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
} from 'lucide-react';
import { electronBrowser, isElectron } from '../services/api';
import { SemanticAXNode } from '../types';

export const BrowseMode: React.FC = () => {
  const [url, setUrl] = useState('https://news.ycombinator.com');
  const [inputUrl, setInputUrl] = useState('https://news.ycombinator.com');
  const [isLoading, setIsLoading] = useState(false);
  const [axTree, setAxTree] = useState<SemanticAXNode[]>([]);
  const [isCapturingAX, setIsCapturingAX] = useState(false);
  const [selectedNode, setSelectedNode] = useState<SemanticAXNode | null>(null);
  const [clickResult, setClickResult] = useState<any | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const webviewRef = useRef<any>(null);

  // Load initial AX Tree
  useEffect(() => {
    handleCaptureAXTree();
  }, []);

  const handleNavigate = async (target?: string) => {
    const dest = target || inputUrl;
    setIsLoading(true);
    setClickResult(null);
    try {
      const res = await electronBrowser.navigate(dest);
      setUrl(res.url);
      setInputUrl(res.url);
      setTimeout(() => {
        handleCaptureAXTree();
        setIsLoading(false);
      }, 1200);
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
      // Re-fetch AX snapshot to verify diff
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

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden bg-[#0a0d14]">
      {/* Top Browser Chrome Bar */}
      <div className="h-12 px-4 bg-[#111520] border-b border-[#23293d] flex items-center gap-3 select-none">
        <div className="flex items-center gap-1 text-slate-400">
          <button
            onClick={() => electronBrowser.goBack()}
            className="p-1.5 rounded-lg hover:bg-[#171c2b] hover:text-white transition-colors"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => electronBrowser.goForward()}
            className="p-1.5 rounded-lg hover:bg-[#171c2b] hover:text-white transition-colors"
            title="Go Forward"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setIsLoading(true);
              electronBrowser.reload().then(() => {
                setTimeout(() => setIsLoading(false), 800);
              });
            }}
            className={`p-1.5 rounded-lg hover:bg-[#171c2b] hover:text-white transition-colors ${
              isLoading ? 'animate-spin text-blue-400' : ''
            }`}
            title="Reload"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>

        {/* Address Omnibox */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleNavigate();
          }}
          className="flex-1 max-w-2xl flex items-center h-8 px-3 rounded-full bg-[#0a0d14] border border-[#23293d] text-xs font-mono text-slate-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
        >
          <Lock className="w-3.5 h-3.5 text-emerald-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 font-sans text-xs"
            placeholder="Search or enter website address..."
          />
          {isLoading && (
            <span className="text-[10px] text-blue-400 animate-pulse ml-2">
              Loading...
            </span>
          )}
        </form>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCaptureAXTree}
            disabled={isCapturingAX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isCapturingAX ? 'Reading AX...' : 'Inspect CDP Tree'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Chromium Webview + CDP AXTree Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Chromium Browser Webview Frame */}
        <div className="flex-1 relative bg-white flex flex-col overflow-hidden">
          {isElectron() ? (
            /* Real Chromium <webview> rendered inside Electron */
            <webview
              ref={webviewRef}
              src={url}
              className="w-full h-full border-none"
              // @ts-ignore
              allowpopups="true"
            />
          ) : (
            /* Standard iframe fallback for web browser preview */
            <iframe
              src={url}
              title="AutoForge Browser View"
              className="w-full h-full border-none"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          )}

          {/* Verification Overlay Toast */}
          {clickResult && (
            <div className="absolute bottom-4 left-4 max-w-md p-3.5 rounded-xl bg-[#111520]/95 backdrop-blur-md border border-[#23293d] shadow-2xl animate-slide-up text-xs font-sans text-slate-200 z-20">
              <div className="flex items-center gap-2 font-bold mb-1">
                {clickResult.success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Postcondition Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400">Execution Alert</span>
                  </>
                )}
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
                {clickResult.message}
              </p>
              {clickResult.axDiffCount > 0 && (
                <div className="mt-2 flex items-center gap-3 text-[10px] font-mono text-slate-400 pt-2 border-t border-[#23293d]">
                  <span>AX Delta: +{clickResult.axDiffCount} nodes</span>
                  <span>URL Changed: {clickResult.urlChanged ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Real CDP Accessibility Tree Inspector */}
        <div className="w-80 md:w-96 bg-[#0e121b] border-l border-[#23293d] flex flex-col h-full font-mono text-xs select-none">
          <div className="p-3.5 border-b border-[#23293d] bg-[#111520] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span className="font-bold text-slate-200">CDP 1.3 AX Tree</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px]">
              {axTree.length} Nodes
            </span>
          </div>

          <div className="p-2 border-b border-[#23293d] bg-[#0a0d14] text-[10px] text-slate-400">
            Click any semantic node to dispatch a verified CDP click postcondition assertion.
          </div>

          {/* Node List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            {axTree.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                Capturing accessibility tree...
              </div>
            ) : (
              axTree.map((node) => {
                const isSelected = selectedNode?.backendDOMNodeId === node.backendDOMNodeId;
                return (
                  <div
                    key={`${node.nodeId}-${node.backendDOMNodeId}`}
                    onClick={() => setSelectedNode(node)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                        : 'bg-[#141926] border-[#23293d] text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#1e2538] text-blue-300">
                        {node.role}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        #{node.backendDOMNodeId}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-sans font-medium text-slate-100 truncate">
                      {node.name}
                    </div>

                    {isSelected && (
                      <div className="mt-2 pt-2 border-t border-blue-500/30 flex items-center justify-between">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTestClick(node);
                          }}
                          disabled={isClicking}
                          className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-sans font-semibold shadow-sm transition-all"
                        >
                          <MousePointerClick className="w-3.5 h-3.5" />
                          <span>{isClicking ? 'Verifying Click...' : '1-Click Test Click'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Node Details Footnote */}
          {selectedNode && (
            <div className="p-3 bg-[#111520] border-t border-[#23293d] text-[10px] text-slate-400 space-y-1">
              <div>
                <span className="text-slate-500">Selected NodeId: </span>
                <span className="text-slate-200">{selectedNode.nodeId}</span>
              </div>
              <div>
                <span className="text-slate-500">BackendDOMNode: </span>
                <span className="text-blue-400 font-bold">
                  {selectedNode.backendDOMNodeId}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
