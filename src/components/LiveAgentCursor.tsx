import React from 'react';
import { MousePointer, Sparkles } from 'lucide-react';

interface LiveAgentCursorProps {
  visible: boolean;
  x: number;
  y: number;
  agentName: string;
  actionText: string;
}

export const LiveAgentCursor: React.FC<LiveAgentCursorProps> = ({
  visible,
  x,
  y,
  agentName,
  actionText,
}) => {
  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none z-30 transition-all duration-300 ease-out"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-4px, -4px)',
      }}
    >
      {/* Outer Pulsing Glow */}
      <div className="absolute -inset-2 rounded-full bg-cyan-500/25 blur-md animate-ping" />

      {/* Cursor Icon with Gradient */}
      <div className="relative flex items-start gap-1.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-600 p-1 text-white shadow-[0_0_15px_rgba(6,182,212,0.8)] border border-white/40 flex items-center justify-center animate-bounce">
          <MousePointer className="w-3.5 h-3.5 -rotate-45 fill-white text-white" />
        </div>

        {/* Floating Agent Badge Pill */}
        <div className="px-2.5 py-1 rounded-full bg-[#0B0E17]/95 border border-cyan-400/50 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-mono font-bold text-white tracking-tight">
            {agentName}
          </span>
          <span className="text-[10px] font-sans text-cyan-300">
            {actionText}
          </span>
          <Sparkles className="w-2.5 h-2.5 text-amber-300 shrink-0" />
        </div>
      </div>
    </div>
  );
};
