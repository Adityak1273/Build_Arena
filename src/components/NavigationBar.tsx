import React from 'react';
import { ShieldCheck, Activity, Terminal, Layers } from 'lucide-react';
import { ModeChips } from './ModeChips';
import { ForgeMode } from '../types';

interface NavigationBarProps {
  activeMode: ForgeMode;
  onSelectMode: (mode: ForgeMode) => void;
  wsConnected: boolean;
  onToggleTelemetry: () => void;
  telemetryCount: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeMode,
  onSelectMode,
  wsConnected,
  onToggleTelemetry,
  telemetryCount,
}) => {
  return (
    <header className="h-14 px-4 bg-[#0a0d14] border-b border-[#23293d] flex items-center justify-between select-none z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Auto<span className="text-blue-500">Forge</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#171c2b] text-blue-400 border border-[#23293d]">
                v1.0 CDP
              </span>
            </div>
            <p className="text-[10px] text-slate-400">AI-Native Developer Browser</p>
          </div>
        </div>
      </div>

      {/* Center YouTube-style Mode Chips */}
      <div className="flex-1 max-w-xl flex justify-center">
        <ModeChips activeMode={activeMode} onSelectMode={onSelectMode} />
      </div>

      {/* Right Telemetry & ArmorIQ Security Indicators */}
      <div className="flex items-center gap-3">
        {/* Zero-Trust Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ArmorIQ CSRG: Active</span>
        </div>

        {/* WebSocket Connection State */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#111520] border border-[#23293d] text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
            }`}
          />
          <span className="text-slate-300">
            {wsConnected ? 'WS Synced' : 'WS Reconnecting'}
          </span>
        </div>

        {/* Telemetry Drawer Trigger */}
        <button
          onClick={onToggleTelemetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111520] hover:bg-[#171c2b] border border-[#23293d] text-xs text-slate-300 font-mono transition-colors"
        >
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>Feed</span>
          {telemetryCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px]">
              {telemetryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
