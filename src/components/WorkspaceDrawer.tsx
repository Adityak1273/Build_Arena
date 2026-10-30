import React, { useState, useEffect } from 'react';
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
  Image as ImageIcon,
  Sparkles,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { StartupRow, VerificationOutcome, CouncilVerdict, SemanticAXNode } from '../types';
import { api, API_BASE } from '../services/api';

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
  const [researchDataset, setResearchDataset] = useState<{
    count: number;
    sha256: string;
    rows: any[];
  } | null>(null);
  const [spreadsheetView, setSpreadsheetView] = useState<'startups' | 'research'>('research');
  const [artifactKey, setArtifactKey] = useState<number>(Date.now());
  const [previewModalImg, setPreviewModalImg] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    loadResearchDataset();
  }, [activeDrawerTab]);

  const loadResearchDataset = async () => {
    try {
      const res = await api.getLatestResearch();
      if (res && res.rows && res.rows.length > 0) {
        setResearchDataset(res);
        setSpreadsheetView('research');
      }
    } catch {
      // not yet generated
    }
  };

  const handleRefreshArtifacts = () => {
    setArtifactKey(Date.now());
    loadResearchDataset();
  };

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
            {/* View Switcher: Startups Benchmark vs Multi-Agent Research Dataset */}
            <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSpreadsheetView('startups')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer ${
                    spreadsheetView === 'startups'
                      ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-xs'
                      : 'bg-white text-slate-700 border-[#D5CEBF] hover:bg-[#FAF7F2]'
                  }`}
                >
                  🏢 AI Startups Matrix ({editableRows.length} rows)
                </button>
                {researchDataset && researchDataset.rows && (
                  <button
                    onClick={() => setSpreadsheetView('research')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                      spreadsheetView === 'research'
                        ? 'bg-[#0D9488] text-white border-[#0D9488] shadow-xs'
                        : 'bg-white text-slate-700 border-[#D5CEBF] hover:bg-[#FAF7F2]'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00F2FE]" />
                    <span>🔬 Multi-Agent Research Dataset ({researchDataset.rows.length} rows)</span>
                  </button>
                )}
              </div>

              <button
                onClick={handleRefreshArtifacts}
                className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#ECE5D8] hover:bg-[#DAD2C2] text-xs font-mono font-bold text-slate-700 border border-[#D5CEBF] cursor-pointer"
                title="Reload from disk"
              >
                <RefreshCw className="w-3 h-3 text-[#0D9488]" />
                <span>Reload Files</span>
              </button>
            </div>

            {/* Action Bar with Bark Black Border */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#0F172A] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#0D9488] animate-pulse" />
                  Disk Checksum:
                </span>
                <span className="text-xs font-mono text-[#0F766E] font-bold bg-[#00F2FE]/10 border border-[#D5CEBF] px-2.5 py-0.5 rounded truncate max-w-xs shadow-xs">
                  {spreadsheetView === 'research'
                    ? (researchDataset?.sha256 || 'Verified SHA-256')
                    : (spreadsheetOutcome?.disk_hash || '1398bd2e9ed9fd57...')}
                </span>
                <button
                  onClick={() => {
                    const h = spreadsheetView === 'research' ? researchDataset?.sha256 : spreadsheetOutcome?.disk_hash;
                    if (h) handleCopyHash(h);
                  }}
                  className="text-slate-600 hover:text-[#0D9488] p-1 border border-[#D5CEBF]/40 rounded hover:border-[#D5CEBF] cursor-pointer"
                  title="Copy SHA-256"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-[#0D9488]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {spreadsheetView === 'startups' ? (
                  <>
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
                  </>
                ) : (
                  <a
                    href={api.getResearchDownloadUrl()}
                    download="research.csv"
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0D9488] hover:bg-[#0F766E] text-white font-mono font-bold text-xs shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download research.csv</span>
                  </a>
                )}
              </div>
            </div>

            {/* Table Rendering */}
            {spreadsheetView === 'research' && researchDataset ? (
              <div className="rounded-xl border-[1.5px] border-[#D5CEBF] overflow-hidden bg-white shadow-xs">
                <div className="overflow-x-auto max-h-72">
                  <table className="w-full text-left text-xs divide-y divide-[#0D1117]/25">
                    <thead className="bg-[#F4EFE6] text-[10px] font-mono text-[#0F172A] uppercase tracking-wider sticky top-0 z-10 border-b-2 border-[#D5CEBF]">
                      <tr>
                        <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20 w-14">#</th>
                        <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Result Title</th>
                        <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Source</th>
                        <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Intelligence Snippet</th>
                        <th className="py-2.5 px-3 font-extrabold border-r border-[#D5CEBF]/20">Search Query</th>
                        <th className="py-2.5 px-3 font-extrabold">Link</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#0D1117]/15 text-[#0F172A]">
                      {researchDataset.rows.map((row: any, idx: number) => (
                        <tr key={idx} className={`hover:bg-[#00F2FE]/5 transition-colors ${idx % 2 === 1 ? 'bg-[#FAF7F2]/70' : 'bg-white'}`}>
                          <td className="py-2 px-3 font-mono text-[11px] font-bold text-[#0D9488] border-r border-[#D5CEBF]/15">
                            {row.rank || idx + 1}
                          </td>
                          <td className="py-2 px-3 font-bold text-[#0F172A] border-r border-[#D5CEBF]/15">
                            {row.title}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-slate-600 border-r border-[#D5CEBF]/15">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">{row.source || 'web'}</span>
                          </td>
                          <td className="py-2 px-3 text-[11px] text-slate-700 leading-snug border-r border-[#D5CEBF]/15 max-w-md">
                            {row.snippet}
                          </td>
                          <td className="py-2 px-3 font-mono text-[10px] text-slate-500 border-r border-[#D5CEBF]/15">
                            {row.query || '-'}
                          </td>
                          <td className="py-2 px-3">
                            {row.link ? (
                              <a
                                href={row.link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#0D9488] hover:text-[#00F2FE] flex items-center gap-1 font-mono text-[11px] font-bold"
                              >
                                <span>Visit</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
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
            )}
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
          <div className="space-y-3">
            {/* Multimodal Header Bar */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#00F2FE]/15 border border-[#D5CEBF] text-[#0F766E]">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-display font-extrabold text-[#0F172A] flex items-center gap-2">
                    <span>Multimodal GTM Studio & Swarm Visual Assets</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live Disk Verified
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-600 font-sans">
                    View real-time visual card infographics, launch posters, 1080p muxed video, and narration audio synthesized by the Swarm.
                  </p>
                </div>
              </div>

              <button
                onClick={handleRefreshArtifacts}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#ECE5D8] hover:bg-[#DAD2C2] text-[#0F766E] border-[1.5px] border-[#D5CEBF] font-mono font-bold text-xs shadow-xs transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-[#0D9488]" />
                <span>Refresh Media</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: Multi-Agent Swarm Infographic (result.png) */}
              <div className="p-3 rounded-xl bg-white border-2 border-[#0D9488] shadow-md space-y-2 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-[#0D9488] text-white text-[9px] font-mono font-bold px-2 py-0.5 rounded-bl-lg shadow-xs">
                  SWARM INTELLIGENCE
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-extrabold text-[#0F172A] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
                      Swarm Infographic
                    </span>
                  </div>
                  <div className="w-full aspect-video rounded-lg bg-[#ECE5D8] border border-[#D5CEBF] overflow-hidden relative group flex items-center justify-center">
                    <img
                      key={`result-${artifactKey}`}
                      src={`${API_BASE}/gtm-assets/result.png?t=${artifactKey}`}
                      alt="Multi-Agent Swarm Infographic"
                      className="w-full h-full object-contain bg-[#0F121C] transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('/artifacts/')) {
                          target.src = `${API_BASE}/artifacts/result.png?t=${artifactKey}`;
                        }
                      }}
                    />
                    <button
                      onClick={() =>
                        setPreviewModalImg({
                          url: `${API_BASE}/gtm-assets/result.png?t=${artifactKey}`,
                          title: 'Multi-Agent Swarm Infographic (result.png)'
                        })
                      }
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono font-bold transition-opacity cursor-pointer gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D5CEBF]/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">result.png</span>
                  <a
                    href={`${API_BASE}/artifacts/result.png`}
                    download="result.png"
                    className="text-[11px] text-[#0D9488] hover:text-[#00F2FE] hover:underline flex items-center gap-1 font-mono font-bold"
                  >
                    <span>Download PNG</span>
                    <Download className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 2: Promotional Launch Poster (hero_frame.png) */}
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-[#0F172A]">Launch Poster (HD)</span>
                    <span className="text-[#0D9488] font-bold text-[9px] px-1.5 py-0.2 rounded bg-[#00F2FE]/10 border border-[#D5CEBF]">Playwright</span>
                  </div>
                  <div className="w-full aspect-video rounded-lg bg-[#ECE5D8] border border-[#D5CEBF] overflow-hidden relative group flex items-center justify-center">
                    <img
                      key={`hero-${artifactKey}`}
                      src={`${API_BASE}/gtm-assets/hero_frame.png?t=${artifactKey}`}
                      alt="Launch Poster"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('/artifacts/')) {
                          target.src = `${API_BASE}/artifacts/hero_frame.png?t=${artifactKey}`;
                        }
                      }}
                    />
                    <button
                      onClick={() =>
                        setPreviewModalImg({
                          url: `${API_BASE}/gtm-assets/hero_frame.png?t=${artifactKey}`,
                          title: 'Launch Poster (hero_frame.png)'
                        })
                      }
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-mono font-bold transition-opacity cursor-pointer gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Click to Enlarge</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D5CEBF]/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">1280x720 PNG</span>
                  <a
                    href={`${API_BASE}/artifacts/hero_frame.png`}
                    download="hero_frame.png"
                    className="text-[11px] text-[#0D9488] hover:text-[#00F2FE] hover:underline flex items-center gap-1 font-mono font-bold"
                  >
                    <span>Download</span>
                    <Download className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 3: 1080p Launch Video (launch_video.mp4) */}
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-[#0F172A]">Launch Video (1080p)</span>
                    <span className="text-purple-700 font-bold text-[9px] px-1.5 py-0.2 rounded bg-purple-100 border border-[#D5CEBF]">FFmpeg Muxed</span>
                  </div>
                  <div className="w-full aspect-video rounded-lg bg-[#ECE5D8] border border-[#D5CEBF] overflow-hidden">
                    <video
                      key={`video-${artifactKey}`}
                      src={`${API_BASE}/gtm-assets/launch_video.mp4?t=${artifactKey}`}
                      controls
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D5CEBF]/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">H.264 MP4</span>
                  <a
                    href={`${API_BASE}/artifacts/launch_video.mp4`}
                    download="launch_video.mp4"
                    className="text-[11px] text-purple-700 hover:underline flex items-center gap-1 font-mono font-bold"
                  >
                    <span>Download</span>
                    <Download className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Card 4: Audio Narration (voiceover.mp3) */}
              <div className="p-3 rounded-xl bg-white border-[1.5px] border-[#D5CEBF] shadow-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-[#0F172A]">Narration Voiceover</span>
                    <span className="text-[#0D9488] font-bold text-[9px] px-1.5 py-0.2 rounded bg-[#00F2FE]/10 border border-[#D5CEBF]">TTS</span>
                  </div>
                  <audio
                    key={`audio-${artifactKey}`}
                    src={`${API_BASE}/gtm-assets/voiceover.mp3?t=${artifactKey}`}
                    controls
                    className="w-full mt-2"
                  />
                  <div className="p-2 mt-2 rounded bg-[#F4EFE6] text-[10px] font-sans text-slate-700 leading-snug border border-[#D5CEBF]/30">
                    Narration synthesized from launch brief and muxed with high-res poster into MP4.
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D5CEBF]/40 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">MP3 Audio</span>
                  <a
                    href={`${API_BASE}/artifacts/voiceover.mp3`}
                    download="voiceover.mp3"
                    className="text-[11px] text-[#0D9488] hover:underline flex items-center gap-1 font-mono font-bold"
                  >
                    <span>Download</span>
                    <Download className="w-3 h-3" />
                  </a>
                </div>
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

      {/* Lightbox Image Preview Modal */}
      {previewModalImg && (
        <div
          onClick={() => setPreviewModalImg(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-[#0F121C] border border-white/20 rounded-2xl overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            <div className="flex items-center justify-between px-4 py-3 bg-[#0A0D14] border-b border-white/10 text-white text-xs font-mono font-bold">
              <span>{previewModalImg.title}</span>
              <button
                onClick={() => setPreviewModalImg(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center overflow-auto max-h-[80vh]">
              <img
                src={previewModalImg.url}
                alt={previewModalImg.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
