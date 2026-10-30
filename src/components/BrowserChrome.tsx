import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Plus,
  X,
  Bot,
  Globe,
  FileSpreadsheet,
  ShieldCheck,
  Video,
  Layers,
  Activity,
  Sparkles
} from 'lucide-react';
import { BrowserTab } from '../types';

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
    <div className="flex flex-col bg-[#07090D] border-b border-[#00F2FE]/20 select-none z-20">
      {/* 1. Multi-Tab Strip */}
      <div className="flex items-center px-2 pt-2 gap-1.5 overflow-x-auto no-scrollbar bg-[#090C13]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const hasAgent = Boolean(tab.activeAgent);

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-sans transition-all cursor-pointer border-t border-x ${
                isActive
                  ? 'bg-[#FAF7F2] text-[#0D1117] border-[#00F2FE]/40 shadow-[0_-2px_12px_rgba(0,242,254,0.15)] font-semibold'
                  : 'bg-[#121622]/90 text-slate-400 border-white/[0.04] hover:bg-[#181E2D] hover:text-[#FAF7F2]'
              }`}
              style={{ minWidth: '150px', maxWidth: '240px' }}
            >
              {/* Active tab top glow indicator in Electric Teal */}
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-[2.5px] bg-[#00F2FE] rounded-full shadow-[0_0_8px_#00F2FE]" />
              )}

              {/* Favicon / Globe / Agent Indicator */}
              <div className="shrink-0">
                {hasAgent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE] animate-pulse block shadow-[0_0_6px_#00F2FE]" />
                ) : (
                  <Globe className={`w-3.5 h-3.5 ${isActive ? 'text-[#0D9488]' : 'text-slate-500'}`} />
                )}
              </div>

              {/* Tab Title */}
              <span className="truncate flex-1 font-medium text-[11px]">
                {tab.title || tab.url}
              </span>

              {/* Live Worker Agent Pill on Tab */}
              {tab.activeAgent && (
                <span className="px-1.5 py-0.2 rounded bg-[#00F2FE]/15 text-[#0D9488] text-[9px] font-mono border border-[#00F2FE]/40 flex items-center gap-1 shrink-0">
                  <Sparkles className="w-2 h-2 text-[#00F2FE] animate-spin" />
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
                  className={`opacity-0 group-hover:opacity-100 rounded p-0.5 transition-opacity ${
                    isActive ? 'text-[#0D1117] hover:bg-black/10' : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
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
          className="p-1.5 rounded-lg text-slate-400 hover:text-[#00F2FE] hover:bg-[#00F2FE]/10 transition-colors cursor-pointer ml-1"
          title="Open New Browser Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Browser Navigation & Omnibar */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-[#0C0F17]/95 backdrop-blur-xl border-t border-[#00F2FE]/15">
        {/* Navigation History Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onGoBack}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00F2FE] hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00F2FE] hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
            title="Go Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            className="p-1.5 rounded-lg text-slate-400 hover:text-[#00F2FE] hover:bg-[#00F2FE]/10 transition-colors cursor-pointer"
            title="Reload Page"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#00F2FE]' : ''}`} />
          </button>
        </div>

        {/* Omnibar (Warm Ivory Surface with Electric Teal Ring & Ink Black Text) */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <div className="w-full flex items-center bg-[#FAF7F2] border border-[#00F2FE]/40 hover:border-[#00F2FE]/70 focus-within:border-[#00F2FE] focus-within:ring-2 focus-within:ring-[#00F2FE]/30 rounded-xl px-3.5 py-1.5 gap-2 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.15)]">
            {/* Security & CDP Lock Badge */}
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <Lock className={`w-3.5 h-3.5 ${cdpConnected ? 'text-[#0D9488]' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono font-bold text-[#0D9488] hidden sm:inline">
                CDP 1.3
              </span>
              <span className="text-slate-300">|</span>
            </div>

            {/* Main Input (Ink Black Text on Warm Ivory) */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search or enter web address, or type prompt to dispatch Multi-Agent Swarm..."
              className="flex-1 bg-transparent text-xs text-[#0D1117] placeholder-slate-400 outline-hidden font-sans font-medium"
            />

            {/* Quick Action Pill on right of omnibar */}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-[#07090D] hover:bg-[#121622] text-[#00F2FE] hover:text-[#00F2FE] text-[10px] font-mono font-bold border border-[#00F2FE]/40 shadow-[0_0_8px_rgba(0,242,254,0.25)] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Bot className="w-3 h-3 text-[#00F2FE]" />
              <span>Go / Swarm</span>
            </button>
          </div>
        </form>

        {/* 3. Quick Workspace Drawer Toggle Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => onToggleDrawer('spreadsheet')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'spreadsheet'
                ? 'bg-[#FAF7F2] text-[#0D1117] border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.35)]'
                : 'bg-[#121622] text-[#FAF7F2] border-[#00F2FE]/20 hover:border-[#00F2FE]/60'
            }`}
            title="Toggle Live Competitive Startups Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden lg:inline text-[11px]">Spreadsheet</span>
          </button>

          <button
            onClick={() => onToggleDrawer('council')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'council'
                ? 'bg-[#FAF7F2] text-[#0D1117] border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.35)]'
                : 'bg-[#121622] text-[#FAF7F2] border-[#00F2FE]/20 hover:border-[#00F2FE]/60'
            }`}
            title="Toggle 7-Critic Code Review Council"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden lg:inline text-[11px]">Council</span>
          </button>

          <button
            onClick={() => onToggleDrawer('gtm')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'gtm'
                ? 'bg-[#FAF7F2] text-[#0D1117] border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.35)]'
                : 'bg-[#121622] text-[#FAF7F2] border-[#00F2FE]/20 hover:border-[#00F2FE]/60'
            }`}
            title="Toggle GTM Multimodal Studio (Poster & Video)"
          >
            <Video className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden lg:inline text-[11px]">GTM Studio</span>
          </button>

          <button
            onClick={() => onToggleDrawer('ax')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'ax'
                ? 'bg-[#FAF7F2] text-[#0D1117] border-[#00F2FE] shadow-[0_0_12px_rgba(0,242,254,0.35)]'
                : 'bg-[#121622] text-[#FAF7F2] border-[#00F2FE]/20 hover:border-[#00F2FE]/60'
            }`}
            title="Toggle CDP Accessibility Tree Inspector"
          >
            <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden lg:inline text-[11px]">AX Tree</span>
          </button>

          <div className="w-[1px] h-5 bg-[#00F2FE]/20 mx-0.5" />

          {/* Telemetry Drawer Toggle */}
          <button
            onClick={onToggleTelemetry}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#07090D] text-[#00F2FE] text-xs font-mono font-bold border border-[#00F2FE]/40 hover:border-[#00F2FE] shadow-[0_0_8px_rgba(0,242,254,0.25)] transition-all cursor-pointer"
            title="View Real-Time Swarm Telemetry & WebSocket Event Bus"
          >
            <Activity className="w-3 h-3 text-[#00F2FE]" />
            <span>{telemetryCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
