import { EventEmitter } from 'events';
import crypto from 'crypto';
import { IntentToken } from '../types';

export type PolicyRiskLevel = 'SAFE' | 'CONSEQUENTIAL' | 'DESTRUCTIVE';

export interface ActionRequest {
  type: string;
  target?: string;
  payload?: any;
  details?: string;
}

interface PendingGateEntry {
  token: IntentToken;
  resolve: (token: IntentToken) => void;
  reject: (reason: Error) => void;
}

export class PolicyApprovalGate extends EventEmitter {
  private pendingResolvers: Map<string, PendingGateEntry> = new Map();
  private isCancelled: boolean = false;

  constructor() {
    super();
  }

  public getIsCancelled(): boolean {
    return this.isCancelled;
  }

  public resetCancel(): void {
    this.isCancelled = false;
  }

  public assessRisk(action: ActionRequest): {
    riskLevel: PolicyRiskLevel;
    requiresApproval: boolean;
    reason: string;
  } {
    const actType = (action.type || '').toLowerCase();
    const target = (action.target || '').toLowerCase();

    // High-risk consequential actions requiring human approval
    const consequentialPatterns = [
      'submit',
      'purchase',
      'buy',
      'pay',
      'delete',
      'drop',
      'truncate',
      'auth',
      'login',
      'password',
      'credential',
      'publish_gtm',
      'execute_script',
      'cookie_overwrite',
      'external_transfer'
    ];

    for (const pat of consequentialPatterns) {
      if (actType.includes(pat) || target.includes(pat)) {
        return {
          riskLevel: 'CONSEQUENTIAL',
          requiresApproval: true,
          reason: `Action '${action.type}' involves consequential operations (${pat}) and requires explicit human gate clearance.`
        };
      }
    }

    // Default to safe low-risk read-only / navigation
    return {
      riskLevel: 'SAFE',
      requiresApproval: false,
      reason: `Action '${action.type}' assessed as safe read-only or standard execution.`
    };
  }

  public evaluateGoalSecurity(goal: string): {
    cleared: boolean;
    token: string;
    reason: string;
  } {
    const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex');
    const token = 'IT-' + sha(goal + Date.now()).slice(0, 32);
    const riskyPattern = /delete|password|credit card|otp|hack|malware|bank login/i;

    if (riskyPattern.test(goal)) {
      return {
        cleared: false,
        token,
        reason: 'BLOCKED: risky request needs approval'
      };
    }

    return {
      cleared: true,
      token,
      reason: 'CLEARED ' + token
    };
  }

  public generateIntentToken(
    action: ActionRequest,
    riskLevel: PolicyRiskLevel,
    requiresApproval: boolean,
    reason: string
  ): IntentToken {
    const intentId = `intent-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const timestamp = Date.now();
    const payloadStr = JSON.stringify({
      action: action.type,
      target: action.target || '',
      riskLevel,
      timestamp
    });

    const merkleRoot = crypto.createHash('sha256').update(payloadStr).digest('hex');
    const signature = crypto
      .createHmac('sha256', 'autoforge-vigil-secret')
      .update(merkleRoot)
      .digest('hex');

    return {
      intent_id: intentId,
      timestamp,
      action: action.type,
      target: action.target || '',
      risk_level: riskLevel,
      requires_approval: requiresApproval,
      merkle_root: merkleRoot,
      signature,
      status: requiresApproval ? 'PENDING_APPROVAL' : 'AUTHORIZED',
      reason
    };
  }

  public async requestGateClearance(action: ActionRequest): Promise<IntentToken> {
    if (this.isCancelled) {
      throw new Error('Policy gate is currently in EMERGENCY_CANCELLED state.');
    }

    const { riskLevel, requiresApproval, reason } = this.assessRisk(action);
    const token = this.generateIntentToken(action, riskLevel, requiresApproval, reason);

    if (!requiresApproval) {
      this.emit('gate:authorized', token);
      return token;
    }

    // Consequential risk: halt execution and request human-in-the-loop clearance
    return new Promise<IntentToken>((resolve, reject) => {
      this.pendingResolvers.set(token.intent_id, {
        token,
        resolve,
        reject
      });

      this.emit('gate:clearance_required', token);
    });
  }

  public resolveClearance(
    intentId: string,
    decision: 'APPROVED' | 'REJECTED' | 'MANUAL_TAKEOVER'
  ): boolean {
    const entry = this.pendingResolvers.get(intentId);
    if (!entry) {
      return false;
    }

    this.pendingResolvers.delete(intentId);

    if (decision === 'APPROVED') {
      entry.token.status = 'AUTHORIZED';
      entry.token.reason = 'Approved by human operator via Policy Gate clearance.';
      this.emit('gate:resolved', { intentId, decision, token: entry.token });
      entry.resolve(entry.token);
      return true;
    } else {
      entry.token.status = 'TASK_BLOCKED';
      entry.token.reason = `Rejected or Manual Takeover triggered by operator (${decision}).`;
      this.emit('gate:resolved', { intentId, decision, token: entry.token });
      entry.reject(new Error(`Policy clearance ${decision} for intent ${intentId}`));
      return true;
    }
  }

  public triggerEmergencyCancel(): void {
    this.isCancelled = true;
    const count = this.pendingResolvers.size;

    for (const [id, entry] of this.pendingResolvers.entries()) {
      entry.token.status = 'TASK_BLOCKED';
      entry.token.reason = 'Immediate Emergency Cancellation triggered by operator.';
      entry.reject(new Error('EMERGENCY_CANCELLED'));
    }
    this.pendingResolvers.clear();

    this.emit('gate:cancelled', { timestamp: Date.now(), cancelledCount: count });

    // Reset after a brief pause so future requests can function if re-enabled
    setTimeout(() => {
      this.isCancelled = false;
    }, 1000);
  }

  public getPendingIntents(): IntentToken[] {
    return Array.from(this.pendingResolvers.values()).map((e) => e.token);
  }
}

export const policyApprovalGate = new PolicyApprovalGate();
