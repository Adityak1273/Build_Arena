import React, { useState } from 'react';
import {
  Brain,
  Globe,
  Database,
  Palette,
  ShieldAlert,
  ShieldCheck,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  StopCircle,
  Pause,
  Play,
  UserCheck,
  XCircle,
  KeyRound,
  FileSpreadsheet,
  Video,
  Code2
} from 'lucide-react';
import {
  SwarmAgentProfile,
  SwarmAgentId,
  AgentHandoffMessage,
  AutonomousPlanResult,
  IntentToken
} from '../types';

interface MultiAgentSidebarProps {
  agents: SwarmAgentProfile[];
  handoffs: AgentHandoffMessage[];
  activePlan: AutonomousPlanResult | null;
  isExecutingPlan: boolean;
  isPaused: boolean;
  pendingIntent: IntentToken | null;
  onApproveIntent: (intentId: string) => void;
  onRejectIntent: (intentId: string) => void;
  onManualTakeover: (intentId: string) => void;
  onPauseExecution: () => void;
  onResumeExecution: () => void;
  onCancelExecution: () => void;
  onDispatchPrompt: (prompt: string) => void;
}

export const MultiAgentSidebar: React.FC<MultiAgentSidebarProps> = ({
  agents,
  handoffs,
  activePlan,
  isExecutingPlan,
  isPaused,
  pendingIntent,
  onApproveIntent,
  onRejectIntent,
  onManualTakeover,
  onPauseExecution,
  onResumeExecution,
  onCancelExecution,
  onDispatchPrompt,
}) => {
  const [promptText, setPromptText] = useState('');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim()) return;
    onDispatchPrompt(promptText.trim());
    setPromptText('');
  };

  const quickChips = [
    { label: '⚡ Run 10-Startup Research Swarm', prompt: 'Research 10 AI startups, compare product and pricing, write to spreadsheet, create a launch image' },
    { label: '🎬 Launch GTM Multimodal Swarm', prompt: 'Launch full GTM multimodal campaign: render high-res poster and mux 1080p video' },
    { label: '🔍 Run 7-Agent Code Audit', prompt: 'Execute parallel 7-critic AST code review on active codebase' },
  ];

  return (
    <aside className="w-full h-full flex flex-col bg-[#0B0E17]/95 border-l border-white/[0.08] backdrop-blur-2xl text-slate-100 select-none overflow-hidden">
      {/* 1. Header: Multi-Agent Swarm Command Center */}
      <div className="p-3.5 border-b border-white/[0.08] bg-gradient-to-r from-[#0F121C] via-[#141826] to-[#0F121C] shadow-[0_2px_15px_rgba(0,0,0,0.4)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-cyan-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs font-display font-extrabold text-white tracking-tight uppercase">
                Multi-Agent Swarm HUD
              </h2>
              <p className="text-[10px] text-slate-400 font-sans">
                AdaL Dynamic Specialist Worker Swarm (5 Agents)
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Swarm Live
          </span>
        </div>

        {/* 2. 5-Agent Roster Grid */}
        <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2 border-t border-white/[0.06]">
          {agents.map((agent) => {
            const isActing = agent.state === 'ACTING ON TAB' || agent.state === 'THINKING' || agent.state === 'VERIFYING';
            const isWaiting = agent.state === 'AWAITING APPROVAL';

            return (
              <div
                key={agent.id}
                className={`relative p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  isActing
                    ? 'bg-cyan-500/10 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                    : isWaiting
                    ? 'bg-rose-500/10 border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.25)] animate-pulse'
                    : 'bg-[#06080D] border-white/[0.06]'
                }`}
                title={`${agent.name} (${agent.role}): ${agent.state}`}
              >
                {/* Status Ring / Icon */}
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    agent.id === 'orchestrator' ? 'bg-indigo-600/30 text-indigo-300' :
                    agent.id === 'navigator' ? 'bg-cyan-600/30 text-cyan-300' :
                    agent.id === 'researcher' ? 'bg-emerald-600/30 text-emerald-300' :
                    agent.id === 'coder' ? 'bg-purple-600/30 text-purple-300' :
                    'bg-amber-600/30 text-amber-300'
                  }`}>
                    {agent.id === 'orchestrator' && <Brain className="w-3.5 h-3.5" />}
                    {agent.id === 'navigator' && <Globe className="w-3.5 h-3.5" />}
                    {agent.id === 'researcher' && <Database className="w-3.5 h-3.5" />}
                    {agent.id === 'coder' && <Palette className="w-3.5 h-3.5" />}
                    {agent.id === 'verifier' && <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>

                  {/* Pulsing state dot */}
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#0B0E17] ${
                    isActing ? 'bg-cyan-400 animate-ping' :
                    isWaiting ? 'bg-rose-400 animate-ping' :
                    'bg-slate-500'
                  }`} />
                </div>

                <span className="text-[9px] font-bold text-slate-200 truncate w-full">
                  {agent.name.split(' ')[0]}
                </span>
                <span className={`text-[8px] font-mono font-semibold px-1 rounded truncate w-full ${
                  isActing ? 'text-cyan-300 bg-cyan-400/10' :
                  isWaiting ? 'text-rose-300 bg-rose-400/10' :
                  'text-slate-500'
                }`}>
                  {agent.state === 'ACTING ON TAB' ? 'ACTING' : agent.state}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Pinned Human Clearance Gate (Zero-Trust Modal In-Sidebar) */}
      {pendingIntent && (
        <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-[#1E1118] to-[#120B10] border-2 border-rose-500/50 shadow-[0_0_25px_rgba(244,63,94,0.3)] space-y-2 animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400 animate-bounce shrink-0" />
            <div className="flex-1">
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">
                VIGIL POLICY INTERCEPTION
              </span>
              <h4 className="text-xs font-display font-bold text-white mt-0.5">
                Clearance Required: {pendingIntent.action}
              </h4>
            </div>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {pendingIntent.reason}
          </p>

          <div className="p-2 rounded-lg bg-[#06080D] border border-white/[0.08] text-[10px] font-mono text-slate-400 space-y-0.5">
            <div>Target: <span className="text-cyan-300 font-bold">{pendingIntent.target}</span></div>
            <div className="text-emerald-400 truncate">Token: {pendingIntent.intent_id}</div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => onRejectIntent(pendingIntent.intent_id)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <XCircle className="w-3 h-3" />
              <span>Cancel</span>
            </button>
            <button
              onClick={() => onManualTakeover(pendingIntent.intent_id)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3" />
              <span>Takeover</span>
            </button>
            <button
              onClick={() => onApproveIntent(pendingIntent.intent_id)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-[10px] font-mono font-bold shadow-[0_0_12px_rgba(16,185,129,0.35)] transition-all cursor-pointer flex items-center justify-center gap-1 border border-emerald-400/40"
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Autonomous Swarm Plan Execution Bar */}
      {activePlan && (
        <div className="px-3.5 py-2.5 border-b border-white/[0.08] bg-[#0E121E]/90 space-y-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Plan: {activePlan.plan_id.slice(0, 12)}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              activePlan.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
              activePlan.status === 'EXECUTING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
              activePlan.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
              'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
            }`}>
              {activePlan.status}
            </span>
          </div>

          {/* Step Progress Pills */}
          <div className="flex items-center gap-1">
            {activePlan.steps.map((st, i) => (
              <div
                key={i}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  st.verification_state === 'VERIFIED' ? 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                  st.status === 'RUNNING' ? 'bg-amber-400 animate-pulse' :
                  st.status === 'FAILED' ? 'bg-rose-500' :
                  'bg-white/[0.1]'
                }`}
                title={`${st.step_id} (${st.tool}): ${st.verification_state || st.status}`}
              />
            ))}
          </div>

          {/* Loop Control Buttons */}
          {isExecutingPlan && (
            <div className="flex items-center gap-1.5 pt-1">
              <button
                onClick={isPaused ? onResumeExecution : onPauseExecution}
                className="flex-1 py-1 rounded-md bg-amber-600/25 hover:bg-amber-600/40 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{isPaused ? 'Resume Swarm' : 'Pause Takeover'}</span>
              </button>
              <button
                onClick={onCancelExecution}
                className="py-1 px-3 rounded-md bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <StopCircle className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Live Inter-Agent Handoff Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-sans">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pb-1 border-b border-white/[0.06]">
          <span className="font-bold text-cyan-400 uppercase tracking-wider">Inter-Agent Handoff Stream</span>
          <span>{handoffs.length} Transitions</span>
        </div>

        {handoffs.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-slate-500 font-mono text-xs">
            <Brain className="w-8 h-8 text-slate-600 mx-auto animate-pulse" />
            <p>Swarm standing by on active tab.</p>
            <p className="text-[10px] text-slate-600">Type a goal below or click a quick-action chip to dispatch autonomous agents.</p>
          </div>
        ) : (
          handoffs.map((msg) => (
            <div
              key={msg.id}
              className="p-2.5 rounded-xl bg-[#07090F] border border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.3)] space-y-1.5 animate-fade-in text-xs"
            >
              {/* Agent Handoff Route */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-indigo-400 uppercase">{msg.fromAgent}</span>
                  <ArrowRight className="w-3 h-3 text-cyan-400" />
                  <span className="text-cyan-400 uppercase">{msg.toAgent}</span>
                </div>
                <span className="text-slate-500">{msg.timestamp}</span>
              </div>

              {/* Action Description */}
              <p className="text-[11px] text-slate-200 font-sans leading-snug">
                {msg.action}
              </p>

              {msg.details && (
                <div className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
                  {msg.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 6. Quick Action Swarm Chips */}
      <div className="p-2.5 border-t border-white/[0.06] bg-[#07090E] space-y-1.5 shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-wider text-slate-500 font-bold">
          Quick Swarm Orchestrations:
        </div>
        <div className="flex flex-col gap-1">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onDispatchPrompt(chip.prompt)}
              className="w-full text-left px-2.5 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-slate-300 hover:text-white text-[11px] font-sans transition-all cursor-pointer truncate flex items-center justify-between group"
            >
              <span className="truncate">{chip.label}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* 7. Bottom Unified Prompt Input */}
      <div className="p-3 border-t border-white/[0.08] bg-[#0D101C] shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Command the 5-Agent Swarm..."
            className="flex-1 bg-[#06080E] border border-white/[0.1] focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-sans outline-hidden"
          />
          <button
            type="submit"
            disabled={!promptText.trim()}
            className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
