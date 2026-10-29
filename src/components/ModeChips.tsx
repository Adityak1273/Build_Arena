import React from 'react';
import { Globe, Cpu, PlayCircle, Video } from 'lucide-react';
import { ForgeMode } from '../types';

interface ModeChipsProps {
  activeMode: ForgeMode;
  onSelectMode: (mode: ForgeMode) => void;
}

export const ModeChips: React.FC<ModeChipsProps> = ({ activeMode, onSelectMode }) => {
  const modes: { id: ForgeMode; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'browse', label: 'Browse', icon: <Globe className="w-4 h-4" /> },
    { id: 'build', label: 'Build', icon: <Cpu className="w-4 h-4" />, badge: '7 Critics' },
    { id: 'automate', label: 'Automate', icon: <PlayCircle className="w-4 h-4" />, badge: 'Judge Bench' },
    { id: 'create', label: 'Create', icon: <Video className="w-4 h-4" />, badge: '1080p GTM' },
  ];

  return (
    <div className="flex items-center gap-1.5 p-1 bg-[#111520] border border-[#23293d] rounded-full shadow-inner">
      {modes.map((m) => {
        const isActive = activeMode === m.id;
        return (
          <button
            key={m.id}
            onClick={() => onSelectMode(m.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 select-none ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-1 ring-blue-400/50'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#171c2b]'
            }`}
          >
            {m.icon}
            <span>{m.label}</span>
            {m.badge && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                  isActive
                    ? 'bg-blue-800/80 text-blue-100'
                    : 'bg-[#23293d] text-slate-400'
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
