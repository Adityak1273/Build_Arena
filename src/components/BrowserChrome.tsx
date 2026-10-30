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
    <div className="flex flex-col bg-[#ECE5D8] border-b border-[#D5CEBF] select-none z-20">
      {/* 1. Multi-Tab Strip (Soft Warm Stone Theme) */}
      <div className="flex items-center px-2 pt-2 gap-1.5 overflow-x-auto no-scrollbar bg-[#E4DDCF] border-b border-[#D5CEBF]">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const hasAgent = Boolean(tab.activeAgent);

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`group relative flex items-center gap-2 px-3.5 py-1.5 rounded-t-xl text-xs font-sans transition-all cursor-pointer border-t border-x ${
                isActive
                  ? 'bg-[#FAF7F2] text-[#0F172A] border-[#D5CEBF] shadow-[0_-1px_4px_rgba(0,0,0,0.06)] font-bold'
                  : 'bg-[#DAD2C2]/90 text-slate-600 border-[#D5CEBF]/80 hover:bg-[#EAE4D8] hover:text-[#0F172A]'
              }`}
              style={{ minWidth: '150px', maxWidth: '240px' }}
            >
              {/* Active tab top glow indicator in Electric Teal */}
              {isActive && (
                <div className="absolute top-0 left-2 right-2 h-[2px] bg-[#0D9488] rounded-full shadow-[0_0_6px_#00F2FE]" />
              )}

              {/* Favicon / Globe / Agent Indicator */}
              <div className="shrink-0">
                {hasAgent ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488] animate-pulse block shadow-[0_0_6px_#00F2FE]" />
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
                <span className="px-1.5 py-0.2 rounded bg-[#00F2FE]/15 text-[#0D9488] text-[9px] font-mono border border-[#D5CEBF] flex items-center gap-1 shrink-0 font-bold">
                  <Sparkles className="w-2 h-2 text-[#0D9488] animate-spin" />
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
                    isActive ? 'text-slate-600 hover:bg-slate-200' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-300/50'
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
          className="p-1.5 rounded-lg text-slate-600 hover:text-[#0D9488] hover:bg-[#FAF7F2] border border-[#D5CEBF] transition-colors cursor-pointer ml-1"
          title="Open New Browser Tab"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. Browser Navigation & Omnibar (Refined Warm Stone Surface) */}
      <div className="flex items-center gap-2.5 px-3 py-2 bg-[#ECE5D8]">
        {/* Navigation History Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onGoBack}
            className="p-1.5 rounded-lg text-slate-700 hover:text-[#0D9488] hover:bg-[#FAF7F2] bg-[#E4DDCF] border border-[#D5CEBF] transition-colors cursor-pointer shadow-xs"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onGoForward}
            className="p-1.5 rounded-lg text-slate-700 hover:text-[#0D9488] hover:bg-[#FAF7F2] bg-[#E4DDCF] border border-[#D5CEBF] transition-colors cursor-pointer shadow-xs"
            title="Go Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onReload}
            className="p-1.5 rounded-lg text-slate-700 hover:text-[#0D9488] hover:bg-[#FAF7F2] bg-[#E4DDCF] border border-[#D5CEBF] transition-colors cursor-pointer shadow-xs"
            title="Reload Page"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#0D9488]' : ''}`} />
          </button>
        </div>

        {/* Omnibar (Crisp White Surface with Soft Stone Border & Teal Focus Ring) */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center relative">
          <div className="w-full flex items-center bg-[#FFFFFF] border border-[#D5CEBF] hover:border-[#B8AFA0] focus-within:border-[#0D9488] focus-within:ring-2 focus-within:ring-[#00F2FE]/25 rounded-xl px-3.5 py-1.5 gap-2 transition-all shadow-xs">
            {/* Security & CDP Lock Badge */}
            <div className="flex items-center gap-1.5 shrink-0 select-none">
              <Lock className={`w-3.5 h-3.5 ${cdpConnected ? 'text-[#0D9488]' : 'text-slate-400'}`} />
              <span className="text-[10px] font-mono font-bold text-[#0D9488] hidden sm:inline">
                CDP 1.3
              </span>
              <span className="text-slate-300">|</span>
            </div>

            {/* Main Input */}
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Search or enter web address, or type prompt to dispatch Multi-Agent Swarm..."
              className="flex-1 bg-transparent text-xs text-[#0F172A] placeholder-slate-400 outline-hidden font-sans font-medium"
            />

            {/* Quick Action Pill on right of omnibar */}
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white text-[10px] font-mono font-bold border border-[#0D9488] shadow-xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
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
                ? 'bg-[#FAF7F2] text-[#0D9488] border-[#0D9488] shadow-xs'
                : 'bg-[#DAD2C2] text-[#334155] border-[#D5CEBF] hover:bg-[#FAF7F2] hover:text-[#0F172A]'
            }`}
            title="Toggle Live Competitive Startups Spreadsheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="hidden lg:inline text-[11px]">Spreadsheet</span>
          </button>

          <button
            onClick={() => onToggleDrawer('council')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'council'
                ? 'bg-[#FAF7F2] text-[#0D9488] border-[#0D9488] shadow-xs'
                : 'bg-[#DAD2C2] text-[#334155] border-[#D5CEBF] hover:bg-[#FAF7F2] hover:text-[#0F172A]'
            }`}
            title="Toggle 7-Critic Code Review Council"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="hidden lg:inline text-[11px]">Council</span>
          </button>

          <button
            onClick={() => onToggleDrawer('gtm')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'gtm'
                ? 'bg-[#FAF7F2] text-[#0D9488] border-[#0D9488] shadow-xs'
                : 'bg-[#DAD2C2] text-[#334155] border-[#D5CEBF] hover:bg-[#FAF7F2] hover:text-[#0F172A]'
            }`}
            title="Toggle GTM Multimodal Studio (Poster & Video)"
          >
            <Video className="w-3.5 h-3.5 text-[#0D9488]" />
            <span className="hidden lg:inline text-[11px]">GTM Studio</span>
          </button>

          <button
            onClick={() => onToggleDrawer('ax')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'ax'
                ? 'bg-[#FAF7F2] text-[#0D9488] border-[#0D9488] shadow-xs'
                : 'bg-[#DAD2C2] text-[#334155] border-[#D5CEBF] hover:bg-[#FAF7F2] hover:text-[#0F172A]'
            }`}
            title="Toggle CDP Accessibility Tree Inspector"
          >
            <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span className="hidden lg:inline text-[11px]">AX Tree</span>
          </button>

          <div className="w-[1px] h-5 bg-[#D5CEBF] mx-0.5" />

          {/* Telemetry Drawer Toggle */}
          <button
            onClick={onToggleTelemetry}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FAF7F2] text-[#0D9488] text-xs font-mono font-bold border border-[#D5CEBF] hover:border-[#0D9488] shadow-xs transition-all cursor-pointer"
            title="View Real-Time Swarm Telemetry & WebSocket Event Bus"
          >
            <Activity className="w-3 h-3 text-[#0D9488]" />
            <span>{telemetryCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
