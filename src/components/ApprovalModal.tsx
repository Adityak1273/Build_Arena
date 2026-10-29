import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, KeyRound, AlertTriangle } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  intent: {
    intent_id: string;
    action: string;
    target: string;
    risk_level: string;
    reason: string;
  } | null;
  onApprove: (intentId: string) => void;
  onReject: (intentId: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  intent,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !intent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-[#111520] border-2 border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/10">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                {intent.risk_level} INTENT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {intent.intent_id.slice(0, 8)}...
              </span>
            </div>
            <h3 className="mt-1 text-lg font-bold text-slate-100">
              Zero-Trust Verification Required
            </h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {intent.reason}
            </p>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-lg bg-[#0a0d14] border border-[#23293d] space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-400">
            <span>Action:</span>
            <span className="text-slate-200 font-semibold">{intent.action}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Target Resource:</span>
            <span className="text-slate-200 font-semibold">{intent.target}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#23293d] text-emerald-400 text-[11px]">
            <KeyRound className="w-3.5 h-3.5" />
            <span>ArmorIQ Merkle signature attached & verified</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={() => onReject(intent.intent_id)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#171c2b] text-slate-300 hover:bg-[#23293d] hover:text-white transition-colors"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            Halt Execution (Fail-Closed)
          </button>
          <button
            onClick={() => onApprove(intent.intent_id)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-500 shadow-md shadow-amber-600/30 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            Authorize Consequential Action
          </button>
        </div>
      </div>
    </div>
  );
};
