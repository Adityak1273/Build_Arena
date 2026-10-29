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
    <div className="p-7 rounded-3xl bg-white border border-[#E4E4E7] shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F0F0F] tracking-[-0.03em]">AutoForge Task Matrix</h2>
          <p className="text-xs text-[#71717A] font-medium mt-0.5">Continuous QA & Playwright Verified</p>
        </div>
        <span className="px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full text-xs font-mono font-bold tracking-tight">
          HTTP 200 • 0 Console Errors
        </span>
      </div>

      <div className="space-y-3">
        {tasks.map(t => (
          <div key={t.id} className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E4E7] flex items-center justify-between hover:border-purple-300 transition duration-150">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-[#0F0F0F] tracking-tight">{t.title}</span>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold">
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
      {/* Top Action Ribbon (Modern Typography) */}
      <div className="px-7 py-3.5 bg-white border-b border-[#E4E4E7] flex items-center justify-between shadow-2xs">
        <div className="flex-1 max-w-2xl flex items-center bg-[#F4F4F5] border border-[#E4E4E7] rounded-full px-4 py-2 shadow-inner">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-transparent text-[#0F0F0F] text-xs outline-none font-medium tracking-tight"
            placeholder="Describe what to build or refine with Code Builder + Design Critic..."
          />
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => onTriggerTask(prompt)}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-5 py-2.5 bg-[#0F0F0F] hover:bg-[#27272A] text-white rounded-full text-xs font-bold tracking-tight shadow-sm transition duration-150 disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            <span>Run Critique Loop</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-7 py-2.5 bg-white border-b border-[#E4E4E7] flex items-center space-x-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('code')}
          className={`px-4 py-1.5 rounded-full transition duration-150 tracking-tight ${
            activeTab === 'code' 
              ? 'bg-[#0F0F0F] text-white shadow-xs' 
              : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-[#F4F4F5]'
          }`}
        >
          Code Inspector (@src/components)
        </button>
        <button
          onClick={() => setActiveTab('critique')}
          className={`px-4 py-1.5 rounded-full transition duration-150 tracking-tight ${
            activeTab === 'critique' 
              ? 'bg-purple-100 text-purple-900 border border-purple-200 shadow-xs' 
              : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-[#F4F4F5]'
          }`}
        >
          Multi-Agent Critique Diff (Before vs After)
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-1.5 rounded-full transition duration-150 tracking-tight ${
            activeTab === 'preview' 
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-xs' 
              : 'text-[#52525B] hover:text-[#0F0F0F] hover:bg-[#F4F4F5]'
          }`}
        >
          Live Localhost:3000 Preview
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-7">
        {activeTab === 'code' && (
          <div className="h-full bg-white rounded-3xl border border-[#E4E4E7] p-6 font-mono text-xs overflow-auto shadow-sm text-[#0F0F0F]">
            <div className="text-purple-700 font-bold mb-3 tracking-tight">// AutoForge Code Builder - Generated & Checked with Playwright</div>
            <pre className="text-[#0F0F0F] leading-[1.7]">{critiquedCode}</pre>
          </div>
        )}

        {activeTab === 'critique' && (
          <div className="grid grid-cols-2 gap-6 h-full">
            <div className="flex flex-col bg-white rounded-3xl border border-rose-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-rose-50/80 border-b border-rose-100 text-xs font-bold text-rose-950 flex items-center justify-between">
                <span className="tracking-tight">BEFORE: Generic AI Boilerplate</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-rose-200 text-rose-950 font-bold rounded-full">
                  Rejected by Design Critic
                </span>
              </div>
              <pre className="p-5 font-mono text-xs text-rose-950 overflow-auto flex-1 bg-rose-50/20 leading-[1.7]">
                {boilerplateCode}
              </pre>
            </div>

            <div className="flex flex-col bg-white rounded-3xl border border-emerald-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-emerald-50/80 border-b border-emerald-100 text-xs font-bold text-emerald-950 flex items-center justify-between">
                <span className="tracking-tight">AFTER: Polished Anti-Boilerplate UI</span>
                <span className="text-[10px] px-2.5 py-0.5 bg-emerald-200 text-emerald-950 font-bold rounded-full">
                  Approved & QA Passed
                </span>
              </div>
              <pre className="p-5 font-mono text-xs text-emerald-950 overflow-auto flex-1 bg-emerald-50/20 leading-[1.7]">
                {critiquedCode}
              </pre>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="max-w-2xl mx-auto mt-6">
            <div className="p-7 rounded-3xl bg-white border border-[#E4E4E7] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#0F0F0F] tracking-[-0.03em]">AutoForge Task Matrix</h2>
                  <p className="text-xs text-[#71717A] font-medium mt-0.5">Continuous QA & Playwright Verified</p>
                </div>
                <span className="px-3.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-full text-xs font-mono font-bold tracking-tight">
                  HTTP 200 • 0 Console Errors
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E4E7] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-[#0F0F0F] tracking-tight">Verify CDP Accessibility Tree Extraction</span>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold">
                    Critical
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-[#E4E4E7] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-bold text-[#0F0F0F] tracking-tight">Mint ArmorIQ CSRG Merkle Intent Token</span>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-bold">
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
