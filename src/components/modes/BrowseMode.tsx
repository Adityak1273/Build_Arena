import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Layers, Search, Check, Shield } from 'lucide-react';

export const BrowseMode: React.FC = () => {
  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [showAXTree, setShowAXTree] = useState(true);

  // Simulated live fused accessibility tree extracted by SemanticBrowserEngine
  const axNodes = [
    { axNodeId: 'ax_101', role: 'link', name: 'Show HN: AutoForge - AI-Native Developer Browser', interactive: true, backendNodeId: 42, color: 'sky' },
    { axNodeId: 'ax_102', role: 'button', name: 'Vote / Upvote', interactive: true, backendNodeId: 43, color: 'purple' },
    { axNodeId: 'ax_103', role: 'textbox', name: 'Search AI startups or repos', interactive: true, backendNodeId: 44, color: 'emerald' },
    { axNodeId: 'ax_104', role: 'link', name: 'Anthropic Claude 3.5 Pricing Update', interactive: true, backendNodeId: 45, color: 'amber' },
    { axNodeId: 'ax_105', role: 'link', name: 'AdaL Agent Suite by SylphAI', interactive: true, backendNodeId: 46, color: 'purple' },
    { axNodeId: 'ax_106', role: 'button', name: 'Sign in to HackDriven', interactive: true, backendNodeId: 47, color: 'sky' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Browser Navigation Bar (Pastel Theme) */}
      <div className="flex items-center space-x-2.5 px-5 py-2.5 bg-white border-b border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-1 text-slate-500">
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition"><ArrowLeft className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition"><ArrowRight className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition"><RotateCw className="w-4 h-4" /></button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-1.5 text-xs shadow-inner">
          <Shield className="w-4 h-4 text-emerald-600 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent text-slate-800 outline-none font-mono text-xs"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAXTree(!showAXTree)}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition ${
              showAXTree 
                ? 'bg-purple-100 text-purple-900 border-purple-200 shadow-xs' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Semantic AX Tree</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Web View Pane */}
        <div className="flex-1 flex flex-col bg-white border-r border-slate-200/80 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50/80 border-b border-slate-200 text-xs text-slate-600">
            <span className="flex items-center gap-2 font-semibold text-slate-700">
              <Globe className="w-4 h-4 text-sky-600" /> Live Chromium Container
            </span>
            <span className="font-mono text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-semibold border border-emerald-200">
              CDP 1.3 Active
            </span>
          </div>

          <div className="flex-1 p-8 flex flex-col items-center justify-center text-center bg-gradient-to-b from-slate-50/50 via-white to-purple-50/30">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-100 to-purple-100 border border-purple-200/60 flex items-center justify-center mb-4 shadow-sm">
              <Globe className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Chromium Semantic Browser Active</h3>
            <p className="text-xs text-slate-600 max-w-md mb-6 leading-relaxed">
              AutoForge operates directly on the active browser tab using Chrome DevTools Protocol (CDP) Accessibility tree fusion, bypassing fragile HTML/CSS selectors.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setUrl('http://localhost:3000')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
              >
                Inspect Localhost:3000
              </button>
              <button 
                onClick={() => setUrl('https://news.ycombinator.com')}
                className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition"
              >
                Crawl HackerNews
              </button>
            </div>
          </div>
        </div>

        {/* Semantic Accessibility Tree Inspector */}
        {showAXTree && (
          <div className="w-84 bg-slate-50/70 flex flex-col text-xs border-l border-slate-200">
            <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-800">Fused AX Nodes</span>
              <span className="font-mono text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-semibold">
                2.1M Tokens (-64%)
              </span>
            </div>
            <div className="p-3 space-y-2 overflow-y-auto flex-1 font-mono text-[11px]">
              {axNodes.map((node) => (
                <div
                  key={node.axNodeId}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 hover:border-purple-300 shadow-xs transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[9px] uppercase tracking-wider">
                      {node.role}
                    </span>
                    <span className="text-slate-400 text-[10px]">ID: {node.backendNodeId}</span>
                  </div>
                  <div className="text-slate-800 font-sans font-medium text-xs truncate">{node.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
