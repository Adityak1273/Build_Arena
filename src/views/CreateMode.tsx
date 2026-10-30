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
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-y-auto bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Top Header Card */}
      <div className="p-4 sm:p-5 bg-white border-b border-slate-200 shadow-2xs select-none">
        <div className="max-w-6xl mx-auto space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gradient-to-r from-slate-50 via-white to-orange-50/30 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
                <Film className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight font-sans">
                    Multimodal Intelligence & GTM Studio
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[10px] font-bold border border-orange-200">
                    Pillar 2 Multimodal
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  1080p Video Compositor • Creative Image Generator • Spoken Audio Voice Synthesis
                </p>
              </div>
            </div>

            {/* Mode Switcher Tabs matching SIH_DEAL_DEMO */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold shadow-2xs">
              <button
                onClick={() => setActiveTab('video')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>1. 1080p Video</span>
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'image'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>2. Image Generator</span>
              </button>
              <button
                onClick={() => setActiveTab('audio')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                  activeTab === 'audio'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>3. Audio & Voice</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Studio Body */}
      <div className="p-4 sm:p-6 max-w-6xl mx-auto w-full">
        {/* ================================================================= */}
        {/* TAB 1: 1080p Video Compositor                                     */}
        {/* ================================================================= */}
        {activeTab === 'video' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <span>Video Campaign Metadata</span>
                  </div>
                  <button
                    onClick={handleGenerateVideo}
                    disabled={isVideoLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Headline
                  </label>
                  <input
                    type="text"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                  <div className="mt-2 space-y-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suggested Headlines:</span>
                    {headlinesPreset.map((hp, i) => (
                      <button
                        key={i}
                        onClick={() => setHeadline(hp)}
                        className="block text-left text-[11px] text-slate-600 hover:text-orange-600 truncate w-full cursor-pointer transition-colors"
                      >
                        • {hp}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Voiceover Script
                    </label>
                    <span className="text-[10px] font-mono text-slate-400">
                      {script.length} characters
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden resize-none leading-relaxed"
                  />
                  <p className="mt-1 text-[10px] text-slate-400 font-mono">
                    Composited via genuine frame generator + FFmpeg H.264 / AAC at 1920x1080.
                  </p>
                </div>
              </div>

              {/* Specs Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs font-mono shadow-2xs">
                <div className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  Pipeline Architecture
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold text-slate-500">Video Engine:</span>
                  <span className="text-slate-900 font-bold">1080p Canvas + FFmpeg Compositor</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold text-slate-500">Audio Track:</span>
                  <span className="text-orange-600 font-bold">Spoken Narration (SpeechSynthesizer)</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-semibold text-slate-500">Output Artifact:</span>
                  <span className="text-emerald-700 font-bold">artifacts/autoforge_gtm_1080p.mp4</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-slate-900">
                      1080p MP4 Video Preview
                    </span>
                  </div>
                  {videoResult?.success && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                      1920x1080 ({videoResult.video_size_bytes ? `${Math.round(videoResult.video_size_bytes / 1024)} KB` : 'Verified'})
                    </span>
                  )}
                </div>

                <div className="w-full aspect-video rounded-xl bg-slate-900 border border-slate-300 overflow-hidden flex items-center justify-center relative shadow-inner">
                  <video
                    key={mediaKey}
                    controls
                    className="w-full h-full object-cover"
                    src={`http://127.0.0.1:4000/artifacts/autoforge_gtm_1080p.mp4?v=${mediaKey}`}
                  >
                    Your browser does not support video playback.
                  </video>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-mono truncate max-w-xs">
                    Path: artifacts/autoforge_gtm_1080p.mp4
                  </span>
                  <a
                    href="http://127.0.0.1:4000/artifacts/autoforge_gtm_1080p.mp4"
                    download="autoforge_gtm_1080p.mp4"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
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
        {/* TAB 2: Creative Image Generator                                   */}
        {/* ================================================================= */}
        {activeTab === 'image' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span>GTM Creative Banner Specs</span>
                  </div>
                  <button
                    onClick={handleGenerateImage}
                    disabled={isImageLoading}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
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
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Banner Title
                  </label>
                  <input
                    type="text"
                    value={imageTitle}
                    onChange={(e) => setImageTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subtitle / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={imageTagline}
                    onChange={(e) => setImageTagline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Badge Text
                    </label>
                    <input
                      type="text"
                      value={imageBadge}
                      onChange={(e) => setImageBadge(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Theme
                    </label>
                    <select
                      value={imageTheme}
                      onChange={(e) => setImageTheme(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 font-medium focus:bg-white focus:border-orange-500 outline-hidden cursor-pointer"
                    >
                      <option value="indigo">GovTech / Enterprise</option>
                      <option value="emerald">Emerald Verified</option>
                      <option value="orange">Saffron Brand</option>
                      <option value="slate">Deep Slate</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 font-mono space-y-1">
                  <div className="text-slate-900 font-bold">Image Resolution: 1200 x 630 px</div>
                  <div>OpenGraph high-res raster asset generated for developer community distribution.</div>
                </div>
              </div>
            </div>

            {/* Image Preview Canvas */}
            <div className="lg:col-span-7 space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    <span className="text-xs font-bold text-slate-900">
                      1200x630 Marketing Banner Preview
                    </span>
                  </div>
                  {imageResult?.success && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-mono font-bold">
                      Generated: {imageResult.badge || 'GTM LAUNCH'}
                    </span>
                  )}
                </div>

                <div className="w-full aspect-[1200/630] rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {imageResult?.image_base64 || imageResult?.base64 ? (
                    <img
                      src={`data:image/png;base64,${imageResult.image_base64 || imageResult.base64}`}
                      alt="Generated GTM Creative Asset"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2">
                      <ImageIcon className="w-10 h-10 text-slate-400 mx-auto" />
                      <p className="text-xs text-slate-500 font-sans">
                        Click "Generate Banner" to composite a 1200x630 launch graphic with typography and badges.
                      </p>
                    </div>
                  )}
                </div>

                {imageResult?.success && (
                  <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500 font-mono truncate max-w-xs">
                      Resolution: 1200x630 HD
                    </span>
                    <a
                      href={`data:image/png;base64,${imageResult.image_base64 || imageResult.base64}`}
                      download="launch_banner.png"
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
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
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Mic className="w-4 h-4 text-orange-600" />
                    <span>Voice Input & Transcription (Speech-to-Text)</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    speechSupported ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {speechSupported ? 'Speech API Ready' : 'API Unsupported'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 font-sans leading-relaxed">
                  Click the microphone to speak your command aloud. The companion transcribes your spoken words in real time.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVoiceRecording}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-bold text-xs shadow-xs transition-all cursor-pointer ${
                      isRecording
                        ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                        : 'bg-orange-600 hover:bg-orange-700 text-white'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isRecording ? 'Listening (Click to Stop)...' : 'Start Voice Input'}</span>
                  </button>

                  {transcribedText && (
                    <button
                      onClick={() => handleSpeakAloud(transcribedText)}
                      className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                    >
                      <Volume2 className="w-4 h-4 text-orange-600" />
                      <span>Speak Aloud</span>
                    </button>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 min-h-[90px] font-mono text-xs text-slate-800">
                  {transcribedText ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-1 font-bold">TRANSCRIBED TEXT:</span>
                      <p className="leading-relaxed text-slate-900 font-sans font-medium">{transcribedText}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic font-sans text-xs">
                      {isRecording ? 'Listening to speech...' : 'Press "Start Voice Input" and speak into your microphone.'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Audio Track Parameters & Analysis */}
            <div className="lg:col-span-6 space-y-4">
              <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-orange-600" />
                    <span>Audio Track Parameter Inspection</span>
                  </div>
                  <button
                    onClick={handleAnalyzeAudio}
                    disabled={isAnalyzingAudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingAudio ? 'animate-spin' : ''}`} />
                    <span>Analyze Track</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Track Duration</span>
                    <div className="text-sm font-bold text-emerald-700 mt-0.5">
                      {audioAnalysis?.duration_seconds ? `${audioAnalysis.duration_seconds}s` : '6.00s'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Sample Rate</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {audioAnalysis?.sample_rate ? `${audioAnalysis.sample_rate} Hz` : '44,100 Hz'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Channels</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {audioAnalysis?.channels || 'Stereo (2 Ch)'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-400 text-[10px] font-bold uppercase">Encoding Format</span>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {audioAnalysis?.format || 'MPEG Audio / WAV'}
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <audio
                    key={`audio-track-${mediaKey}`}
                    controls
                    className="w-full h-10 rounded-lg outline-hidden"
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
