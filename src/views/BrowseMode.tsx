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
  ExternalLink,
  Sparkles,
  SlidersHorizontal,
  Compass,
  Check,
  Plus,
  X,
  Laptop,
  AlertTriangle,
} from 'lucide-react';
import { electronBrowser, isElectron } from '../services/api';
import { SemanticAXNode } from '../types';

interface NavigationTarget {
  id: string;
  title: string;
  url: string;
}

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
    const dest = target || inputUrl;
    setIsLoading(true);
    setClickResult(null);
    try {
      const res = await electronBrowser.navigate(dest);
      if (res.url) {
        setUrl(res.url);
        setInputUrl(res.url);
      }
      setTimeout(() => {
        handleCaptureAXTree();
        checkTelemetry();
        setIsLoading(false);
      }, 1000);
    } catch {
      setIsLoading(false);
    }
  };

  const handleCaptureAXTree = async () => {
    setIsCapturingAX(true);
    try {
      const tree = await electronBrowser.captureAXTree();
      setAxTree(tree);
      if (tree.length > 0) {
        setSelectedNode(tree[0]);
      } else {
        setSelectedNode(null);
      }
    } catch (e) {
      console.error(e);
      setAxTree([]);
    } finally {
      setIsCapturingAX(false);
    }
  };

  const handleTestClick = async (node: SemanticAXNode) => {
    setSelectedNode(node);
    setIsClicking(true);
    setClickResult(null);
    try {
      const result = await electronBrowser.clickBackendNode(node.backendDOMNodeId);
      setClickResult(result);
      if (result.newUrl && result.newUrl !== url) {
        setUrl(result.newUrl);
        setInputUrl(result.newUrl);
      }
      setTimeout(() => {
        handleCaptureAXTree();
        checkTelemetry();
      }, 600);
    } catch (err: any) {
      setClickResult({
        success: false,
        status: 'DISPATCH_FAILED',
        message: err.message || 'CDP Click Dispatch Failed',
      });
    } finally {
      setIsClicking(false);
    }
  };

  // Filter nodes by role and search string
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
      return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    }
    if (role.includes('link')) {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    }
    if (role.includes('heading')) {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
    if (role.includes('box') || role.includes('input')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    }
    return 'bg-white/[0.06] text-slate-300 border-white/[0.08]';
  };

  const quickBookmarks = [
    { name: 'Hacker News', url: 'https://news.ycombinator.com' },
    { name: 'GitHub', url: 'https://github.com' },
    { name: 'Perplexity', url: 'https://www.perplexity.ai' },
    { name: 'Anthropic', url: 'https://anthropic.com' },
    { name: 'OpenAI', url: 'https://openai.com' },
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#07090e]">
      {/* Target Strip */}
      <div className="h-9 px-3 bg-[#0a0d14] border-b border-white/[0.06] flex items-center justify-between select-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          <span className="text-[10px] text-slate-500 font-mono mr-2">Target:</span>
          {targets.map((tgt) => {
            const isActive = tgt.id === activeTargetId;
            return (
              <button
                key={tgt.id}
                onClick={() => handleSwitchTarget(tgt)}
                className={`group flex items-center gap-2 px-3 py-1 rounded-t-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#111622] text-white border-t border-x border-white/[0.1] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                <span className="truncate max-w-[120px]">{tgt.title}</span>
              </button>
            );
          })}
        </div>

        {/* Real Telemetry Indicator */}
        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className={`flex items-center gap-1 ${telemetry.cdpConnected ? 'text-emerald-400' : 'text-slate-500'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${telemetry.cdpConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {telemetry.cdpConnected ? 'CDP 1.3 Active' : (isElectron() ? 'CDP Connecting...' : 'CDP Detached')}
          </span>
          <span>•</span>
          <span>Latency: {telemetry.latencyMs !== null ? `${telemetry.latencyMs}ms` : 'N/A'}</span>
        </div>
      </div>

      {/* Main Omnibox & Developer Controls */}
      <div className="h-12 px-4 bg-[#0d111a] border-b border-white/[0.08] flex items-center gap-3 select-none">
        {/* Navigation Arrows & Refresh */}
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => electronBrowser.goBack()}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => electronBrowser.goForward()}
            className="p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors"
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
            className={`p-1.5 rounded-lg hover:bg-white/[0.06] hover:text-white transition-colors ${
              isLoading ? 'animate-spin text-indigo-400' : ''
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
          className="flex-1 max-w-3xl flex items-center h-8 px-3 rounded-full bg-[#07090e] border border-white/[0.09] text-xs font-mono text-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-inner transition-all"
        >
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/[0.12] border border-emerald-500/30 text-emerald-400 text-[10px] font-sans font-bold mr-2">
            <Lock className="w-2.5 h-2.5" />
            <span>TLS</span>
          </div>
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 font-sans text-xs tracking-tight"
            placeholder="Enter URL to navigate..."
          />
          {isLoading && (
            <span className="text-[10px] text-indigo-400 font-mono animate-pulse ml-2">
              Navigating...
            </span>
          )}
        </form>

        {/* Quick Inspector Toggle Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setInspectorOpen(!inspectorOpen)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              inspectorOpen
                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-white border border-white/[0.08]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{inspectorOpen ? 'AX Inspector: Active' : 'Show Inspector'}</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="px-4 py-1.5 bg-[#0a0d14] border-b border-white/[0.04] flex items-center gap-2 text-xs select-none overflow-x-auto">
        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
          <Compass className="w-3 h-3 text-slate-500" />
          Shortcuts:
        </span>
        {quickBookmarks.map((bm, i) => (
          <button
            key={i}
            onClick={() => {
              setInputUrl(bm.url);
              handleNavigate(bm.url);
            }}
            className="px-2 py-0.5 rounded text-[11px] font-sans text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] transition-colors"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* Preview Mode Notification Banner when outside Electron */}
      {!isElectron() && (
        <div className="px-4 py-2 bg-amber-950/40 border-b border-amber-800/40 text-amber-300 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Web Preview Mode: Electron Chromium Shell & CDP 1.3 debugger are detached.</span>
          </div>
          <span className="text-[10px] text-amber-400/80">Launch with `npm start` for full hardware CDP automation</span>
        </div>
      )}

      {/* Main Split Layout: Chromium Webview Frame + CDP AX Inspector */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chromium Browser Webview Frame */}
        <div className="flex-1 relative bg-[#07090e] flex flex-col overflow-hidden">
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
              src={url}
              title="AutoForge Browser Frame"
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          )}
        </div>

        {/* Right: CDP Accessibility Tree Inspector Split Pane */}
        {inspectorOpen && (
          <div className="w-[430px] border-l border-white/[0.08] bg-[#0c1018] flex flex-col h-full shadow-2xl">
            {/* Inspector Header */}
            <div className="p-3.5 bg-[#090d14] border-b border-white/[0.08] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight font-sans">
                      CDP Accessibility Tree
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono">
                      Accessibility.getFullAXTree ({axTree.length} semantic nodes)
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCaptureAXTree}
                  disabled={isCapturingAX}
                  className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                  title="Refresh Accessibility Snapshot"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isCapturingAX ? 'animate-spin text-indigo-400' : ''}`} />
                </button>
              </div>

              {/* Filter and Category Chips */}
              <div className="space-y-1.5">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Filter nodes by role, name, ID..."
                    className="w-full pl-8 pr-3 py-1 bg-[#06080e] border border-white/[0.08] rounded-md text-xs text-slate-200 placeholder-slate-500 font-mono focus:border-indigo-500 outline-none"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[10px] font-mono">
                  {['all', 'button', 'link', 'input', 'heading'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedRoleFilter(cat)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors ${
                        selectedRoleFilter === cat
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-white/[0.03] text-slate-400 hover:text-slate-200'
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
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  {clickResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 space-y-1">
                    <div className="font-bold flex items-center justify-between">
                      <span>Status: {clickResult.status || (clickResult.success ? 'OUTCOME_VERIFIED' : 'DISPATCH_FAILED')}</span>
                      <span className="text-[10px] opacity-75">ID #{clickResult.backendDOMNodeId}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      {clickResult.message}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Node List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-white/[0.03]">
              {filteredNodes.length > 0 ? (
                filteredNodes.map((node) => {
                  const isSelected = selectedNode?.nodeId === node.nodeId;
                  return (
                    <div
                      key={node.nodeId}
                      onClick={() => setSelectedNode(node)}
                      className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/30 border-indigo-500/50 shadow-sm'
                          : 'bg-transparent border-transparent hover:bg-white/[0.02]'
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
                        <span className="text-[10px] font-mono text-slate-500">
                          #{node.backendDOMNodeId}
                        </span>
                      </div>
                      <div className="mt-1 text-xs font-sans text-slate-200 font-medium truncate">
                        {node.name}
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-white/[0.06] flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">
                            nodeId: {node.nodeId}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestClick(node);
                            }}
                            disabled={isClicking}
                            className="flex items-center gap-1.5 px-3 py-1 rounded bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs shadow-sm transition-all disabled:opacity-50"
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
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2 mt-12">
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
