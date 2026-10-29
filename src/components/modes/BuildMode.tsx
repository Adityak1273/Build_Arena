import React, { useState } from 'react';
import { 
  Code, Sparkles, CheckCircle2, Play, RefreshCw, Eye, 
  Terminal, ShieldCheck, AlertCircle 
} from 'lucide-react';

interface BuildModeProps {
  onTriggerTask: (prompt: string) => void;
  isProcessing: boolean;
}

export const BuildMode: React.FC<BuildModeProps> = ({ onTriggerTask, isProcessing }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'critique' | 'preview'>('code');
  const [prompt, setPrompt] = useState('Build a dark-mode developer task manager app, test its UI and API routes, and generate a launch promo video.');

  const boilerplateCode = `// BEFORE: Generic AI Template (Boring, low contrast, no micro-interactions)
export function TaskList() {
  return (
    <div className="p-4 bg-white text-black">
      <h1>My Tasks</h1>
      <ul>
        <li>Task 1</li>
        <li>Task 2</li>
      </ul>
      <button className="bg-blue-500 text-white p-2">Add Task</button>
    </div>
  );
}`;

  const critiquedCode = `// AFTER: AutoForge Multi-Agent Polished Component (AdaL + Design Critic pass)
import React, { useState } from 'react';
import { CheckCircle2, Flame, Shield, ArrowUpRight } from 'lucide-react';

export function ModernTaskDashboard() {
  const [tasks] = useState([
    { id: 1, title: 'Verify CDP Accessibility Tree Extraction', status: 'verified', priority: 'high' },
    { id: 2, title: 'Mint ArmorIQ CSRG Merkle Intent Token', status: 'verified', priority: 'critical' },
    { id: 3, title: 'Synthesize ElevenLabs GTM Voiceover', status: 'ready', priority: 'medium' }
  ]);

  return (
    <div className="p-6 rounded-2xl bg-[#0f1523] border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AutoForge Task Matrix</h2>
          <p className="text-xs text-slate-400">Continuous QA & Playwright Verified</p>
        </div>
        <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
          HTTP 200 • 0 Console Errors
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="p-3.5 rounded-xl bg-[#131b2e] border border-slate-700/50 flex items-center justify-between hover:border-indigo-500/50 transition">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-slate-200">{t.title}</span>
            </div>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">
              {t.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

  return (
    <div className="flex flex-col h-full bg-[#090d16]">
      {/* Top Action Ribbon */}
      <div className="px-6 py-4 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between">
        <div className="flex-1 max-w-2xl flex items-center bg-[#131b30] border border-slate-700 rounded-xl px-4 py-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-transparent text-slate-200 text-xs outline-none"
            placeholder="Describe what to build or refine with Code Builder + Design Critic..."
          />
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => onTriggerTask(prompt)}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-medium shadow-lg shadow-indigo-950 transition disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Critique Loop</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2 bg-[#0b0f1c] border-b border-slate-800 flex items-center space-x-4 text-xs font-medium">
        <button
          onClick={() => setActiveTab('code')}
          className={`pb-1.5 border-b-2 transition ${
            activeTab === 'code' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Code Inspector (@src/components)
        </button>
        <button
          onClick={() => setActiveTab('critique')}
          className={`pb-1.5 border-b-2 transition ${
            activeTab === 'critique' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Multi-Agent Critique Diff (Before vs After)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`pb-1.5 border-b-2 transition ${
            activeTab === 'preview' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Localhost:3000 Preview
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'code' && (
          <div className="h-full bg-[#0a0e1a] rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-auto text-slate-300">
            <div className="text-slate-500 mb-2">// AutoForge Code Builder - Generated & Checked with Playwright</div>
            <pre className="text-emerald-300">{critiquedCode}</pre>
          </div>
        )}

        {activeTab === 'critique' && (
          <div className="grid grid-cols-2 gap-6 h-full">
            <div className="flex flex-col bg-[#0b0f1c] rounded-xl border border-red-500/30 overflow-hidden">
              <div className="p-3 bg-red-950/30 border-b border-red-500/20 text-xs font-semibold text-red-300 flex items-center justify-between">
                <span>BEFORE: Generic AI Boilerplate</span>
                <span className="text-[10px] px-2 py-0.5 bg-red-900/50 rounded">Rejected by Design Critic</span>
              </div>
              <pre className="p-4 font-mono text-xs text-red-200/80 overflow-auto flex-1">{boilerplateCode}</pre>
            </div>

            <div className="flex flex-col bg-[#0b0f1c] rounded-xl border border-emerald-500/40 overflow-hidden">
              <div className="p-3 bg-emerald-950/30 border-b border-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>AFTER: Polished Anti-Boilerplate UI</span>
                <span className="text-[10px] px-2 py-0.5 bg-emerald-900/50 rounded">Approved & QA Passed</span>
              </div>
              <pre className="p-4 font-mono text-xs text-emerald-300 overflow-auto flex-1">{critiquedCode}</pre>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="p-6 rounded-2xl bg-[#0f1523] border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">AutoForge Task Matrix</h2>
                  <p className="text-xs text-slate-400">Continuous QA & Playwright Verified</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-mono">
                  HTTP 200 • 0 Console Errors
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#131b2e] border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-200">Verify CDP Accessibility Tree Extraction</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">Critical</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#131b2e] border border-slate-700/50 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-medium text-slate-200">Mint ArmorIQ CSRG Merkle Intent Token</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300">High</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
