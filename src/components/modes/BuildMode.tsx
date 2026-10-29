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
    <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">AutoForge Task Matrix</h2>
          <p className="text-xs text-slate-500">Continuous QA & Playwright Verified</p>
        </div>
        <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-mono font-semibold">
          HTTP 200 • 0 Console Errors
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between hover:border-purple-300 transition">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-semibold text-slate-800">{t.title}</span>
            </div>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
              {t.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}`;

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Top Action Ribbon (Pastel Theme) */}
      <div className="px-6 py-3.5 bg-white border-b border-slate-200/80 flex items-center justify-between shadow-xs">
        <div className="flex-1 max-w-2xl flex items-center bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 shadow-inner">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-transparent text-slate-800 text-xs outline-none font-medium"
            placeholder="Describe what to build or refine with Code Builder + Design Critic..."
          />
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => onTriggerTask(prompt)}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Run Critique Loop</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-2.5 bg-slate-50/70 border-b border-slate-200 flex items-center space-x-3 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'code' 
              ? 'bg-white text-purple-900 shadow-xs border border-slate-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Code Inspector (@src/components)
        </button>
        <button
          onClick={() => setActiveTab('critique')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'critique' 
              ? 'bg-purple-100 text-purple-900 shadow-xs border border-purple-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Multi-Agent Critique Diff (Before vs After)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-3 py-1.5 rounded-lg transition ${
            activeTab === 'preview' 
              ? 'bg-emerald-100 text-emerald-900 shadow-xs border border-emerald-200' 
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Live Localhost:3000 Preview
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        {activeTab === 'code' && (
          <div className="h-full bg-white rounded-2xl border border-slate-200 p-5 font-mono text-xs overflow-auto shadow-sm text-slate-800">
            <div className="text-purple-700 font-semibold mb-2">// AutoForge Code Builder - Generated & Checked with Playwright</div>
            <pre className="text-slate-800 leading-relaxed">{critiquedCode}</pre>
          </div>
        )}

        {activeTab === 'critique' && (
          <div className="grid grid-cols-2 gap-6 h-full">
            <div className="flex flex-col bg-white rounded-2xl border border-rose-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-rose-50/80 border-b border-rose-100 text-xs font-bold text-rose-900 flex items-center justify-between">
                <span>BEFORE: Generic AI Boilerplate</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-rose-200/80 text-rose-900 font-semibold rounded-full">
                  Rejected by Design Critic
                </span>
              </div>
              <pre className="p-4 font-mono text-xs text-rose-950 overflow-auto flex-1 bg-rose-50/20 leading-relaxed">
                {boilerplateCode}
              </pre>
            </div>

            <div className="flex flex-col bg-white rounded-2xl border border-emerald-200 overflow-hidden shadow-xs">
              <div className="p-3.5 bg-emerald-50/80 border-b border-emerald-100 text-xs font-bold text-emerald-900 flex items-center justify-between">
                <span>AFTER: Polished Anti-Boilerplate UI</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-200/80 text-emerald-900 font-semibold rounded-full">
                  Approved & QA Passed
                </span>
              </div>
              <pre className="p-4 font-mono text-xs text-emerald-950 overflow-auto flex-1 bg-emerald-50/20 leading-relaxed">
                {critiquedCode}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">AutoForge Task Matrix</h2>
                  <p className="text-xs text-slate-500">Continuous QA & Playwright Verified</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-mono font-semibold">
                  HTTP 200 • 0 Console Errors
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-800">Verify CDP Accessibility Tree Extraction</span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                    Critical
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-semibold text-slate-800">Mint ArmorIQ CSRG Merkle Intent Token</span>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-semibold">
                    High
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
