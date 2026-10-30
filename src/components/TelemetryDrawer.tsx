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
    <div className="fixed inset-y-0 right-0 w-96 z-40 bg-white border-l border-slate-200 shadow-xl flex flex-col font-mono text-xs animate-slide-left">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-2 text-slate-900 font-bold font-sans">
          <Terminal className="w-4 h-4 text-orange-600" />
          <span>Real-Time Telemetry Feed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onClear}
            title="Clear logs"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close drawer"
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/50">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-sans text-xs">
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
                className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all shadow-2xs ${
                  isBlocked
                    ? 'bg-red-50 border-red-200 text-red-900'
                    : isSuccess
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : isWarn
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between opacity-80 text-[10px] mb-1 font-bold">
                  <span className="uppercase tracking-wider">{ev.type}</span>
                  <span className="text-slate-400 font-normal">{ev.timestamp}</span>
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

      <div className="p-3 border-t border-slate-200 bg-slate-50 text-[10.5px] text-slate-500 flex items-center justify-between font-sans">
        <span className="flex items-center gap-1.5 font-medium">
          <Shield className="w-3.5 h-3.5 text-orange-600" />
          VIGIL Policy Gate
        </span>
        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded text-[9.5px] font-bold">
          100% Fail-Closed
        </span>
      </div>
    </div>
  );
};
