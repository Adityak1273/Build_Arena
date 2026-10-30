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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 shadow-2xs select-none">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-orange-50/30 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <FileSpreadsheet className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                    Autonomous Verification & Judge Test Bench
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-200">
                    AdaL Ground Truth
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Standard TLS crawl • Physical disk read-back assertion • Cryptographic SHA-256 integrity verification
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleRunBenchmark('LIVE_SCRAPED')}
                disabled={isLoading}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Crawling Live...' : 'Trigger Live Scrape (10 Startups)'}</span>
              </button>
              <a
                href={api.getDownloadUrl()}
                download="ai_startups_matrix.csv"
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs shadow-2xs transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download CSV Artifact</span>
              </a>
            </div>
          </div>

          {outcome?.is_cached_snapshot && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Displaying Saved Disk Snapshot ({outcome.retrieval_timestamp}). Click "Trigger Live Scrape" for live network verification.</span>
              </div>
            </div>
          )}

          {/* Autonomous Goal Planning Bar */}
          <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 whitespace-nowrap flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-orange-600" />
              <span>Goal:</span>
            </span>
            <input
              type="text"
              value={autonomousGoal}
              onChange={(e) => setAutonomousGoal(e.target.value)}
              placeholder="Enter natural-language goal (e.g. Crawl 10 startups and verify disk)..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-hidden focus:border-orange-500 focus:bg-white"
            />
            <button
              onClick={handlePlanAutonomous}
              disabled={isPlanning || isExecutingPlan}
              className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isPlanning ? 'Planning...' : 'Generate Plan'}
            </button>
            {activePlan && activePlan.status !== 'COMPLETED' && (
              <button
                onClick={handleExecuteAutonomous}
                disabled={isExecutingPlan}
                className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                {isExecutingPlan ? 'Executing Plan...' : 'Execute Plan'}
              </button>
            )}
            {isExecutingPlan && (
              <button
                onClick={handleCancelAutonomous}
                className="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5 inline mr-1" />
                Cancel
              </button>
            )}
          </div>

          {/* Autonomous Plan Step View */}
          {activePlan && (
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-900 font-bold font-sans">
                <span>Plan: {activePlan.plan_id.slice(0, 12)} • Planner: {activePlan.planner}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-orange-900 border border-orange-200">
                  Status: {activePlan.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 pt-1">
                {activePlan.steps.map((st) => (
                  <div key={st.step_id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-bold text-slate-800">{st.step_id}: {st.tool}</span>
                      <span className={`px-1.5 py-0.2 rounded font-bold ${
                        st.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        st.status === 'RUNNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        st.status === 'FAILED' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {st.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-sans leading-tight">{st.reasoning}</p>
                    {Boolean(st.execution_time_ms && st.execution_time_ms > 0) && (
                      <div className="text-[10px] text-slate-400">Duration: {st.execution_time_ms}ms</div>
                    )}
                  </div>
                ))}
              </div>
              {activePlan.overall_outcome && (
                <div className="text-emerald-800 bg-emerald-50 border border-emerald-200 p-2 rounded-lg text-[11px] font-sans font-semibold">
                  Outcome: {activePlan.overall_outcome}
                </div>
              )}
            </div>
          )}

          {/* Judge Test Bench 3 Modes Bar */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-sans">
              <span className="text-slate-700 font-bold">Judge Bench Mode:</span>
              <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-lg shadow-2xs">
                <button
                  onClick={() => handleRunBenchmark('LIVE_SCRAPED')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedMode === 'LIVE_SCRAPED'
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  1. Live Scraped Run
                </button>
                <button
                  onClick={() => handleRunBenchmark('OFFLINE_HOST_FAILURE')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedMode === 'OFFLINE_HOST_FAILURE'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  2. Fault Injection: Unreachable
                </button>
                <button
                  onClick={() => handleRunBenchmark('CORRUPTION_DETECTION')}
                  disabled={isLoading}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    selectedMode === 'CORRUPTION_DETECTION'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  3. Fault Injection: Byte Corruption
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLogs(!showLogs)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5 text-orange-600" />
                <span>{showLogs ? 'Hide Logs' : 'View Logs'}</span>
              </button>
              <button
                onClick={() => handleRunBenchmark(selectedMode)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>{isLoading ? 'Executing...' : 'Re-Run'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-5 max-w-7xl mx-auto w-full space-y-4">
        {/* 4 Summary KPI Metric Pills matching SIH_DEAL_DEMO */}
        <div className="grid grid-cols-2 lg:grid-cols-4 border border-slate-200 rounded-xl bg-white shadow-xs overflow-hidden">
          <div className="p-4 border-r border-b lg:border-b-0 border-slate-100 bg-white">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Verification Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <p className={`text-xl font-black mt-1 ${outcome?.disk_integrity_verified ? 'text-emerald-700' : 'text-red-700'}`}>
              {outcome?.status || 'INITIALIZING'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {outcome?.is_cached_snapshot ? 'Cached Snapshot Verified' : 'Live Crawl Verified'}
            </p>
          </div>

          <div className="p-4 border-r border-b lg:border-b-0 border-slate-100 bg-white">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Total Evaluated</span>
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xl font-black text-slate-900 mt-1">
              {outcome?.total_evaluated ?? 10} Startups
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              {outcome?.successful_fetches ?? 0} endpoints reachable
            </p>
          </div>

          <div className="p-4 border-r border-b lg:border-b-0 border-slate-100 bg-white">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>Enterprise Sales Gates</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xl font-black text-amber-700 mt-1">
              {outcome?.flagged_sales_gates ?? 0} Flagged
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Honest unverified pricing policy</p>
          </div>

          <div className="p-4 bg-white">
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              <span>SHA-256 Checksum</span>
              <CheckCircle2 className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-sm font-mono font-bold text-slate-900 mt-1.5 truncate">
              {outcome?.disk_hash ? `${outcome.disk_hash.slice(0, 16)}...` : 'N/A'}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Disk hash verified</p>
          </div>
        </div>

        {/* Assertion Terminal Logs */}
        {showLogs && (
          <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs max-h-44 overflow-y-auto space-y-1 shadow-xs border border-slate-800">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 text-[10px] text-slate-400">
              <span className="font-bold text-orange-400">TELEMETRY ASSERTION CONSOLE</span>
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
                      ? 'text-red-400 font-bold'
                      : log.includes('[FLAG]') || log.includes('[TEST]') || log.includes('UNKNOWN')
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
        <div className="rounded-xl bg-white border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-orange-50/30">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-orange-100 text-orange-700">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Verified Competitive Startups Matrix</h3>
                <p className="text-xs text-slate-500">Target entities audited for API availability, sales gates, and pricing tiers</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-md">
              {outcome?.rows?.length || 0} Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans divide-y divide-slate-200">
              <thead className="bg-slate-50 text-[11px] font-mono text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="py-3 px-4 font-bold">Company</th>
                  <th className="py-3 px-4 font-bold">Target Domain</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold">Live Extracted Title</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Pricing Tier</th>
                  <th className="py-3 px-4 font-bold">Sales Gate</th>
                  <th className="py-3 px-4 font-bold">API Availability</th>
                  <th className="py-3 px-4 font-bold">SHA-256</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800 font-normal">
                {outcome?.rows && outcome.rows.length > 0 ? (
                  outcome.rows.map((row: StartupRow, idx: number) => {
                    const isGate = (row.enterprise_sales_gate || '').includes('YES');
                    const isSuccess = (row.verification_status || '') === 'VERIFIED';
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {row.company_name}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                          {row.target_url || row.domain}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded font-bold border ${
                            isSuccess ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
                          }`}>
                            {row.fetch_status || (isSuccess ? 'VERIFIED' : 'UNVERIFIED')}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-700">
                          {row.scraped_title}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-[11px]">
                          {row.target_category || row.category || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-700">
                          <span className={row.pricing_tier.includes('UNKNOWN') ? 'text-amber-800 font-bold bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded' : ''}>
                            {row.pricing_tier}
                          </span>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                              isGate
                                ? 'bg-amber-50 text-amber-900 border-amber-300'
                                : 'bg-slate-100 text-slate-600 border-slate-200'
                            }`}
                          >
                            {row.enterprise_sales_gate}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600 whitespace-nowrap">
                          {row.api_availability || 'Standard API'}
                        </td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500 whitespace-nowrap">
                          {row.row_hash}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-mono text-xs">
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
