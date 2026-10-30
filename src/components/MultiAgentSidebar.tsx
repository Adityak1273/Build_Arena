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
  StopCircle,
  Pause,
  Play,
  UserCheck,
  XCircle,
} from 'lucide-react';
import {
  SwarmAgentProfile,
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
    <aside className="w-full h-full flex flex-col bg-[#FAF7F2] border-l border-[#00F2FE]/25 text-[#0D1117] select-none overflow-hidden shadow-[-4px_0_25px_rgba(0,0,0,0.12)]">
      {/* 1. Header: Ink Black Command Center Framing */}
      <div className="p-3.5 border-b border-[#00F2FE]/20 bg-[#07090D] shadow-[0_2px_15px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00F2FE] via-[#0D9488] to-[#10B981] p-0.5 flex items-center justify-center shadow-[0_0_12px_rgba(0,242,254,0.4)]">
              <Sparkles className="w-4 h-4 text-[#07090D]" />
            </div>
            <div>
              <h2 className="text-xs font-display font-extrabold text-[#FAF7F2] tracking-tight uppercase">
                Multi-Agent Swarm HUD
              </h2>
              <p className="text-[10px] text-slate-400 font-sans">
                AdaL Dynamic Specialist Worker Swarm (5 Agents)
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#00F2FE]/15 text-[#00F2FE] text-[10px] font-mono font-bold border border-[#00F2FE]/40 flex items-center gap-1.5 shadow-[0_0_8px_rgba(0,242,254,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
            Swarm Live
          </span>
        </div>

        {/* 2. 5-Agent Roster Grid */}
        <div className="grid grid-cols-5 gap-1.5 mt-3 pt-2.5 border-t border-white/[0.08]">
          {agents.map((agent) => {
            const isActing = agent.state === 'ACTING ON TAB' || agent.state === 'THINKING' || agent.state === 'VERIFYING';
            const isWaiting = agent.state === 'AWAITING APPROVAL';

            return (
              <div
                key={agent.id}
                className={`relative p-1.5 rounded-lg border text-center transition-all flex flex-col items-center gap-1 ${
                  isActing
                    ? 'bg-[#00F2FE]/15 border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.35)]'
                    : isWaiting
                    ? 'bg-rose-500/20 border-rose-400/60 shadow-[0_0_12px_rgba(244,63,94,0.3)] animate-pulse'
                    : 'bg-[#121622] border-white/[0.08]'
                }`}
                title={`${agent.name} (${agent.role}): ${agent.state}`}
              >
                {/* Status Ring / Icon */}
                <div className="relative">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    agent.id === 'orchestrator' ? 'bg-[#00F2FE]/20 text-[#00F2FE]' :
                    agent.id === 'navigator' ? 'bg-[#0D9488]/30 text-[#00F2FE]' :
                    agent.id === 'researcher' ? 'bg-emerald-500/20 text-emerald-400' :
                    agent.id === 'coder' ? 'bg-purple-500/20 text-purple-300' :
                    'bg-amber-500/20 text-amber-300'
                  }`}>
                    {agent.id === 'orchestrator' && <Brain className="w-3.5 h-3.5" />}
                    {agent.id === 'navigator' && <Globe className="w-3.5 h-3.5" />}
                    {agent.id === 'researcher' && <Database className="w-3.5 h-3.5" />}
                    {agent.id === 'coder' && <Palette className="w-3.5 h-3.5" />}
                    {agent.id === 'verifier' && <ShieldCheck className="w-3.5 h-3.5" />}
                  </div>

                  {/* Pulsing state dot */}
                  <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-[#07090D] ${
                    isActing ? 'bg-[#00F2FE] animate-ping' :
                    isWaiting ? 'bg-rose-400 animate-ping' :
                    'bg-slate-500'
                  }`} />
                </div>

                <span className="text-[9px] font-bold text-[#FAF7F2] truncate w-full">
                  {agent.name.split(' ')[0]}
                </span>
                <span className={`text-[8px] font-mono font-bold px-1 rounded truncate w-full ${
                  isActing ? 'text-[#00F2FE] bg-[#00F2FE]/20' :
                  isWaiting ? 'text-rose-300 bg-rose-400/20' :
                  'text-slate-400'
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
        <div className="p-3 m-3 rounded-xl bg-gradient-to-b from-[#FFF5F5] to-[#FEE2E2] border-2 border-rose-500/60 shadow-[0_4px_20px_rgba(244,63,94,0.2)] space-y-2 animate-fade-in shrink-0 text-[#0D1117]">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-600 animate-bounce shrink-0" />
            <div className="flex-1">
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-600/15 text-rose-700 border border-rose-600/30">
                VIGIL POLICY INTERCEPTION
              </span>
              <h4 className="text-xs font-display font-extrabold text-rose-950 mt-0.5">
                Clearance Required: {pendingIntent.action}
              </h4>
            </div>
          </div>

          <p className="text-[11px] text-slate-700 font-sans leading-relaxed font-medium">
            {pendingIntent.reason}
          </p>

          <div className="p-2 rounded-lg bg-white border border-rose-200 text-[10px] font-mono text-slate-600 space-y-0.5 shadow-sm">
            <div>Target: <span className="text-[#0D9488] font-bold">{pendingIntent.target}</span></div>
            <div className="text-emerald-700 truncate">Token: {pendingIntent.intent_id}</div>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            <button
              onClick={() => onRejectIntent(pendingIntent.intent_id)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-rose-100 hover:bg-rose-200 border border-rose-300 text-rose-800 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <XCircle className="w-3 h-3 text-rose-600" />
              <span>Cancel</span>
            </button>
            <button
              onClick={() => onManualTakeover(pendingIntent.intent_id)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-indigo-100 hover:bg-indigo-200 border border-indigo-300 text-indigo-900 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <UserCheck className="w-3 h-3 text-indigo-700" />
              <span>Takeover</span>
            </button>
            <button
              onClick={() => onApproveIntent(pendingIntent.intent_id)}
              className="flex-1 py-1.5 px-2 rounded-lg bg-[#07090D] hover:bg-[#121622] text-[#00F2FE] text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(0,242,254,0.3)] transition-all cursor-pointer flex items-center justify-center gap-1 border border-[#00F2FE]/50"
            >
              <CheckCircle2 className="w-3 h-3 text-[#00F2FE]" />
              <span>Approve</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Active Autonomous Swarm Plan Execution Bar */}
      {activePlan && (
        <div className="px-3.5 py-2.5 border-b border-[#E5DEC9] bg-[#F4EFE6] space-y-2 shrink-0">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-bold text-[#0D1117] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
              <span>Plan: {activePlan.plan_id.slice(0, 12)}</span>
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              activePlan.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              activePlan.status === 'EXECUTING' ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' :
              activePlan.status === 'CANCELLED' ? 'bg-rose-100 text-rose-800 border-rose-300' :
              'bg-[#00F2FE]/15 text-[#0F766E] border-[#00F2FE]/40'
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
                  st.verification_state === 'VERIFIED' ? 'bg-[#0D9488] shadow-[0_0_6px_rgba(13,148,136,0.5)]' :
                  st.status === 'RUNNING' ? 'bg-amber-500 animate-pulse' :
                  st.status === 'FAILED' ? 'bg-rose-500' :
                  'bg-black/10'
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
                className="flex-1 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                {isPaused ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                <span>{isPaused ? 'Resume Swarm' : 'Pause Takeover'}</span>
              </button>
              <button
                onClick={onCancelExecution}
                className="py-1 px-3 rounded-md bg-rose-100 hover:bg-rose-200 text-rose-900 border border-rose-300 text-[10px] font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <StopCircle className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* 5. Live Inter-Agent Handoff Feed (Light Theme Warm Ivory Surfaces) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-sans teal-texture-grid">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-600 pb-1 border-b border-[#E5DEC9]">
          <span className="font-bold text-[#0D9488] uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE] shadow-[0_0_6px_#00F2FE]" />
            Inter-Agent Handoff Stream
          </span>
          <span className="text-slate-500 font-semibold">{handoffs.length} Transitions</span>
        </div>

        {handoffs.length === 0 ? (
          <div className="text-center py-10 space-y-2 text-slate-500 font-mono text-xs">
            <Brain className="w-8 h-8 text-[#0D9488] mx-auto animate-pulse" />
            <p className="font-semibold text-slate-700">Swarm standing by on active tab.</p>
            <p className="text-[10px] text-slate-500">Type a goal below or click a quick-action chip to dispatch autonomous agents.</p>
          </div>
        ) : (
          handoffs.map((msg) => (
            <div
              key={msg.id}
              className="p-3 rounded-xl bg-white border border-[#E5DEC9] hover:border-[#00F2FE]/60 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,242,254,0.15)] space-y-1.5 transition-all animate-fade-in text-xs"
            >
              {/* Agent Handoff Route */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5 font-bold">
                  <span className="text-[#0D1117] uppercase px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#E5DEC9]">{msg.fromAgent}</span>
                  <ArrowRight className="w-3 h-3 text-[#0D9488]" />
                  <span className="text-[#0F766E] uppercase px-1.5 py-0.5 rounded bg-[#00F2FE]/10 border border-[#00F2FE]/30 font-extrabold">{msg.toAgent}</span>
                </div>
                <span className="text-slate-400 font-medium">{msg.timestamp}</span>
              </div>

              {/* Action Description */}
              <p className="text-[11px] text-[#0D1117] font-sans font-medium leading-snug">
                {msg.action}
              </p>

              {msg.details && (
                <div className="text-[10px] font-mono text-[#0F766E] bg-[#00F2FE]/10 border border-[#00F2FE]/30 px-2 py-1 rounded font-medium">
                  {msg.details}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 6. Quick Action Swarm Chips (Warm Ivory on Ink Black Accent) */}
      <div className="p-3 border-t border-[#E5DEC9] bg-[#F4EFE6] space-y-1.5 shrink-0">
        <div className="text-[9px] font-mono uppercase tracking-wider text-slate-600 font-bold">
          Quick Swarm Orchestrations:
        </div>
        <div className="flex flex-col gap-1">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => onDispatchPrompt(chip.prompt)}
              className="w-full text-left px-3 py-2 rounded-lg bg-white hover:bg-[#FAF7F2] border border-[#E5DEC9] hover:border-[#00F2FE]/60 text-[#0D1117] hover:text-[#0D9488] text-[11px] font-sans font-medium shadow-xs hover:shadow-[0_0_10px_rgba(0,242,254,0.15)] transition-all cursor-pointer truncate flex items-center justify-between group"
            >
              <span className="truncate">{chip.label}</span>
              <ArrowRight className="w-3 h-3 text-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-1" />
            </button>
          ))}
        </div>
      </div>

      {/* 7. Bottom Unified Prompt Input (Ink Black Dock with Warm Ivory Input & Electric Teal Action) */}
      <div className="p-3 border-t border-[#00F2FE]/20 bg-[#07090D] shrink-0">
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder="Command the 5-Agent Swarm..."
            className="flex-1 bg-[#FAF7F2] border border-[#00F2FE]/40 focus:border-[#00F2FE] focus:ring-2 focus:ring-[#00F2FE]/30 rounded-xl px-3.5 py-2 text-xs text-[#0D1117] placeholder-slate-400 font-sans font-medium outline-hidden shadow-inner"
          />
          <button
            type="submit"
            disabled={!promptText.trim()}
            className="p-2.5 rounded-xl bg-[#00F2FE] hover:bg-[#00D2E0] text-[#07090D] shadow-[0_0_15px_rgba(0,242,254,0.4)] transition-all disabled:opacity-40 cursor-pointer shrink-0 font-bold"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
};
