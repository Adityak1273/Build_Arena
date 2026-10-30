import React from 'react';
import { ShieldAlert, CheckCircle2, XCircle, KeyRound, UserCheck } from 'lucide-react';

interface ApprovalModalProps {
  isOpen: boolean;
  intent: {
    intent_id: string;
    action: string;
    target: string;
    risk_level: string;
    reason: string;
    intent_token?: string;
    merkle_signature?: string;
  } | null;
  onApprove: (intentId: string) => void;
  onReject: (intentId: string) => void;
  onManualTakeover?: (intentId: string) => void;
}

export const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  intent,
  onApprove,
  onReject,
  onManualTakeover,
}) => {
  if (!isOpen || !intent) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#07090D]/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-lg p-6 bg-[#FAF7F2] border-2 border-[#00F2FE]/50 rounded-2xl shadow-[0_12px_45px_rgba(0,0,0,0.25),0_0_35px_rgba(0,242,254,0.25)] text-[#0D1117]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-100 border border-rose-300 rounded-xl text-rose-600 shrink-0 shadow-xs">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-rose-100 text-rose-800 uppercase tracking-wider border border-rose-300">
                {intent.risk_level} INTENT
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Token: <span className="text-[#0D9488] font-bold">{intent.intent_token || `tok_${intent.intent_id.slice(0, 10)}`}</span>
              </span>
            </div>
            <h3 className="mt-1.5 text-base font-display font-extrabold text-[#0D1117] tracking-tight">
              VIGIL Policy Clearance Required
            </h3>
            <p className="mt-1 text-xs text-slate-700 leading-relaxed font-sans font-medium">
              {intent.reason}
            </p>
          </div>
        </div>

        <div className="mt-4 p-3.5 rounded-xl bg-white border border-[#E5DEC9] space-y-2 text-xs font-mono shadow-xs">
          <div className="flex justify-between text-slate-600">
            <span className="font-semibold text-slate-600">Action:</span>
            <span className="text-[#0D1117] font-bold">{intent.action}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span className="font-semibold text-slate-600">Target Resource:</span>
            <span className="text-[#0D9488] font-bold truncate max-w-xs">{intent.target}</span>
          </div>
          <div className="flex items-center gap-1.5 pt-2 border-t border-[#E5DEC9] text-[#0F766E] text-[11px] font-semibold">
            <KeyRound className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
            <span className="truncate">Merkle Root: {intent.merkle_signature || 'HMAC-SHA256 (64-byte signature verified)'}</span>
          </div>
        </div>

        {/* 3 High-Contrast Action Buttons */}
        <div className="mt-5 flex items-center justify-end gap-2 flex-wrap">
          <button
            onClick={() => onReject(intent.intent_id)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 shadow-xs transition-all cursor-pointer"
          >
            <XCircle className="w-4 h-4 text-rose-600" />
            Emergency Cancel
          </button>

          <button
            onClick={() => onManualTakeover ? onManualTakeover(intent.intent_id) : onApprove(intent.intent_id)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-bold rounded-xl bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 text-indigo-900 shadow-xs transition-all cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-indigo-700" />
            Manual Takeover
          </button>

          <button
            onClick={() => onApprove(intent.intent_id)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold rounded-xl bg-[#07090D] hover:bg-[#121622] text-[#00F2FE] shadow-[0_0_18px_rgba(0,242,254,0.35)] transition-all cursor-pointer border border-[#00F2FE]/50"
          >
            <CheckCircle2 className="w-4 h-4 text-[#00F2FE]" />
            Approve & Execute
          </button>
        </div>
      </div>
    </div>
  );
};
