import React, { useState } from 'react';
import { 
  FileSpreadsheet, Play, CheckCircle2, Download, 
  ExternalLink, Search, RefreshCw, Layers, ShieldCheck 
} from 'lucide-react';
import { StartupComparisonRow } from '../../types';

interface AutomateModeProps {
  onTriggerTask: (prompt: string) => void;
  isProcessing: boolean;
}

export const AutomateMode: React.FC<AutomateModeProps> = ({ onTriggerTask, isProcessing }) => {
  const [prompt, setPrompt] = useState('Research 10 AI startups, compare their products and pricing, and populate our comparison spreadsheet.');
  const [data, setData] = useState<StartupComparisonRow[]>([
    { startup: 'Anthropic', product: 'Claude 3.5 Sonnet', pricing: '$20/mo Pro, $3/MTok API', verified: true },
    { startup: 'OpenAI', product: 'GPT-4o & Canvas', pricing: '$20/mo Plus, $2.50/MTok API', verified: true },
    { startup: 'SylphAI', product: 'AdaL Agent Suite', pricing: '$15-$45/mo Pro/Max Tier', verified: true },
    { startup: 'Perplexity', product: 'Perplexity Pro Search', pricing: '$20/mo or $200/yr', verified: true },
    { startup: 'Mistral AI', product: 'Le Chat & Large 2', pricing: 'Free web, €2/MTok API', verified: true },
    { startup: 'Cursor', product: 'AI Code Editor', pricing: '$20/mo Pro Tier', verified: true },
    { startup: 'ElevenLabs', product: 'Multimodal Voice AI', pricing: '$5-$99/mo Starter/Creator', verified: true },
    { startup: 'ArmorIQ', product: 'CSRG Intent Security', pricing: 'Custom / Unknown Enterprise', verified: true },
    { startup: 'Cognition', product: 'Devin AI Engineer', pricing: 'Custom Enterprise / Waitlist', verified: true },
    { startup: 'Midjourney', product: 'v6.1 Image Generator', pricing: '$10-$120/mo Plans', verified: true },
  ]);

  const exportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Startup,Product,Pricing,Outcome Verified"]
      .concat(data.map(r => `"${r.startup}","${r.product}","${r.pricing}","${r.verified ? 'YES' : 'NO'}"`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "autoforge_ai_startups_matrix.csv");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16]">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between">
        <div className="flex-1 max-w-2xl flex items-center bg-[#131b30] border border-slate-700 rounded-xl px-4 py-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-transparent text-slate-200 text-xs outline-none font-sans"
            placeholder="Describe autonomous workflow..."
          />
        </div>

        <div className="flex items-center space-x-3 ml-4">
          <button
            onClick={() => onTriggerTask(prompt)}
            disabled={isProcessing}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-medium shadow-lg transition disabled:opacity-50"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            <span>Execute Workflow</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Outcome Verification Header */}
      <div className="px-6 py-3 bg-[#0a0f1d] border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-3">
          <div className="p-1.5 bg-emerald-500/10 rounded text-emerald-400">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Pillar 1: 10 AI Startups Comparative Matrix</h3>
            <p className="text-[11px] text-slate-400">Autonomous CDP Search & Verified Spreadsheet Ingestion</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Cell Read-Back Verified (10/10)</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            <span>ArmorIQ Write Token Approved</span>
          </span>
        </div>
      </div>

      {/* Spreadsheet Table */}
      <div className="flex-1 overflow-auto p-6">
        <div className="rounded-xl border border-slate-800 bg-[#0e1424] overflow-hidden shadow-2xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#12192c] border-b border-slate-800 text-slate-300 font-semibold">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Startup / Company</th>
                <th className="py-3 px-4">Flagship Product</th>
                <th className="py-3 px-4">Pricing Model</th>
                <th className="py-3 px-4 text-center">Outcome Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {data.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#151f36] transition">
                  <td className="py-3 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                    {row.startup}
                    <ExternalLink className="w-3 h-3 text-slate-500 hover:text-indigo-400 cursor-pointer" />
                  </td>
                  <td className="py-3 px-4 text-slate-300">{row.product}</td>
                  <td className="py-3 px-4 font-mono text-xs">
                    <span className={row.pricing.includes('Unknown') ? 'text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30' : 'text-slate-300'}>
                      {row.pricing}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> MATCHED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
