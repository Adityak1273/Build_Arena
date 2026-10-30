import {
  CouncilVerdict,
  VerificationOutcome,
  GTMResult,
  SemanticAXNode,
  AutonomousPlanResult
} from '../types';

const API_BASE = 'http://127.0.0.1:4000';

// Global declaration for Electron context bridge
declare global {
  interface Window {
    electronAPI?: {
      navigate: (url: string) => Promise<{ success: boolean; url: string; error?: string }>;
      captureAXTree: () => Promise<SemanticAXNode[]>;
      clickBackendNode: (backendDOMNodeId: number) => Promise<any>;
      goBack: () => Promise<void>;
      goForward: () => Promise<void>;
      reload: () => Promise<void>;
      getAppVersion: () => Promise<string>;
      getTelemetry: () => Promise<{ cdpConnected: boolean; latencyMs: number | null; url: string }>;
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
    return { success: true, url, mode: 'WEB_PREVIEW' };
  },
  captureAXTree: async (targetUrl?: string): Promise<SemanticAXNode[]> => {
    if (window.electronAPI) {
      return await window.electronAPI.captureAXTree();
    }
    // Web preview mode: call /api/browser/preview/ax
    try {
      const u = targetUrl || 'https://news.ycombinator.com';
      const res = await fetch(`${API_BASE}/api/browser/preview/ax?url=${encodeURIComponent(u)}`);
      if (res.ok) {
        const data = await res.json();
        return data.nodes || [];
      }
    } catch {
      // ignore
    }
    return [];
  },
  clickBackendNode: async (backendDOMNodeId: number) => {
    if (window.electronAPI) {
      return await window.electronAPI.clickBackendNode(backendDOMNodeId);
    }
    return {
      success: false,
      status: 'DISPATCH_FAILED',
      backendDOMNodeId,
      urlChanged: false,
      initialUrl: '',
      newUrl: '',
      axDiffCount: 0,
      message: 'Electron shell is not attached. Cannot dispatch hardware CDP input events.',
      error: 'ELECTRON_SHELL_DETACHED'
    };
  },
  getTelemetry: async () => {
    if (window.electronAPI) {
      return await window.electronAPI.getTelemetry();
    }
    return { cdpConnected: false, latencyMs: null, url: '' };
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

  updateSpreadsheet: async (rows: any[]): Promise<VerificationOutcome> => {
    const res = await fetch(`${API_BASE}/api/spreadsheet/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows })
    });
    if (!res.ok) throw new Error('Spreadsheet update failed');
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
  },

  planAutonomousTask: async (goal: string, context?: any): Promise<AutonomousPlanResult> => {
    const res = await fetch(`${API_BASE}/api/autonomous/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goal, context })
    });
    if (!res.ok) throw new Error('Task planning failed');
    return await res.json();
  },

  executeAutonomousPlan: async (plan: AutonomousPlanResult): Promise<AutonomousPlanResult> => {
    const res = await fetch(`${API_BASE}/api/autonomous/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(plan)
    });
    if (!res.ok) throw new Error('Autonomous plan execution failed');
    return await res.json();
  },

  cancelAutonomousPlan: async (planId: string) => {
    const res = await fetch(`${API_BASE}/api/autonomous/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: planId })
    });
    return await res.json();
  },

  // Multimodal Intelligence Services (Images, Audio, Video)
  generateImageBanner: async (title: string, tagline: string, badge?: string, theme?: string) => {
    const res = await fetch(`${API_BASE}/api/multimodal/image/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, tagline, badge: badge || 'GTM CAMPAIGN', theme: theme || 'indigo' })
    });
    if (!res.ok) throw new Error('Failed to generate creative banner');
    return await res.json();
  },

  analyzeVisualStructure: async (imageBase64?: string, contextUrl?: string) => {
    const res = await fetch(`${API_BASE}/api/multimodal/image/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_base64: imageBase64, context_url: contextUrl || '' })
    });
    if (!res.ok) throw new Error('Visual analysis failed');
    return await res.json();
  },

  analyzeAudioTrack: async () => {
    const res = await fetch(`${API_BASE}/api/multimodal/audio/analyze`);
    if (!res.ok) throw new Error('Audio track analysis failed');
    return await res.json();
  }
};
