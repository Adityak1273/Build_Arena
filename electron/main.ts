import { app, BrowserWindow, ipcMain, WebContents } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { extractSemanticNodes, verifyAndClickBackendNode, SemanticAXNode } from './semanticBrowser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// The built directory structure
process.env.DIST = path.join(__dirname, '../dist');
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(process.env.DIST, '../public');

let mainWindow: BrowserWindow | null = null;
let activeWebview: WebContents | null = null;
let cachedAXTree: SemanticAXNode[] = [];
let lastNavigatedUrl = 'https://news.ycombinator.com';

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

async function attachCDPToWebview(contents: WebContents) {
  activeWebview = contents;
  try {
    if (!contents.debugger.isAttached()) {
      contents.debugger.attach('1.3');
    }
    await contents.debugger.sendCommand('Accessibility.enable');
    await contents.debugger.sendCommand('DOM.enable');
    await contents.debugger.sendCommand('Page.enable');

    contents.on('did-finish-load', async () => {
      lastNavigatedUrl = contents.getURL();
      broadcastNavState();
      try {
        const rawTree = await contents.debugger.sendCommand('Accessibility.getFullAXTree', {});
        cachedAXTree = extractSemanticNodes(rawTree.nodes);
        mainWindow?.webContents.send('browser:axTreeUpdated', cachedAXTree);
      } catch (e) {
        console.warn('AXTree auto-refresh warning:', e);
      }
    });

    contents.on('did-navigate', (_e, url) => {
      lastNavigatedUrl = url;
      broadcastNavState();
    });

    contents.on('did-navigate-in-page', (_e, url) => {
      lastNavigatedUrl = url;
      broadcastNavState();
    });

  } catch (error) {
    console.error('Failed to attach CDP debugger to webview:', error);
  }
}

function broadcastNavState() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send('browser:navStateChanged', {
    url: lastNavigatedUrl,
    canGoBack: activeWebview?.canGoBack() ?? false,
    canGoForward: activeWebview?.canGoForward() ?? false,
    loading: activeWebview?.isLoading() ?? false
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0a0d14',
    title: 'AutoForge — The AI-Native Developer Browser',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
  });

  const distPath = process.env.DIST || path.join(__dirname, '../dist');
  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(distPath, 'index.html'));
  }

  // Intercept webview creation
  app.on('web-contents-created', (_event, contents) => {
    if (contents.getType() === 'webview') {
      attachCDPToWebview(contents);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    activeWebview = null;
  });
}

// IPC Handlers
ipcMain.handle('browser:navigate', async (_event, url: string) => {
  let targetUrl = url.trim();
  if (!/^https?:\/\//i.test(targetUrl)) {
    targetUrl = 'https://' + targetUrl;
  }
  lastNavigatedUrl = targetUrl;

  if (activeWebview && !activeWebview.isDestroyed()) {
    return new Promise((resolve) => {
      let resolved = false;

      const finishHandler = () => {
        if (!resolved) {
          resolved = true;
          activeWebview?.removeListener('did-finish-load', finishHandler);
          activeWebview?.removeListener('did-fail-load', failHandler);
          resolve({ success: true, url: activeWebview?.getURL() || targetUrl });
        }
      };

      const failHandler = (_e: any, errorCode: number, errorDesc: string) => {
        if (!resolved) {
          resolved = true;
          activeWebview?.removeListener('did-finish-load', finishHandler);
          activeWebview?.removeListener('did-fail-load', failHandler);
          resolve({ success: false, url: targetUrl, error: `${errorDesc} (Code ${errorCode})` });
        }
      };

      activeWebview!.once('did-finish-load', finishHandler);
      activeWebview!.once('did-fail-load', failHandler);

      // 8s navigation timeout guard
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          activeWebview?.removeListener('did-finish-load', finishHandler);
          activeWebview?.removeListener('did-fail-load', failHandler);
          resolve({
            success: false,
            url: activeWebview?.getURL() || targetUrl,
            timedOut: true,
            error: 'Navigation timed out after 8000ms'
          });
        }
      }, 8000);

      activeWebview!.loadURL(targetUrl);
    });
  }

  // If running in browser preview outside Electron webview
  return { success: false, url: targetUrl, error: 'NO_ELECTRON_WEBVIEW' };
});

ipcMain.handle('browser:captureAXTree', async () => {
  if (activeWebview && !activeWebview.isDestroyed()) {
    if (!activeWebview.debugger.isAttached()) {
      try {
        activeWebview.debugger.attach('1.3');
        await activeWebview.debugger.sendCommand('Accessibility.enable');
        await activeWebview.debugger.sendCommand('DOM.enable');
        await activeWebview.debugger.sendCommand('Page.enable');
      } catch (attachErr) {
        console.warn('Could not attach CDP debugger on demand for AXTree:', attachErr);
      }
    }

    if (activeWebview.debugger.isAttached()) {
      try {
        const rawTree = await activeWebview.debugger.sendCommand('Accessibility.getFullAXTree', {});
        cachedAXTree = extractSemanticNodes(rawTree.nodes);
        return cachedAXTree;
      } catch (err: any) {
        console.warn('Live CDP getFullAXTree failed:', err);
        return [];
      }
    }
  }

  // When CDP debugger is not connected, return empty array honestly
  return [];
});

ipcMain.handle('browser:clickBackendNode', async (_event, backendDOMNodeId: number) => {
  if (activeWebview && !activeWebview.isDestroyed()) {
    if (!activeWebview.debugger.isAttached()) {
      try {
        activeWebview.debugger.attach('1.3');
        await activeWebview.debugger.sendCommand('Accessibility.enable');
        await activeWebview.debugger.sendCommand('DOM.enable');
        await activeWebview.debugger.sendCommand('Page.enable');
      } catch (attachErr) {
        console.warn('Could not attach CDP debugger on demand:', attachErr);
      }
    }

    if (activeWebview.debugger.isAttached()) {
      return await verifyAndClickBackendNode(
        activeWebview.debugger,
        backendDOMNodeId,
        () => activeWebview?.getURL() || lastNavigatedUrl,
        async () => {
          const rawTree = await activeWebview!.debugger.sendCommand('Accessibility.getFullAXTree', {});
          return extractSemanticNodes(rawTree.nodes);
        }
      );
    }

    // If CDP debugger could not be attached, report honestly rather than using fake DOM attributes
    return {
      success: false,
      status: 'DISPATCH_FAILED',
      backendDOMNodeId,
      urlChanged: false,
      initialUrl: lastNavigatedUrl,
      newUrl: lastNavigatedUrl,
      axDiffCount: 0,
      targetRole: 'interactive',
      targetName: `Node #${backendDOMNodeId}`,
      message: 'CDP debugger unavailable; cannot resolve backend DOM node ID on external webpage without active CDP session.',
      error: 'CDP_UNAVAILABLE'
    };
  }

  return {
    success: false,
    status: 'DISPATCH_FAILED',
    backendDOMNodeId,
    urlChanged: false,
    initialUrl: lastNavigatedUrl,
    newUrl: lastNavigatedUrl,
    axDiffCount: 0,
    message: 'No active webview or browser session available.',
    error: 'NO_ACTIVE_BROWSER'
  };
});

ipcMain.handle('browser:getTelemetry', async () => {
  if (activeWebview && !activeWebview.isDestroyed() && activeWebview.debugger.isAttached()) {
    try {
      const start = Date.now();
      await activeWebview.debugger.sendCommand('DOM.getDocument', { depth: 1 });
      const latencyMs = Date.now() - start;
      return {
        cdpConnected: true,
        latencyMs,
        url: activeWebview.getURL() || lastNavigatedUrl
      };
    } catch {
      return { cdpConnected: false, latencyMs: null, url: lastNavigatedUrl };
    }
  }
  return { cdpConnected: false, latencyMs: null, url: lastNavigatedUrl };
});

ipcMain.handle('browser:goBack', async () => {
  if (activeWebview?.canGoBack()) activeWebview.goBack();
});

ipcMain.handle('browser:goForward', async () => {
  if (activeWebview?.canGoForward()) activeWebview.goForward();
});

ipcMain.handle('browser:reload', async () => {
  if (activeWebview) activeWebview.reload();
});

ipcMain.handle('browser:getVersion', async () => {
  return app.getVersion();
});

// App Lifecycle - Standard secure operation without tampering with CSP/X-Frame-Options headers
app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
