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
    <header className="h-14 px-4 sm:px-6 bg-white border-b border-slate-200 shadow-2xs flex items-center justify-between select-none z-30 sticky top-0">
      {/* Brand & Window Accents */}
      <div className="flex items-center gap-3">
        {/* Desktop Window Dots */}
        <div className="hidden sm:flex items-center gap-1.5 mr-1">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-400 hover:bg-rose-500 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 hover:bg-amber-500 transition-colors cursor-pointer" />
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 hover:bg-emerald-500 transition-colors cursor-pointer" />
        </div>

        <div className="flex items-center gap-2.5 sm:pl-2.5 sm:border-l sm:border-slate-200">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center font-bold text-white shadow-xs">
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-slate-900 font-sans">
                Auto<span className="text-orange-600 ml-0.5">Forge</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                AdaL Core
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden md:block">
              AI Browser <span className="mx-1">/</span> {modeLabels[activeMode]}
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
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-bold">VIGIL Intent Gate</span>
        </div>

        {/* WebSocket Sync Status Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              wsConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500 ring-2 ring-rose-200'
            }`}
          />
          <span className="text-[11px] text-slate-700 font-semibold">
            {wsConnected ? 'CDP Live' : 'Offline'}
          </span>
        </div>

        {/* Telemetry Feed Drawer Button */}
        <button
          onClick={onToggleTelemetry}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-xs text-slate-700 font-bold transition-all shadow-2xs cursor-pointer"
        >
          <Terminal className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-[11px]">Feed</span>
          {telemetryCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[9px] font-bold">
              {telemetryCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
