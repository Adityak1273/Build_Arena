import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, Terminal, KeyRound, AlertTriangle } from 'lucide-react';
import { ApprovalRequest } from '../../types';

interface ApprovalModalProps {
  approval: ApprovalRequest;
  onDecision: (approved: boolean) => void;
  onTakeover?: () => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({ approval, onDecision, onTakeover }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white border border-rose-200 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-50 via-amber-50 to-orange-50 px-6 py-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-100 rounded-xl text-rose-700 shadow-xs">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 tracking-tight">ArmorIQ Security Checkpoint</h3>
              <p className="text-xs text-rose-800 font-medium">Consequential or state-mutating action intercepted</p>
            </div>
          </div>
          <span className="text-[11px] px-2.5 py-1 bg-rose-100 text-rose-800 font-mono font-semibold rounded-full border border-rose-200">
            FAIL-CLOSED
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Terminal className="w-4 h-4 text-purple-600" /> Target Action:
              </span>
              <span className="text-purple-800 font-bold uppercase tracking-wider">{approval.tool}</span>
            </div>
            <div className="bg-white p-3 rounded-lg font-mono text-xs text-slate-800 overflow-x-auto border border-slate-200 shadow-inner">
              {JSON.stringify(approval.input, null, 2)}
            </div>
          </div>

          {/* Intent Token Validation */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-xs">
            <div className="flex items-center space-x-2 text-indigo-900 font-medium">
              <KeyRound className="w-4 h-4 text-indigo-600" />
              <span>CSRG Merkle Intent Token:</span>
            </div>
            <span className="font-mono text-emerald-800 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {approval.intentToken || 'Verified Valid'}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200/70">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium">
              AutoForge requires explicit human consent before executing operations that write data, modify state, or publish assets.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={() => onTakeover ? onTakeover() : onDecision(false)}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg transition-colors"
          >
            Manual Takeover
          </button>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onDecision(false)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-rose-700 border border-rose-200 text-xs font-semibold shadow-xs transition"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject & Abort</span>
            </button>
            <button
              onClick={() => onDecision(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Action</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
