import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Plus,
  X,
  Search,
  Bot,
  Globe,
  FileSpreadsheet,
  ShieldCheck,
  Video,
  Layers,
  Activity,
  Terminal,
  Sparkles
} from 'lucide-react';
import { BrowserTab, SwarmAgentId } from '../types';

interface BrowserChromeProps {
  tabs: BrowserTab[];
  activeTabId: string;
  onSelectTab: (tabId: string) => void;
  onCloseTab: (tabId: string) => void;
  onNewTab: () => void;
  url: string;
  onNavigate: (targetUrl: string) => void;
  onDispatchSwarmPrompt: (prompt: string) => void;
  onGoBack: () => void;
  onGoForward: () => void;
  onReload: () => void;
  isLoading: boolean;
  cdpConnected: boolean;
  activeDrawerTab: 'spreadsheet' | 'council' | 'gtm' | 'ax' | null;
  onToggleDrawer: (drawerTab: 'spreadsheet' | 'council' | 'gtm' | 'ax') => void;
  onToggleTelemetry: () => void;
  telemetryCount: number;
}

export const BrowserChrome: React.FC<BrowserChromeProps> = ({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
  url,
  onNavigate,
  onDispatchSwarmPrompt,
  onGoBack,
  onGoForward,
  onReload,
  isLoading,
  cdpConnected,
  activeDrawerTab,
  onToggleDrawer,
  onToggleTelemetry,
  telemetryCount,
}) => {
  const [inputValue, setInputValue] = useState(url);

  React.useEffect(() => {
    setInputValue(url);
  }, [url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputValue.trim();
    if (!clean) return;

    // Check if input is a natural language prompt or a URL/search
    const looksLikeUrl =
      /^https?:\/\//i.test(clean) ||
      clean.includes('.com') ||
      clean.includes('.io') ||
      clean.includes('.org') ||
      clean.includes('.dev') ||
      clean.includes('.app') ||
      clean.includes('.net') ||
      clean.startsWith('localhost') ||
      clean.startsWith('127.0.0.1');

    const looksLikePrompt =
      clean.toLowerCase().startsWith('research') ||
      clean.toLowerCase().startsWith('find') ||
      clean.toLowerCase().startsWith('crawl') ||
      clean.toLowerCase().startsWith('scrape') ||
      clean.toLowerCase().startsWith('compare') ||
      clean.toLowerCase().startsWith('create') ||
      clean.toLowerCase().startsWith('build') ||
      clean.toLowerCase().startsWith('audit') ||
      clean.toLowerCase().startsWith('generate');

    if (looksLikePrompt) {
      onDispatchSwarmPrompt(clean);
    } else {
      onNavigate(clean);
    }
  };

  return (
    <div className="flex flex-col bg-[#07090E] border-b border-white/[0.08] select-none z-20">
      {/* 1. Multi-Tab Strip */}
      <div className="flex items-center px-2 pt-2 gap-1 overflow-x-auto no-scrollbar bg-[#05060A]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const hasAgent = Boolean(tab.activeAgent);

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-sans transition-all cursor-pointer border-t border-x ${
                isActive
                  ? 'bg-[#0F121C] text-white border-white/[0.12] shadow-[0_-2px_10px_rgba(0,0,0,0.4)]'
                  : 'bg-[#080B12]/80 text-slate-400 border-white/[0.04] hover:bg-[#0B0E17] hover:text-slate-200'
              }`}
              style={{ minWidth: '150px', maxWidth: '240px' }}
            >
              {/* Active tab top glow indicator */}
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-[2px] bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-500 rounded-full" />
              )}

              {/* Favicon / Globe / Agent Indicator */}
              <div className="shrink-0">
                {hasAgent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse block" />
                ) : (
                  <Globe className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 font-medium text-[11px]">
                {tab.title || tab.url}
              </span>

              {/* Live Worker Agent Pill on Tab */}
              {tab.activeAgent && (
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 text-[9px] font-mono border border-cyan-500/30 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2 h-2 text-cyan-400 animate-spin" />
                  <span className="capitalize">{tab.activeAgent}</span>
                </span>
              )}

              {/* Close Tab Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 hover:bg-white/[0.1] rounded p-0.5 text-slate-400 hover:text-white transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}

        {/* New Tab Button */}
        <button
          onClick={onNewTab}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer ml-1"
          title="Open New Browser Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Browser Navigation & Omnibar */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[#0F121C]/95 backdrop-blur-xl border-t border-white/[0.06]">
        {/* Navigation History Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onGoBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Go Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Reload Page"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Omnibar (URL / Search / Swarm Prompt) */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <div className="w-full flex items-center bg-[#06080E] border border-white/[0.1] hover:border-white/20 focus-within:border-cyan-500/70 focus-within:ring-1 focus-within:ring-cyan-500/50 rounded-xl px-3 py-1.5 gap-2 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
            {/* Security & CDP Lock Badge */}
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <Lock className={`w-3.5 h-3.5 ${cdpConnected ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className="text-[10px] font-mono font-bold text-emerald-400/90 hidden sm:inline">
                CDP 1.3
              </span>
              <span className="text-slate-600">|</span>
            </div>

            {/* Main Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search or enter web address, or type prompt to dispatch Multi-Agent Swarm..."
              className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 outline-hidden font-sans"
            />

            {/* Quick Action Pill on right of omnibar */}
            <button
              type="submit"
              className="px-2 py-0.5 rounded-md bg-white/[0.08] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 text-[10px] font-mono border border-white/[0.08] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Bot className="w-3 h-3 text-cyan-400" />
              <span>Go / Swarm</span>
            </button>
          </div>
        </form>

        {/* 3. Quick Workspace Drawer Toggle Chips */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleDrawer('spreadsheet')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'spreadsheet'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-white/[0.05] text-slate-300 border-white/[0.08] hover:bg-white/[0.1]'
            }`}
            title="Toggle Live Competitive Startups Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden lg:inline text-[11px]">Spreadsheet</span>
          </button>

          <button
            onClick={() => onToggleDrawer('council')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'council'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'bg-white/[0.05] text-slate-300 border-white/[0.08] hover:bg-white/[0.1]'
            }`}
            title="Toggle 7-Critic Code Review Council"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden lg:inline text-[11px]">Council</span>
          </button>

          <button
            onClick={() => onToggleDrawer('gtm')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'gtm'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-white/[0.05] text-slate-300 border-white/[0.08] hover:bg-white/[0.1]'
            }`}
            title="Toggle GTM Multimodal Studio (Poster & Video)"
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline text-[11px]">GTM Studio</span>
          </button>

          <button
            onClick={() => onToggleDrawer('ax')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'ax'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.05] text-slate-300 border-white/[0.08] hover:bg-white/[0.1]'
            }`}
            title="Toggle CDP Accessibility Tree Inspector"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden lg:inline text-[11px]">AX Tree</span>
          </button>

          <div className="w-[1px] h-5 bg-white/[0.1] mx-0.5" />

          {/* Telemetry Drawer Toggle */}
          <button
            onClick={onToggleTelemetry}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] text-slate-300 text-xs font-mono transition-colors cursor-pointer"
            title="Open Telemetry Drawer"
          >
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-cyan-300 font-bold">{telemetryCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
