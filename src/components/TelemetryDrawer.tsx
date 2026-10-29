import React from 'react';
import { Terminal, Shield, CheckCircle, AlertTriangle, XCircle, Trash2, X } from 'lucide-react';
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
    <div className="fixed inset-y-0 right-0 w-96 z-40 bg-[#0e121b] border-l border-[#23293d] shadow-2xl flex flex-col font-mono text-xs animate-slide-left">
      <div className="flex items-center justify-between p-4 border-b border-[#23293d] bg-[#111520]">
        <div className="flex items-center gap-2 text-slate-200 font-bold">
          <Terminal className="w-4 h-4 text-blue-400" />
          <span>Real-Time Telemetry Feed</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClear}
            title="Clear logs"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            title="Close drawer"
            className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {events.length === 0 ? (
          <div className="text-center py-12 text-slate-500 font-sans text-xs">
            No active telemetry events recorded yet.
          </div>
        ) : (
          events.map((ev) => {
            const isBlocked = ev.type === 'TASK_BLOCKED';
            const isSuccess = ev.type === 'TASK_COMPLETED' || ev.payload?.level === 'SUCCESS';
            const isWarn = ev.type === 'APPROVAL_REQUEST';

            return (
              <div
                key={ev.id}
                className={`p-2.5 rounded-lg border text-[11px] leading-relaxed transition-all ${
                  isBlocked
                    ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                    : isSuccess
                    ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
                    : isWarn
                    ? 'bg-amber-950/20 border-amber-900/50 text-amber-300'
                    : 'bg-[#141926] border-[#23293d] text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between opacity-80 text-[10px] mb-1">
                  <span className="font-bold uppercase tracking-wider">{ev.type}</span>
                  <span>{ev.timestamp}</span>
                </div>
                <div className="break-words">
                  {typeof ev.payload === 'string'
                    ? ev.payload
                    : JSON.stringify(ev.payload, null, 2)}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-3 border-t border-[#23293d] bg-[#111520] text-[10px] text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-blue-400" />
          ArmorIQ Zero-Trust Guard
        </span>
        <span className="text-emerald-400 font-bold">100% Fail-Closed</span>
      </div>
    </div>
  );
};
