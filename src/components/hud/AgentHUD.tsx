import React, { useState } from 'react';
import { 
  Bot, ShieldCheck, Terminal, Cpu, CheckCircle, 
  XCircle, AlertOctagon, RotateCw, Sparkles, Activity
} from 'lucide-react';
import { AgentEvent } from '../../types';

interface AgentHUDProps {
  events: AgentEvent[];
  activeAgent: string;
  currentStep: number;
  totalSteps: number;
  isProcessing: boolean;
  intentToken: string | null;
}

export const AgentHUD: React.FC<AgentHUDProps> = ({
  events,
  activeAgent,
  currentStep,
  totalSteps,
  isProcessing,
  intentToken,
}) => {
  const [filter, setFilter] = useState<'all' | 'security' | 'critique'>('all');

  const filteredEvents = events.filter((e) => {
    if (filter === 'security') return e.type.includes('SECURITY') || e.type.includes('APPROVAL');
    if (filter === 'critique') return e.agent?.includes('Critic') || e.action?.includes('redesign');
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#0d1322] border-l border-slate-800 text-xs">
      {/* Top Header */}
      <div className="px-4 py-3 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-indigo-500/10 rounded text-indigo-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-200">AdaL Companion Runtime</h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span className={`w-1.5 h-1.5 rounded-full ${isProcessing ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isProcessing ? `Active: ${activeAgent}` : 'Ready for instruction'}</span>
            </div>
          </div>
        </div>

        {/* Security Token Pill */}
        <div className="flex items-center gap-1 bg-emerald-950/40 text-emerald-300 px-2 py-1 rounded border border-emerald-500/30 text-[10px] font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>{intentToken ? intentToken.slice(0, 14) + '...' : 'ArmorIQ Guard'}</span>
        </div>
      </div>

      {/* Multi-Agent Status Grid (Slide 3) */}
      <div className="p-3 bg-[#090e1a] border-b border-slate-800/80 grid grid-cols-2 gap-2">
        <div className={`p-2 rounded border transition-all ${
          activeAgent === 'Code Builder' ? 'bg-indigo-950/40 border-indigo-500/50 shadow-sm' : 'bg-[#101728] border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-300">Code Builder</span>
            {activeAgent === 'Code Builder' && <RotateCw className="w-3 h-3 text-indigo-400 animate-spin" />}
          </div>
          <span className="text-[10px] text-slate-400">AdaL @src/ Scaffolder</span>
        </div>

        <div className={`p-2 rounded border transition-all ${
          activeAgent === 'Design Critic' ? 'bg-purple-950/40 border-purple-500/50 shadow-sm' : 'bg-[#101728] border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-300">Design Critic</span>
            {activeAgent === 'Design Critic' && <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />}
          </div>
          <span className="text-[10px] text-slate-400">Anti-Boilerplate Loop</span>
        </div>

        <div className={`p-2 rounded border transition-all ${
          activeAgent === 'QA Agent' ? 'bg-cyan-950/40 border-cyan-500/50 shadow-sm' : 'bg-[#101728] border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-300">QA / Tester</span>
            {activeAgent === 'QA Agent' && <Activity className="w-3 h-3 text-cyan-400 animate-spin" />}
          </div>
          <span className="text-[10px] text-slate-400">CDP + Vision Verification</span>
        </div>

        <div className={`p-2 rounded border transition-all ${
          activeAgent === 'GTM Agent' ? 'bg-amber-950/40 border-amber-500/50 shadow-sm' : 'bg-[#101728] border-slate-800 text-slate-400'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-medium text-slate-300">GTM Studio</span>
            {activeAgent === 'GTM Agent' && <RotateCw className="w-3 h-3 text-amber-400 animate-spin" />}
          </div>
          <span className="text-[10px] text-slate-400">ElevenLabs & FFmpeg</span>
        </div>
      </div>

      {/* Step Progress Bar */}
      {totalSteps > 0 && (
        <div className="px-4 py-2 bg-[#0c1220] border-b border-slate-800 flex items-center justify-between text-[11px]">
          <span className="text-slate-400">Execution Progress</span>
          <span className="font-mono text-indigo-300">Step {currentStep} of {totalSteps}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="px-3 py-2 bg-[#0a0f1c] flex items-center gap-1.5 border-b border-slate-800/80">
        <button
          onClick={() => setFilter('all')}
          className={`px-2 py-0.5 rounded text-[10px] ${filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          All Logs
        </button>
        <button
          onClick={() => setFilter('security')}
          className={`px-2 py-0.5 rounded text-[10px] ${filter === 'security' ? 'bg-red-900/60 text-red-200' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Security Gate
        </button>
        <button
          onClick={() => setFilter('critique')}
          className={`px-2 py-0.5 rounded text-[10px] ${filter === 'critique' ? 'bg-purple-900/60 text-purple-200' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Critique Loop
        </button>
      </div>

      {/* Event Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 font-mono text-[11px]">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Bot className="w-6 h-6 mx-auto mb-2 opacity-40" />
            <p>Waiting for task execution...</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            if (evt.type === 'SECURITY_BLOCK') {
              return (
                <div key={idx} className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-red-300">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                    <span>ARMORIQ INJECTION BLOCKED</span>
                  </div>
                  <p className="text-[10px]">{evt.reason}</p>
                </div>
              );
            }
            if (evt.type === 'APPROVAL_REQUIRED') {
              return (
                <div key={idx} className="p-2.5 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200">
                  <div className="flex items-center gap-1.5 font-semibold mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>HOLD: APPROVAL REQUIRED</span>
                  </div>
                  <p className="text-[10px]">Tool: {evt.tool}</p>
                </div>
              );
            }
            if (evt.type === 'STEP_COMPLETED') {
              return (
                <div key={idx} className="p-2 rounded bg-emerald-950/20 border border-emerald-500/20 text-emerald-300">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-emerald-400" /> {evt.agent}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 bg-emerald-900/50 rounded text-emerald-200">
                      {evt.verification || 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">{evt.action}</p>
                </div>
              );
            }
            return (
              <div key={idx} className="p-1.5 rounded bg-slate-900/50 border border-slate-800 text-slate-300">
                <span className="text-indigo-400">[{evt.agent || evt.type}]</span> {evt.message || evt.action || JSON.stringify(evt)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
