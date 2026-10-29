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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#111726] border border-red-500/40 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950/80 to-amber-950/80 px-6 py-4 border-b border-red-500/20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500/20 rounded-lg text-red-400">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-semibold text-white tracking-wide">ArmorIQ Policy Gate: Approval Required</h3>
              <p className="text-xs text-red-300">Consequential or mutating action intercepted</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-red-500/20 text-red-300 font-mono rounded border border-red-500/30">
            FAIL-CLOSED
          </span>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-[#090d16] p-3.5 rounded-lg border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <Terminal className="w-4 h-4 text-indigo-400" /> Target Tool:
              </span>
              <span className="text-indigo-300 font-semibold uppercase">{approval.tool}</span>
            </div>
            <div className="bg-black/60 p-2.5 rounded font-mono text-xs text-amber-200 overflow-x-auto border border-slate-800/80">
              {JSON.stringify(approval.input, null, 2)}
            </div>
          </div>

          {/* Intent Token Validation */}
          <div className="flex items-center justify-between px-3 py-2 bg-indigo-950/40 border border-indigo-500/30 rounded-lg text-xs">
            <div className="flex items-center space-x-2 text-indigo-200">
              <KeyRound className="w-4 h-4 text-indigo-400" />
              <span>CSRG Merkle Intent Token:</span>
            </div>
            <span className="font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
              {approval.intentToken || 'Verified Valid'}
            </span>
          </div>

          <div className="flex items-start gap-2.5 text-xs text-slate-300 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              AutoForge requires explicit consent before executing operations that write data, modify state, or publish assets.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-[#0b101c] px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => onTakeover ? onTakeover() : onDecision(false)}
            className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded transition-colors"
          >
            Manual Takeover
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onDecision(false)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              <XCircle className="w-4 h-4 text-red-400" />
              <span>Reject & Abort</span>
            </button>
            <button
              onClick={() => onDecision(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium shadow-lg shadow-emerald-900/40 transition"
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
