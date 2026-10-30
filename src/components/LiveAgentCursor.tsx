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
      <div className="absolute -inset-2 rounded-full bg-[#00F2FE]/30 blur-md animate-ping" />

      {/* Cursor Icon with Electric Teal Gradient */}
      <div className="relative flex items-start gap-1.5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00F2FE] via-[#0D9488] to-[#07090D] p-1 text-[#07090D] shadow-[0_0_16px_rgba(0,242,254,0.9)] border border-white/60 flex items-center justify-center animate-bounce">
          <MousePointer className="w-3.5 h-3.5 -rotate-45 fill-[#07090D] text-[#07090D]" />
        </div>

        {/* Floating Agent Badge Pill: Ink Black with Electric Teal text & Warm Ivory elements */}
        <div className="px-3 py-1 rounded-full bg-[#07090D]/95 border border-[#00F2FE]/60 shadow-[0_4px_18px_rgba(0,242,254,0.3)] backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-[#00F2FE] animate-pulse shadow-[0_0_6px_#00F2FE]" />
          <span className="text-[11px] font-mono font-bold text-[#FAF7F2] tracking-tight">
            {agentName}
          </span>
          <span className="text-[10px] font-sans text-[#00F2FE] font-medium">
            {actionText}
          </span>
          <Sparkles className="w-2.5 h-2.5 text-[#00F2FE] shrink-0 animate-spin" />
        </div>
      </div>
    </div>
  );
};
