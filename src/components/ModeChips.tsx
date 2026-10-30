import React from 'react';
import { Globe, Terminal, PlayCircle, Video } from 'lucide-react';
import { ForgeMode } from '../types';

interface ModeChipsProps {
  activeMode: ForgeMode;
  onSelectMode: (mode: ForgeMode) => void;
}

export const ModeChips: React.FC<ModeChipsProps> = ({ activeMode, onSelectMode }) => {
  const modes: { id: ForgeMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'browse', label: 'Chromium Shell', icon: <Globe className="w-3.5 h-3.5" />, badge: 'CDP' },
    { id: 'build', label: 'Council Studio', icon: <Terminal className="w-3.5 h-3.5" />, badge: '7 Critics' },
    { id: 'automate', label: 'Judge Bench', icon: <PlayCircle className="w-3.5 h-3.5" />, badge: '10 Matrix' },
    { id: 'create', label: 'Media Lab', icon: <Video className="w-3.5 h-3.5" />, badge: 'GTM' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[#07090E]/80 backdrop-blur-md border border-white/[0.08] rounded-xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]">
      {modes.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all select-none cursor-pointer ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-white/20'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
            }`}
          >
            <span className="shrink-0">{m.icon}</span>
            <span className="font-semibold tracking-tight">{m.label}</span>
            {m.badge && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase transition-colors ${
                  isActive
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/[0.06] text-slate-400 border border-white/[0.05]'
                }`}
              >
                {m.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
