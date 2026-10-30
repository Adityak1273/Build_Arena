// AutoForge v1.6 Electron Preload Script
import { contextBridge, ipcRenderer } from 'electron';

export interface ElectronAPI {
  navigate: (url: string) => Promise<{ success: boolean; url: string }>;
  captureAXTree: () => Promise<any[]>;
  clickBackendNode: (backendDOMNodeId: number) => Promise<any>;
  goBack: () => Promise<void>;
  goForward: () => Promise<void>;
  reload: () => Promise<void>;
  getAppVersion: () => Promise<string>;
  getTelemetry: () => Promise<{ cdpConnected: boolean; latencyMs: number | null; url: string }>;
  onNavStateChanged: (callback: (state: { url: string; canGoBack: boolean; canGoForward: boolean; loading: boolean }) => void) => () => void;
  onAXTreeUpdated: (callback: (tree: any[]) => void) => () => void;
}

const api: ElectronAPI = {
  navigate: (url: string) => ipcRenderer.invoke('browser:navigate', url),
  captureAXTree: () => ipcRenderer.invoke('browser:captureAXTree'),
  clickBackendNode: (backendDOMNodeId: number) => ipcRenderer.invoke('browser:clickBackendNode', backendDOMNodeId),
  goBack: () => ipcRenderer.invoke('browser:goBack'),
  goForward: () => ipcRenderer.invoke('browser:goForward'),
  reload: () => ipcRenderer.invoke('browser:reload'),
  getAppVersion: () => ipcRenderer.invoke('browser:getVersion'),
  getTelemetry: () => ipcRenderer.invoke('browser:getTelemetry'),
  onNavStateChanged: (callback) => {
    const handler = (_event: any, state: any) => callback(state);
    ipcRenderer.on('browser:navStateChanged', handler);
    return () => {
      ipcRenderer.removeListener('browser:navStateChanged', handler);
    };
  },
  onAXTreeUpdated: (callback) => {
    const handler = (_event: any, tree: any) => callback(tree);
    ipcRenderer.on('browser:axTreeUpdated', handler);
    return () => {
      ipcRenderer.removeListener('browser:axTreeUpdated', handler);
    };
  }
};

contextBridge.exposeInMainWorld('electronAPI', api);
