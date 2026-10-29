import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Code2,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  Terminal,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { api } from '../services/api';
import { CouncilVerdict, CriticFeedback } from '../types';

export const BuildMode: React.FC = () => {
  const [prompt, setPrompt] = useState(
    'Generate an enterprise telemetry component with custom AutoForge design variables'
  );
  const [inputCode, setInputCode] = useState(`// Generic legacy boilerplate sample
export function LegacyCard(props: any) {
  const [data, setData] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  return (
    <div className="bg-slate-900 border border-slate-700 text-slate-100 p-6 rounded-lg">
      <h2 className="text-xl font-bold">{props.title}</h2>
      <button onClick={() => setCount(count + 1)} className="bg-blue-600 px-3 py-1">
        Count: {count}
      </button>
    </div>
  );
}`);

  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState<CouncilVerdict | null>(null);
  const [activeTab, setActiveTab] = useState<'optimized' | 'critics' | 'input'>('critics');
  const [copied, setCopied] = useState(false);
  const [blockedError, setBlockedError] = useState<string | null>(null);

  const handleRunCouncil = async (overridePrompt?: string, overrideCode?: string) => {
    const p = overridePrompt || prompt;
    const c = overrideCode || inputCode;
    setIsLoading(true);
    setBlockedError(null);

    try {
      const res = await api.executeTask('COUNCIL_AUDIT', p, c);
      setVerdict(res);
      setActiveTab('critics');
    } catch (err: any) {
      if (err.message && err.message.includes('TASK_BLOCKED')) {
        setBlockedError(err.message);
      } else {
        setBlockedError(`Task Error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Top Prompt Header */}
      <div className="p-4 bg-[#111520] border-b border-[#23293d] select-none">
        <div className="max-w-5xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Code2 className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold tracking-tight text-white">
                Anti-Boilerplate Studio & 7-Agent Council
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>Concurrent AST Parsing</span>
              <span>•</span>
              <span className="text-blue-400">asyncio.gather</span>
            </div>
          </div>

          {/* Prompt Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-3 rounded-xl bg-[#0a0d14] border border-[#23293d] focus-within:border-blue-500 transition-colors">
              <Sparkles className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe component or paste code to submit to 7-Agent Council..."
                className="w-full py-2.5 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500"
              />
            </div>
            <button
              onClick={() => handleRunCouncil()}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Evaluating 7 Critics...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Audit & Transform</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Benchmark & Security Triggers */}
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono overflow-x-auto">
            <span className="text-slate-500">Quick Tests:</span>
            <button
              onClick={() => {
                setPrompt('Refactor Monolith into Modular Hooks & Design Tokens');
                handleRunCouncil('Refactor Monolith into Modular Hooks & Design Tokens');
              }}
              className="px-2.5 py-1 rounded-md bg-[#171c2b] hover:bg-[#1e2538] text-slate-300 border border-[#23293d] transition-colors"
            >
              Modular Hooks & Tokens
            </button>
            <button
              onClick={() => {
                setPrompt('Eliminate :any escapes and unhandled promises');
                handleRunCouncil('Eliminate :any escapes and unhandled promises');
              }}
              className="px-2.5 py-1 rounded-md bg-[#171c2b] hover:bg-[#1e2538] text-slate-300 border border-[#23293d] transition-colors"
            >
              Strict TypeScript Audit
            </button>
            <button
              onClick={() => {
                setPrompt('Evaluate destructive script: rm -rf / --no-preserve-root');
                setInputCode('rm -rf / && DROP DATABASE production;');
                handleRunCouncil('Evaluate destructive script: rm -rf / --no-preserve-root', 'rm -rf / && DROP DATABASE production;');
              }}
              className="px-2.5 py-1 rounded-md bg-rose-950/40 hover:bg-rose-950/60 text-rose-300 border border-rose-800/50 flex items-center gap-1 transition-colors"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              Trigger Fail-Closed Test (rm -rf)
            </button>
          </div>
        </div>
      </div>

      {/* Fail-Closed Blocked Alert */}
      {blockedError && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 shadow-lg text-xs font-mono text-rose-200 flex items-start gap-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-100 flex items-center gap-2">
              <span>ArmorIQ CSRG Zero-Trust Interception: TASK_BLOCKED</span>
              <span className="px-2 py-0.2 rounded bg-rose-900/60 text-[10px]">Fail-Closed</span>
            </div>
            <p className="mt-1 text-[11px] text-rose-300 leading-relaxed">
              {blockedError}
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Left: Input Code vs Optimized Code Workspace */}
        <div className="flex-1 flex flex-col bg-[#111520] border border-[#23293d] rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e121b] border-b border-[#23293d]">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('critics')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'critics'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Council Breakdown ({verdict?.critics.length || 7})
              </button>
              <button
                onClick={() => setActiveTab('optimized')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'optimized'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Synthesized Code
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'input'
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Raw Input Code
              </button>
            </div>

            {verdict?.optimized_code && (
              <button
                onClick={() => handleCopyCode(verdict.optimized_code || '')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Production Code'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs">
            {activeTab === 'optimized' && (
              <pre className="text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {verdict?.optimized_code || '// Run the 7-Agent Council audit above to generate clean code.'}
              </pre>
            )}

            {activeTab === 'input' && (
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full h-full bg-transparent border-none outline-none resize-none font-mono text-xs text-slate-200 leading-relaxed"
                placeholder="Paste generic boilerplate code here..."
              />
            )}

            {activeTab === 'critics' && (
              <div className="space-y-4">
                {verdict ? (
                  <div className="space-y-4">
                    {/* Verdict Banner */}
                    <div className="p-4 rounded-xl bg-[#171c2b] border border-[#23293d] flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Council Verdict
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                              verdict.passed
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {verdict.passed ? 'PASSED COUNCIL AUDIT' : 'FLAGGED BOILERPLATE'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 font-sans">
                          {verdict.overall_feedback}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-blue-400">
                          {verdict.average_score}
                          <span className="text-xs text-slate-500 font-normal">/100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          Average Quality
                        </div>
                      </div>
                    </div>

                    {/* 7 Critics List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {verdict.critics.map((critic, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#141926] border border-[#23293d] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between pb-2 border-b border-[#23293d]">
                              <div>
                                <h4 className="text-xs font-bold text-slate-100">
                                  {critic.critic_name}
                                </h4>
                                <p className="text-[10px] text-slate-400 font-sans">
                                  {critic.role}
                                </p>
                              </div>
                              <span
                                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                  critic.passed
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-rose-500/20 text-rose-400'
                                }`}
                              >
                                {critic.score}/100
                              </span>
                            </div>

                            {critic.issues.length > 0 && (
                              <div className="mt-2 text-[11px] text-rose-300 space-y-1">
                                {critic.issues.map((iss, i) => (
                                  <div key={i} className="flex items-start gap-1.5">
                                    <span className="text-rose-500 font-bold">•</span>
                                    <span>{iss}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {critic.recommendations.length > 0 && (
                              <div className="mt-2 text-[11px] text-slate-300 space-y-1">
                                {critic.recommendations.map((rec, i) => (
                                  <div key={i} className="flex items-start gap-1.5 text-blue-300">
                                    <span className="text-blue-400">→</span>
                                    <span>{rec}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {critic.diff_snippet && (
                            <div className="mt-3 p-2 rounded bg-[#0a0d14] border border-[#23293d] text-[10px] text-slate-400 overflow-x-auto">
                              <pre className="whitespace-pre">{critic.diff_snippet}</pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs font-sans">
                    Click "Audit & Transform" above to dispatch the 7 parallel critics.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
