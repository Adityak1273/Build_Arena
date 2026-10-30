import React, { useState } from 'react';
import {
  Sparkles,
  ShieldAlert,
  Code2,
  Copy,
  Check,
  AlertCircle,
  FileCheck,
  Flame,
  Wand2,
} from 'lucide-react';
import { api } from '../services/api';
import { CouncilVerdict } from '../types';

export const BuildMode: React.FC = () => {
  const [prompt, setPrompt] = useState(
    'Audit React component for anti-boilerplate patterns, security, and accessibility'
  );
  const [inputCode, setInputCode] = useState(`// Sample Code Fixture (Demo Input for 7-Reviewer Council)
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
  const [activeTab, setActiveTab] = useState<'critics' | 'optimized' | 'input'>('critics');
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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-transparent text-slate-100 font-sans">
      {/* Studio Header Card */}
      <div className="p-4 sm:p-5 bg-[#0B0E17]/80 backdrop-blur-xl border-b border-white/[0.08] select-none sticky top-0 z-20 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#0F121C] via-[#151926] to-[#0F121C] p-4 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-display font-extrabold text-white tracking-tight">
                    7-Reviewer Anti-Boilerplate Council
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                    Parallel Static Review
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Rule-based AST pattern analysis across 7 concurrent critic roles • Real unified diffs & line references
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="px-3 py-1 rounded-full bg-white/[0.06] border border-white/[0.1] text-[11px] font-bold text-cyan-300">
                {verdict?.council_mode || 'Rule-Based Multi-Reviewer Council'}
              </span>
            </div>
          </div>

          {/* Interactive Prompt Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-3.5 rounded-xl bg-[#06080D] border border-white/[0.1] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
              <Wand2 className="w-4 h-4 text-cyan-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe component or paste code to submit to 7-Agent Council..."
                className="w-full py-2 bg-transparent border-none outline-hidden text-xs text-white placeholder-slate-500 font-mono font-medium"
              />
            </div>
            <button
              onClick={() => handleRunCouncil()}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.35)] flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer border border-white/20"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin text-white" />
                  <span>Evaluating 7 Critics...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Run 7-Critic Audit</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 pt-0.5 text-[11px] overflow-x-auto">
            <span className="text-slate-500 font-mono font-bold uppercase text-[10px] tracking-wider">Presets:</span>
            <button
              onClick={() => {
                setPrompt('Refactor Monolith into Modular Hooks & Design Tokens');
                handleRunCouncil('Refactor Monolith into Modular Hooks & Design Tokens');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] font-mono transition-colors cursor-pointer"
            >
              Modular Hooks & Tokens
            </button>
            <button
              onClick={() => {
                setPrompt('Eliminate :any escapes and unhandled promises');
                handleRunCouncil('Eliminate :any escapes and unhandled promises');
              }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] font-mono transition-colors cursor-pointer"
            >
              Strict TypeScript Audit
            </button>
            <button
              onClick={() => {
                setPrompt('Evaluate destructive script: rm -rf / --no-preserve-root');
                setInputCode('rm -rf / && DROP DATABASE production;');
                handleRunCouncil('Evaluate destructive script: rm -rf / --no-preserve-root', 'rm -rf / && DROP DATABASE production;');
              }}
              className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1 font-mono font-bold transition-colors cursor-pointer shadow-[0_0_10px_rgba(244,63,94,0.15)]"
            >
              <Flame className="w-3 h-3 text-rose-400" />
              Fail-Closed Test (rm -rf)
            </button>
          </div>
        </div>
      </div>

      {/* Fail-Closed Alert Banner */}
      {blockedError && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 shadow-[0_0_25px_rgba(244,63,94,0.15)] text-xs text-rose-200 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-200 flex items-center gap-2">
              <span className="font-mono">Local Intent Policy Gate: TASK_BLOCKED</span>
              <span className="px-2 py-0.2 rounded-md bg-rose-500/20 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/30">Fail-Closed</span>
            </div>
            <p className="mt-1 text-xs text-rose-300 leading-relaxed font-sans">
              {blockedError}
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden p-4 sm:p-6 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0A0D14]/90 backdrop-blur-md border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('critics')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'critics'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-2xs border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Council Breakdown ({verdict?.critics.length || 7})
              </button>
              <button
                onClick={() => setActiveTab('optimized')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'optimized'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-2xs border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Refactored Output
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  activeTab === 'input'
                    ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-2xs border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                Input Code (Demo Fixture)
              </button>
            </div>

            {verdict?.optimized_code && (
              <button
                onClick={() => handleCopyCode(verdict.optimized_code || '')}
                className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 text-xs">
            {activeTab === 'optimized' && (
              <pre className="bg-[#05070B] text-slate-200 p-4 rounded-xl leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono border border-white/[0.08] shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]">
                {verdict?.optimized_code || '// Run the 7-Critic audit to view deterministic tokenized refactoring.'}
              </pre>
            )}

            {activeTab === 'input' && (
              <div className="h-full flex flex-col">
                <div className="mb-2 px-3 py-1.5 bg-[#06080D] border border-white/[0.08] rounded-lg text-[11px] text-cyan-300 font-mono font-semibold">
                  Sample Code Fixture (Demo Input for 7-Reviewer Council)
                </div>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 w-full bg-[#05070B] border border-white/[0.08] rounded-xl p-3 outline-hidden resize-none font-mono text-xs text-slate-200 leading-relaxed focus:border-indigo-500 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
                  placeholder="Paste code here to submit to council..."
                />
              </div>
            )}

            {activeTab === 'critics' && (
              <div className="space-y-4">
                {verdict ? (
                  <div className="space-y-4">
                    {/* Summary Banner */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-[#111522] via-[#151926] to-[#111522] border border-white/[0.08] flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                            Council Verdict
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
                              verdict.passed
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                            }`}
                          >
                            {verdict.passed ? 'PASSED (>=75)' : 'REQUIRES REFACTORING'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 font-sans leading-relaxed">
                          {verdict.overall_feedback}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-white">
                          {verdict.average_score}
                          <span className="text-xs text-slate-500 font-sans">/100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono font-bold uppercase">Composite Score</div>
                      </div>
                    </div>

                    {/* 7 Critics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {verdict.critics.map((critic, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-[#111522] border border-white/[0.08] hover:border-white/[0.16] shadow-xs transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-display font-bold text-xs text-white">
                                {critic.critic_name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {critic.role}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${
                                critic.passed
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                              }`}
                            >
                              {critic.score} pts
                            </span>
                          </div>

                          {critic.line_violations && critic.line_violations.length > 0 && (
                            <div className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md inline-block">
                              Detected at line(s): {critic.line_violations.join(', ')}
                            </div>
                          )}

                          {critic.issues.length > 0 && (
                            <div className="space-y-1">
                              {critic.issues.map((iss, j) => (
                                <div
                                  key={j}
                                  className="text-[11px] text-rose-200 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-start gap-1.5 font-sans"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                                  <span>{iss}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {critic.recommendations.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-white/[0.06]">
                              {critic.recommendations.map((rec, k) => (
                                <div
                                  key={k}
                                  className="text-[11px] text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-lg flex items-start gap-1.5 font-sans"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {critic.diff_snippet && (
                            <div className="mt-2 p-2.5 rounded-xl bg-[#05070B] text-slate-200 border border-white/[0.08] text-[10.5px] font-mono overflow-x-auto whitespace-pre">
                              {critic.diff_snippet}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-500 space-y-2 mt-8">
                    <Code2 className="w-10 h-10 opacity-30 mx-auto" />
                    <p className="text-xs font-mono">
                      Click "Run 7-Critic Audit" to evaluate the sample code fixture across all 7 reviewer roles concurrently.
                    </p>
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
