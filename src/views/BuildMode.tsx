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
  Flame,
  Wand2,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { CouncilVerdict, CriticFeedback } from '../types';

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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#07090e] text-slate-100 font-sans">
      {/* Studio Header */}
      <div className="p-4 bg-[#0d111a] border-b border-white/[0.08] select-none">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                <Code2 className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white font-sans flex items-center gap-2">
                  <span>7-Reviewer Anti-Boilerplate Council</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    Parallel Static Review
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400">
                  Rule-based AST pattern analysis across 7 concurrent critic roles • Real unified diffs & line references
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px]">
                {verdict?.council_mode || 'Rule-Based Multi-Reviewer Council'}
              </span>
            </div>
          </div>

          {/* Interactive Prompt Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-3.5 rounded-xl bg-[#07090e] border border-white/[0.09] focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all shadow-inner">
              <Wand2 className="w-4 h-4 text-indigo-400 mr-2.5 flex-shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe component or paste code to submit to 7-Agent Council..."
                className="w-full py-2.5 bg-transparent border-none outline-none text-xs text-slate-100 placeholder-slate-500 font-sans"
              />
            </div>
            <button
              onClick={() => handleRunCouncil()}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
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
          <div className="flex items-center gap-2 pt-1 text-[11px] font-mono overflow-x-auto">
            <span className="text-slate-500">Presets:</span>
            <button
              onClick={() => {
                setPrompt('Refactor Monolith into Modular Hooks & Design Tokens');
                handleRunCouncil('Refactor Monolith into Modular Hooks & Design Tokens');
              }}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] transition-colors"
            >
              Modular Hooks & Tokens
            </button>
            <button
              onClick={() => {
                setPrompt('Eliminate :any escapes and unhandled promises');
                handleRunCouncil('Eliminate :any escapes and unhandled promises');
              }}
              className="px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.06] transition-colors"
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
              Fail-Closed Test (rm -rf)
            </button>
          </div>
        </div>
      </div>

      {/* Fail-Closed Alert Banner */}
      {blockedError && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-rose-950/40 border border-rose-700/60 shadow-xl text-xs font-mono text-rose-200 flex items-start gap-3 animate-fade-in">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-rose-100 flex items-center gap-2">
              <span>Local Intent Policy Gate: TASK_BLOCKED</span>
              <span className="px-2 py-0.2 rounded bg-rose-900/60 text-[10px]">Fail-Closed</span>
            </div>
            <p className="mt-1 text-[11px] text-rose-300 leading-relaxed font-sans">
              {blockedError}
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden p-6 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col bg-[#0e121b] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#090d14] border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('critics')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'critics'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Council Breakdown ({verdict?.critics.length || 7})
              </button>
              <button
                onClick={() => setActiveTab('optimized')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'optimized'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Refactored Output
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeTab === 'input'
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Input Code (Demo Fixture)
              </button>
            </div>

            {verdict?.optimized_code && (
              <button
                onClick={() => handleCopyCode(verdict.optimized_code || '')}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 font-mono text-xs">
            {activeTab === 'optimized' && (
              <pre className="text-slate-200 leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono">
                {verdict?.optimized_code || '// Run the 7-Critic audit to view deterministic tokenized refactoring.'}
              </pre>
            )}

            {activeTab === 'input' && (
              <div className="h-full flex flex-col">
                <div className="mb-2 px-2 py-1 bg-white/[0.04] rounded text-[11px] text-slate-400 font-mono">
                  Sample Code Fixture (Demo Input for 7-Reviewer Council)
                </div>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 w-full bg-transparent border-none outline-none resize-none font-mono text-xs text-slate-200 leading-relaxed"
                  placeholder="Paste code here to submit to council..."
                />
              </div>
            )}

            {activeTab === 'critics' && (
              <div className="space-y-4">
                {verdict ? (
                  <div className="space-y-4">
                    {/* Summary Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/30 to-blue-950/20 border border-indigo-500/20 flex items-center justify-between">
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
                            {verdict.passed ? 'PASSED (>=75)' : 'REQUIRES REFACTORING'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-300 font-sans leading-relaxed">
                          {verdict.overall_feedback}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold font-mono text-white">
                          {verdict.average_score}
                          <span className="text-xs text-slate-400 font-sans">/100</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">Composite Score</div>
                      </div>
                    </div>

                    {/* 7 Critics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {verdict.critics.map((critic, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-[#080c14] border border-white/[0.07] hover:border-indigo-500/30 transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-slate-100 font-sans">
                                {critic.critic_name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {critic.role}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                critic.passed
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}
                            >
                              {critic.score} pts
                            </span>
                          </div>

                          {critic.line_violations && critic.line_violations.length > 0 && (
                            <div className="text-[10px] font-mono text-amber-400/90">
                              Detected at line(s): {critic.line_violations.join(', ')}
                            </div>
                          )}

                          {critic.issues.length > 0 && (
                            <div className="space-y-1">
                              {critic.issues.map((iss, j) => (
                                <div
                                  key={j}
                                  className="text-[11px] text-rose-300/90 flex items-start gap-1.5 font-sans"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                                  <span>{iss}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {critic.recommendations.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-white/[0.04]">
                              {critic.recommendations.map((rec, k) => (
                                <div
                                  key={k}
                                  className="text-[11px] text-emerald-300/90 flex items-start gap-1.5 font-sans"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {critic.diff_snippet && (
                            <div className="mt-2 p-2 rounded bg-black/40 border border-white/[0.04] text-[10px] font-mono overflow-x-auto text-slate-300 whitespace-pre">
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
