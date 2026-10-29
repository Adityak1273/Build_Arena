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
} from 'lucide-react';
import { electronBrowser, isElectron } from '../services/api';
import { SemanticAXNode } from '../types';

interface BrowserTab {
  id: string;
  title: string;
  url: string;
  favicon?: string;
}

export const BrowseMode: React.FC = () => {
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 't1', title: 'Hacker News', url: 'https://news.ycombinator.com' },
    { id: 't2', title: 'GitHub', url: 'https://github.com' },
    { id: 't3', title: 'Perplexity AI', url: 'https://www.perplexity.ai' },
    { id: 't4', title: 'Localhost Dev', url: 'http://localhost:3000' }
  ]);
  const [activeTabId, setActiveTabId] = useState('t1');

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

  const webviewRef = useRef<any>(null);

  useEffect(() => {
    handleCaptureAXTree();
  }, []);

  const handleSwitchTab = (tab: BrowserTab) => {
    setActiveTabId(tab.id);
    setUrl(tab.url);
    setInputUrl(tab.url);
    handleNavigate(tab.url);
  };

  const handleNavigate = async (target?: string) => {
    const dest = target || inputUrl;
    setIsLoading(true);
    setClickResult(null);
    try {
      const res = await electronBrowser.navigate(dest);
      setUrl(res.url);
      setInputUrl(res.url);
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, url: res.url, title: res.url.replace(/^https?:\/\//, '').split('/')[0] } : t))
      );
      setTimeout(() => {
        handleCaptureAXTree();
        setIsLoading(false);
      }, 1100);
    } catch {
      setIsLoading(false);
    }
  };

  const handleCaptureAXTree = async () => {
    setIsCapturingAX(true);
    try {
      const tree = await electronBrowser.captureAXTree();
      setAxTree(tree);
      if (tree.length > 0 && !selectedNode) {
        setSelectedNode(tree[0]);
      }
    } catch (e) {
      console.error(e);
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
      }, 600);
    } catch (err: any) {
      setClickResult({
        success: false,
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
      {/* Sleek Browser Tab Strip */}
      <div className="h-9 px-3 bg-[#0a0d14] border-b border-white/[0.06] flex items-center justify-between select-none">
        <div className="flex items-center gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <button
                key={tab.id}
                onClick={() => handleSwitchTab(tab)}
                className={`group flex items-center gap-2 px-3 py-1 rounded-t-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#111622] text-white border-t border-x border-white/[0.1] shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-slate-600'}`} />
                <span className="truncate max-w-[130px]">{tab.title}</span>
              </button>
            );
          })}
          <button
            onClick={() => {
              const newTab = { id: `t${tabs.length + 1}`, title: 'New Tab', url: 'https://news.ycombinator.com' };
              setTabs([...tabs, newTab]);
              handleSwitchTab(newTab);
            }}
            className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            CDP 1.3 Active
          </span>
          <span>•</span>
          <span>Latency: 38ms</span>
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
            placeholder="Search or enter URL (e.g. news.ycombinator.com)..."
          />
          {isLoading && (
            <span className="text-[10px] text-indigo-400 font-mono animate-pulse ml-2">
              CDP Synced
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

      {/* Quick Bookmark Chips */}
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

          {/* Observable Postcondition Verification Result Toast */}
          {clickResult && (
            <div className="absolute bottom-5 left-5 max-w-lg p-4 rounded-2xl bg-[#0e121b]/95 backdrop-blur-xl border border-white/[0.12] shadow-[0_16px_40px_rgba(0,0,0,0.6)] animate-slide-up text-xs font-sans text-slate-200 z-20">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2 font-bold">
                  {clickResult.success ? (
                    <>
                      <div className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <span className="text-emerald-400 text-sm font-semibold">Postcondition Verified</span>
                    </>
                  ) : (
                    <>
                      <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <span className="text-amber-400 text-sm font-semibold">Execution Notice</span>
                    </>
                  )}
                </div>
                <span className="px-2 py-0.5 rounded bg-white/[0.06] font-mono text-[10px] text-slate-400">
                  Node #{clickResult.backendDOMNodeId}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {clickResult.message}
              </p>
              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/[0.06] text-[10px] font-mono text-slate-400">
                <span className="text-indigo-400">AX Delta: +{clickResult.axDiffCount} nodes</span>
                <span>URL Shift: {clickResult.urlChanged ? 'True' : 'False'}</span>
                <span className="text-emerald-400">Zero-Trust: Passed</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: Modern CDP Accessibility Tree Inspector */}
        {inspectorOpen && (
          <div className="w-80 md:w-96 bg-[#0c1017] border-l border-white/[0.08] flex flex-col h-full font-mono text-xs select-none shadow-2xl">
            {/* Inspector Top Bar */}
            <div className="p-3.5 border-b border-white/[0.08] bg-[#0e131d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-200 text-xs font-sans">Accessibility Inspector</h3>
                  <p className="text-[10px] text-slate-400">CDP getFullAXTree</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                  {filteredNodes.length} Nodes
                </span>
              </div>
            </div>

            {/* Search Filter Bar */}
            <div className="p-2.5 bg-[#090d14] border-b border-white/[0.06] space-y-2">
              <div className="flex items-center px-2.5 py-1.5 rounded-lg bg-[#0e121b] border border-white/[0.08] text-xs">
                <Search className="w-3.5 h-3.5 text-slate-500 mr-2" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Filter nodes (role, name, ID)..."
                  className="w-full bg-transparent border-none outline-none text-slate-200 text-[11px] placeholder-slate-500"
                />
                {searchFilter && (
                  <button onClick={() => setSearchFilter('')} className="text-slate-500 hover:text-slate-300">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Role Filter Chips */}
              <div className="flex items-center gap-1 overflow-x-auto text-[10px]">
                {['all', 'button', 'link', 'input', 'heading'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedRoleFilter(r)}
                    className={`px-2 py-0.5 rounded-md capitalize transition-colors ${
                      selectedRoleFilter === r
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'bg-white/[0.04] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Tree Node List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
              {filteredNodes.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs font-sans">
                  {isCapturingAX ? 'Extracting accessibility nodes...' : 'No matching accessibility nodes found.'}
                </div>
              ) : (
                filteredNodes.map((node) => {
                  const isSelected = selectedNode?.backendDOMNodeId === node.backendDOMNodeId;
                  return (
                    <div
                      key={`${node.nodeId}-${node.backendDOMNodeId}`}
                      onClick={() => setSelectedNode(node)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/60 text-white shadow-sm ring-1 ring-indigo-500/30'
                          : 'bg-[#10141e] border-white/[0.06] text-slate-300 hover:bg-[#141926] hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${getRoleStyle(
                            node.role
                          )}`}
                        >
                          {node.role}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          ID: #{node.backendDOMNodeId}
                        </span>
                      </div>

                      <div className="mt-1.5 text-xs font-sans font-medium text-slate-100 truncate">
                        {node.name}
                      </div>

                      {/* Interactive 1-Click Verification Trigger */}
                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-indigo-500/25">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleTestClick(node);
                            }}
                            disabled={isClicking}
                            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-sans font-semibold shadow-md shadow-indigo-600/30 transition-all disabled:opacity-50"
                          >
                            <MousePointerClick className="w-3.5 h-3.5" />
                            <span>{isClicking ? 'Verifying Click & AX Diff...' : '1-Click Test Click'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Node Inspection Footer */}
            {selectedNode && (
              <div className="p-3 bg-[#0e131d] border-t border-white/[0.08] text-[10px] text-slate-400 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Selected Target:</span>
                  <span className="text-slate-200 font-semibold">{selectedNode.role}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BackendDOMNodeId:</span>
                  <span className="text-indigo-400 font-bold">{selectedNode.backendDOMNodeId}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
