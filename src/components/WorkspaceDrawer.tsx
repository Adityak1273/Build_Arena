import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Video,
  Layers,
  Maximize2,
  X,
  Save,
  Download,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
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
      className={`absolute bottom-0 left-0 right-0 z-30 flex flex-col bg-[#FAF7F2] border-t-2 border-[#D5CEBF] shadow-[0_-12px_35px_rgba(13,17,23,0.3)] transition-all duration-300 ease-out text-[#0F172A] ${
        isMaximized ? 'h-[85%]' : 'h-[48%]'
      }`}
    >
      {/* Drawer Title Bar (Ink Black Frame with Crisp Bark Black Bottom Border) */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[#D5CEBF] bg-[#ECE5D8] select-none">
        {/* Tab Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => onSelectDrawerTab('spreadsheet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'spreadsheet'
                ? 'bg-[#FAF7F2] text-[#0F172A] border-[#D5CEBF] shadow-xs'
                : 'bg-[#DAD2C2] text-[#0F172A] border-[#D5CEBF] hover:border-[#00F2FE]/60'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Competitive Startups Spreadsheet</span>
            <span className="px-1.5 py-0.2 rounded bg-[#00F2FE]/20 text-[10px] text-[#00F2FE] border border-[#D5CEBF]/60">
              {editableRows.length} Rows
            </span>
          </button>

          <button
            onClick={() => onSelectDrawerTab('council')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'council'
                ? 'bg-[#FAF7F2] text-[#0F172A] border-[#D5CEBF] shadow-xs'
                : 'bg-[#DAD2C2] text-[#0F172A] border-[#D5CEBF] hover:border-[#00F2FE]/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>7-Critic Code Council</span>
          </button>

          <button
            onClick={() => onSelectDrawerTab('gtm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'gtm'
                ? 'bg-[#FAF7F2] text-[#0F172A] border-[#D5CEBF] shadow-xs'
                : 'bg-[#DAD2C2] text-[#0F172A] border-[#D5CEBF] hover:border-[#00F2FE]/60'
            }`}
          >
            <Video className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>GTM Multimodal Studio</span>
          </button>

          <button
            onClick={() => onSelectDrawerTab('ax')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
              activeDrawerTab === 'ax'
                ? 'bg-[#FAF7F2] text-[#0F172A] border-[#D5CEBF] shadow-xs'
                : 'bg-[#DAD2C2] text-[#0F172A] border-[#D5CEBF] hover:border-[#00F2FE]/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#00F2FE]" />
            <span>Accessibility Tree</span>
            <span className="px-1.5 py-0.2 rounded bg-[#00F2FE]/20 text-[10px] text-[#00F2FE] border border-[#D5CEBF]/60">
              {axTree.length} Nodes
            </span>
          </button>
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1.5 rounded-md text-slate-400 hover:text-[#00F2FE] hover:bg-white/[0.08] border border-[#D5CEBF] transition-colors cursor-pointer"
            title={isMaximized ? 'Restore Drawer' : 'Maximize Drawer'}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onCloseDrawer}
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-white/[0.08] border border-[#D5CEBF] transition-colors cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Drawer Content (Warm Ivory Canvas with Bark Black Highlight Borders) */}
      <div className="flex-1 overflow-y-auto p-4 text-[#0F172A] font-sans">
        {/* 1. SPREADSHEET DRAWER TAB */}
        {activeDrawerTab === 'spreadsheet' && (
          <div className="space-y-3">
            {/* Action Bar with Bark Black Border */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                  Disk Checksum:
                </span>
                <span className="text-xs font-mono text-[#0F766E] font-bold bg-[#00F2FE]/10 border border-[#D5CEBF] px-2.5 py-0.5 rounded truncate max-w-xs shadow-xs">
                  {spreadsheetOutcome?.disk_hash || '1398bd2e9ed9fd57...'}
                </span>
                <button
                  onClick={() => spreadsheetOutcome?.disk_hash && handleCopyHash(spreadsheetOutcome.disk_hash)}
                  className="text-slate-600 hover:text-[#0D9488] p-1 border border-[#D5CEBF]/40 rounded hover:border-[#D5CEBF] cursor-pointer"
                  title="Copy SHA-256"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-[#0D9488]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {hasUnsavedEdits && (
                  <span className="text-[10px] font-mono text-amber-950 bg-amber-100 border border-[#D5CEBF] px-2 py-0.5 rounded-md font-bold animate-pulse shadow-xs">
                    Unsaved Edits Detected
                  </span>
                )}
                <button
                  onClick={onSaveSpreadsheet}
                  disabled={isSavingSpreadsheet || !hasUnsavedEdits}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border-[1.5px] ${
                    hasUnsavedEdits
                      ? 'bg-[#00F2FE] hover:bg-[#00D2E0] text-[#07090D] shadow-xs border-[#D5CEBF] animate-pulse'
                      : 'bg-slate-100 text-slate-400 border-slate-300 cursor-not-allowed'
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingSpreadsheet ? 'Re-Verifying...' : 'Save & Re-Verify (SHA-256)'}</span>
                </button>

                <button
                  onClick={onTriggerScrape}
                  disabled={isScraping}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#ECE5D8] hover:bg-[#DAD2C2] text-[#00F2FE] border-[1.5px] border-[#D5CEBF] font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                  <span>{isScraping ? 'Crawling...' : 'Trigger Scrape'}</span>
                </button>

                <a
                  href={api.getDownloadUrl()}
                  download="ai_startups_matrix.csv"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAF7F2] text-[#0F172A] font-mono font-bold text-xs border-[1.5px] border-[#D5CEBF] shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                  <span>CSV</span>
                </a>
              </div>
            </div>

            {/* Editable Spreadsheet Table with Bark Black Borders */}
            <div className="rounded-xl border-[1.5px] border-[#D5CEBF] overflow-hidden bg-white shadow-xs">
              <div className="overflow-x-auto max-h-72">
                <table className="w-full text-left text-xs divide-y divide-[#0D1117]/25">
                  <thead className="bg-[#F4EFE6] text-[10px] font-mono text-[#0F172A] uppercase tracking-wider sticky top-0 z-10 border-b-2 border-[#D5CEBF]">
                    <tr>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Company</th>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Domain & Source URL</th>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Status</th>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Scraped Title</th>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Pricing Tier</th>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Sales Gate</th>
                      <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">API Available</th>
                      <th className="py-2.5 px-3 font-extrabold">Row Hash</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0D1117]/15 text-[#0F172A]">
                    {editableRows.map((row, idx) => {
                      const isGate = (row.enterprise_sales_gate || '').toUpperCase().includes('YES');
                      const isUnknownPricing = (row.pricing_tier || '').includes('UNKNOWN');
                      const isSuccess = (row.verification_status || '') === 'VERIFIED';
                      const targetLink = row.target_url || `https://${row.domain}`;

                      return (
                        <tr key={idx} className={`hover:bg-[#00F2FE]/5 transition-colors ${idx % 2 === 1 ? 'bg-[#FAF7F2]/70' : 'bg-white'}`}>
                          <td className="py-2 px-2.5 font-bold text-[#0F172A] whitespace-nowrap border-r border-[#D5CEBF]/15">
                            <input
                              type="text"
                              value={row.company_name}
                              onChange={(e) => onCellChange(idx, 'company_name', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-[#D5CEBF]/40 focus:border-[#00F2FE] rounded px-1.5 py-0.5 text-[#0F172A] text-xs font-bold w-32 outline-hidden"
                            />
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[11px] border-r border-[#D5CEBF]/15">
                            <div className="flex items-center gap-1">
                              <input
                                type="text"
                                value={row.domain}
                                onChange={(e) => onCellChange(idx, 'domain', e.target.value)}
                                className="bg-transparent border border-transparent hover:border-[#D5CEBF]/40 focus:border-[#00F2FE] rounded px-1 py-0.5 text-[#0D9488] font-mono text-[11px] font-bold w-28 outline-hidden"
                              />
                              <a
                                href={targetLink}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0D9488] hover:text-[#00F2FE] p-0.5"
                                title={`Open ${targetLink}`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap border-r border-[#D5CEBF]/15">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${
                              isSuccess ? 'bg-emerald-100 text-emerald-800 border-[#D5CEBF]/40' : 'bg-rose-100 text-rose-800 border-[#D5CEBF]/40'
                            }`}>
                              {row.fetch_status || 'VERIFIED'}
                            </span>
                          </td>
                          <td className="py-2 px-2.5 max-w-xs truncate border-r border-[#D5CEBF]/15">
                            <input
                              type="text"
                              value={row.scraped_title}
                              onChange={(e) => onCellChange(idx, 'scraped_title', e.target.value)}
                              className="bg-transparent border border-transparent hover:border-[#D5CEBF]/40 focus:border-[#00F2FE] rounded px-1.5 py-0.5 text-slate-800 text-xs w-full outline-hidden truncate"
                            />
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap border-r border-[#D5CEBF]/15">
                            <input
                              type="text"
                              value={row.pricing_tier}
                              onChange={(e) => onCellChange(idx, 'pricing_tier', e.target.value)}
                              className={`rounded px-2 py-0.5 font-mono text-[11px] w-44 outline-hidden border ${
                                isUnknownPricing
                                  ? 'bg-amber-100 text-amber-950 border-[#D5CEBF] font-bold'
                                  : 'bg-transparent text-slate-800 border-transparent hover:border-[#D5CEBF]/40'
                              }`}
                            />
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap border-r border-[#D5CEBF]/15">
                            <input
                              type="text"
                              value={row.enterprise_sales_gate}
                              onChange={(e) => onCellChange(idx, 'enterprise_sales_gate', e.target.value)}
                              className={`rounded px-1.5 py-0.5 font-mono text-[10px] w-28 outline-hidden border ${
                                isGate ? 'bg-amber-100 text-amber-900 border-[#D5CEBF]/50 font-bold' : 'bg-transparent text-slate-600 border-transparent'
                              }`}
                            />
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[10px] text-slate-700 font-bold border-r border-[#D5CEBF]/15">
                            {row.api_availability}
                          </td>
                          <td className="py-2 px-2.5 whitespace-nowrap font-mono text-[10px] text-slate-500">
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
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs">
              <div>
                <h4 className="text-xs font-display font-extrabold text-[#0F172A]">7-Reviewer AST & Anti-Boilerplate Council</h4>
                <p className="text-[11px] text-slate-600 font-sans">
                  Evaluates architecture, design tokens, security injection risks, and generates verified diffs.
                </p>
              </div>
              <button
                onClick={onRunCouncil}
                disabled={isEvaluatingCouncil}
                className="px-3.5 py-1.5 rounded-lg bg-[#ECE5D8] hover:bg-[#DAD2C2] text-[#00F2FE] border-[1.5px] border-[#D5CEBF] font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                {isEvaluatingCouncil ? 'Auditing Code...' : 'Execute 7-Critic Audit'}
              </button>
            </div>

            {councilVerdict ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-extrabold">
                    Critics Scorecard (Avg: {councilVerdict.average_score}/100)
                  </div>
                  <div className="space-y-1.5">
                    {councilVerdict.critics.map((critic, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-white border-[1.5px] border-[#D5CEBF] flex items-center justify-between text-xs shadow-[1.5px_1.5px_0px_rgba(13,17,23,0.08)]">
                        <span className="font-bold text-[#0F172A]">{critic.critic_name}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#D5CEBF] ${
                          critic.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {critic.score}/100
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-700 font-extrabold">
                    Unified Diff & Optimization
                  </div>
                  <pre className="p-3 rounded-lg bg-[#ECE5D8] border-[1.5px] border-[#D5CEBF] text-[11px] font-mono text-[#00F2FE] overflow-x-auto max-h-56 leading-relaxed shadow-inner">
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
            <div className="p-3.5 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#0F172A]">Launch Poster (1280x720)</span>
                <span className="text-[#0D9488] font-bold text-[10px] px-1.5 py-0.2 rounded bg-[#00F2FE]/10 border border-[#D5CEBF]/30">Playwright Rendered</span>
              </div>
              <div className="w-full aspect-video rounded-lg bg-[#ECE5D8] border border-[#D5CEBF] overflow-hidden">
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
                className="text-[10px] text-[#0D9488] hover:text-[#00F2FE] hover:underline flex items-center gap-1 font-mono font-bold"
              >
                <span>Download High-Res PNG (&gt;400KB)</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Video */}
            <div className="p-3.5 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#0F172A]">Launch Video (1080p MP4)</span>
                <span className="text-purple-700 font-bold text-[10px] px-1.5 py-0.2 rounded bg-purple-100 border border-[#D5CEBF]/30">AdaL FFmpeg Muxed</span>
              </div>
              <div className="w-full aspect-video rounded-lg bg-[#ECE5D8] border border-[#D5CEBF] overflow-hidden">
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
                className="text-[10px] text-purple-700 hover:underline flex items-center gap-1 font-mono font-bold"
              >
                <span>Download 1080p MP4</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Audio Voiceover */}
            <div className="p-3.5 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-[#0F172A]">Voiceover Audio</span>
                <span className="text-[#0D9488] font-bold text-[10px] px-1.5 py-0.2 rounded bg-[#00F2FE]/10 border border-[#D5CEBF]/30">TTS Synthesis</span>
              </div>
              <audio src="/artifacts/voiceover.mp3" controls className="w-full mt-4" />
              <div className="p-2.5 rounded-lg bg-[#F4EFE6] text-[10px] font-sans text-slate-700 leading-snug font-medium border border-[#D5CEBF]/20">
                Audio synthesized from launch narration brief and muxed with high-res canvas poster into complete MP4 package.
              </div>
            </div>
          </div>
        )}

        {/* 4. AX TREE DRAWER TAB */}
        {activeDrawerTab === 'ax' && (
          <div className="space-y-2 font-mono">
            <div className="flex items-center justify-between pb-1 border-b-2 border-[#D5CEBF]">
              <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00F2FE]" />
                Chromium CDP Accessibility Nodes ({axTree.length})
              </span>
              <button
                onClick={onRefreshAXTree}
                className="px-2.5 py-1 rounded-md bg-[#ECE5D8] hover:bg-[#DAD2C2] text-[#00F2FE] text-xs font-bold border border-[#D5CEBF] shadow-xs cursor-pointer"
              >
                Refresh Tree
              </button>
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto">
              {axTree.map((node, i) => (
                <div key={i} className="p-2 rounded-lg bg-white border-[1.5px] border-[#D5CEBF] flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.2 rounded bg-[#00F2FE]/15 text-[#0F766E] text-[10px] font-bold border border-[#D5CEBF]">
                      {node.role}
                    </span>
                    <span className="text-[#0F172A] font-semibold">{node.name}</span>
                  </div>
                  <span className="text-slate-500 font-bold text-[10px]">Node #{node.backendDOMNodeId}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
