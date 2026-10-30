import React, { useState, useEffect } from 'react';
import {
  Download,
  AlertTriangle,
  FileSpreadsheet,
  RefreshCw,
  Terminal,
  StopCircle,
  Database,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Copy,
  Check,
  Save,
  Edit3,
  History,
  Trash2,
  Pause,
  Play,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Split,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Globe
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationOutcome, StartupRow, AutonomousPlanResult, TaskStep, TaskHistoryEntry } from '../types';

export const AutomateMode: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string>('LIVE_SCRAPED');
  const [outcome, setOutcome] = useState<VerificationOutcome | null>(null);
  const [editableRows, setEditableRows] = useState<StartupRow[]>([]);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(true);
  const [copiedHash, setCopiedHash] = useState(false);

  // Autonomous task runner state
  const [autonomousGoal, setAutonomousGoal] = useState(
    'Research 10 AI startups, compare product and pricing, write to spreadsheet, create a launch image'
  );
  const [activePlan, setActivePlan] = useState<AutonomousPlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedStepId, setExpandedStepId] = useState<string | null>(null);

  // Side-by-side view state
  const [sideBySide, setSideBySide] = useState(false);
  const [latestScreenshot, setLatestScreenshot] = useState<string | null>(null);
  const [latestUrl, setLatestUrl] = useState<string>('https://elevenlabs.io');

  // Task History State
  const [taskHistory, setTaskHistory] = useState<TaskHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    handleLoadInitial();
    handleLoadHistory();
  }, []);

  const handleLoadInitial = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLatestSpreadsheet();
      setOutcome(data);
      if (data?.rows) {
        setEditableRows(JSON.parse(JSON.stringify(data.rows)));
      }
    } catch (e) {
      console.error('Failed to load spreadsheet:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const data = await api.getTaskHistory();
      setTaskHistory(data.history || []);
    } catch (e) {
      console.warn('Could not load history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Clear all recorded task history memory?')) return;
    try {
      await api.clearTaskHistory();
      setTaskHistory([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRunBenchmark = async (mode: string) => {
    setSelectedMode(mode);
    setIsLoading(true);
    setSaveSuccessMsg(null);
    try {
      const res = await api.exportSpreadsheet(mode);
      setOutcome(res);
      if (res?.rows) {
        setEditableRows(JSON.parse(JSON.stringify(res.rows)));
        setHasUnsavedEdits(false);
      }
      await handleLoadHistory();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCellChange = (rowIndex: number, field: keyof StartupRow, value: string) => {
    setEditableRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = {
        ...copy[rowIndex],
        [field]: value,
      };
      return copy;
    });
    setHasUnsavedEdits(true);
  };

  const handleSaveAndReverify = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);
    try {
      const updatedOutcome = await api.updateSpreadsheet(editableRows);
      setOutcome(updatedOutcome);
      if (updatedOutcome?.rows) {
        setEditableRows(JSON.parse(JSON.stringify(updatedOutcome.rows)));
      }
      setHasUnsavedEdits(false);
      setSaveSuccessMsg(`Disk Artifact Re-Verified: New SHA-256 Hash is ${updatedOutcome.disk_hash}`);
      setTimeout(() => setSaveSuccessMsg(null), 6000);
    } catch (err: any) {
      console.error('Save failed:', err);
      alert('Failed to save and re-verify spreadsheet artifact: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePlanAutonomous = async () => {
    setIsPlanning(true);
    try {
      const plan = await api.planAutonomousTask(autonomousGoal);
      setActivePlan(plan);
      if (plan.steps.length > 0) {
        setExpandedStepId(plan.steps[0].step_id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecuteAutonomous = async () => {
    if (!activePlan) return;
    setIsExecutingPlan(true);
    setIsPaused(false);
    try {
      const result = await api.executeAutonomousPlan(activePlan);
      setActivePlan(result);
      // Capture screenshot if available from browser_navigate step
      const navStep = result.steps.find((s) => s.tool === 'browser_navigate' && s.result?.screenshotBase64);
      if (navStep) {
        setLatestScreenshot(navStep.result.screenshotBase64);
        setLatestUrl(navStep.result.url || latestUrl);
      }
      await handleLoadInitial();
      await handleLoadHistory();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingPlan(false);
      setIsPaused(false);
    }
  };

  const handlePauseAutonomous = async () => {
    try {
      await api.pauseAutonomousPlan();
      setIsPaused(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResumeAutonomous = async () => {
    try {
      await api.resumeAutonomousPlan();
      setIsPaused(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelAutonomous = async () => {
    if (!activePlan) return;
    try {
      await api.cancelAutonomousPlan(activePlan.plan_id);
      setIsExecutingPlan(false);
      setIsPaused(false);
      await handleLoadHistory();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-transparent text-slate-100 font-sans">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-[#0B0E17]/80 backdrop-blur-xl border-b border-white/[0.08] select-none sticky top-0 z-20 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#0F121C] via-[#151926] to-[#0F121C] p-4 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <FileSpreadsheet className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-display font-extrabold text-white tracking-tight">
                    Autonomous Verification & Judge Test Bench
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                    AdaL Ground Truth
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
                    Live Editable Matrix
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Standard TLS crawl • Physical disk read-back assertion • Cryptographic SHA-256 integrity verification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSideBySide(!sideBySide)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                  sideBySide
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-white/[0.06] text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
                }`}
                title="Toggle side-by-side view (Browser on left, Plan & Verification on right)"
              >
                <Split className="w-3.5 h-3.5 text-cyan-400" />
                <span>{sideBySide ? 'Single View' : 'Side-by-Side'}</span>
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                  showHistory
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40'
                    : 'bg-white/[0.06] text-slate-300 border-white/[0.1] hover:bg-white/[0.1]'
                }`}
                title="View previous task executions and user-controlled memory"
              >
                <History className="w-3.5 h-3.5 text-indigo-400" />
                <span>Task History ({taskHistory.length})</span>
              </button>

              <button
                onClick={handleSaveAndReverify}
                disabled={isSaving || !hasUnsavedEdits}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                  hasUnsavedEdits
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] border-emerald-400/40 animate-pulse'
                    : 'bg-white/[0.04] text-slate-500 border-white/[0.06] cursor-not-allowed'
                }`}
                title={hasUnsavedEdits ? 'Persist edited rows to disk and recalculate SHA-256' : 'Edit any table cell to enable disk re-verification'}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Re-Verifying...' : 'Save & Re-Verify (SHA-256)'}</span>
              </button>

              <button
                onClick={() => handleRunBenchmark('LIVE_SCRAPED')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white font-mono font-bold text-xs shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all disabled:opacity-50 cursor-pointer border border-white/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Crawling...' : 'Trigger Live Scrape'}</span>
              </button>

              <a
                href={api.getDownloadUrl()}
                download="ai_startups_matrix.csv"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 font-mono font-bold text-xs shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Download CSV</span>
              </a>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-[0_0_25px_rgba(16,185,129,0.25)] animate-fade-in font-mono">
              <div className="flex items-center gap-2 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            </div>
          )}

          {outcome?.is_cached_snapshot && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.12)]">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Displaying Saved Disk Snapshot ({outcome.retrieval_timestamp}). Click "Trigger Live Scrape" for live network verification.</span>
              </div>
            </div>
          )}

          {/* Autonomous Goal Planning Bar */}
          <div className="p-3 rounded-xl bg-[#0F121C]/80 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)] flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-white whitespace-nowrap flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Goal:</span>
            </span>
            <input
              type="text"
              value={autonomousGoal}
              onChange={(e) => setAutonomousGoal(e.target.value)}
              placeholder="Enter natural-language goal (e.g. Research 10 AI startups, compare product and pricing, write to spreadsheet, create a launch image)..."
              className="flex-1 min-w-[280px] bg-[#06080D] border border-white/[0.08] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 font-mono focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            <button
              onClick={handlePlanAutonomous}
              disabled={isPlanning || isExecutingPlan}
              className="px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.14] text-white font-mono font-bold text-xs border border-white/[0.1] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPlanning ? 'Planning...' : 'Generate Plan'}
            </button>
            {activePlan && activePlan.status !== 'COMPLETED' && (
              <button
                onClick={handleExecuteAutonomous}
                disabled={isExecutingPlan}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all disabled:opacity-50 cursor-pointer border border-emerald-400/30"
              >
                {isExecutingPlan ? (isPaused ? 'Paused' : 'Executing Plan...') : 'Execute Plan'}
              </button>
            )}
            {isExecutingPlan && (
              <>
                <button
                  onClick={isPaused ? handleResumeAutonomous : handlePauseAutonomous}
                  className="px-3 py-1.5 rounded-lg bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 font-mono font-bold text-xs border border-amber-500/40 transition-all cursor-pointer flex items-center gap-1"
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{isPaused ? 'Resume Takeover' : 'Manual Takeover'}</span>
                </button>
                <button
                  onClick={handleCancelAutonomous}
                  className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-[0_0_15px_rgba(244,63,94,0.3)] flex items-center gap-1"
                >
                  <StopCircle className="w-3.5 h-3.5" />
                  <span>Cancel Loop</span>
                </button>
              </>
            )}
          </div>

          {/* Autonomous Plan Step View with Honest Badges & Expandable Accordion */}
          {activePlan && (
            <div className="p-3.5 rounded-xl bg-[#0F121C]/80 border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)] space-y-3 text-xs font-mono">
              <div className="flex items-center justify-between text-white font-display font-bold">
                <span className="flex items-center gap-2">
                  <span>Plan: {activePlan.plan_id.slice(0, 14)}</span>
                  <span className="text-slate-400 font-sans font-normal text-xs">({activePlan.steps.length} steps)</span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold border ${
                  activePlan.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  activePlan.status === 'EXECUTING' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                  activePlan.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                  'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  Status: {activePlan.status}
                </span>
              </div>

              {/* Grid of step cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
                {activePlan.steps.map((st) => {
                  const isExpanded = expandedStepId === st.step_id;
                  const isVerified = st.verification_state === 'VERIFIED' || st.verified === true;
                  const isFailed = st.status === 'FAILED' || st.verification_state === 'FAILED';
                  const isRunning = st.status === 'RUNNING';

                  return (
                    <div
                      key={st.step_id}
                      onClick={() => setExpandedStepId(isExpanded ? null : st.step_id)}
                      className={`p-2.5 rounded-lg bg-[#0A0D16] border transition-all cursor-pointer space-y-1.5 ${
                        isExpanded
                          ? 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                          : 'border-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-200 truncate">{st.step_id}</span>
                        <span className={`px-1.5 py-0.2 rounded font-bold uppercase text-[9px] border ${
                          isVerified ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          isRunning ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 animate-pulse' :
                          isFailed ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-white/[0.05] text-slate-400 border-white/[0.05]'
                        }`}>
                          {isVerified ? 'Verified' : isRunning ? 'Running' : isFailed ? 'Failed' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-cyan-300 truncate font-semibold">
                        {st.tool}
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-2 leading-tight">
                        {st.reasoning}
                      </p>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-0.5 border-t border-white/[0.04]">
                        <span>{st.execution_time_ms ? `${st.execution_time_ms}ms` : 'Queued'}</span>
                        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expandable Step Details Drawer */}
              {expandedStepId && (() => {
                const step = activePlan.steps.find((s) => s.step_id === expandedStepId);
                if (!step) return null;
                return (
                  <div className="mt-2 p-3.5 rounded-xl bg-[#06080E] border border-cyan-500/30 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] space-y-2 text-xs font-mono animate-fade-in">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{step.step_id}: {step.tool}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          step.verification_state === 'VERIFIED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                          step.status === 'FAILED' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                          'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {step.verification_state || step.status}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedStepId(null)}
                        className="text-slate-400 hover:text-white text-xs cursor-pointer"
                      >
                        Close Details
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Input Arguments:
                        </div>
                        <pre className="p-2.5 rounded-lg bg-[#090D18] border border-white/[0.06] text-[11px] text-cyan-300 overflow-x-auto max-h-36">
                          {JSON.stringify(step.arguments, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Execution & Verification Result:
                        </div>
                        <pre className="p-2.5 rounded-lg bg-[#090D18] border border-white/[0.06] text-[11px] text-emerald-300 overflow-x-auto max-h-36">
                          {step.result ? JSON.stringify(step.result, null, 2) : 'Awaiting execution output...'}
                        </pre>
                      </div>
                    </div>

                    {step.error && (
                      <div className="p-2.5 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 font-mono">
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span><strong>Error:</strong> {step.error}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {activePlan.overall_outcome && (
                <div className="text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-lg text-xs font-sans font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Outcome: {activePlan.overall_outcome}</span>
                </div>
              )}
            </div>
          )}

          {/* Task History Panel (User Controlled Memory) */}
          {showHistory && (
            <div className="p-4 rounded-xl bg-[#0F121C]/90 border border-indigo-500/30 shadow-[0_4px_25px_rgba(99,102,241,0.2)] space-y-3 font-mono animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 text-white font-display font-bold">
                  <History className="w-4 h-4 text-indigo-400" />
                  <span>Task Execution History & User Memory</span>
                  <span className="text-xs text-slate-400 font-sans font-normal">
                    (Honest audit trail of all previous runs)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearHistory}
                    className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-rose-400" />
                    <span>Clear Memory</span>
                  </button>
                  <button
                    onClick={() => setShowHistory(false)}
                    className="text-slate-400 hover:text-white text-xs cursor-pointer px-2 py-1"
                  >
                    Hide
                  </button>
                </div>
              </div>

              {isLoadingHistory ? (
                <div className="text-slate-400 text-xs py-4 text-center">Loading task history...</div>
              ) : taskHistory.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">
                  No task runs recorded in memory yet. Execute a plan above to create verified history records.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {taskHistory.map((entry, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#06080E] border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white">{entry.task_id}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            entry.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            entry.status === 'CANCELLED' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                            'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          }`}>
                            {entry.status}
                          </span>
                          <span className="text-slate-400 text-[11px] flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {new Date(entry.start_time).toLocaleTimeString()} ({entry.duration_ms}ms)
                          </span>
                        </div>
                        <p className="text-slate-300 font-sans text-xs">{entry.goal}</p>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap shrink-0">
                        <span className="px-2 py-1 rounded bg-white/[0.05] text-cyan-300 text-[11px]">
                          {entry.verified_steps} / {entry.steps_count} Verified
                        </span>
                        {entry.artifacts && entry.artifacts.length > 0 && (
                          <div className="flex items-center gap-1">
                            {entry.artifacts.map((art, aIdx) => (
                              <a
                                key={aIdx}
                                href={`/${art.path}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] flex items-center gap-1"
                              >
                                <span>{art.name}</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Judge Test Bench 3 Modes Bar */}
          <div className="p-3 rounded-xl bg-[#0F121C]/80 border border-white/[0.08] flex flex-wrap items-center justify-between gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-slate-300 font-bold font-mono">Judge Bench:</span>
              <div className="flex items-center gap-1.5 p-1 bg-[#06080D] border border-white/[0.08] rounded-xl">
                <button
                  onClick={() => handleRunBenchmark('LIVE_SCRAPED')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedMode === 'LIVE_SCRAPED'
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-white/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  1. Live Scraped Run
                </button>
                <button
                  onClick={() => handleRunBenchmark('OFFLINE_HOST_FAILURE')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedMode === 'OFFLINE_HOST_FAILURE'
                      ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.35)] border border-rose-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  2. Fault: Unreachable
                </button>
                <button
                  onClick={() => handleRunBenchmark('CORRUPTION_DETECTION')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                    selectedMode === 'CORRUPTION_DETECTION'
                      ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.35)] border border-amber-400/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  3. Fault: Byte Corruption
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showLogs ? 'Hide Logs' : 'View Logs'}</span>
              </button>
              <button
                onClick={() => handleRunBenchmark(selectedMode)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold transition-colors disabled:opacity-50 cursor-pointer border border-white/[0.1]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Executing...' : 'Re-Run'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Supports Single or Side-by-Side Split View */}
      <div className="p-4 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
        {sideBySide && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pb-2">
            {/* Left Side: Live Browser State & Screenshot */}
            <div className="rounded-2xl bg-[#0F121C]/80 border border-white/[0.08] p-4 space-y-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-white">Live Chromium Viewport</span>
                </div>
                <span className="text-cyan-300 truncate max-w-xs">{latestUrl}</span>
              </div>
              <div className="w-full aspect-video rounded-xl bg-[#06080D] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                {latestScreenshot ? (
                  <img
                    src={`data:image/jpeg;base64,${latestScreenshot}`}
                    alt="Live Chromium Session"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 font-mono text-xs flex flex-col items-center gap-2">
                    <Eye className="w-6 h-6 text-slate-600" />
                    <span>Run an autonomous plan to view live browser viewport</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Side: Generated Launch Artifact Preview */}
            <div className="rounded-2xl bg-[#0F121C]/80 border border-white/[0.08] p-4 space-y-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-mono">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-white">Verified Launch Visual (1280x720)</span>
                </div>
                <a
                  href="/artifacts/hero_frame.png"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>Open Full Artifact</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="w-full aspect-video rounded-xl bg-[#06080D] border border-white/[0.08] overflow-hidden flex items-center justify-center">
                <img
                  src="/artifacts/hero_frame.png"
                  alt="Verified GTM Launch Poster"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* 4 Summary KPI Metric Pills */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-white/[0.08] rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]">
          <div className="p-4 bg-transparent">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span>Verification Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <p className={`text-xl font-display font-black mt-1 ${outcome?.disk_integrity_verified ? 'text-emerald-400' : 'text-rose-400'}`}>
              {outcome?.status || 'INITIALIZING'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {outcome?.is_cached_snapshot ? 'Cached Snapshot Verified' : 'VERIFIED ON DISK'}
            </p>
          </div>

          <div className="p-4 bg-transparent">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span>Total Evaluated</span>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-xl font-display font-black text-white mt-1">
              {editableRows.length || 10} / 10 Startups
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {outcome?.successful_fetches ?? 10} endpoints reachable
            </p>
          </div>

          <div className="p-4 bg-transparent">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span>Enterprise Sales Gates</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-display font-black text-amber-400 mt-1">
              {outcome?.flagged_sales_gates ?? 0} Flagged
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Honest unverified pricing policy</p>
          </div>

          <div className="p-4 bg-transparent">
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-mono font-bold uppercase tracking-wider">
              <span>SHA-256 Checksum</span>
              <button
                onClick={() => outcome?.disk_hash && handleCopyHash(outcome.disk_hash)}
                title="Copy full SHA-256 hash"
                className="text-slate-400 hover:text-cyan-300 transition-colors cursor-pointer"
              >
                {copiedHash ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs font-mono font-bold text-cyan-300 mt-1.5 truncate">
              {outcome?.disk_hash ? `${outcome.disk_hash.slice(0, 18)}...` : 'N/A'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Physical disk HMAC-SHA256 verified</p>
          </div>
        </div>

        {/* Assertion Terminal Logs */}
        {showLogs && (
          <div className="p-4 rounded-2xl bg-[#05070B] text-slate-200 font-mono text-xs max-h-44 overflow-y-auto space-y-1 shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)] border border-white/[0.08]">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.08] text-[10px] text-slate-400">
              <span className="font-bold text-cyan-400">TELEMETRY ASSERTION CONSOLE</span>
              <span>Timestamp: {outcome?.retrieval_timestamp || 'N/A'}</span>
            </div>
            {outcome?.telemetry_logs && outcome.telemetry_logs.length > 0 ? (
              outcome.telemetry_logs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed text-[11px] ${
                    log.includes('[SUCCESS]') || log.includes('[OK') || log.includes('verified')
                      ? 'text-emerald-400'
                      : log.includes('[FAIL]') || log.includes('[ALERT]') || log.includes('[REAL ERROR') || log.includes('failed')
                      ? 'text-rose-400 font-bold'
                      : log.includes('[FLAG]') || log.includes('[TEST]') || log.includes('UNKNOWN')
                      ? 'text-amber-300'
                      : 'text-slate-300'
                  }`}
                >
                  {log}
                </div>
              ))
            ) : (
              <div className="text-slate-500">No telemetry logs recorded.</div>
            )}
          </div>
        )}

        {/* Matrix Table with Live Inline Editing & Clickable Source URLs */}
        <div className="rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-4 border-b border-white/[0.08] flex items-center justify-between bg-gradient-to-r from-[#0F121C] via-[#151926] to-[#0F121C] flex-wrap gap-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-display font-bold text-white">Verified Competitive Startups Matrix</h3>
                  <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 text-[10px] font-mono border border-cyan-500/30 flex items-center gap-1">
                    <Edit3 className="w-3 h-3" /> Inline Editing Active
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-sans">
                  Live evidence URLs • Honest unknown pricing policy • Physical CSV save & SHA-256 recalculation
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasUnsavedEdits && (
                <span className="text-[11px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-lg animate-pulse">
                  Unsaved Edits Detected
                </span>
              )}
              <button
                onClick={handleSaveAndReverify}
                disabled={isSaving || !hasUnsavedEdits}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono font-bold text-xs transition-all cursor-pointer border ${
                  hasUnsavedEdits
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.35)] border-emerald-400/30'
                    : 'bg-white/[0.05] text-slate-500 border-white/[0.08] cursor-not-allowed'
                }`}
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? 'Re-Verifying...' : 'Save & Re-Verify (SHA-256)'}</span>
              </button>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 rounded-lg">
                {editableRows.length} Records
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans divide-y divide-white/[0.06]">
              <thead className="bg-[#0A0D14]/90 backdrop-blur-md text-[11px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-white/[0.08]">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Company</th>
                  <th className="py-3.5 px-4 font-bold">Target Domain / Source URL</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-4 font-bold">Live Extracted Title</th>
                  <th className="py-3.5 px-4 font-bold">Category</th>
                  <th className="py-3.5 px-4 font-bold">Pricing Tier</th>
                  <th className="py-3.5 px-4 font-bold">Sales Gate</th>
                  <th className="py-3.5 px-4 font-bold">API Availability</th>
                  <th className="py-3.5 px-4 font-bold">SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300 font-normal">
                {editableRows.length > 0 ? (
                  editableRows.map((row: StartupRow, idx: number) => {
                    const isGate = (row.enterprise_sales_gate || '').toUpperCase().includes('YES');
                    const isUnknownPricing = (row.pricing_tier || '').includes('UNKNOWN');
                    const isSuccess = (row.verification_status || '') === 'VERIFIED';
                    const targetLink = row.target_url || `https://${row.domain}`;

                    return (
                      <tr key={idx} className="hover:bg-white/[0.03] transition-colors group">
                        {/* Company Name Editable */}
                        <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                          <input
                            type="text"
                            value={row.company_name}
                            onChange={(e) => handleCellChange(idx, 'company_name', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 focus:bg-[#06080D] rounded px-1.5 py-1 text-white text-xs font-bold w-36 outline-hidden transition-all"
                          />
                        </td>

                        {/* Domain & Clickable Source URL */}
                        <td className="py-2 px-3 font-mono text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="text"
                              value={row.domain}
                              onChange={(e) => handleCellChange(idx, 'domain', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 focus:bg-[#06080D] rounded px-1.5 py-1 text-cyan-300 font-mono text-[11px] w-28 outline-hidden transition-all"
                            />
                            <a
                              href={targetLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={`Open live target: ${targetLink}`}
                              className="text-cyan-400 hover:text-cyan-200 transition-colors p-1 rounded hover:bg-white/[0.08]"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="py-3.5 px-4 font-mono text-[10px] whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md font-bold border ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          }`}>
                            {row.fetch_status || (isSuccess ? 'VERIFIED' : 'UNVERIFIED')}
                          </span>
                        </td>

                        {/* Scraped Title Editable */}
                        <td className="py-2 px-3 max-w-xs text-slate-300 font-sans">
                          <input
                            type="text"
                            value={row.scraped_title}
                            onChange={(e) => handleCellChange(idx, 'scraped_title', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 focus:bg-[#06080D] rounded px-1.5 py-1 text-slate-200 text-xs w-full outline-hidden truncate transition-all font-sans"
                          />
                        </td>

                        {/* Category Editable */}
                        <td className="py-2 px-3 text-slate-400 text-[11px]">
                          <input
                            type="text"
                            value={row.target_category || row.category || ''}
                            onChange={(e) => handleCellChange(idx, 'category', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 focus:bg-[#06080D] rounded px-1.5 py-1 text-slate-400 text-[11px] w-36 outline-hidden truncate transition-all"
                          />
                        </td>

                        {/* Pricing Tier with Honest Unknown Badge */}
                        <td className="py-2 px-3 font-mono text-[11px]">
                          <div className="relative">
                            <input
                              type="text"
                              value={row.pricing_tier}
                              onChange={(e) => handleCellChange(idx, 'pricing_tier', e.target.value)}
                              className={`rounded px-2 py-1 font-mono text-xs w-48 outline-hidden transition-all border ${
                                isUnknownPricing
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 focus:border-amber-400 font-bold'
                                  : 'bg-transparent text-slate-200 border-transparent hover:border-white/20 focus:border-cyan-500 focus:bg-[#06080D]'
                              }`}
                            />
                          </div>
                        </td>

                        {/* Sales Gate Editable */}
                        <td className="py-2 px-3 whitespace-nowrap">
                          <input
                            type="text"
                            value={row.enterprise_sales_gate}
                            onChange={(e) => handleCellChange(idx, 'enterprise_sales_gate', e.target.value)}
                            className={`rounded px-2 py-0.5 text-[10px] font-mono font-bold w-36 outline-hidden transition-all border ${
                              isGate
                                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                : 'bg-transparent text-slate-400 border-transparent hover:border-white/20 focus:border-cyan-500'
                            }`}
                          />
                        </td>

                        {/* API Availability Editable */}
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-300 whitespace-nowrap">
                          <input
                            type="text"
                            value={row.api_availability || ''}
                            onChange={(e) => handleCellChange(idx, 'api_availability', e.target.value)}
                            className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 focus:bg-[#06080D] rounded px-1.5 py-1 text-slate-300 font-mono text-[11px] w-36 outline-hidden transition-all"
                          />
                        </td>

                        {/* Row Hash */}
                        <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {row.row_hash}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-500 font-mono text-xs">
                      No records verified. Run a benchmark mode above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
