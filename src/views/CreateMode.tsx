import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  Download,
  Sparkles,
  Film,
  Volume2,
  RefreshCw,
  Image as ImageIcon,
  Sliders,
  FileText,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { GTMResult } from '../types';

export const CreateMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');

  // Video & Campaign State
  const [title, setTitle] = useState('AutoForge v2.0 Launch');
  const [headline, setHeadline] = useState(
    'The AI-Native Browser with Multimodal Companion Powered by AdaL × VIGIL'
  );
  const [script, setScript] = useState(
    'Introducing AutoForge. Traditional browsers only render web pages. AutoForge understands developer intent, operates live Playwright CDP sessions, executes multi-step workflows, and verifies outcomes with cryptographic integrity checks. Build faster with AdaL.'
  );
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<GTMResult | null>(null);
  const [mediaKey, setMediaKey] = useState(Date.now());
  const [cinemaView, setCinemaView] = useState<'video' | 'poster'>('video');

  // Image Generation State
  const [imageTitle, setImageTitle] = useState('AutoForge v2.0');
  const [imageTagline, setImageTagline] = useState('AI-Native Browser & Autonomous Multimodal Companion');
  const [imageBadge, setImageBadge] = useState('GTM LAUNCH');
  const [imageTheme, setImageTheme] = useState('indigo');
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [imageResult, setImageResult] = useState<any | null>(null);

  // Audio / Speech State
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [audioAnalysis, setAudioAnalysis] = useState<any | null>(null);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const hasSpeech = typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
    setSpeechSupported(hasSpeech);
  }, []);

  const handleGenerateVideo = async () => {
    setIsVideoLoading(true);
    try {
      const res = await api.generateGTM(title, headline, script);
      setVideoResult(res);
      setMediaKey(Date.now());
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsVideoLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    setIsImageLoading(true);
    try {
      const res = await api.generateImageBanner(imageTitle, imageTagline, imageBadge, imageTheme);
      setImageResult(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsImageLoading(false);
    }
  };

  const handleAnalyzeAudio = async () => {
    setIsAnalyzingAudio(true);
    try {
      const res = await api.analyzeAudioTrack();
      setAudioAnalysis(res);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsAnalyzingAudio(false);
    }
  };

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Web Speech API is not supported in this browser environment.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsRecording(true);
    };

    recognition.onresult = (event: any) => {
      let current = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        current += event.results[i][0].transcript;
      }
      setTranscribedText(current);
      setScript(current);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.start();
  };

  const handleSpeakAloud = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  const headlinesPreset = [
    'AI-Native Developer Browser with CDP Accessibility Trees & 7-Reviewer Council',
    'Eliminate Generic Code with Chromium DevTools Protocol & Anti-Boilerplate AST Audits',
    'Zero-Trust Automation: Local Intent Policy Gate with Fail-Closed Safety',
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-transparent text-slate-100 font-sans">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-[#0B0E17]/80 backdrop-blur-xl border-b border-white/[0.08] select-none sticky top-0 z-20 shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-[#0F121C] via-[#151926] to-[#0F121C] p-4 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Film className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-display font-extrabold text-white tracking-tight font-sans">
                    Multimodal Intelligence & GTM Studio
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-mono font-bold border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]">
                    Pillar 2 Multimodal
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
                    AdaL × VIGIL Powered
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 font-sans">
                  Playwright High-Res Poster Render • 1280x720 FFmpeg Muxer • OpenGraph Canvas • Spoken Audio Voice Synthesis
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 p-1 bg-[#07090E]/80 backdrop-blur-md border border-white/[0.08] rounded-xl text-xs font-mono font-bold shadow-2xs">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>1. Launch Studio (Bento)</span>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'image'
                    ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Image Banner</span>
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] border border-white/20'
                    : 'text-slate-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>3. Voice Deck</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* ================================================================= */}
        {/* TAB 1: 3-Panel Bento Grid Studio                                 */}
        {/* ================================================================= */}
        {activeTab === 'video' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Panel 1: Campaign Metadata & Settings */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-bold text-white font-display">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>Campaign Configuration</span>
                    </div>
                    <button
                      onClick={handleGenerateVideo}
                      disabled={isVideoLoading}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all disabled:opacity-50 cursor-pointer border border-white/20"
                    >
                      {isVideoLoading ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Film className="w-3.5 h-3.5" />
                      )}
                      <span>{isVideoLoading ? 'Rendering Poster & Video...' : 'Composite All Assets'}</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Campaign Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Value Proposition Headline
                    </label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-wider">Suggested Headlines:</span>
                      {headlinesPreset.map((hp, i) => (
                        <button
                          key={i}
                          onClick={() => setHeadline(hp)}
                          className="block text-left text-[11px] text-slate-400 hover:text-cyan-300 truncate w-full cursor-pointer transition-colors font-sans"
                        >
                          • {hp}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono font-bold text-slate-300">
                        Voiceover Narration Script
                      </label>
                      <span className="text-[10px] font-mono text-slate-500">
                        {script.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={4}
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden resize-none leading-relaxed shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                </div>

                {/* Strategic Competitor Brief Card */}
                <div className="p-4 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] space-y-2.5 text-xs font-mono shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                  <div className="flex items-center justify-between text-slate-300 font-bold">
                    <span className="flex items-center gap-1.5 text-cyan-300 font-display">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      Strategic Positioning Brief
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono">AdaL GTM Matrix</span>
                  </div>
                  <div className="space-y-1.5 text-[11px] text-slate-300 font-sans leading-relaxed">
                    <div className="p-2 rounded-lg bg-[#06080D] border border-white/[0.06]">
                      <strong className="text-white block font-mono text-[10px] text-indigo-300 mb-0.5">VS. GOOGLE CHROME:</strong>
                      Passive display vs. AutoForge's native CDP autonomous action controller.
                    </div>
                    <div className="p-2 rounded-lg bg-[#06080D] border border-white/[0.06]">
                      <strong className="text-white block font-mono text-[10px] text-cyan-300 mb-0.5">VS. ARC / DIA:</strong>
                      Tab summaries vs. AutoForge's physical disk outcome verification & SHA-256 assertions.
                    </div>
                    <div className="p-2 rounded-lg bg-[#06080D] border border-white/[0.06]">
                      <strong className="text-white block font-mono text-[10px] text-amber-300 mb-0.5">VS. PERPLEXITY AI:</strong>
                      Read-only retrieval vs. AutoForge's full browser workspace & 7-reviewer code council.
                    </div>
                  </div>
                </div>
              </div>

              {/* Panel 2: 16:9 Cinema Stage (Video & High-Res Poster) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-5 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col">
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-display font-bold text-white">
                        16:9 Cinema Stage
                      </span>
                    </div>

                    <div className="flex items-center gap-1 p-0.5 bg-[#06080D] border border-white/[0.08] rounded-lg text-[10px] font-mono font-bold">
                      <button
                        onClick={() => setCinemaView('video')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          cinemaView === 'video'
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Play Video (MP4)
                      </button>
                      <button
                        onClick={() => setCinemaView('poster')}
                        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                          cinemaView === 'poster'
                            ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-2xs'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        High-Res Poster (PNG)
                      </button>
                    </div>
                  </div>

                  {/* Cinema Bezel */}
                  <div className="w-full aspect-video rounded-xl bg-[#05070B] border border-white/[0.1] overflow-hidden flex items-center justify-center relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                    {cinemaView === 'video' ? (
                      <video
                        key={`gtm-video-${mediaKey}`}
                        controls
                        className="w-full h-full object-cover"
                        src={`http://127.0.0.1:4000/public/gtm-assets/launch_video.mp4?v=${mediaKey}`}
                      >
                        Your browser does not support video playback.
                      </video>
                    ) : (
                      <img
                        key={`gtm-poster-${mediaKey}`}
                        src={`http://127.0.0.1:4000/public/gtm-assets/hero_frame.png?v=${mediaKey}`}
                        alt="High-Res Promotional Launch Poster"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Badges & Downloads */}
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.08] flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        1280x720 HD Verified
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                        H.264 / AAC Muxed
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`http://127.0.0.1:4000/public/gtm-assets/hero_frame.png?v=${mediaKey}`}
                        download="hero_frame.png"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold transition-colors border border-white/[0.1] cursor-pointer"
                      >
                        <Download className="w-3 h-3 text-cyan-400" />
                        <span>Poster PNG</span>
                      </a>
                      <a
                        href={`http://127.0.0.1:4000/public/gtm-assets/launch_video.mp4?v=${mediaKey}`}
                        download="launch_video.mp4"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Video MP4</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Panel 3: Voiceover Audio Narration Deck */}
                <div className="p-4 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold font-display text-white">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      Narration Audio Track (Spoken Narration)
                    </span>
                    <button
                      onClick={() => handleSpeakAloud(script)}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-cyan-300 border border-white/[0.08] text-[10px] font-mono transition-colors cursor-pointer"
                    >
                      Speak Aloud Now
                    </button>
                  </div>
                  <audio
                    key={`voiceover-audio-${mediaKey}`}
                    controls
                    className="w-full h-9 rounded-xl outline-hidden"
                    src={`http://127.0.0.1:4000/public/gtm-assets/voiceover.mp3?v=${mediaKey}`}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: Creative Image Generator                                   */}
        {/* ================================================================= */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-bold text-white font-display">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>GTM Creative Banner Specs</span>
                  </div>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isImageLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all disabled:opacity-50 cursor-pointer border border-white/20"
                  >
                    {isImageLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>{isImageLoading ? 'Rendering...' : 'Generate Banner'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                    Subtitle / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={imageTagline}
                    onChange={(e) => setImageTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={imageBadge}
                      onChange={(e) => setImageBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                      Theme
                    </label>
                    <select
                      value={imageTheme}
                      onChange={(e) => setImageTheme(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#06080D] border border-white/[0.1] text-xs text-white font-mono focus:border-indigo-500 outline-hidden cursor-pointer shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
                    >
                      <option value="indigo">GovTech / Enterprise</option>
                      <option value="emerald">Emerald Verified</option>
                      <option value="orange">Saffron Brand</option>
                      <option value="slate">Deep Slate</option>
                    </select>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A0D16] border border-white/[0.08] text-xs text-slate-300 font-mono space-y-1">
                  <div className="text-white font-bold">Image Resolution: 1200 x 630 px</div>
                  <div className="text-slate-400">OpenGraph high-res raster asset generated for developer community distribution.</div>
                </div>
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-display font-bold text-white">
                      1200x630 Marketing Banner Preview
                    </span>
                  </div>
                  {imageResult?.success && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                      Generated: {imageResult.badge || 'GTM LAUNCH'}
                    </span>
                  )}
                </div>

                <div className="w-full aspect-[1200/630] rounded-xl bg-[#05070B] border border-white/[0.1] overflow-hidden flex items-center justify-center relative shadow-[inset_0_2px_8px_rgba(0,0,0,0.8)]">
                  {imageResult?.image_base64 || imageResult?.base64 ? (
                    <img
                      src={`data:image/png;base64,${imageResult.image_base64 || imageResult.base64}`}
                      alt="Generated GTM Creative Asset"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="w-10 h-10 text-slate-500 mx-auto" />
                      <p className="text-xs text-slate-400 font-sans">
                        Click "Generate Banner" to composite a 1200x630 launch graphic with typography and badges.
                      </p>
                    </div>
                  )}
                </div>

                {imageResult?.success && (
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                    <span className="text-xs text-slate-400 font-mono truncate max-w-xs">
                      Resolution: 1200x630 HD
                    </span>
                    <a
                      href={`data:image/png;base64,${imageResult.image_base64 || imageResult.base64}`}
                      download="launch_banner.png"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold transition-colors border border-white/[0.1] cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download PNG</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: Audio & Voice Studio                                       */}
        {/* ================================================================= */}
        {activeTab === 'audio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-bold text-white font-display">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-cyan-400" />
                    <span>Voice Input & Transcription (Speech-to-Text)</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    speechSupported ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-white/[0.05] text-slate-500 border border-white/[0.08]'
                  }`}>
                    {speechSupported ? 'Speech API Ready' : 'API Unsupported'}
                  </span>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Click the microphone to speak your command aloud. The companion transcribes your spoken words in real time.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVoiceRecording}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-xs shadow-xs transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                        : 'bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] border border-white/20'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Listening (Click to Stop)...' : 'Start Voice Input'}</span>
                  </button>

                  {transcribedText && (
                    <button
                      onClick={() => handleSpeakAloud(transcribedText)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] text-slate-200 text-xs font-mono font-bold transition-colors cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4 text-cyan-400" />
                      <span>Speak Aloud</span>
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#06080D] border border-white/[0.08] min-h-[90px] font-mono text-xs text-slate-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]">
                  {transcribedText ? (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1 font-bold">TRANSCRIBED TEXT:</span>
                      <p className="leading-relaxed text-white font-sans font-medium">{transcribedText}</p>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic font-sans text-xs">
                      {isRecording ? 'Listening to speech...' : 'Press "Start Voice Input" and speak into your microphone.'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Track Parameters & Analysis */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0F121C]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] text-xs font-bold text-white font-display">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Audio Track Parameter Inspection</span>
                  </div>
                  <button
                    onClick={handleAnalyzeAudio}
                    disabled={isAnalyzingAudio}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white text-xs font-mono font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer border border-white/[0.1]"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAudio ? 'animate-spin' : ''}`} />
                    <span>Analyze Track</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#0A0D16] border border-white/[0.08]">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Track Duration</span>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">
                      {audioAnalysis?.duration_seconds ? `${audioAnalysis.duration_seconds}s` : '6.00s'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A0D16] border border-white/[0.08]">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Sample Rate</span>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">
                      {audioAnalysis?.sample_rate ? `${audioAnalysis.sample_rate} Hz` : '44,100 Hz'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A0D16] border border-white/[0.08]">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Channels</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {audioAnalysis?.channels || 'Stereo (2 Ch)'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0A0D16] border border-white/[0.08]">
                    <span className="text-slate-500 text-[10px] font-bold uppercase">Encoding Format</span>
                    <div className="text-sm font-bold text-white mt-0.5">
                      {audioAnalysis?.format || 'MPEG Audio / WAV'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <audio
                    key={`audio-track-${mediaKey}`}
                    controls
                    className="w-full h-10 rounded-xl outline-hidden"
                    src={`http://127.0.0.1:4000/public/gtm-assets/voiceover.mp3?v=${mediaKey}`}
                  >
                    Your browser does not support audio playback.
                  </audio>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
