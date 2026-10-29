import React, { useState } from 'react';
import {
  Video,
  Mic,
  Play,
  Download,
  Sparkles,
  Layers,
  KeyRound,
  FileCheck,
  Film,
  Volume2,
  RefreshCw,
} from 'lucide-react';
import { api } from '../services/api';
import { GTMResult } from '../types';

export const CreateMode: React.FC = () => {
  const [title, setTitle] = useState('AutoForge Launchpad');
  const [headline, setHeadline] = useState(
    'AI-Native Developer Browser with CDP Accessibility Trees & 7-Agent Council'
  );
  const [script, setScript] = useState(
    'Introducing AutoForge. The AI-native desktop developer browser. Featuring native Chromium CDP accessibility automation, a seven-agent anti-boilerplate council, and independent disk outcome assertions.'
  );

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GTMResult | null>(null);
  const [mediaKey, setMediaKey] = useState(Date.now()); // for forcing player cache refresh

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await api.generateGTM(title, headline, script);
      setResult(res);
      setMediaKey(Date.now());
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const headlinesPreset = [
    'AI-Native Developer Browser with CDP Accessibility Trees & 7-Agent Council',
    'Eliminate Generic Code with Chromium DevTools Protocol & Anti-Boilerplate AST Audits',
    'Zero-Trust Automation: Merkle Tree Intent Tokens with Fail-Closed Safety',
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Top Header */}
      <div className="p-4 bg-[#111520] border-b border-[#23293d] select-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                GTM Multimodal Media Packaging Launchpad
              </h2>
              <p className="text-xs text-slate-400">
                ElevenLabs voiceover synthesis with SHA-256 disk cache • Pillow 1080p canvas • FFmpeg video compositing
              </p>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Compositing 1080p MP4...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate GTM Package</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Script & Creative Controls */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-2xl bg-[#111520] border border-[#23293d] shadow-xl space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-[#23293d] text-xs font-bold text-slate-200">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Campaign Metadata & Script</span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Product / Campaign Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0d14] border border-[#23293d] text-xs text-slate-100 focus:border-blue-500 outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Technical Value Headline
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0d14] border border-[#23293d] text-xs text-slate-100 focus:border-blue-500 outline-none font-sans"
                />
                {/* Headline Suggestions */}
                <div className="mt-2 space-y-1">
                  <span className="text-[10px] text-slate-500 font-mono">Suggested Headlines:</span>
                  {headlinesPreset.map((hp, i) => (
                    <button
                      key={i}
                      onClick={() => setHeadline(hp)}
                      className="block text-left text-[11px] text-blue-400 hover:text-blue-300 truncate w-full"
                    >
                      • {hp}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-slate-400">
                    Voiceover Script (ElevenLabs Engine)
                  </label>
                  <span className="text-[10px] font-mono text-slate-500">
                    {script.length} characters
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0a0d14] border border-[#23293d] text-xs text-slate-100 focus:border-blue-500 outline-none font-sans resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Pipeline Specs Box */}
            <div className="p-4 rounded-xl bg-[#0e121b] border border-[#23293d] space-y-2 text-xs font-mono">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                Multimodal Pipeline Specifications
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Audio Engine:</span>
                <span className="text-blue-400">ElevenLabs (SHA-256 Cached)</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Frame Engine:</span>
                <span className="text-slate-200">Pillow 1080p UI Renderer</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Compositor:</span>
                <span className="text-slate-200">FFmpeg 7.1 H.264 / AAC</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Target Output:</span>
                <span className="text-emerald-400 font-bold">1920x1080 30FPS MP4</span>
              </div>
            </div>
          </div>

          {/* Right Column: Video Preview & Audio Player */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1080p Video Player Box */}
            <div className="p-5 rounded-2xl bg-[#111520] border border-[#23293d] shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#23293d]">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-slate-200">
                    1080p MP4 Video Preview
                  </span>
                </div>
                {result?.success && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                    1920x1080 Composited
                  </span>
                )}
              </div>

              {/* Video Player */}
              <div className="w-full aspect-video rounded-xl bg-[#0a0d14] border border-[#23293d] overflow-hidden flex items-center justify-center relative">
                {result?.success ? (
                  <video
                    key={mediaKey}
                    controls
                    className="w-full h-full object-cover"
                    src={`http://127.0.0.1:8000/artifacts/autoforge_gtm_1080p.mp4?v=${mediaKey}`}
                  >
                    Your browser does not support video playback.
                  </video>
                ) : (
                  <div className="text-center p-6 space-y-2">
                    <Film className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400 font-sans">
                      Click "Generate GTM Package" to synthesize voiceover and composite 1080p video.
                    </p>
                  </div>
                )}
              </div>

              {/* Download Video Action */}
              {result?.success && (
                <div className="mt-4 flex items-center justify-between pt-3 border-t border-[#23293d]">
                  <span className="text-xs text-slate-400 font-mono truncate max-w-xs">
                    Path: artifacts/autoforge_gtm_1080p.mp4
                  </span>
                  <a
                    href="http://127.0.0.1:8000/artifacts/autoforge_gtm_1080p.mp4"
                    download="autoforge_gtm_1080p.mp4"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#171c2b] hover:bg-[#23293d] text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
              )}
            </div>

            {/* Voiceover Player Box */}
            <div className="p-5 rounded-2xl bg-[#111520] border border-[#23293d] shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#23293d]">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-bold text-slate-200">
                    Voiceover Audio Track
                  </span>
                </div>
                {result?.audio_source && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#171c2b] text-blue-300 border border-[#23293d]">
                    Source: {result.audio_source}
                  </span>
                )}
              </div>

              {result?.sha256 && (
                <div className="p-2.5 rounded-lg bg-[#0a0d14] border border-[#23293d] flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">SHA-256 Audio Cache:</span>
                  <span className="text-emerald-400 font-bold">
                    {result.sha256.slice(0, 20)}...
                  </span>
                </div>
              )}

              <div className="pt-2">
                <audio
                  key={`audio-${mediaKey}`}
                  controls
                  className="w-full h-10 rounded-lg outline-none"
                  src={`http://127.0.0.1:8000/artifacts/latest_gtm_audio.wav?v=${mediaKey}`}
                >
                  Your browser does not support audio playback.
                </audio>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
