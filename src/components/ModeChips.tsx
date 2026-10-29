import React from 'react';
import { Globe, Terminal, PlayCircle, Video, Sparkles } from 'lucide-react';
import { ForgeMode } from '../types';

interface ModeChipsProps {
  activeMode: ForgeMode;
  onSelectMode: (mode: ForgeMode) => void;
}

export const ModeChips: React.FC<ModeChipsProps> = ({ activeMode, onSelectMode }) => {
  const modes: { id: ForgeMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'browse', label: 'Chromium Shell', icon: <Globe className="w-3.5 h-3.5" />, badge: 'CDP 1.3' },
    { id: 'build', label: 'Council Studio', icon: <Terminal className="w-3.5 h-3.5" />, badge: '7 Critics' },
    { id: 'automate', label: 'Judge Bench', icon: <PlayCircle className="w-3.5 h-3.5" />, badge: 'Matrix' },
    { id: 'create', label: 'Media Lab', icon: <Video className="w-3.5 h-3.5" />, badge: '1080p' },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[#0b0e15]/90 backdrop-blur-xl border border-white/[0.08] rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      {modes.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-tight transition-all duration-200 select-none ${
              isActive
                ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-blue-600 text-white shadow-[0_2px_12px_rgba(99,102,241,0.35)] ring-1 ring-white/20'
                : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05]'
            }`}
          >
            <span className={`transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
              {m.icon}
            </span>
            <span className="font-medium">{m.label}</span>
            {m.badge && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold tracking-wider uppercase transition-colors ${
                  isActive
                    ? 'bg-black/25 text-indigo-100'
                    : 'bg-white/[0.06] text-slate-400 group-hover:text-slate-300'
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
