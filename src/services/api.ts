import { CouncilVerdict, VerificationOutcome, GTMResult, SemanticAXNode } from '../types';

const API_BASE = 'http://127.0.0.1:8000';

// Global declaration for Electron context bridge
declare global {
  interface Window {
    electronAPI?: {
      navigate: (url: string) => Promise<{ success: boolean; url: string }>;
      captureAXTree: () => Promise<SemanticAXNode[]>;
      clickBackendNode: (backendDOMNodeId: number) => Promise<any>;
      goBack: () => Promise<void>;
      goForward: () => Promise<void>;
      reload: () => Promise<void>;
      getAppVersion: () => Promise<string>;
      onNavStateChanged: (callback: (state: any) => void) => () => void;
      onAXTreeUpdated: (callback: (tree: SemanticAXNode[]) => void) => () => void;
    };
  }
}

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && Boolean(window.electronAPI);
};

export const electronBrowser = {
  navigate: async (url: string) => {
    if (window.electronAPI) {
      return await window.electronAPI.navigate(url);
    }
    return { success: true, url, simulated: true };
  },
  captureAXTree: async (): Promise<SemanticAXNode[]> => {
    if (window.electronAPI) {
      return await window.electronAPI.captureAXTree();
    }
    // High-fidelity fallback AX Tree for browser-based preview
    return [
      { nodeId: 'ax-1', backendDOMNodeId: 101, role: 'heading', name: 'AutoForge Developer Shell v1.0' },
      { nodeId: 'ax-2', backendDOMNodeId: 102, role: 'link', name: 'Hacker News — AI Startup Benchmarks' },
      { nodeId: 'ax-3', backendDOMNodeId: 103, role: 'button', name: 'Trigger CDP AXTree Capture' },
      { nodeId: 'ax-4', backendDOMNodeId: 104, role: 'searchbox', name: 'Search repositories & models' },
      { nodeId: 'ax-5', backendDOMNodeId: 105, role: 'tab', name: 'Council Telemetry Tab' },
      { nodeId: 'ax-6', backendDOMNodeId: 106, role: 'button', name: 'Verify Physical Disk Outcomes' }
    ];
  },
  clickBackendNode: async (backendDOMNodeId: number) => {
    if (window.electronAPI) {
      return await window.electronAPI.clickBackendNode(backendDOMNodeId);
    }
    return {
      success: true,
      backendDOMNodeId,
      urlChanged: true,
      initialUrl: 'https://news.ycombinator.com',
      newUrl: `https://news.ycombinator.com#item-${backendDOMNodeId}`,
      axDiffCount: 4,
      targetRole: 'button',
      targetName: `Interactive Node #${backendDOMNodeId}`,
      message: `Verified simulated CDP click dispatch on backendDOMNodeId ${backendDOMNodeId} (AX delta: +4 nodes)`
    };
  },
  goBack: async () => {
    if (window.electronAPI) await window.electronAPI.goBack();
  },
  goForward: async () => {
    if (window.electronAPI) await window.electronAPI.goForward();
  },
  reload: async () => {
    if (window.electronAPI) await window.electronAPI.reload();
  }
};

export const api = {
  executeTask: async (taskType: string, prompt: string, codeSnippet?: string, options?: any) => {
    const res = await fetch(`${API_BASE}/api/task/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        task_type: taskType,
        prompt,
        code_snippet: codeSnippet,
        options
      })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Task execution failed' }));
      throw new Error(err.error || `HTTP error ${res.status}`);
    }
    return await res.json();
  },

  approveTask: async (intentId: string, decision: 'APPROVED' | 'REJECTED') => {
    const res = await fetch(`${API_BASE}/api/task/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent_id: intentId, decision })
    });
    return await res.json();
  },

  getLatestSpreadsheet: async (): Promise<VerificationOutcome> => {
    const res = await fetch(`${API_BASE}/api/spreadsheet/latest`);
    if (!res.ok) throw new Error('Failed to fetch spreadsheet');
    return await res.json();
  },

  exportSpreadsheet: async (mode: string = 'LIVE_SCRAPED'): Promise<VerificationOutcome> => {
    const res = await fetch(`${API_BASE}/api/spreadsheet/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode })
    });
    if (!res.ok) throw new Error('Benchmark export failed');
    return await res.json();
  },

  getDownloadUrl: () => `${API_BASE}/api/spreadsheet/download`,

  generateGTM: async (title: string, headline: string, script?: string): Promise<GTMResult> => {
    const res = await fetch(`${API_BASE}/api/gtm/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, headline, script })
    });
    if (!res.ok) throw new Error('GTM composite failed');
    return await res.json();
  }
};
