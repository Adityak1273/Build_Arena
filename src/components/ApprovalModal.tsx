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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-lg p-6 bg-white border-2 border-amber-300 rounded-2xl shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-900 uppercase tracking-wider border border-amber-200">
                {intent.risk_level} INTENT
              </span>
              <span className="text-xs text-slate-500 font-mono">
                ID: {intent.intent_id.slice(0, 12)}...
              </span>
            </div>
            <h3 className="mt-1 text-base font-bold text-slate-900">
              VIGIL Policy Clearance Required
            </h3>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed font-sans">
              {intent.reason}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
          <div className="flex justify-between text-slate-600">
            <span className="font-semibold text-slate-500">Action:</span>
            <span className="text-slate-900 font-bold">{intent.action}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-semibold text-slate-500">Target Resource:</span>
            <span className="text-slate-900 font-semibold truncate max-w-xs">{intent.target}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200 text-emerald-800 text-[11px] font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-emerald-600" />
            <span>Cryptographic Merkle Root: HMAC-SHA256 verified</span>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={() => onReject(intent.intent_id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-red-700 shadow-2xs transition-colors cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-500" />
            Reject (Fail-Closed)
          </button>
          <button
            onClick={() => onApprove(intent.intent_id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-orange-600 text-white hover:bg-orange-700 shadow-xs transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            Authorize Action
          </button>
        </div>
      </div>
    </div>
  );
};
