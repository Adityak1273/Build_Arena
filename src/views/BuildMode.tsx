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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Studio Header Card */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 shadow-2xs select-none">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-orange-50/30 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <Code2 className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    7-Reviewer Anti-Boilerplate Council
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-200">
                    Parallel Static Review
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rule-based AST pattern analysis across 7 concurrent critic roles • Real unified diffs & line references
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-600">
              <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-bold">
                {verdict?.council_mode || 'Rule-Based Multi-Reviewer Council'}
              </span>
            </div>
          </div>

          {/* Interactive Prompt Bar */}
          <div className="flex gap-2">
            <div className="flex-1 flex items-center px-3.5 rounded-lg bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all shadow-2xs">
              <Wand2 className="w-4 h-4 text-orange-600 mr-2.5 shrink-0" />
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe component or paste code to submit to 7-Agent Council..."
                className="w-full py-2 bg-transparent border-none outline-hidden text-xs text-slate-900 placeholder-slate-400 font-sans font-medium"
              />
            </div>
            <button
              onClick={() => handleRunCouncil()}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
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
          <div className="flex items-center gap-2 pt-0.5 text-[11px] overflow-x-auto">
            <span className="text-slate-400 font-bold uppercase text-[10px] tracking-wider">Presets:</span>
            <button
              onClick={() => {
                setPrompt('Refactor Monolith into Modular Hooks & Design Tokens');
                handleRunCouncil('Refactor Monolith into Modular Hooks & Design Tokens');
              }}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium transition-colors shadow-2xs cursor-pointer"
            >
              Modular Hooks & Tokens
            </button>
            <button
              onClick={() => {
                setPrompt('Eliminate :any escapes and unhandled promises');
                handleRunCouncil('Eliminate :any escapes and unhandled promises');
              }}
              className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium transition-colors shadow-2xs cursor-pointer"
            >
              Strict TypeScript Audit
            </button>
            <button
              onClick={() => {
                setPrompt('Evaluate destructive script: rm -rf / --no-preserve-root');
                setInputCode('rm -rf / && DROP DATABASE production;');
                handleRunCouncil('Evaluate destructive script: rm -rf / --no-preserve-root', 'rm -rf / && DROP DATABASE production;');
              }}
              className="px-2.5 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-800 border border-red-200 flex items-center gap-1 font-bold transition-colors cursor-pointer"
            >
              <Flame className="w-3 h-3 text-red-600" />
              Fail-Closed Test (rm -rf)
            </button>
          </div>
        </div>
      </div>

      {/* Fail-Closed Alert Banner */}
      {blockedError && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 border border-red-200 shadow-xs text-xs text-red-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-bold text-red-900 flex items-center gap-2">
              <span>Local Intent Policy Gate: TASK_BLOCKED</span>
              <span className="px-2 py-0.2 rounded bg-red-100 text-[10px] font-bold">Fail-Closed</span>
            </div>
            <p className="mt-1 text-xs text-red-800 leading-relaxed font-sans">
              {blockedError}
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Split */}
      <div className="flex-1 flex overflow-hidden p-4 sm:p-6 gap-6 max-w-7xl mx-auto w-full">
        <div className="flex-1 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('critics')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'critics'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Council Breakdown ({verdict?.critics.length || 7})
              </button>
              <button
                onClick={() => setActiveTab('optimized')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'optimized'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Refactored Output
              </button>
              <button
                onClick={() => setActiveTab('input')}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'input'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                Input Code (Demo Fixture)
              </button>
            </div>

            {verdict?.optimized_code && (
              <button
                onClick={() => handleCopyCode(verdict.optimized_code || '')}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            )}
          </div>

          <div className="flex-1 overflow-auto p-4 text-xs">
            {activeTab === 'optimized' && (
              <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl leading-relaxed overflow-x-auto whitespace-pre-wrap font-mono border border-slate-800 shadow-inner">
                {verdict?.optimized_code || '// Run the 7-Critic audit to view deterministic tokenized refactoring.'}
              </pre>
            )}

            {activeTab === 'input' && (
              <div className="h-full flex flex-col">
                <div className="mb-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] text-slate-600 font-mono font-semibold">
                  Sample Code Fixture (Demo Input for 7-Reviewer Council)
                </div>
                <textarea
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-hidden resize-none font-mono text-xs text-slate-900 leading-relaxed focus:bg-white focus:border-orange-500"
                  placeholder="Paste code here to submit to council..."
                />
              </div>
            )}

            {activeTab === 'critics' && (
              <div className="space-y-4">
                {verdict ? (
                  <div className="space-y-4">
                    {/* Summary Banner */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 via-white to-orange-50/30 border border-slate-200 flex items-center justify-between shadow-2xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                            Council Verdict
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                              verdict.passed
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}
                          >
                            {verdict.passed ? 'PASSED (>=75)' : 'REQUIRES REFACTORING'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-700 font-sans leading-relaxed">
                          {verdict.overall_feedback}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black font-mono text-slate-900">
                          {verdict.average_score}
                          <span className="text-xs text-slate-400 font-sans">/100</span>
                        </div>
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Composite Score</div>
                      </div>
                    </div>

                    {/* 7 Critics Cards matching SIH_DEAL_DEMO */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                      {verdict.critics.map((critic, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 shadow-xs transition-all space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-xs text-slate-900 font-sans">
                                {critic.critic_name}
                              </div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {critic.role}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-mono font-bold border ${
                                critic.passed
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-red-50 text-red-800 border-red-200'
                              }`}
                            >
                              {critic.score} pts
                            </span>
                          </div>

                          {critic.line_violations && critic.line_violations.length > 0 && (
                            <div className="text-[10px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded inline-block">
                              Detected at line(s): {critic.line_violations.join(', ')}
                            </div>
                          )}

                          {critic.issues.length > 0 && (
                            <div className="space-y-1">
                              {critic.issues.map((iss, j) => (
                                <div
                                  key={j}
                                  className="text-[11px] text-red-800 bg-red-50 border border-red-100 p-2 rounded flex items-start gap-1.5 font-sans"
                                >
                                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                                  <span>{iss}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {critic.recommendations.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-100">
                              {critic.recommendations.map((rec, k) => (
                                <div
                                  key={k}
                                  className="text-[11px] text-emerald-900 bg-emerald-50 border border-emerald-100 p-2 rounded flex items-start gap-1.5 font-sans"
                                >
                                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {critic.diff_snippet && (
                            <div className="mt-2 p-2.5 rounded-lg bg-slate-900 text-slate-100 border border-slate-800 text-[10.5px] font-mono overflow-x-auto whitespace-pre">
                              {critic.diff_snippet}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-slate-400 space-y-2 mt-8">
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
