import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('autoForgeElectron', {
  navigate: (url: string) => ipcRenderer.invoke('browser:navigate', url),
  captureAXTree: () => ipcRenderer.invoke('browser:captureAXTree'),
  clickBackendNode: (backendNodeId: number) => ipcRenderer.invoke('browser:clickBackendNode', backendNodeId),
  onBrowserUrlChange: (callback: (url: string) => void) => {
    const handler = (_event: any, url: string) => callback(url);
    ipcRenderer.on('browser:urlChanged', handler);
    return () => ipcRenderer.removeListener('browser:urlChanged', handler);
  },
  onAgentEvent: (callback: (data: any) => void) => {
    const handler = (_event: any, data: any) => callback(data);
    ipcRenderer.on('agent:event', handler);
    return () => ipcRenderer.removeListener('agent:event', handler);
  },
  resolveApproval: (approvalId: string, approved: boolean) => 
    ipcRenderer.invoke('agent:resolveApproval', { approvalId, approved })
});
