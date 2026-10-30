import React from 'react';
import { Terminal, Shield, Trash2, X } from 'lucide-react';
import { TelemetryEvent } from '../types';

interface TelemetryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: TelemetryEvent[];
  onClear: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({
  isOpen,
  onClose,
  events,
  onClear,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 z-40 bg-[#0B0E17]/95 backdrop-blur-2xl border-l border-white/[0.08] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col font-mono text-xs animate-slide-left text-slate-200">
      <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-[#07090E]/80">
        <div className="flex items-center gap-2 text-white font-display font-bold">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Real-Time Telemetry Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClear}
            title="Clear logs"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close drawer"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#07090E]/50">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-sans text-xs">
            No active telemetry events recorded yet.
          </div>
        ) : (
          events.map((ev) => {
            const isBlocked = ev.type === 'TASK_BLOCKED' || ev.type === 'APPROVAL_REJECTED';
            const isSuccess = ev.type === 'TASK_COMPLETED' || ev.payload?.level === 'SUCCESS' || ev.type === 'WS_CONNECT';
            const isWarn = ev.type === 'APPROVAL_REQUEST';

            return (
              <div
                key={ev.id}
                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] ${
                  isBlocked
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-200 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : isSuccess
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                    : isWarn
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'bg-[#0F121C]/80 border-white/[0.08] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between opacity-80 text-[10px] mb-1 font-bold">
                  <span className="uppercase tracking-wider font-mono text-cyan-300">{ev.type}</span>
                  <span className="text-slate-400 font-mono font-normal">{ev.timestamp}</span>
                </div>
                <div className="break-words font-mono text-[10.5px]">
                  {typeof ev.payload === 'string'
                    ? ev.payload
                    : JSON.stringify(ev.payload, null, 2)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-white/[0.08] bg-[#07090E]/80 text-[10.5px] text-slate-400 flex items-center justify-between font-sans">
        <span className="flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-indigo-400" />
          VIGIL Policy Gate
        </span>
        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold">
          100% Fail-Closed
        </span>
      </div>
    </div>
  );
};
