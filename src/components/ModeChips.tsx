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
    <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg shadow-2xs">
      {modes.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all select-none cursor-pointer ${
              isActive
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
            }`}
          >
            <span className="shrink-0">{m.icon}</span>
            <span className="font-bold tracking-tight">{m.label}</span>
            {m.badge && (
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold uppercase transition-colors ${
                  isActive
                    ? 'bg-orange-700/80 text-white'
                    : 'bg-slate-200 text-slate-600'
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
