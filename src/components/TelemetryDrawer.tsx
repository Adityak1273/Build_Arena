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
    <div className="fixed inset-y-0 right-0 w-96 z-40 bg-[#FAF7F2] border-l-2 border-[#00F2FE]/40 shadow-[-8px_0_40px_rgba(0,0,0,0.25)] flex flex-col font-mono text-xs animate-slide-left text-[#0D1117] select-none">
      <div className="flex items-center justify-between p-4 border-b border-[#00F2FE]/20 bg-[#07090D] text-[#FAF7F2]">
        <div className="flex items-center gap-2 font-display font-bold">
          <Terminal className="w-4 h-4 text-[#00F2FE]" />
          <span>Real-Time Telemetry Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClear}
            title="Clear logs"
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00F2FE] hover:bg-white/[0.08] transition-colors cursor-pointer"
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

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-[#FAF7F2] teal-texture-grid">
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
                className={`p-3 rounded-xl border text-[11px] leading-relaxed transition-all shadow-xs ${
                  isBlocked
                    ? 'bg-rose-50 border-rose-300 text-rose-900'
                    : isSuccess
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : isWarn
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-white border-[#E5DEC9] text-[#0D1117] hover:border-[#00F2FE]/60'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-1 font-bold">
                  <span className="uppercase tracking-wider font-mono text-[#0D9488]">{ev.type}</span>
                  <span className="text-slate-500 font-mono font-medium">{ev.timestamp}</span>
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

      <div className="p-3.5 border-t border-[#00F2FE]/20 bg-[#07090D] text-[#FAF7F2] text-[10.5px] flex items-center justify-between font-sans">
        <span className="flex items-center gap-1.5 font-bold">
          <Shield className="w-3.5 h-3.5 text-[#00F2FE]" />
          VIGIL Policy Gate
        </span>
        <span className="text-[#00F2FE] bg-[#00F2FE]/15 border border-[#00F2FE]/40 px-2 py-0.5 rounded-md text-[9.5px] font-mono font-bold shadow-[0_0_8px_rgba(0,242,254,0.3)]">
          100% Fail-Closed
        </span>
      </div>
    </div>
  );
};
