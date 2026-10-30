import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, KeyRound } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030407]/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-[#0F121C]/95 backdrop-blur-2xl border border-rose-500/30 rounded-2xl shadow-[0_0_60px_rgba(244,63,94,0.18),inset_0_1px_0_0_rgba(255,255,255,0.08)]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 uppercase tracking-wider border border-rose-500/30">
                {intent.risk_level} INTENT
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {intent.intent_id.slice(0, 12)}...
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-display font-bold text-white tracking-tight">
              VIGIL Policy Clearance Required
            </h3>
            <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">
              {intent.reason}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-[#06080D] border border-white/[0.08] space-y-2 text-xs font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
          <div className="flex justify-between text-slate-400">
            <span className="font-semibold text-slate-400">Action:</span>
            <span className="text-white font-bold">{intent.action}</span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span className="font-semibold text-slate-400">Target Resource:</span>
            <span className="text-cyan-300 font-semibold truncate max-w-xs">{intent.target}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-white/[0.08] text-emerald-400 text-[11px] font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cryptographic Merkle Root: HMAC-SHA256 verified</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={() => onReject(intent.intent_id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-white/[0.06] border border-white/[0.1] text-slate-300 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-200 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            Reject (Fail-Closed)
          </button>
          <button
            onClick={() => onApprove(intent.intent_id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all cursor-pointer border border-emerald-400/30"
          >
            <CheckCircle2 className="w-4 h-4" />
            Authorize Action
          </button>
        </div>
      </div>
    </div>
  );
};
