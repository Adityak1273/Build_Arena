import React, { useState } from 'react';
import { 
  Video, Mic, Wand2, Download, Play, Sparkles, 
  Film, Music, Layers, ShieldCheck, RefreshCw 
} from 'lucide-react';

interface CreateModeProps {
  onTriggerTask: (prompt: string) => void;
  isProcessing: boolean;
}

export const CreateMode: React.FC<CreateModeProps> = ({ onTriggerTask, isProcessing }) => {
  const [headline, setHeadline] = useState('AutoForge: From Ideas to Working Software, All in One Browser');
  const [script, setScript] = useState(
    'Meet AutoForge, the AI-native developer browser built on AdaL. Stop tab switching. Our multi-agent critique loop designs, writes, and tests production code directly in your browser. AutoForge: Build faster with real verified outcomes.'
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMedia, setGeneratedMedia] = useState<{ audio: string; video: string } | null>({
    audio: 'voiceover_demo.mp3',
    video: 'launch_promo.mp4'
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/gtm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, script }),
      });
      const data = await res.json();
      setGeneratedMedia({
        audio: data.audio_path || 'voiceover_cached.mp3',
        video: data.video_path || 'launch_promo.mp4'
      });
    } catch (e) {
      console.warn('Backend not responding to GTM endpoint, using local preview assets');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#090d16]">
      {/* Top Banner */}
      <div className="px-6 py-4 bg-[#0e1424] border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Film className="w-5 h-5 text-indigo-400" />
            <span>Pillar 2: Multimodal GTM Studio</span>
          </h2>
          <p className="text-xs text-slate-400">Automated ElevenLabs Voiceover & FFmpeg Compositor</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || isProcessing}
          className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-950 transition disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          <span>Synthesize GTM Launch Assets</span>
        </button>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 overflow-auto p-6 grid grid-cols-2 gap-6">
        {/* Left Column: Script & Voiceover Configuration */}
        <div className="flex flex-col space-y-4">
          <div className="p-5 bg-[#0e1424] rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-400" />
              <span>Marketing Headline & Video Caption</span>
            </h3>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#131b30] border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-200 outline-none"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Narration Script (ElevenLabs Voice Engine)</span>
                <span className="font-mono text-[11px] text-amber-400">SHA-256 Idempotency Cache</span>
              </div>
              <textarea
                rows={5}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full bg-[#131b30] border border-slate-700 rounded-xl p-3 text-xs text-slate-200 outline-none font-sans leading-relaxed resize-none"
              />
            </div>

            <div className="p-3 bg-[#131b2e] rounded-xl border border-slate-800 text-xs space-y-1.5">
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Selected Voice:</span>
                <span className="font-mono text-indigo-300 font-semibold">George (Warm & Professional)</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="text-slate-400">Audio Model:</span>
                <span className="font-mono text-slate-300">eleven_multilingual_v2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Video & Media Compositing Preview */}
        <div className="flex flex-col space-y-4">
          <div className="p-5 bg-[#0e1424] rounded-2xl border border-slate-800 flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Video className="w-4 h-4 text-indigo-400" />
                <span>1080p FFmpeg Video Compositor</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono">
                zoompan + burn-in captions
              </span>
            </div>

            {/* Video Preview Frame */}
            <div className="flex-1 min-h-[220px] bg-black/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center p-6 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              
              <div className="z-10 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center mx-auto text-indigo-400 shadow-xl group-hover:scale-105 transition cursor-pointer">
                  <Play className="w-6 h-6 fill-current ml-1" />
                </div>
                <div className="text-xs font-semibold text-white drop-shadow">
                  {headline}
                </div>
              </div>

              <div className="absolute bottom-4 left-4 right-4 z-10 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10 text-center">
                <p className="text-[11px] text-slate-200 font-medium italic">
                  "{headline.slice(0, 50)}..."
                </p>
              </div>
            </div>

            {/* Assets Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Music className="w-4 h-4 text-amber-400" />
                <span>voiceover_cached.mp3 ready</span>
              </div>
              <button className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-medium border border-slate-700 transition">
                <Download className="w-4 h-4" />
                <span>Download .mp4 Package</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
