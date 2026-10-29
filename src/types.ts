export type WorkspaceMode = 'browse' | 'build' | 'automate' | 'create';

export interface SemanticAXNode {
  axNodeId: string;
  backendNodeId: number;
  frameId: string;
  role: string;
  name: string;
  value?: string;
  interactive: boolean;
}

export interface AgentEvent {
  type: string;
  agent?: string;
  status?: string;
  message?: string;
  action?: string;
  stepIndex?: number;
  totalSteps?: number;
  taskId?: string;
  intentToken?: string;
  tool?: string;
  input?: any;
  approvalId?: string;
  intentTokenVerified?: boolean;
  reason?: string;
  error?: string;
  verification?: string;
  timestamp?: number;
  results?: any[];
  summary?: string;
  report?: {
    rows_written: number;
    rows_verified: number;
    cells_checked: number;
    flagged_unknown: number;
    artifact_path: string;
  };
}

export interface ApprovalRequest {
  approvalId: string;
  tool: string;
  input: Record<string, any>;
  intentToken?: string;
  intentTokenVerified?: boolean;
}

export interface StartupComparisonRow {
  startup: string;
  product: string;
  pricing: string;
  evidenceUrl?: string;
  verified: boolean;
  flagged?: boolean;
}

export interface AutoForgeElectronAPI {
  navigate: (url: string) => Promise<{ success: boolean; url?: string; error?: string }>;
  captureAXTree: () => Promise<SemanticAXNode[]>;
  clickBackendNode: (backendNodeId: number) => Promise<{ verified: boolean; axDiffCount: number; error?: string }>;
  getMetrics: () => Promise<{ title: string; url: string; isLoading: boolean; canGoBack: boolean; canGoForward: boolean } | null>;
  onBrowserUrlChange: (callback: (url: string) => void) => () => void;
  onDoNavigate: (callback: (url: string) => void) => () => void;
  onLoadFailed: (callback: (data: any) => void) => () => void;
  onAgentEvent: (callback: (data: any) => void) => () => void;
  resolveApproval: (approvalId: string, approved: boolean) => Promise<any>;
}

declare global {
  interface Window {
    autoForgeElectron?: AutoForgeElectronAPI;
  }
}
