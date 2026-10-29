export type WorkspaceMode = 'browse' | 'build' | 'automate' | 'create';

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
  verified: boolean;
}
