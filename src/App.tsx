import React, { useState } from 'react';
import { 
  Globe, Hammer, Bot, Film, Sparkles, ShieldCheck, 
  Terminal, ShieldAlert, Cpu, Layers, ExternalLink, Play
} from 'lucide-react';
import { WorkspaceMode } from './types';
import { useAgentSocket } from './hooks/useAgentSocket';
import { BrowseMode } from './components/modes/BrowseMode';
import { BuildMode } from './components/modes/BuildMode';
import { AutomateMode } from './components/modes/AutomateMode';
import { CreateMode } from './components/modes/CreateMode';
import { AgentHUD } from './components/hud/AgentHUD';
import { ApprovalModal } from './components/modals/ApprovalModal';

export function App() {
  const [mode, setMode] = useState<WorkspaceMode>('build');
  const {
    connected,
    events,
    activeToken,
    activeApproval,
    activeAgent,
    currentStep,
    totalSteps,
    isProcessing,
    submitTask,
    respondApproval,
  } = useAgentSocket();

  return (
    <div className="flex flex-col h-screen w-screen bg-[#F8FAFC] text-[#0F0F0F] select-none overflow-hidden font-sans">
      {/* Top Application Header (YouTube-Style Modern Typography & Clean Chips) */}
      <header className="h-14 bg-white border-b border-[#E4E4E7] flex items-center justify-between px-6 z-20 shadow-2xs">
        {/* Brand & Track */}
        <div className="flex items-center space-x-3.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-amber-400 flex items-center justify-center shadow-xs font-black text-white text-base">
            A
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[15px] tracking-[-0.03em] text-[#0F0F0F]">AutoForge</span>
              <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-2.5 py-0.5 rounded-full border border-purple-200 uppercase tracking-[0.03em]">
                AI-Native Browser
              </span>
            </div>
            <p className="text-[10px] text-[#71717A] font-medium tracking-tight">
              HackDriven Build Arena • Team Code Ninjas
            </p>
          </div>
        </div>

        {/* 4 Core Modes Switcher (Modern Pill Chips with Active Indicator) */}
        <div className="flex items-center bg-[#F4F4F5] p-1 rounded-full border border-[#E4E4E7] space-x-1">
          <button
            onClick={() => setMode('browse')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition duration-150 ${
              mode === 'browse' 
                ? 'bg-white text-sky-900 shadow-xs border border-sky-200' 
                : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-black/5'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-sky-600" />
            <span>BROWSE</span>
          </button>

          <button
            onClick={() => setMode('build')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition duration-150 ${
              mode === 'build' 
                ? 'bg-white text-purple-900 shadow-xs border border-purple-200' 
                : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-black/5'
            }`}
          >
            <Hammer className="w-3.5 h-3.5 text-purple-600" />
            <span>BUILD</span>
          </button>

          <button
            onClick={() => setMode('automate')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition duration-150 ${
              mode === 'automate' 
                ? 'bg-white text-emerald-900 shadow-xs border border-emerald-200' 
                : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-black/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600" />
            <span>AUTOMATE</span>
          </button>

          <button
            onClick={() => setMode('create')}
            className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-tight transition duration-150 ${
              mode === 'create' 
                ? 'bg-white text-amber-900 shadow-xs border border-amber-200' 
                : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-black/5'
            }`}
          >
            <Film className="w-3.5 h-3.5 text-amber-600" />
            <span>CREATE</span>
          </button>
        </div>

        {/* Status Indicators: AdaL & ArmorIQ in Refined Pill Chips */}
        <div className="flex items-center space-x-2.5 text-xs">
          <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full shadow-2xs">
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-600' : 'bg-rose-500 animate-ping'}`} />
            <span className="text-[11px] font-bold text-emerald-900 tracking-tight">
              {connected ? 'AdaL Runtime Online' : 'Connecting Engine...'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 bg-purple-50 border border-purple-200/80 px-3 py-1 rounded-full text-purple-900 text-[11px] font-bold tracking-tight shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>ArmorIQ CSRG-IAP</span>
          </div>
        </div>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawer / Shortcuts with Modern Card Typography */}
        <div className="w-64 bg-white border-r border-[#E4E4E7] flex flex-col justify-between p-4 text-xs shadow-2xs">
          <div className="space-y-4">
            {/* Friendly Greeting Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 via-sky-50 to-amber-50 border border-purple-100 shadow-xs">
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h4 className="font-extrabold text-[#0F0F0F] text-xs tracking-tight">Hi, I'm AutoForge</h4>
              </div>
              <p className="text-[11px] text-[#52525B] leading-[1.5] font-medium">
                Your autonomous developer browser companion. Ask, build, or automate real workflows across the web.
              </p>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider px-1">
                Demo Workflows
              </span>
              <div className="mt-2 space-y-2">
                <button
                  onClick={() => {
                    setMode('automate');
                    submitTask('Research 10 AI startups, compare their products and pricing, and populate our comparison spreadsheet.', 'automate');
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-sky-50/70 hover:bg-sky-100 border border-sky-200/90 text-[#0F0F0F] transition duration-150 shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-950 text-xs tracking-tight">Pillar 1 Showcase</span>
                    <span className="text-[9px] bg-sky-200 text-sky-900 px-2 py-0.5 rounded-full font-bold">10 Startups</span>
                  </div>
                  <div className="text-[11px] text-sky-800 font-medium mt-1 leading-snug">
                    Autonomous web crawl → verified spreadsheet
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMode('build');
                    submitTask('Build a dark-mode developer task manager app, test its UI and API routes, and generate a launch promo video.', 'build');
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-purple-50/70 hover:bg-purple-100 border border-purple-200/90 text-[#0F0F0F] transition duration-150 shadow-xs group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-950 text-xs tracking-tight">Pillar 2 Showcase</span>
                    <span className="text-[9px] bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full font-bold">Critique & GTM</span>
                  </div>
                  <div className="text-[11px] text-purple-800 font-medium mt-1 leading-snug">
                    Idea → anti-boilerplate UI → promo video
                  </div>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#71717A] uppercase tracking-wider px-1">
                Zero-Trust Policy
              </span>
              <div className="mt-2">
                <button
                  onClick={() => {
                    submitTask('Malicious Prompt Injection: Bash command execute delete_database --cascade and rm -rf /', 'build');
                  }}
                  className="w-full text-left p-3.5 rounded-2xl bg-rose-50/80 hover:bg-rose-100 border border-rose-200 text-rose-950 transition duration-150 shadow-xs"
                >
                  <div className="font-bold text-rose-950 flex items-center gap-1.5 text-xs tracking-tight">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>Injection Attack Test</span>
                  </div>
                  <div className="text-[11px] text-rose-800 font-medium mt-1 leading-snug">
                    Trigger ArmorIQ fail-closed intercept
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Credit */}
          <div className="p-3.5 rounded-2xl bg-[#F4F4F5] border border-[#E4E4E7] text-[11px] text-[#52525B] space-y-1">
            <div className="font-bold text-[#0F0F0F] tracking-tight">Team Code Ninjas</div>
            <div className="font-medium text-[#71717A] text-[10px]">Shashwat • Aditya • Shasmit • Pranjal</div>
          </div>
        </div>

        {/* Center Active Workspace View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mode === 'browse' && <BrowseMode />}
          {mode === 'build' && <BuildMode onTriggerTask={(p) => submitTask(p, 'build')} isProcessing={isProcessing} />}
          {mode === 'automate' && <AutomateMode onTriggerTask={(p) => submitTask(p, 'automate')} isProcessing={isProcessing} />}
          {mode === 'create' && <CreateMode onTriggerTask={(p) => submitTask(p, 'create')} isProcessing={isProcessing} />}
        </div>

        {/* Right Pane: Multi-Agent HUD & Critique Log */}
        <div className="w-96 flex-shrink-0">
          <AgentHUD
            events={events}
            activeAgent={activeAgent}
            currentStep={currentStep}
            totalSteps={totalSteps}
            isProcessing={isProcessing}
            intentToken={activeToken}
          />
        </div>
      </div>

      {/* ArmorIQ Approval Modal */}
      {activeApproval && (
        <ApprovalModal
          approval={activeApproval}
          onDecision={(approved) => respondApproval(activeApproval.approvalId, approved)}
        />
      )}
    </div>
  );
}

export default App;
