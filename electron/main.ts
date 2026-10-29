import { app, BrowserWindow, ipcMain, WebContents } from 'electron';
import * as path from 'path';
import { SemanticBrowserEngine } from './semanticBrowser';

let mainWindow: BrowserWindow | null = null;
let activeWebviewContents: WebContents | null = null;
let browserEngine: SemanticBrowserEngine | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1560,
    height: 960,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0F0F0F',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enables real Chromium in-app browser view tabs
    },
  });

  browserEngine = new SemanticBrowserEngine(mainWindow.webContents);

  const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
    activeWebviewContents = null;
  });
}

// Track webview creations to connect CDP directly to the live browsing session
app.on('web-contents-created', (_event, contents) => {
  if (contents.getType() === 'webview') {
    activeWebviewContents = contents;
    browserEngine = new SemanticBrowserEngine(contents);

    contents.on('did-navigate', (_navEvent, url) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser:urlChanged', url);
      }
    });

    contents.on('did-fail-load', (_failEvent, errorCode, errorDescription, validatedURL) => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('browser:loadFailed', { errorCode, errorDescription, url: validatedURL });
      }
    });
  }
});

// Real IPC Handlers
ipcMain.handle('browser:navigate', async (_event, url: string) => {
  let targetUrl = url.trim();
  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = `https://${targetUrl}`;
  }

  try {
    if (activeWebviewContents && !activeWebviewContents.isDestroyed()) {
      await activeWebviewContents.loadURL(targetUrl);
      return { success: true, url: targetUrl };
    } else if (mainWindow && !mainWindow.isDestroyed()) {
      // Forward command to webview element inside renderer
      mainWindow.webContents.send('browser:doNavigate', targetUrl);
      return { success: true, url: targetUrl };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'No active browser target available' };
});

ipcMain.handle('browser:captureAXTree', async () => {
  const targetEngine = browserEngine || (mainWindow ? new SemanticBrowserEngine(mainWindow.webContents) : null);
  if (targetEngine) {
    return await targetEngine.captureFusedSemanticTree();
  }
  return [];
});

ipcMain.handle('browser:clickBackendNode', async (_event, backendNodeId: number) => {
  const targetEngine = browserEngine || (mainWindow ? new SemanticBrowserEngine(mainWindow.webContents) : null);
  if (targetEngine) {
    return await targetEngine.verifyAndClickBackendNode(backendNodeId);
  }
  return { verified: false, axDiffCount: 0, error: 'No active browser debugger attached' };
});

ipcMain.handle('browser:getMetrics', async () => {
  const targetContents = activeWebviewContents || mainWindow?.webContents;
  if (targetContents && !targetContents.isDestroyed()) {
    return {
      title: targetContents.getTitle(),
      url: targetContents.getURL(),
      isLoading: targetContents.isLoading(),
      canGoBack: targetContents.canGoBack(),
      canGoForward: targetContents.canGoForward(),
    };
  }
  return null;
});

app.whenReady().then(createWindow);

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
