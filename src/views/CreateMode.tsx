import React, { useState, useEffect } from 'react';
import {
  Video,
  Mic,
  MicOff,
  Play,
  Download,
  Sparkles,
  Layers,
  FileCheck,
  Film,
  Volume2,
  RefreshCw,
  AlertTriangle,
  Info,
  Image as ImageIcon,
  Radio,
  Sliders,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { GTMResult } from '../types';

export const CreateMode: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'video' | 'image' | 'audio'>('video');

  // Video State
  const [title, setTitle] = useState('AutoForge Launchpad');
  const [headline, setHeadline] = useState(
    'AI-Native Developer Browser with CDP Accessibility Trees & 7-Reviewer Council'
  );
  const [script, setScript] = useState(
    'Introducing AutoForge. The AI-native desktop developer browser. Featuring native Chromium CDP accessibility automation, a seven-reviewer anti-boilerplate council, and independent disk outcome assertions.'
  );
  const [isVideoLoading, setIsVideoLoading] = useState(false);
  const [videoResult, setVideoResult] = useState<GTMResult | null>(null);
  const [mediaKey, setMediaKey] = useState(Date.now());

  // Image Generation State
  const [imageTitle, setImageTitle] = useState('AutoForge v2.3');
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
    // Check Web Speech API support
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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#07090e] text-slate-100 font-sans">
      {/* Top Header & Multimodal Studio Nav */}
      <div className="p-4 bg-[#0d111a] border-b border-white/[0.08] select-none">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight font-sans">
                Multimodal Intelligence & GTM Studio
              </h2>
              <p className="text-xs text-slate-400">
                Pillar 2 Hackathon Suite: 1080p Video Compositor • Creative Image Generator • Audio & Voice Synthesis
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#07090e] border border-white/[0.08] rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('video')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'video'
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>1. 1080p Video</span>
            </button>
            <button
              onClick={() => setActiveTab('image')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'image'
                  ? 'bg-purple-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>2. Image Generator</span>
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                activeTab === 'audio'
                  ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>3. Audio & Voice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 overflow-y-auto p-6 max-w-6xl mx-auto w-full">
        {/* ================================================================= */}
        {/* TAB 1: 1080p Video Compositor                                     */}
        {/* ================================================================= */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>Video Campaign Metadata</span>
                  </div>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isVideoLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    {isVideoLoading ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Film className="w-3.5 h-3.5" />
                    )}
                    <span>{isVideoLoading ? 'Compositing...' : 'Render MP4'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-indigo-500 outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-indigo-500 outline-none font-sans"
                  />
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] text-slate-500 font-mono">Suggested Headlines:</span>
                    {headlinesPreset.map((hp, i) => (
                      <button
                        key={i}
                        onClick={() => setHeadline(hp)}
                        className="block text-left text-[11px] text-indigo-400 hover:text-indigo-300 truncate w-full"
                      >
                        • {hp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-slate-400">
                      Voiceover Script
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {script.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-indigo-500 outline-none font-sans resize-none leading-relaxed"
                  />
                  <p className="mt-1 text-[10px] text-slate-500 font-mono">
                    Composited via Pillow frame generator + FFmpeg H.264 / AAC at 1920x1080.
                  </p>
                </div>
              </div>

              {/* Specs Box */}
              <div className="p-4 rounded-xl bg-[#090d14] border border-white/[0.08] space-y-2 text-xs font-mono">
                <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  Pipeline Architecture
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Video Engine:</span>
                  <span className="text-slate-200">Pillow 1080p Canvas + imageio-ffmpeg</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Audio Track:</span>
                  <span className="text-indigo-400">ElevenLabs Live (or Acoustic Tone)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Output Artifact:</span>
                  <span className="text-emerald-400 font-bold">artifacts/autoforge_gtm_1080p.mp4</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">
                      1080p MP4 Video Preview
                    </span>
                  </div>
                  {videoResult?.success && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      1920x1080 ({videoResult.video_size_bytes ? `${Math.round(videoResult.video_size_bytes / 1024)} KB` : 'Verified'})
                    </span>
                  )}
                </div>

                <div className="w-full aspect-video rounded-xl bg-[#07090e] border border-white/[0.08] overflow-hidden flex items-center justify-center relative">
                  <video
                    key={mediaKey}
                    controls
                    className="w-full h-full object-cover"
                    src={`http://127.0.0.1:4000/artifacts/autoforge_gtm_1080p.mp4?v=${mediaKey}`}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                  <span className="text-xs text-slate-400 font-mono truncate max-w-xs">
                    Path: artifacts/autoforge_gtm_1080p.mp4
                  </span>
                  <a
                    href="http://127.0.0.1:4000/artifacts/autoforge_gtm_1080p.mp4"
                    download="autoforge_gtm_1080p.mp4"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download MP4</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: Creative Image Generator (1200x630 Social & Hero Card)     */}
        {/* ================================================================= */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span>GTM Creative Banner Specs</span>
                  </div>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isImageLoading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
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
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-purple-500 outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Subtitle / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={imageTagline}
                    onChange={(e) => setImageTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-purple-500 outline-none font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={imageBadge}
                      onChange={(e) => setImageBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-purple-500 outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Color Palette Theme
                    </label>
                    <select
                      value={imageTheme}
                      onChange={(e) => setImageTheme(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#07090e] border border-white/[0.08] text-xs text-slate-100 focus:border-purple-500 outline-none font-sans"
                    >
                      <option value="indigo">Indigo Cyberpunk</option>
                      <option value="emerald">Emerald Neon</option>
                      <option value="cyan">Deep Cyan</option>
                      <option value="purple">Cosmic Purple</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#07090e] border border-white/[0.06] text-xs text-slate-400 font-mono space-y-1">
                  <div className="text-white font-bold">Image Resolution: 1200 x 630 px</div>
                  <div>Standard OpenGraph / Twitter Card high-res raster asset generated with Pillow canvas.</div>
                </div>
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-200">
                      1200x630 Marketing Banner Preview
                    </span>
                  </div>
                  {imageResult?.success && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                      Generated: {imageResult.filename}
                    </span>
                  )}
                </div>

                <div className="w-full aspect-[1200/630] rounded-xl bg-[#07090e] border border-white/[0.08] overflow-hidden flex items-center justify-center relative">
                  {imageResult?.base64 ? (
                    <img
                      src={imageResult.base64}
                      alt="Generated GTM Creative Asset"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="w-12 h-12 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-sans">
                        Click "Generate Banner" to composite a 1200x630 launch graphic with typography and badges.
                      </p>
                    </div>
                  )}
                </div>

                {imageResult?.success && (
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/[0.08]">
                    <span className="text-xs text-slate-400 font-mono truncate max-w-xs">
                      Path: artifacts/launch_banner.png
                    </span>
                    <a
                      href={imageResult.base64}
                      download="launch_banner.png"
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
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
              {/* Voice Transcription (Speech-to-Text) Card */}
              <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-emerald-400" />
                    <span>Voice Input & Transcription (Speech-to-Text)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                    speechSupported ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {speechSupported ? 'Web Speech API Ready' : 'API Unsupported'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  Click the microphone to speak your command aloud. The companion transcribes your spoken words in real time.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVoiceRecording}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs shadow-lg transition-all ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Listening (Click to Stop)...' : 'Start Voice Input'}</span>
                  </button>

                  {transcribedText && (
                    <button
                      onClick={() => handleSpeakAloud(transcribedText)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold transition-colors"
                    >
                      <Volume2 className="w-4 h-4 text-indigo-400" />
                      <span>Speak Aloud</span>
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-[#07090e] border border-white/[0.08] min-h-[90px] font-mono text-xs text-slate-200">
                  {transcribedText ? (
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-1">TRANSCRIBED TEXT:</span>
                      <p className="leading-relaxed text-emerald-300 font-sans">{transcribedText}</p>
                    </div>
                  ) : (
                    <span className="text-slate-500 italic">
                      {isRecording ? 'Listening to speech...' : 'Press "Start Voice Input" and speak into your microphone.'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Track Parameters & Analysis */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-2xl bg-[#0e121b] border border-white/[0.08] shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/[0.08] text-xs font-bold text-slate-200">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    <span>Audio Track Parameter Inspection</span>
                  </div>
                  <button
                    onClick={handleAnalyzeAudio}
                    disabled={isAnalyzingAudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAudio ? 'animate-spin' : ''}`} />
                    <span>Analyze Track</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/[0.06]">
                    <span className="text-slate-500 text-[10px]">Track Duration</span>
                    <div className="text-sm font-bold text-emerald-400">
                      {audioAnalysis?.duration_seconds ? `${audioAnalysis.duration_seconds}s` : '4.00s'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/[0.06]">
                    <span className="text-slate-500 text-[10px]">Sample Rate</span>
                    <div className="text-sm font-bold text-indigo-400">
                      {audioAnalysis?.sample_rate ? `${audioAnalysis.sample_rate} Hz` : '44,100 Hz'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/[0.06]">
                    <span className="text-slate-500 text-[10px]">Channels</span>
                    <div className="text-sm font-bold text-purple-400">
                      {audioAnalysis?.channels || 'Mono (1 Ch)'}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-[#07090e] border border-white/[0.06]">
                    <span className="text-slate-500 text-[10px]">Encoding Format</span>
                    <div className="text-sm font-bold text-slate-200">
                      {audioAnalysis?.format || '16-bit PCM WAV'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <audio
                    key={`audio-track-${mediaKey}`}
                    controls
                    className="w-full h-10 rounded-lg outline-none"
                    src={`http://127.0.0.1:4000/artifacts/latest_gtm_audio.wav?v=${mediaKey}`}
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
