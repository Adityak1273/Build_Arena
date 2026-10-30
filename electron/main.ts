// AutoForge v1.8 Electron Main Process
import { app, BrowserWindow, ipcMain, WebContents, session } from 'electron';
import path from 'path';
import fs from 'fs';
import http from 'http';
import { spawn, ChildProcess } from 'child_process';
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

const CHROME_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
app.userAgentFallback = CHROME_UA;

let runtimeProcess: ChildProcess | null = null;

function checkHealth(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:4000/api/health', (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(800, () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function ensureRuntimeServerRunning() {
  const healthy = await checkHealth();
  if (healthy) {
    console.log('[AutoForge] Runtime server on port 4000 is active and healthy.');
    return;
  }

  console.log('[AutoForge] Spawning local runtime server (src/runtime/server.ts)...');
  const serverScript = path.join(__dirname, '../src/runtime/server.ts');
  const isWindows = process.platform === 'win32';
  const cmd = isWindows ? 'npx.cmd' : 'npx';

  runtimeProcess = spawn(cmd, ['tsx', serverScript], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '4000' },
    stdio: 'inherit',
    shell: true
  });

  runtimeProcess.on('error', (err) => {
    console.error('[AutoForge] Failed to spawn runtime server:', err);
  });

  const startTime = Date.now();
  while (Date.now() - startTime < 12000) {
    await new Promise((r) => setTimeout(r, 400));
    if (await checkHealth()) {
      console.log('[AutoForge] Runtime server successfully started and verified healthy on :4000.');
      break;
    }
  }
}

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
    backgroundColor: '#FAF7F2',
    title: 'AutoForge — The AI-Native Developer Browser',
    webPreferences: {
      preload: fs.existsSync(path.join(__dirname, 'preload.cjs'))
        ? path.join(__dirname, 'preload.cjs')
        : path.join(__dirname, 'preload.js'),
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

  // Intercept webview creation and popup windows
  app.on('web-contents-created', (_event, contents) => {
    contents.setUserAgent(CHROME_UA);

    // Allow OAuth popups (Google, GitHub, ElevenLabs sign-in, etc.)
    contents.setWindowOpenHandler((details) => {
      return {
        action: 'allow',
        overrideBrowserWindowOptions: {
          width: 550,
          height: 680,
          autoHideMenuBar: true,
          title: 'Sign In',
          webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            partition: 'persist:autoforge',
          }
        }
      };
    });

    if (contents.getType() === 'webview') {
      attachCDPToWebview(contents);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
    activeWebview = null;
  });
}

function resolveSmartUrl(input: string): string {
  const clean = input.trim();
  if (!clean) return 'https://news.ycombinator.com';
  if (/^https?:\/\//i.test(clean)) return clean;
  if (/^localhost[:\/]/i.test(clean) || /^127\.0\.0\.1/i.test(clean)) return 'http://' + clean;
  if (clean.includes(' ')) {
    return `https://duckduckgo.com/?q=${encodeURIComponent(clean)}`;
  }
  if (!clean.includes('.')) {
    return `https://www.${clean}.com`;
  }
  return 'https://' + clean;
}

// IPC Handlers
ipcMain.handle('browser:navigate', async (_event, url: string) => {
  const targetUrl = resolveSmartUrl(url);
  lastNavigatedUrl = targetUrl;

  // If activeWebview is attaching during startup, wait briefly
  if (!activeWebview || activeWebview.isDestroyed()) {
    const startWait = Date.now();
    while ((!activeWebview || activeWebview.isDestroyed()) && Date.now() - startWait < 2500) {
      await new Promise((r) => setTimeout(r, 100));
    }
  }

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
        // Chromium error code -3 is net::ERR_ABORTED.
        // It happens during normal HTTP->HTTPS redirects, 301/302 rewrites, or superseded subframes.
        // It is NOT a fatal load failure.
        if (errorCode === -3) {
          return;
        }
        if (!resolved) {
          resolved = true;
          activeWebview?.removeListener('did-finish-load', finishHandler);
          activeWebview?.removeListener('did-fail-load', failHandler);
          resolve({ success: false, url: targetUrl, error: `${errorDesc} (Code ${errorCode})` });
        }
      };

      activeWebview!.once('did-finish-load', finishHandler);
      activeWebview!.on('did-fail-load', failHandler);

      // 20s navigation timeout guard (ensures modern dynamic web apps have adequate load time)
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          activeWebview?.removeListener('did-finish-load', finishHandler);
          activeWebview?.removeListener('did-fail-load', failHandler);
          const currentUrl = activeWebview?.getURL() || targetUrl;
          const isNotBlank = !currentUrl.includes('about:blank');
          resolve({
            success: isNotBlank,
            url: currentUrl,
            timedOut: !isNotBlank
          });
        }
      }, 20000);

      try {
        activeWebview!.loadURL(targetUrl);
      } catch (err: any) {
        if (!resolved) {
          resolved = true;
          activeWebview?.removeListener('did-finish-load', finishHandler);
          activeWebview?.removeListener('did-fail-load', failHandler);
          resolve({ success: false, url: targetUrl, error: err.message });
        }
      }
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

// App Lifecycle - Allow guest browser webviews to render target developer sites and OAuth sign-in
app.whenReady().then(async () => {
  await ensureRuntimeServerRunning();

  const sessions = [session.defaultSession, session.fromPartition('persist:autoforge')];

  sessions.forEach((ses) => {
    ses.setUserAgent(CHROME_UA);

    // Override headers to bypass Google OAuth "disallowed_useragent" and embed checks
    ses.webRequest.onBeforeSendHeaders((details, callback) => {
      details.requestHeaders['User-Agent'] = CHROME_UA;
      if (details.requestHeaders['sec-ch-ua']) {
        details.requestHeaders['sec-ch-ua'] = '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"';
      }
      callback({ cancel: false, requestHeaders: details.requestHeaders });
    });

    // Strip X-Frame-Options and Content-Security-Policy frame-ancestors
    ses.webRequest.onHeadersReceived((details, callback) => {
      if (details.responseHeaders) {
        delete details.responseHeaders['x-frame-options'];
        delete details.responseHeaders['X-Frame-Options'];
        const csp = details.responseHeaders['content-security-policy'] || details.responseHeaders['Content-Security-Policy'];
        if (csp) {
          details.responseHeaders['content-security-policy'] = csp.map((c: string) => c.replace(/frame-ancestors[^;]+;?/gi, ''));
        }
      }
      callback({ responseHeaders: details.responseHeaders });
    });
  });

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  if (runtimeProcess) {
    console.log('[AutoForge] Cleaning up runtime server child process...');
    if (process.platform === 'win32' && runtimeProcess.pid) {
      try {
        spawn('taskkill', ['/pid', runtimeProcess.pid.toString(), '/f', '/t']);
      } catch {}
    } else {
      runtimeProcess.kill('SIGTERM');
    }
    runtimeProcess = null;
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
