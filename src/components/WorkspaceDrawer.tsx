import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Video,
  Layers,
  Minus,
  Maximize2,
  X,
  Save,
  Download,
  RefreshCw,
  ExternalLink,
  Edit3,
  Copy,
  Check,
  AlertTriangle,
  Play,
  Volume2,
  FileText
} from 'lucide-react';
import { StartupRow, VerificationOutcome, CouncilVerdict, SemanticAXNode } from '../types';
import { api } from '../services/api';

interface WorkspaceDrawerProps {
  activeDrawerTab: 'spreadsheet' | 'council' | 'gtm' | 'ax' | null;
  onSelectDrawerTab: (tab: 'spreadsheet' | 'council' | 'gtm' | 'ax') => void;
  onCloseDrawer: () => void;
  // Spreadsheet state
  spreadsheetOutcome: VerificationOutcome | null;
  editableRows: StartupRow[];
  onCellChange: (rowIndex: number, field: keyof StartupRow, value: string) => void;
  hasUnsavedEdits: boolean;
  isSavingSpreadsheet: boolean;
  onSaveSpreadsheet: () => void;
  onTriggerScrape: () => void;
  isScraping: boolean;
  // Council state
  councilVerdict: CouncilVerdict | null;
  onRunCouncil: () => void;
  isEvaluatingCouncil: boolean;
  // AX state
  axTree: SemanticAXNode[];
  onRefreshAXTree: () => void;
}

export const WorkspaceDrawer: React.FC<WorkspaceDrawerProps> = ({
  activeDrawerTab,
  onSelectDrawerTab,
  onCloseDrawer,
  spreadsheetOutcome,
  editableRows,
  onCellChange,
  hasUnsavedEdits,
  isSavingSpreadsheet,
  onSaveSpreadsheet,
  onTriggerScrape,
  isScraping,
  councilVerdict,
  onRunCouncil,
  isEvaluatingCouncil,
  axTree,
  onRefreshAXTree,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!activeDrawerTab) return null;

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div
      className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col bg-[#090C16]/95 backdrop-blur-2xl border-t border-white/[0.12] shadow-[0_-8px_30px_rgba(0,0,0,0.7)] transition-all duration-300 ease-out ${
        isMaximized ? 'h-[85%]' : 'h-[48%]'
      }`}
    >
      {/* Drawer Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.08] bg-[#06080E]/90 select-none">
        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSelectDrawerTab('spreadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'spreadsheet'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Competitive Startups Spreadsheet</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-300">
              {editableRows.length} Rows
            </span>
          </button>

          <button
            onClick={() => onSelectDrawerTab('council')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'council'
                ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.3)]'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>7-Critic Code Council</span>
          </button>

          <button
            onClick={() => onSelectDrawerTab('gtm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'gtm'
                ? 'bg-purple-500/20 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-purple-400" />
            <span>GTM Multimodal Studio</span>
          </button>

          <button
            onClick={() => onSelectDrawerTab('ax')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'ax'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                : 'bg-white/[0.04] text-slate-400 border-white/[0.06] hover:bg-white/[0.08]'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Accessibility Tree</span>
            <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-[10px] text-cyan-300">
              {axTree.length} Nodes
            </span>
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title={isMaximized ? 'Restore Drawer' : 'Maximize Drawer'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCloseDrawer}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-3 text-slate-200 font-sans">
        {/* 1. SPREADSHEET DRAWER TAB */}
        {activeDrawerTab === 'spreadsheet' && (
          <div className="space-y-3">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#06080E] border border-white/[0.08]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Disk Checksum:
                </span>
                <span className="text-xs font-mono text-cyan-300 font-bold bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded truncate max-w-xs">
                  {spreadsheetOutcome?.disk_hash || '1398bd2e9ed9fd57...'}
                </span>
                <button
                  onClick={() => spreadsheetOutcome?.disk_hash && handleCopyHash(spreadsheetOutcome.disk_hash)}
                  className="text-slate-400 hover:text-cyan-300 p-1 cursor-pointer"
                  title="Copy SHA-256"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {hasUnsavedEdits && (
                  <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-md animate-pulse">
                    Unsaved Edits Detected
                  </span>
                )}
                <button
                  onClick={onSaveSpreadsheet}
                  disabled={isSavingSpreadsheet || !hasUnsavedEdits}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                    hasUnsavedEdits
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-400/40 animate-pulse'
                      : 'bg-white/[0.05] text-slate-500 border-white/[0.08] cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSpreadsheet ? 'Re-Verifying...' : 'Save & Re-Verify (SHA-256)'}</span>
                </button>

                <button
                  onClick={onTriggerScrape}
                  disabled={isScraping}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                  <span>{isScraping ? 'Crawling...' : 'Trigger Scrape'}</span>
                </button>

                <a
                  href={api.getDownloadUrl()}
                  download="ai_startups_matrix.csv"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 font-mono font-bold text-xs border border-white/[0.08] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>CSV</span>
                </a>
              </div>
            </div>

            {/* Editable Spreadsheet Table */}
            <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#06080D]">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs divide-y divide-white/[0.06]">
                  <thead className="bg-[#0D101C] text-[10px] font-mono text-slate-400 uppercase tracking-wider sticky top-0 z-10 border-b border-white/[0.08]">
                    <tr>
                      <th className="py-2.5 px-3 font-bold">Company</th>
                      <th className="py-2.5 px-3 font-bold">Domain & Source URL</th>
                      <th className="py-2.5 px-3 font-bold">Status</th>
                      <th className="py-2.5 px-3 font-bold">Scraped Title</th>
                      <th className="py-2.5 px-3 font-bold">Pricing Tier</th>
                      <th className="py-2.5 px-3 font-bold">Sales Gate</th>
                      <th className="py-2.5 px-3 font-bold">API Available</th>
                      <th className="py-2.5 px-3 font-bold">Row Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] text-slate-300">
                    {editableRows.map((row, idx) => {
                      const isGate = (row.enterprise_sales_gate || '').toUpperCase().includes('YES');
                      const isUnknownPricing = (row.pricing_tier || '').includes('UNKNOWN');
                      const isSuccess = (row.verification_status || '') === 'VERIFIED';
                      const targetLink = row.target_url || `https://${row.domain}`;

                      return (
                        <tr key={idx} className="hover:bg-white/[0.03] transition-colors">
                          <td className="py-1.5 px-2.5 font-bold text-white whitespace-nowrap">
                            <input
                              type="text"
                              value={row.company_name}
                              onChange={(e) => onCellChange(idx, 'company_name', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 rounded px-1.5 py-0.5 text-white text-xs font-bold w-32 outline-hidden"
                            />
                          </td>
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-mono text-[11px]">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={row.domain}
                                onChange={(e) => onCellChange(idx, 'domain', e.target.value)}
                                className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 rounded px-1 py-0.5 text-cyan-300 font-mono text-[11px] w-28 outline-hidden"
                              />
                              <a
                                href={targetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-cyan-400 hover:text-cyan-200 p-0.5"
                                title={`Open ${targetLink}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="py-1.5 px-2.5 whitespace-nowrap">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border ${
                              isSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            }`}>
                              {row.fetch_status || 'VERIFIED'}
                            </span>
                          </td>
                          <td className="py-1.5 px-2.5 max-w-xs truncate">
                            <input
                              type="text"
                              value={row.scraped_title}
                              onChange={(e) => onCellChange(idx, 'scraped_title', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-white/20 focus:border-cyan-500 rounded px-1.5 py-0.5 text-slate-300 text-xs w-full outline-hidden truncate"
                            />
                          </td>
                          <td className="py-1.5 px-2.5 whitespace-nowrap">
                            <input
                              type="text"
                              value={row.pricing_tier}
                              onChange={(e) => onCellChange(idx, 'pricing_tier', e.target.value)}
                              className={`rounded px-2 py-0.5 font-mono text-[11px] w-44 outline-hidden border ${
                                isUnknownPricing
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 font-bold'
                                  : 'bg-transparent text-slate-200 border-transparent hover:border-white/20'
                              }`}
                            />
                          </td>
                          <td className="py-1.5 px-2.5 whitespace-nowrap">
                            <input
                              type="text"
                              value={row.enterprise_sales_gate}
                              onChange={(e) => onCellChange(idx, 'enterprise_sales_gate', e.target.value)}
                              className={`rounded px-1.5 py-0.5 font-mono text-[10px] w-28 outline-hidden border ${
                                isGate ? 'bg-amber-500/15 text-amber-300 border-amber-500/30' : 'bg-transparent text-slate-400 border-transparent'
                              }`}
                            />
                          </td>
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-mono text-[10px] text-slate-400">
                            {row.api_availability}
                          </td>
                          <td className="py-1.5 px-2.5 whitespace-nowrap font-mono text-[10px] text-slate-500">
                            {row.row_hash}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. COUNCIL DRAWER TAB */}
        {activeDrawerTab === 'council' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#06080E] border border-white/[0.08]">
              <div>
                <h4 className="text-xs font-display font-bold text-white">7-Reviewer AST & Anti-Boilerplate Council</h4>
                <p className="text-[11px] text-slate-400 font-sans">
                  Evaluates architecture, design tokens, security injection risks, and generates unified diffs.
                </p>
              </div>
              <button
                onClick={onRunCouncil}
                disabled={isEvaluatingCouncil}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-mono font-bold text-xs shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all cursor-pointer"
              >
                {isEvaluatingCouncil ? 'Auditing Code...' : 'Execute 7-Critic Audit'}
              </button>
            </div>

            {councilVerdict ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Critics Scorecard (Avg: {councilVerdict.average_score}/100)
                  </div>
                  <div className="space-y-1.5">
                    {councilVerdict.critics.map((critic, i) => (
                      <div key={i} className="p-2 rounded-lg bg-[#06080E] border border-white/[0.06] flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{critic.critic_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          critic.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {critic.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    Unified Diff & Optimization
                  </div>
                  <pre className="p-3 rounded-lg bg-[#06080E] border border-white/[0.08] text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-56 leading-relaxed">
                    {councilVerdict.optimized_code || councilVerdict.overall_feedback}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-500 font-mono text-xs">
                Click "Execute 7-Critic Audit" to evaluate the code AST with 7 parallel critics.
              </div>
            )}
          </div>
        )}

        {/* 3. GTM MULTIMODAL STUDIO DRAWER TAB */}
        {activeDrawerTab === 'gtm' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Poster */}
            <div className="p-3 rounded-xl bg-[#06080E] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">Launch Poster (1280x720)</span>
                <span className="text-emerald-400 text-[10px]">Playwright Rendered</span>
              </div>
              <div className="w-full aspect-video rounded-lg bg-black border border-white/[0.06] overflow-hidden">
                <img
                  src="/artifacts/hero_frame.png"
                  alt="Launch Poster"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <a
                href="/artifacts/hero_frame.png"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Download High-Res PNG (&gt;400KB)</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Video */}
            <div className="p-3 rounded-xl bg-[#06080E] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">Launch Video (1080p MP4)</span>
                <span className="text-purple-400 text-[10px]">AdaL FFmpeg Muxed</span>
              </div>
              <div className="w-full aspect-video rounded-lg bg-black border border-white/[0.06] overflow-hidden">
                <video
                  src="/artifacts/launch_video.mp4"
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
              <a
                href="/artifacts/launch_video.mp4"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-purple-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Download 1080p MP4</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Audio Voiceover */}
            <div className="p-3 rounded-xl bg-[#06080E] border border-white/[0.08] space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-white">Voiceover Audio</span>
                <span className="text-cyan-400 text-[10px]">TTS Synthesis</span>
              </div>
              <audio src="/artifacts/voiceover.mp3" controls className="w-full mt-4" />
              <div className="p-2 rounded bg-white/[0.03] text-[10px] font-sans text-slate-400 leading-snug">
                Audio synthesized from launch narration brief and muxed with high-res canvas poster into complete MP4 package.
              </div>
            </div>
          </div>
        )}

        {/* 4. AX TREE DRAWER TAB */}
        {activeDrawerTab === 'ax' && (
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between pb-1 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Chromium CDP Accessibility Nodes ({axTree.length})
              </span>
              <button
                onClick={onRefreshAXTree}
                className="px-2.5 py-1 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-xs text-white border border-white/[0.08] cursor-pointer"
              >
                Refresh Tree
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {axTree.map((node, i) => (
                <div key={i} className="p-1.5 rounded bg-[#06080D] border border-white/[0.04] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                      {node.role}
                    </span>
                    <span className="text-slate-200">{node.name}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">Node #{node.backendDOMNodeId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
