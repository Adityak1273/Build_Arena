import React from 'react';
import { ShieldCheck, Terminal, Layers, Activity, ChevronRight, Sparkles } from 'lucide-react';
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
    <header className="h-14 px-4 bg-[#07090e]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between select-none z-30">
      {/* Brand & Window Accents */}
      <div className="flex items-center gap-3">
        {/* Sleek macOS/Developer Window Control Dots */}
        <div className="flex items-center gap-1.5 mr-1">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:opacity-100 transition-opacity cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:opacity-100 transition-opacity cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>

        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_2px_10px_rgba(99,102,241,0.3)] ring-1 ring-white/20">
            <Layers className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight text-white font-sans">
              Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Forge</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/[0.04] text-slate-400 border border-white/[0.06]">
              Chromium
            </span>
          </div>
        </div>
      </div>

      {/* Center Segmented Floating Mode Chips */}
      <div className="flex-1 max-w-xl flex justify-center">
        <ModeChips activeMode={activeMode} onSelectMode={onSelectMode} />
      </div>

      {/* Right Telemetry & Status Badges */}
      <div className="flex items-center gap-2.5">
        {/* Zero-Trust Merkle Gate Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-medium tracking-tight">ArmorIQ CSRG</span>
        </div>

        {/* WebSocket Sync Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs font-mono">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              wsConnected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-400'
            }`}
          />
          <span className="text-[11px] text-slate-300 font-medium">
            {wsConnected ? 'Live CDP' : 'Offline'}
          </span>
        </div>

        {/* Telemetry Feed Drawer Button */}
        <button
          onClick={onToggleTelemetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs text-slate-200 font-mono transition-all duration-150 shadow-sm"
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-medium text-[11px]">Feed</span>
          {telemetryCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500 text-white text-[9px] font-bold">
              {telemetryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
