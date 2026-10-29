import React, { useState } from 'react';
import { 
  Bot, ShieldCheck, Terminal, Cpu, CheckCircle2, 
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
    <div className="flex flex-col h-full bg-white/90 border-l border-slate-200/80 text-xs shadow-sm">
      {/* Top Header */}
      <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 bg-purple-100 rounded-lg text-purple-700 shadow-sm">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-semibold text-slate-800">AdaL Companion Runtime</h4>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              <span className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>{isProcessing ? `Active: ${activeAgent}` : 'Ready for instruction'}</span>
            </div>
          </div>
        </div>

        {/* Security Token Pill */}
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 text-[11px] font-mono shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>{intentToken ? intentToken.slice(0, 14) + '...' : 'ArmorIQ Guard'}</span>
        </div>
      </div>

      {/* Multi-Agent Status Grid (Pastel Palette from Slide 3) */}
      <div className="p-3 bg-slate-50/50 border-b border-slate-200 grid grid-cols-2 gap-2.5">
        <div className={`p-2.5 rounded-xl border transition-all shadow-xs ${
          activeAgent === 'Code Builder' 
            ? 'bg-purple-100/80 border-purple-300 ring-2 ring-purple-200' 
            : 'bg-purple-50/60 border-purple-100 hover:border-purple-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-purple-900">Code Builder</span>
            {activeAgent === 'Code Builder' && <RotateCw className="w-3.5 h-3.5 text-purple-700 animate-spin" />}
          </div>
          <span className="text-[10px] text-purple-700 font-medium">AdaL @src/ Scaffolder</span>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all shadow-xs ${
          activeAgent === 'Design Critic' 
            ? 'bg-rose-100/80 border-rose-300 ring-2 ring-rose-200' 
            : 'bg-rose-50/60 border-rose-100 hover:border-rose-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-rose-900">Design Critic</span>
            {activeAgent === 'Design Critic' && <Sparkles className="w-3.5 h-3.5 text-rose-700 animate-spin" />}
          </div>
          <span className="text-[10px] text-rose-700 font-medium">Anti-Boilerplate Loop</span>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all shadow-xs ${
          activeAgent === 'QA Agent' 
            ? 'bg-sky-100/80 border-sky-300 ring-2 ring-sky-200' 
            : 'bg-sky-50/60 border-sky-100 hover:border-sky-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-sky-900">QA / Tester</span>
            {activeAgent === 'QA Agent' && <Activity className="w-3.5 h-3.5 text-sky-700 animate-spin" />}
          </div>
          <span className="text-[10px] text-sky-700 font-medium">CDP + Vision Verification</span>
        </div>

        <div className={`p-2.5 rounded-xl border transition-all shadow-xs ${
          activeAgent === 'GTM Agent' 
            ? 'bg-amber-100/80 border-amber-300 ring-2 ring-amber-200' 
            : 'bg-amber-50/60 border-amber-100 hover:border-amber-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-amber-900">GTM Studio</span>
            {activeAgent === 'GTM Agent' && <RotateCw className="w-3.5 h-3.5 text-amber-700 animate-spin" />}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">ElevenLabs & FFmpeg</span>
        </div>
      </div>

      {/* Step Progress Bar */}
      {totalSteps > 0 && (
        <div className="px-4 py-2 bg-indigo-50/60 border-b border-indigo-100 flex items-center justify-between text-[11px] font-medium">
          <span className="text-indigo-800">Execution Progress</span>
          <span className="font-mono text-indigo-700 font-semibold bg-white px-2 py-0.5 rounded border border-indigo-200">
            Step {currentStep} of {totalSteps}
          </span>
        </div>
      )}

      {/* Filter Tabs in Pastel Pills */}
      <div className="px-3 py-2 bg-slate-50/90 flex items-center gap-1.5 border-b border-slate-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
            filter === 'all' 
              ? 'bg-white text-slate-800 shadow-xs border border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          All Activity
        </button>
        <button
          onClick={() => setFilter('security')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
            filter === 'security' 
              ? 'bg-rose-100 text-rose-800 border border-rose-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Security Guard
        </button>
        <button
          onClick={() => setFilter('critique')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
            filter === 'critique' 
              ? 'bg-purple-100 text-purple-800 border border-purple-200 shadow-xs' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Critique Logs
        </button>
      </div>

      {/* Event Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-[11px]">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Bot className="w-8 h-8 mx-auto mb-2.5 opacity-50 text-slate-400" />
            <p className="font-medium">Waiting for instructions...</p>
          </div>
        ) : (
          filteredEvents.map((evt, idx) => {
            if (evt.type === 'SECURITY_BLOCK') {
              return (
                <div key={idx} className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>ARMORIQ INJECTION BLOCKED</span>
                  </div>
                  <p className="text-[10px] text-rose-800 font-medium">{evt.reason}</p>
                </div>
              );
            }
            if (evt.type === 'APPROVAL_REQUIRED') {
              return (
                <div key={idx} className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 shadow-xs">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>POLICY HOLD: APPROVAL REQUIRED</span>
                  </div>
                  <p className="text-[10px] font-medium text-amber-800">Target: {evt.tool}</p>
                </div>
              );
            }
            if (evt.type === 'STEP_COMPLETED') {
              return (
                <div key={idx} className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {evt.agent}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 bg-emerald-200/70 rounded-full text-emerald-800 font-semibold">
                      {evt.verification || 'VERIFIED'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-700 mt-1 font-medium">{evt.action}</p>
                </div>
              );
            }
            return (
              <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-700 shadow-xs">
                <span className="font-semibold text-purple-700">[{evt.agent || evt.type}]</span> {evt.message || evt.action || JSON.stringify(evt)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
