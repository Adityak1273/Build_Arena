import React, { useState } from 'react';
import { Globe, ArrowLeft, ArrowRight, RotateCw, Layers, Search, Check, Shield } from 'lucide-react';

export const BrowseMode: React.FC = () => {
  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [showAXTree, setShowAXTree] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'ax-tree'>('preview');

  // Simulated live fused accessibility tree extracted by SemanticBrowserEngine
  const axNodes = [
    { axNodeId: 'ax_101', role: 'link', name: 'Show HN: AutoForge - AI-Native Developer Browser', interactive: true, backendNodeId: 42 },
    { axNodeId: 'ax_102', role: 'button', name: 'Vote / Upvote', interactive: true, backendNodeId: 43 },
    { axNodeId: 'ax_103', role: 'textbox', name: 'Search AI startups or repos', interactive: true, backendNodeId: 44 },
    { axNodeId: 'ax_104', role: 'link', name: 'Anthropic Claude 3.5 Pricing Update', interactive: true, backendNodeId: 45 },
    { axNodeId: 'ax_105', role: 'link', name: 'AdaL Agent Suite by SylphAI', interactive: true, backendNodeId: 46 },
    { axNodeId: 'ax_106', role: 'button', name: 'Sign in to HackDriven', interactive: true, backendNodeId: 47 }
  ];

  return (
    <div className="flex flex-col h-full bg-[#090d16]">
      {/* Browser Navigation Bar */}
      <div className="flex items-center space-x-2 px-4 py-2.5 bg-[#0e1424] border-b border-slate-800">
        <div className="flex items-center space-x-1 text-slate-400">
          <button className="p-1.5 hover:bg-slate-800 rounded transition"><ArrowLeft className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-800 rounded transition"><ArrowRight className="w-4 h-4" /></button>
          <button className="p-1.5 hover:bg-slate-800 rounded transition"><RotateCw className="w-4 h-4" /></button>
        </div>

        {/* Address Bar */}
        <div className="flex-1 flex items-center bg-[#131b30] border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs">
          <Shield className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full bg-transparent text-slate-200 outline-none font-mono text-xs"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAXTree(!showAXTree)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              showAXTree ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300' : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Semantic AX Tree</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Web View Pane */}
        <div className="flex-1 flex flex-col bg-[#0b0f1c] border-r border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#090d18] border-b border-slate-800/80 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium text-slate-300">
              <Globe className="w-3.5 h-3.5 text-blue-400" /> Live Chromium Container
            </span>
            <span className="font-mono text-[11px] text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              CDP 1.3 Active
            </span>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-gradient-to-b from-[#0b0f1c] to-[#0e1529]">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
              <Globe className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-2">Chromium Semantic Browser Active</h3>
            <p className="text-xs text-slate-400 max-w-md mb-6 leading-relaxed">
              AutoForge operates directly on the active browser tab using Chrome DevTools Protocol (CDP) Accessibility tree fusion, bypassing fragile HTML/CSS selectors.
            </p>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setUrl('http://localhost:3000')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-md transition"
              >
                Inspect Localhost:3000
              </button>
              <button 
                onClick={() => setUrl('https://news.ycombinator.com')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition"
              >
                Crawl HackerNews
              </button>
            </div>
          </div>
        </div>

        {/* Semantic Accessibility Tree Inspector */}
        {showAXTree && (
          <div className="w-80 bg-[#0d1324] flex flex-col text-xs border-l border-slate-800">
            <div className="px-4 py-3 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between">
              <span className="font-semibold text-slate-200">Fused AX Nodes</span>
              <span className="font-mono text-[10px] text-indigo-400">2.1M Tokens (-64%)</span>
            </div>
            <div className="p-2 space-y-2 overflow-y-auto flex-1 font-mono text-[11px]">
              {axNodes.map((node) => (
                <div
                  key={node.axNodeId}
                  className="p-2 rounded bg-[#10172c] border border-slate-800/80 hover:border-indigo-500/40 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-bold text-[9px] uppercase">
                      {node.role}
                    </span>
                    <span className="text-slate-500 text-[10px]">ID: {node.backendNodeId}</span>
                  </div>
                  <div className="text-slate-200 text-xs truncate">{node.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
