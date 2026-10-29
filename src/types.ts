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
  line_violations?: number[];
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
  council_mode?: string;
  model_provider_status?: string;
}

export interface StartupRow {
  company_name: string;
  domain: string;
  target_url?: string;
  retrieval_timestamp?: string;
  fetch_status?: string;
  http_status_code?: string | number;
  scraped_title: string;
  meta_description: string;
  target_category?: string;
  category?: string;
  pricing_tier: string;
  enterprise_sales_gate: string;
  api_availability: string;
  data_provenance?: string;
  verification_status?: string;
  row_hash: string;
}

export interface VerificationOutcome {
  mode: string;
  status: string;
  disk_integrity_verified: boolean;
  source_data_verified: boolean;
  total_evaluated: number;
  verified_count: number;
  successful_fetches: number;
  failed_fetches: number;
  flagged_sales_gates: number;
  artifact_path: string;
  disk_hash: string;
  retrieval_timestamp: string;
  is_cached_snapshot?: boolean;
  rows: StartupRow[];
  telemetry_logs: string[];
  error_message?: string;
}

export interface GTMResult {
  success: boolean;
  video_path?: string;
  video_size_bytes?: number;
  audio_path: string;
  audio_source: string;
  narration_generated?: boolean;
  audio_message?: string;
  sha256: string;
  resolution: string;
  title: string;
  headline: string;
  script: string;
  returncode?: number;
  error?: string;
}

export interface TaskStep {
  step_id: string;
  tool: string;
  arguments: Record<string, any>;
  reasoning: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED';
  result?: any;
  verified?: boolean;
  error?: string;
  execution_time_ms?: number;
}

export interface AutonomousPlanResult {
  plan_id: string;
  goal: string;
  planner: string;
  status: 'PENDING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PARTIAL_SUCCESS';
  steps: TaskStep[];
  overall_outcome: string;
  total_time_ms: number;
  security_tokens?: IntentToken[];
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: string;
  payload: any;
}
