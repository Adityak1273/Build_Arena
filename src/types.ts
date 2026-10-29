export type ForgeMode = 'browse' | 'build' | 'automate' | 'create';

export interface SemanticAXNode {
  nodeId: string;
  backendDOMNodeId: number;
  role: string;
  name: string;
  value?: string;
  description?: string;
  disabled?: boolean;
  focused?: boolean;
  children?: string[];
}

export interface IntentToken {
  intent_id: string;
  timestamp: number;
  action: string;
  target: string;
  risk_level: 'SAFE' | 'CONSEQUENTIAL' | 'DESTRUCTIVE';
  requires_approval: boolean;
  merkle_root: string;
  signature: string;
  status: 'AUTHORIZED' | 'PENDING_APPROVAL' | 'TASK_BLOCKED';
  reason: string;
}

export interface CriticFeedback {
  critic_name: string;
  role: string;
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  diff_snippet?: string;
}

export interface CouncilVerdict {
  verdict_id: string;
  timestamp: number;
  passed: boolean;
  average_score: number;
  critics: CriticFeedback[];
  overall_feedback: string;
  optimized_code?: string;
  security_token?: IntentToken;
}

export interface StartupRow {
  company_name: string;
  domain: string;
  scraped_title: string;
  meta_description: string;
  category: string;
  pricing_tier: string;
  enterprise_sales_gate: string;
  api_availability: string;
  verification_status: string;
  row_hash: string;
}

export interface VerificationOutcome {
  mode: string;
  status: 'VERIFIED_DISK_SYNC' | 'FAILED_UNREACHABLE_HOSTS' | 'FAILED_CORRUPTION_DETECTED';
  total_evaluated: number;
  verified_count: number;
  flagged_sales_gates: number;
  artifact_path: string;
  disk_hash: string;
  rows: StartupRow[];
  telemetry_logs: string[];
  error_message?: string;
}

export interface GTMResult {
  success: boolean;
  video_path?: string;
  audio_path: string;
  audio_source: string;
  sha256: string;
  resolution: string;
  title: string;
  headline: string;
  script: string;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: string;
  payload: any;
}
