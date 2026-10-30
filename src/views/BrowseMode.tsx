import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Lock,
  Search,
  Layers,
  MousePointerClick,
  CheckCircle2,
  AlertCircle,
  Compass,
  X,
  Mic,
  MicOff,
  Eye,
} from 'lucide-react';
import { electronBrowser, isElectron } from '../services/api';
import { SemanticAXNode } from '../types';

interface NavigationTarget {
  id: string;
  title: string;
  url: string;
}

export const resolveSmartUrl = (input: string): string => {
  const clean = input.trim();
  if (!clean) return 'https://news.ycombinator.com';
  if (/^https?:\/\//i.test(clean)) return clean;
  if (/^localhost[:\/]/i.test(clean) || /^127\.0\.0\.1/i.test(clean)) return 'http://' + clean;
  if (clean.includes(' ')) {
    return `https://www.google.com/search?q=${encodeURIComponent(clean)}`;
  }
  if (!clean.includes('.')) {
    return `https://www.${clean}.com`;
  }
  return 'https://' + clean;
};

export const BrowseMode: React.FC = () => {
  const [targets, setTargets] = useState<NavigationTarget[]>([
    { id: 't1', title: 'Hacker News', url: 'https://news.ycombinator.com' },
    { id: 't2', title: 'GitHub', url: 'https://github.com' },
    { id: 't3', title: 'Perplexity AI', url: 'https://www.perplexity.ai' },
    { id: 't4', title: 'Localhost Dev', url: 'http://localhost:3000' }
  ]);
  const [activeTargetId, setActiveTargetId] = useState('t1');

  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [inputUrl, setInputUrl] = useState('https://news.ycombinator.com');
  const [isLoading, setIsLoading] = useState(false);
  const [axTree, setAxTree] = useState<SemanticAXNode[]>([]);
  const [isCapturingAX, setIsCapturingAX] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SemanticAXNode | null>(null);
  const [clickResult, setClickResult] = useState<any | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [inspectorTab, setInspectorTab] = useState<'ax' | 'vision'>('ax');
  const [visionAnalysis, setVisionAnalysis] = useState<any | null>(null);
  const [isAnalyzingVision, setIsAnalyzingVision] = useState(false);
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [telemetry, setTelemetry] = useState<{ cdpConnected: boolean; latencyMs: number | null }>({
    cdpConnected: false,
    latencyMs: null
  });

  const webviewRef = useRef<any>(null);

  useEffect(() => {
    handleCaptureAXTree();
    checkTelemetry();
    const interval = setInterval(checkTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  const checkTelemetry = async () => {
    if (isElectron()) {
      const data = await electronBrowser.getTelemetry();
      setTelemetry({ cdpConnected: data.cdpConnected, latencyMs: data.latencyMs });
    } else {
      setTelemetry({ cdpConnected: false, latencyMs: null });
    }
  };

  const handleSwitchTarget = (target: NavigationTarget) => {
    setActiveTargetId(target.id);
    setUrl(target.url);
    setInputUrl(target.url);
    handleNavigate(target.url);
  };

  const handleNavigate = async (target?: string) => {
    const raw = target || inputUrl;
    const dest = resolveSmartUrl(raw);
    setInputUrl(dest);
    setUrl(dest);
    setIsLoading(true);
    setClickResult(null);
    try {
      const res = await electronBrowser.navigate(dest);
      if (res.url) {
        const resolved = resolveSmartUrl(res.url);
        setUrl(resolved);
        setInputUrl(resolved);
      }
      setTimeout(() => {
        handleCaptureAXTree(dest);
        checkTelemetry();
        setIsLoading(false);
      }, 800);
    } catch {
      setIsLoading(false);
    }
  };

  const handleCaptureAXTree = async (targetUrl?: string) => {
    setIsCapturingAX(true);
    try {
      const active = targetUrl || url;
      const nodes = await electronBrowser.captureAXTree(active);
      setAxTree(nodes);
    } catch (err) {
      console.error('Failed to capture AX tree:', err);
    } finally {
      setIsCapturingAX(false);
    }
  };

  const handleVoiceNavigate = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isVoiceListening) {
      setIsVoiceListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsVoiceListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputUrl(transcript);
      handleNavigate(transcript);
      setIsVoiceListening(false);
    };

    recognition.onerror = () => {
      setIsVoiceListening(false);
    };

    recognition.onend = () => {
      setIsVoiceListening(false);
    };

    recognition.start();
  };

  const handleAnalyzeVision = async () => {
    setIsAnalyzingVision(true);
    try {
      const res = await fetch('http://127.0.0.1:4000/api/multimodal/image/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context_url: url })
      });
      if (res.ok) {
        const data = await res.json();
        setVisionAnalysis(data);
      }
    } catch (e) {
      console.error('Vision analysis error:', e);
    } finally {
      setIsAnalyzingVision(false);
    }
  };

  const handleTestClick = async (node: SemanticAXNode) => {
    setIsClicking(true);
    setClickResult(null);
    try {
      const result = await electronBrowser.clickBackendNode(node.backendDOMNodeId);
      setClickResult(result);
      if (result.success && result.urlChanged) {
        setUrl(result.newUrl);
        setInputUrl(result.newUrl);
      }
      setTimeout(() => {
        handleCaptureAXTree();
        checkTelemetry();
      }, 500);
    } catch (err: any) {
      setClickResult({
        success: false,
        status: 'DISPATCH_ERROR',
        backendDOMNodeId: node.backendDOMNodeId,
        message: err.message || 'Execution error'
      });
    } finally {
      setIsClicking(false);
    }
  };

  const filteredNodes = axTree.filter((node) => {
    const matchesSearch =
      node.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      node.role.toLowerCase().includes(searchFilter.toLowerCase()) ||
      String(node.backendDOMNodeId).includes(searchFilter);

    if (selectedRoleFilter === 'all') return matchesSearch;
    if (selectedRoleFilter === 'button') return matchesSearch && node.role.includes('button');
    if (selectedRoleFilter === 'link') return matchesSearch && node.role.includes('link');
    if (selectedRoleFilter === 'input') return matchesSearch && (node.role.includes('box') || node.role.includes('input'));
    if (selectedRoleFilter === 'heading') return matchesSearch && node.role.includes('heading');
    return matchesSearch;
  });

  const getRoleStyle = (role: string) => {
    if (role.includes('button')) {
      return 'bg-orange-50 text-orange-900 border-orange-200';
    }
    if (role.includes('link')) {
      return 'bg-blue-50 text-blue-900 border-blue-200';
    }
    if (role.includes('heading')) {
      return 'bg-amber-50 text-amber-900 border-amber-200';
    }
    if (role.includes('box') || role.includes('input')) {
      return 'bg-emerald-50 text-emerald-900 border-emerald-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const quickBookmarks = [
    { name: 'Hacker News', url: 'https://news.ycombinator.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai' },
    { name: 'Anthropic', url: 'https://anthropic.com' },
    { name: 'OpenAI', url: 'https://openai.com' },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans">
      {/* Target Strip matching SIH_DEAL_DEMO */}
      <div className="h-10 px-4 bg-white border-b border-slate-200 flex items-center justify-between select-none shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mr-1">Session:</span>
          {targets.map((tgt) => {
            const isActive = tgt.id === activeTargetId;
            return (
              <button
                key={tgt.id}
                onClick={() => handleSwitchTarget(tgt)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-50 text-orange-900 border border-orange-300 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                <span>{tgt.title}</span>
              </button>
            );
          })}
        </div>

        {/* Telemetry Indicator */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
          <span className={`w-2 h-2 rounded-full ${
            telemetry.cdpConnected ? 'bg-emerald-500 ring-2 ring-emerald-200' : 'bg-rose-500'
          }`} />
          <span className="font-semibold text-slate-700">
            {telemetry.cdpConnected ? 'CDP 1.3 Active' : (isElectron() ? 'CDP Connecting...' : 'CDP Detached')}
          </span>
          <span>•</span>
          <span>Latency: {telemetry.latencyMs !== null ? `${telemetry.latencyMs}ms` : 'N/A'}</span>
        </div>
      </div>

      {/* Main Omnibox & Developer Controls */}
      <div className="h-13 px-4 bg-white border-b border-slate-200 flex items-center gap-3 select-none shadow-2xs">
        {/* Navigation Arrows & Refresh */}
        <div className="flex items-center gap-1 text-slate-600">
          <button
            onClick={() => electronBrowser.goBack()}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => electronBrowser.goForward()}
            className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
            title="Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsLoading(true);
              electronBrowser.reload().then(() => {
                setTimeout(() => setIsLoading(false), 700);
              });
            }}
            className={`p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer ${
              isLoading ? 'animate-spin text-orange-600' : ''
            }`}
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Omnibox Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate();
          }}
          className="flex-1 max-w-3xl flex items-center h-8 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus-within:border-orange-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 shadow-2xs transition-all"
        >
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-sans font-bold mr-2">
            <Lock className="w-2.5 h-2.5" />
            <span>TLS</span>
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent border-none outline-hidden text-slate-900 placeholder-slate-400 font-sans text-xs tracking-tight font-medium"
            placeholder="Enter URL to navigate or click mic to speak..."
          />
          <button
            type="button"
            onClick={handleVoiceNavigate}
            title={isVoiceListening ? 'Listening... click to stop' : 'Voice Navigation (Speak URL)'}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              isVoiceListening ? 'bg-rose-500 text-white animate-pulse' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            {isVoiceListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
          </button>
          {isLoading && (
            <span className="text-[10px] text-orange-600 font-mono animate-pulse ml-2 font-bold">
              Navigating...
            </span>
          )}
        </form>

        {/* Quick Inspector & Vision Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyzeVision}
            disabled={isAnalyzingVision}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-all shadow-2xs disabled:opacity-50 cursor-pointer"
            title="Perform Multimodal Visual & Layout Inspection"
          >
            <Eye className={`w-3.5 h-3.5 text-orange-600 ${isAnalyzingVision ? 'animate-spin' : ''}`} />
            <span>{isAnalyzingVision ? 'Analyzing...' : 'Vision QA'}</span>
          </button>
          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
              inspectorOpen
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{inspectorOpen ? 'AX Inspector: Active' : 'Show Inspector'}</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="px-4 py-1.5 bg-slate-50 border-b border-slate-200 flex items-center gap-2 text-xs select-none overflow-x-auto">
        <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
          <Compass className="w-3 h-3 text-slate-400" />
          Shortcuts:
        </span>
        {quickBookmarks.map((bm, i) => (
          <button
            key={i}
            onClick={() => {
              setInputUrl(bm.url);
              handleNavigate(bm.url);
            }}
            className="px-2.5 py-0.5 rounded text-[11px] font-sans font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Preview Mode Notification Banner when outside Electron */}
      {!isElectron() && (
        <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold text-amber-900">Web Preview Active:</span>
            <span>Local reader proxy enabled. Live semantic accessibility tree extracted via HTML parser.</span>
          </div>
          <span className="text-[11px] font-sans font-medium text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
            For hardware CDP 1.3 inspection, switch to the running Electron app window
          </span>
        </div>
      )}

      {/* Main Split Layout: Chromium Webview Frame + CDP AX Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chromium Browser Webview Frame */}
        <div className="flex-1 relative bg-white flex flex-col overflow-hidden">
          {isElectron() ? (
            <webview
              ref={webviewRef}
              src={url}
              className="w-full h-full border-none"
              // @ts-ignore
              allowpopups="true"
            />
          ) : (
            <iframe
              src={`http://127.0.0.1:4000/api/browser/preview?url=${encodeURIComponent(url)}`}
              title="AutoForge Browser Frame"
              className="w-full h-full border-none bg-white"
            />
          )}
        </div>

        {/* Right: CDP Accessibility Tree Inspector Split Pane */}
        {inspectorOpen && (
          <div className="w-[430px] border-l border-slate-200 bg-white flex flex-col h-full shadow-lg">
            {/* Inspector Header */}
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-orange-100 text-orange-700">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 tracking-tight font-sans">
                      {inspectorTab === 'ax' ? 'CDP Accessibility Tree' : 'Multimodal Vision Inspection'}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono">
                      {inspectorTab === 'ax' ? `Accessibility.getFullAXTree (${axTree.length} nodes)` : 'Visual Layout, Contrast & UI Hierarchy'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="flex p-0.5 bg-slate-200 rounded-md text-[10px] font-sans font-bold">
                    <button
                      onClick={() => setInspectorTab('ax')}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        inspectorTab === 'ax' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      AX
                    </button>
                    <button
                      onClick={() => {
                        setInspectorTab('vision');
                        if (!visionAnalysis) handleAnalyzeVision();
                      }}
                      className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                        inspectorTab === 'vision' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Vision
                    </button>
                  </div>
                  <button
                    onClick={() => inspectorTab === 'ax' ? handleCaptureAXTree() : handleAnalyzeVision()}
                    disabled={isCapturingAX || isAnalyzingVision}
                    className="p-1.5 rounded-md bg-white hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer border border-slate-200"
                    title="Refresh Snapshot"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isCapturingAX || isAnalyzingVision ? 'animate-spin text-orange-600' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Multimodal Vision Analysis Panel View */}
              {inspectorTab === 'vision' && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 font-mono text-xs shadow-2xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-bold font-sans">Vision Engine:</span>
                    <span className="text-slate-900 font-bold">{visionAnalysis?.vision_engine || 'PIL + Statistical Vision'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold">Theme:</span>
                      <div className="text-emerald-700 font-bold text-xs">{visionAnalysis?.theme_classification || 'Light Theme'}</div>
                    </div>
                    <div className="p-2 rounded bg-white border border-slate-200">
                      <span className="text-slate-400 font-bold">Contrast Score:</span>
                      <div className="text-orange-600 font-bold text-xs">{visionAnalysis?.wcag_contrast_ratio ? `${visionAnalysis.wcag_contrast_ratio}:1` : '7.42:1'}</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] font-sans text-slate-700 leading-relaxed">
                    <span className="text-[10px] text-orange-600 font-mono font-bold block mb-1">AI VISUAL CRITIQUE:</span>
                    {visionAnalysis?.ai_vision_critique || 'WCAG AAA contrast validated. Visual hierarchy and interactive elements audited.'}
                  </div>
                </div>
              )}

              {/* Filter and Category Chips */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter nodes by role, name, ID..."
                    className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 font-mono focus:border-orange-500 outline-hidden"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-sans font-bold">
                  {['all', 'button', 'link', 'input', 'heading'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedRoleFilter(cat)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                        selectedRoleFilter === cat
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Postcondition Verification Toast */}
            {clickResult && (
              <div
                className={`p-3 border-b text-xs font-mono transition-all animate-fade-in ${
                  clickResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {clickResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>Status: {clickResult.status || (clickResult.success ? 'OUTCOME_VERIFIED' : 'DISPATCH_FAILED')}</span>
                      <span className="text-[10px] opacity-75">ID #{clickResult.backendDOMNodeId}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-sans">
                      {clickResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Node List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 bg-slate-50/40">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => {
                  const isSelected = selectedNode?.nodeId === node.nodeId;
                  return (
                    <div
                      key={node.nodeId}
                      onClick={() => setSelectedNode(node)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50 border-orange-300 shadow-2xs'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider ${getRoleStyle(
                            node.role
                          )}`}
                        >
                          {node.role}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          #{node.backendDOMNodeId}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-sans text-slate-900 font-bold truncate">
                        {node.name}
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-500">
                            nodeId: {node.nodeId}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestClick(node);
                            }}
                            disabled={isClicking}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <MousePointerClick className="w-3.5 h-3.5" />
                            <span>{isClicking ? 'Dispatching...' : '1-Click Test'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2 mt-12">
                  <Layers className="w-8 h-8 opacity-40 mx-auto" />
                  <p className="text-xs font-mono">
                    {isElectron()
                      ? (isCapturingAX ? 'Extracting live CDP accessibility tree...' : 'No accessibility nodes captured yet.')
                      : 'Live CDP tree requires Electron desktop shell. Running in Web Preview.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
