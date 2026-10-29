import React, { useState, useEffect } from 'react';
import {
  Play,
  Download,
  ShieldCheck,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Database,
  ExternalLink,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  StopCircle,
} from 'lucide-react';
import { api } from '../services/api';
import { VerificationOutcome, StartupRow, AutonomousPlanResult } from '../types';

export const AutomateMode: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string>('LIVE_SCRAPED');
  const [outcome, setOutcome] = useState<VerificationOutcome | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showLogs, setShowLogs] = useState(true);

  // Autonomous task runner state
  const [autonomousGoal, setAutonomousGoal] = useState('Crawl 10 AI startups and verify physical disk outcome');
  const [activePlan, setActivePlan] = useState<AutonomousPlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);

  useEffect(() => {
    handleLoadInitial();
  }, []);

  const handleLoadInitial = async () => {
    setIsLoading(true);
    try {
      const data = await api.getLatestSpreadsheet();
      setOutcome(data);
    } catch (e) {
      console.error('Failed to load spreadsheet:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunBenchmark = async (mode: string) => {
    setSelectedMode(mode);
    setIsLoading(true);
    try {
      const res = await api.exportSpreadsheet(mode);
      setOutcome(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlanAutonomous = async () => {
    setIsPlanning(true);
    try {
      const plan = await api.planAutonomousTask(autonomousGoal);
      setActivePlan(plan);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPlanning(false);
    }
  };

  const handleExecuteAutonomous = async () => {
    if (!activePlan) return;
    setIsExecutingPlan(true);
    try {
      const result = await api.executeAutonomousPlan(activePlan);
      setActivePlan(result);
      // If benchmark was executed, reload spreadsheet
      await handleLoadInitial();
    } catch (e) {
      console.error(e);
    } finally {
      setIsExecutingPlan(false);
    }
  };

  const handleCancelAutonomous = async () => {
    if (!activePlan) return;
    try {
      await api.cancelAutonomousPlan(activePlan.plan_id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#07090e] text-slate-100 font-sans">
      {/* Top Header */}
      <div className="p-4 bg-[#0d111a] border-b border-white/[0.08] select-none">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight font-sans">
                  Autonomous Verification & Judge Test Bench
                </h2>
                <p className="text-xs text-slate-400">
                  Standard TLS crawl • Physical disk read-back assertion • Cryptographic SHA-256 integrity verification
                </p>
              </div>
            </div>

            <a
              href={api.getDownloadUrl()}
              download="ai_startups_matrix.csv"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download CSV Artifact</span>
            </a>
          </div>

          {/* Autonomous Goal Planning Bar */}
          <div className="p-3 rounded-xl bg-[#0b0e17] border border-white/[0.08] flex items-center gap-2">
            <span className="text-xs font-mono text-indigo-400 font-bold whitespace-nowrap">
              Autonomous Goal:
            </span>
            <input
              type="text"
              value={autonomousGoal}
              onChange={(e) => setAutonomousGoal(e.target.value)}
              placeholder="Enter natural-language goal (e.g. Crawl 10 startups and verify disk)..."
              className="flex-1 bg-transparent border-none outline-none text-xs text-slate-200 font-sans"
            />
            <button
              onClick={handlePlanAutonomous}
              disabled={isPlanning || isExecutingPlan}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
            >
              {isPlanning ? 'Planning...' : 'Generate Plan'}
            </button>
            {activePlan && activePlan.status !== 'COMPLETED' && (
              <button
                onClick={handleExecuteAutonomous}
                disabled={isExecutingPlan}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
              >
                {isExecutingPlan ? 'Executing Plan...' : 'Execute Plan'}
              </button>
            )}
            {isExecutingPlan && (
              <button
                onClick={handleCancelAutonomous}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all"
              >
                <StopCircle className="w-3.5 h-3.5 inline mr-1" />
                Cancel
              </button>
            )}
          </div>

          {/* Autonomous Plan Step View */}
          {activePlan && (
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-indigo-300 font-bold">
                <span>Plan: {activePlan.plan_id.slice(0, 8)} • Planner: {activePlan.planner}</span>
                <span className="px-2 py-0.5 rounded bg-indigo-600/40 text-[10px] text-white">
                  Status: {activePlan.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1">
                {activePlan.steps.map((st) => (
                  <div key={st.step_id} className="p-2 rounded bg-black/40 border border-white/[0.05] space-y-1">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-bold text-slate-200">{st.step_id}: {st.tool}</span>
                      <span className={`px-1.5 py-0.2 rounded ${
                        st.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400' :
                        st.status === 'RUNNING' ? 'bg-amber-500/20 text-amber-400' :
                        st.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' : 'bg-white/[0.05] text-slate-400'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 font-sans">{st.reasoning}</p>
                    {Boolean(st.execution_time_ms && st.execution_time_ms > 0) && (
                      <div className="text-[10px] text-slate-500">Duration: {st.execution_time_ms}ms</div>
                    )}
                  </div>
                ))}
              </div>
              {activePlan.overall_outcome && (
                <div className="text-emerald-400 text-[11px] pt-1">
                  Outcome: {activePlan.overall_outcome}
                </div>
              )}
            </div>
          )}

          {/* Judge Test Bench 3 Modes */}
          <div className="p-3 rounded-xl bg-[#07090e] border border-white/[0.08] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400 font-bold">Judge Bench Mode:</span>
              <div className="flex items-center gap-1.5 p-1 bg-[#0e121b] border border-white/[0.08] rounded-lg">
                <button
                  onClick={() => handleRunBenchmark('LIVE_SCRAPED')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    selectedMode === 'LIVE_SCRAPED'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  1. Live Scraped Run
                </button>
                <button
                  onClick={() => handleRunBenchmark('OFFLINE_HOST_FAILURE')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    selectedMode === 'OFFLINE_HOST_FAILURE'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2. Fault Injection: Unreachable Hosts
                </button>
                <button
                  onClick={() => handleRunBenchmark('CORRUPTION_DETECTION')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                    selectedMode === 'CORRUPTION_DETECTION'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3. Fault Injection: Disk Byte Corruption
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors"
              >
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>{showLogs ? 'Hide Logs' : 'View Assertion Logs'}</span>
              </button>
              <button
                onClick={() => handleRunBenchmark(selectedMode)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Executing...' : 'Re-Run Verification'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 max-w-7xl mx-auto w-full space-y-4">
        {/* Verification Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-[#0e121b] border border-white/[0.08] space-y-1">
            <span className="text-slate-400 text-[11px]">Verification Status</span>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${
                outcome?.disk_integrity_verified ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {outcome?.status || 'INITIALIZING'}
              </span>
              {outcome?.is_cached_snapshot && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-slate-400">
                  Cached
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e121b] border border-white/[0.08] space-y-1">
            <span className="text-slate-400 text-[11px]">Disk vs Source Verification</span>
            <div className="flex items-center gap-2 text-xs">
              <span className={outcome?.disk_integrity_verified ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                Disk Parity: {outcome?.disk_integrity_verified ? 'Verified' : 'Failed'}
              </span>
              <span>•</span>
              <span className="text-slate-300">
                HTTP Fetched: {outcome?.successful_fetches ?? 0}/{outcome?.total_evaluated ?? 10}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e121b] border border-white/[0.08] space-y-1">
            <span className="text-slate-400 text-[11px]">Flagged Enterprise Sales Gates</span>
            <div className="text-sm font-bold text-amber-400">
              {outcome?.flagged_sales_gates ?? 0} Gate(s) Flagged
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0e121b] border border-white/[0.08] space-y-1">
            <span className="text-slate-400 text-[11px]">Disk SHA-256 Checksum</span>
            <div className="text-xs font-bold text-indigo-400 truncate">
              {outcome?.disk_hash ? `${outcome.disk_hash.slice(0, 18)}...` : 'N/A'}
            </div>
          </div>
        </div>

        {/* Assertion Terminal Logs */}
        {showLogs && (
          <div className="p-3.5 rounded-xl bg-[#07090e] border border-white/[0.08] font-mono text-xs max-h-40 overflow-y-auto space-y-1 shadow-inner">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.05] text-[10px] text-slate-500">
              <span>TELEMETRY ASSERTION CONSOLE</span>
              <span>Timestamp: {outcome?.retrieval_timestamp || 'N/A'}</span>
            </div>
            {outcome?.telemetry_logs && outcome.telemetry_logs.length > 0 ? (
              outcome.telemetry_logs.map((log, i) => (
                <div
                  key={i}
                  className={`leading-relaxed text-[11px] ${
                    log.includes('[SUCCESS]') || log.includes('[OK')
                      ? 'text-emerald-400'
                      : log.includes('[FAIL]') || log.includes('[ALERT]') || log.includes('[REAL ERROR')
                      ? 'text-rose-400 font-bold'
                      : log.includes('[FLAG]') || log.includes('[TEST]')
                      ? 'text-amber-400'
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

        {/* Matrix Table */}
        <div className="flex-1 overflow-hidden rounded-xl bg-[#0e121b] border border-white/[0.08] flex flex-col shadow-2xl">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs font-sans divide-y divide-white/[0.06]">
              <thead className="bg-[#090d14] text-[11px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Company</th>
                  <th className="py-2.5 px-4 font-bold">Target URL</th>
                  <th className="py-2.5 px-4 font-bold">Status</th>
                  <th className="py-2.5 px-4 font-bold">Live Extracted Title</th>
                  <th className="py-2.5 px-4 font-bold">Category</th>
                  <th className="py-2.5 px-4 font-bold">Pricing Tier</th>
                  <th className="py-2.5 px-4 font-bold">Sales Gate</th>
                  <th className="py-2.5 px-4 font-bold">Provenance</th>
                  <th className="py-2.5 px-4 font-bold">SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-200 font-normal">
                {outcome?.rows && outcome.rows.length > 0 ? (
                  outcome.rows.map((row: StartupRow, idx: number) => {
                    const isGate = row.enterprise_sales_gate === 'FLAGGED_SALES_GATE';
                    const isSuccess = row.fetch_status === 'HTTP_200';
                    return (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-4 font-bold text-white whitespace-nowrap">
                          {row.company_name}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                          {row.target_url || row.domain}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {row.fetch_status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 max-w-xs truncate text-slate-300">
                          {row.scraped_title}
                        </td>
                        <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                          {row.target_category || row.category || 'N/A'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-slate-400">
                          {row.pricing_tier}
                        </td>
                        <td className="py-2.5 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              isGate
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-white/[0.04] text-slate-400'
                            }`}
                          >
                            {row.enterprise_sales_gate}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                          {row.data_provenance || 'HISTORICAL'}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
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
