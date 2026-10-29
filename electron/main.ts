import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { SemanticBrowserEngine } from './semanticBrowser';

let mainWindow: BrowserWindow | null = null;
let browserEngine: SemanticBrowserEngine | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1560,
    height: 960,
    minWidth: 1200,
    minHeight: 700,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0a0d14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webviewTag: true, // Enables in-app browser view tabs for live web browsing
    },
  });

  // Attach Semantic Browser Engine on main or webview contents
  browserEngine = new SemanticBrowserEngine(mainWindow.webContents);

  const startUrl = process.env.VITE_DEV_SERVER_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  mainWindow.loadURL(startUrl);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers
ipcMain.handle('browser:navigate', async (_event, url: string) => {
  if (mainWindow) {
    // If navigating in main or active webview
    return { success: true, url };
  }
  return { success: false };
});

ipcMain.handle('browser:captureAXTree', async () => {
  if (browserEngine) {
    return await browserEngine.captureFusedSemanticTree();
  }
  return [];
});

ipcMain.handle('browser:clickBackendNode', async (_event, backendNodeId: number) => {
  if (browserEngine) {
    return await browserEngine.verifyAndClickBackendNode(backendNodeId);
  }
  return { verified: false, axDiffCount: 0 };
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
