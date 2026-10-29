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

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await fetch('http://127.0.0.1:8000/api/gtm/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, script }),
      });
    } catch (e) {
      console.warn('Backend not responding to GTM endpoint, using local preview assets');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC]">
      {/* Top Banner (YouTube Studio Style) */}
      <div className="px-7 py-4 bg-white border-b border-[#E4E4E7] flex items-center justify-between shadow-2xs">
        <div>
          <h2 className="text-base font-extrabold text-[#0F0F0F] tracking-[-0.03em] flex items-center gap-2">
            <Film className="w-5 h-5 text-amber-600" />
            <span>Pillar 2: Multimodal GTM Studio</span>
          </h2>
          <p className="text-xs text-[#71717A] font-medium">Automated ElevenLabs Voiceover & FFmpeg Compositor</p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || isProcessing}
          className="flex items-center space-x-2 px-6 py-2.5 bg-[#0F0F0F] hover:bg-[#27272A] text-white rounded-full text-xs font-bold tracking-tight shadow-sm transition duration-150 disabled:opacity-50"
        >
          {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          <span>Synthesize GTM Launch Assets</span>
        </button>
      </div>

      {/* Main Studio Area */}
      <div className="flex-1 overflow-auto p-7 grid grid-cols-2 gap-7">
        {/* Left Column: Script & Voiceover Configuration */}
        <div className="flex flex-col space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-[#E4E4E7] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#0F0F0F] tracking-tight flex items-center gap-2">
              <Mic className="w-4 h-4 text-amber-600" />
              <span>Marketing Headline & Video Caption</span>
            </h3>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl px-4 py-2.5 text-xs text-[#0F0F0F] outline-none font-semibold tracking-tight shadow-inner"
            />

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#52525B]">Narration Script (ElevenLabs Voice Engine)</span>
                <span className="font-mono text-[11px] text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full font-bold">
                  SHA-256 Idempotency Cache
                </span>
              </div>
              <textarea
                rows={5}
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="w-full bg-[#F4F4F5] border border-[#E4E4E7] rounded-2xl p-4 text-xs text-[#0F0F0F] outline-none font-sans leading-[1.6] resize-none shadow-inner font-medium"
              />
            </div>

            <div className="p-4 bg-purple-50/70 rounded-2xl border border-purple-100 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#52525B] font-semibold">Selected Voice:</span>
                <span className="font-mono text-purple-950 font-bold">George (Warm & Professional)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#52525B] font-semibold">Audio Model:</span>
                <span className="font-mono text-purple-900 font-bold">eleven_multilingual_v2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Video & Media Compositing Preview (YouTube Player Aesthetic) */}
        <div className="flex flex-col space-y-4">
          <div className="p-6 bg-white rounded-3xl border border-[#E4E4E7] shadow-sm flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0F0F0F] tracking-tight flex items-center gap-2">
                <Video className="w-4 h-4 text-purple-600" />
                <span>1080p FFmpeg Video Compositor</span>
              </h3>
              <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-950 font-mono font-bold">
                zoompan + burn-in captions
              </span>
            </div>

            {/* Video Player Frame */}
            <div className="flex-1 min-h-[220px] bg-gradient-to-tr from-slate-100 via-purple-50/40 to-amber-50/30 rounded-2xl border border-[#E4E4E7] flex flex-col items-center justify-center p-6 relative overflow-hidden group shadow-inner">
              <div className="z-10 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-white border border-purple-200/80 flex items-center justify-center mx-auto text-purple-600 shadow-md group-hover:scale-105 transition duration-150 cursor-pointer">
                  <Play className="w-7 h-7 fill-current ml-1 text-purple-600" />
                </div>
                <div className="text-xs font-extrabold text-[#0F0F0F] tracking-tight max-w-sm">
                  {headline}
                </div>
              </div>

              {/* Burned-in caption banner */}
              <div className="absolute bottom-4 left-4 right-4 z-10 bg-white/95 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-[#E4E4E7] text-center shadow-xs">
                <p className="text-[11px] text-[#27272A] font-semibold italic tracking-tight">
                  "{headline.slice(0, 55)}..."
                </p>
              </div>
            </div>

            {/* Assets Actions */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2 text-xs text-[#52525B] font-semibold">
                <Music className="w-4 h-4 text-amber-600" />
                <span>voiceover_cached.mp3 ready</span>
              </div>
              <button className="flex items-center space-x-1.5 px-4 py-2 bg-[#0F0F0F] hover:bg-[#27272A] text-white rounded-full text-xs font-bold tracking-tight shadow-xs transition duration-150">
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
