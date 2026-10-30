import React from 'react';
import { ShieldCheck, Terminal, Sparkles } from 'lucide-react';
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
  const modeLabels: Record<ForgeMode, string> = {
    browse: 'Chromium Shell / CDP',
    build: '7-Reviewer Council Studio',
    automate: 'Startup Verification Matrix',
    create: 'Multimodal GTM Studio',
  };

  return (
    <header className="h-14 px-4 sm:px-6 bg-[#0B0E17]/85 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_4px_25px_rgba(0,0,0,0.5)] flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Window Accents */}
      <div className="flex items-center gap-3">
        {/* Desktop Window Dots */}
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:bg-rose-400 transition-colors cursor-pointer shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80 hover:bg-amber-400 transition-colors cursor-pointer shadow-[0_0_8px_rgba(245,158,11,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 hover:bg-emerald-400 transition-colors cursor-pointer shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
        </div>

        <div className="flex items-center gap-2.5 sm:pl-2.5 sm:border-l sm:border-white/[0.08]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 flex items-center justify-center font-bold text-white shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-extrabold text-base tracking-tight text-white">
                Auto<span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent ml-0.5">Forge</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                AdaL Core
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              AI Browser <span className="mx-1 text-slate-600">/</span> <span className="text-slate-300">{modeLabels[activeMode]}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Center Segmented Floating Mode Chips */}
      <div className="flex-1 max-w-xl flex justify-center px-2">
        <ModeChips activeMode={activeMode} onSelectMode={onSelectMode} />
      </div>

      {/* Right Telemetry & Status Badges */}
      <div className="flex items-center gap-2">
        {/* Zero-Trust Merkle Gate Status */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.12)]">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-mono font-bold">VIGIL Gate</span>
        </div>

        {/* WebSocket Sync Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-400 ring-2 ring-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 ring-2 ring-rose-500/40'
            }`}
          />
          <span className="text-[11px] font-mono text-slate-300 font-semibold">
            {wsConnected ? 'CDP Live' : 'Offline'}
          </span>
        </div>

        {/* Telemetry Feed Drawer Button */}
        <button
          onClick={onToggleTelemetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs text-slate-200 font-mono font-bold transition-all shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px]">Feed</span>
          {telemetryCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-[9px] font-bold shadow-[0_0_10px_rgba(99,102,241,0.5)]">
              {telemetryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
