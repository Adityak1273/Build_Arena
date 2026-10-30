import React, { useRef, useState, useEffect } from 'react';
import { isElectron, electronBrowser, api } from '../services/api';
import { LiveAgentCursor } from './LiveAgentCursor';
import { RefreshCw, ExternalLink, Globe } from 'lucide-react';

interface InteractiveViewportProps {
  url: string;
  onUrlChange: (newUrl: string) => void;
  onTitleChange?: (newTitle: string) => void;
  agentCursor: {
    visible: boolean;
    x: number;
    y: number;
    agentName: string;
    actionText: string;
  };
  liveScreenshotBase64?: string | null;
}

export const InteractiveViewport: React.FC<InteractiveViewportProps> = ({
  url,
  onUrlChange,
  onTitleChange,
  agentCursor,
  liveScreenshotBase64,
}) => {
  const inElectron = isElectron();
  const containerRef = useRef<HTMLDivElement>(null);
  const webviewRef = useRef<any>(null);
  const [screenshot, setScreenshot] = useState<string | null>(liveScreenshotBase64 || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTypingFocus, setIsTypingFocus] = useState(false);

  useEffect(() => {
    if (liveScreenshotBase64) {
      setScreenshot(liveScreenshotBase64);
    }
  }, [liveScreenshotBase64]);

  useEffect(() => {
    if (inElectron && webviewRef.current && url) {
      try {
        const currentSrc = webviewRef.current.getURL ? webviewRef.current.getURL() : '';
        if (currentSrc !== url && typeof webviewRef.current.loadURL === 'function') {
          webviewRef.current.loadURL(url);
        }
      } catch {
        // ignore
      }
    }
  }, [url, inElectron]);

  useEffect(() => {
    const webview = webviewRef.current;
    if (!webview) return;

    const handleDidNavigate = (e: any) => {
      if (e.url && e.url !== url && !e.url.includes('about:blank')) {
        onUrlChange(e.url);
      }
    };

    const handleTitleUpdated = (e: any) => {
      if (e.title && onTitleChange && !e.title.toLowerCase().includes('just a moment')) {
        onTitleChange(e.title);
      }
    };

    webview.addEventListener('did-navigate', handleDidNavigate);
    webview.addEventListener('did-navigate-in-page', handleDidNavigate);
    webview.addEventListener('page-title-updated', handleTitleUpdated);

    return () => {
      webview.removeEventListener('did-navigate', handleDidNavigate);
      webview.removeEventListener('did-navigate-in-page', handleDidNavigate);
      webview.removeEventListener('page-title-updated', handleTitleUpdated);
    };
  }, [url, onUrlChange, onTitleChange]);

  // Initial load
  useEffect(() => {
    let active = true;
    const fetchInitial = async () => {
      try {
        const state = await api.getBrowserState();
        if (active && state?.screenshotBase64) {
          setScreenshot(state.screenshotBase64);
        }
      } catch {
        // ignore
      }
    };
    fetchInitial();
    return () => { active = false; };
  }, [url]);

  // Handle interactive clicks on the canvas
  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Scale to standard 1280x800 resolution
    const scaledX = Math.round((clickX / rect.width) * 1280);
    const scaledY = Math.round((clickY / rect.height) * 800);

    setIsLoading(true);
    try {
      const res = await api.interactWithBrowser({
        type: 'click',
        x: scaledX,
        y: scaledY,
      });
      if (res?.screenshotBase64) {
        setScreenshot(res.screenshotBase64);
      }
      if (res?.url && res.url !== url) {
        onUrlChange(res.url);
      }
    } catch (err) {
      console.warn('Canvas click interaction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle mouse wheel scrolling
  const handleCanvasWheel = async (e: React.WheelEvent<HTMLDivElement>) => {
    try {
      const res = await api.interactWithBrowser({
        type: 'wheel',
        deltaX: e.deltaX,
        deltaY: e.deltaY,
      });
      if (res?.screenshotBase64) {
        setScreenshot(res.screenshotBase64);
      }
    } catch {
      // ignore
    }
  };

  // Handle keyboard typing directly on viewport
  const handleKeyDown = async (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Tab') return;
    try {
      if (e.key.length === 1) {
        const res = await api.interactWithBrowser({ type: 'type', text: e.key });
        if (res?.screenshotBase64) setScreenshot(res.screenshotBase64);
      } else {
        const res = await api.interactWithBrowser({ type: 'key', key: e.key });
        if (res?.screenshotBase64) setScreenshot(res.screenshotBase64);
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onFocus={() => setIsTypingFocus(true)}
      onBlur={() => setIsTypingFocus(false)}
      onKeyDown={handleKeyDown}
      onClick={handleCanvasClick}
      onWheel={handleCanvasWheel}
      className="relative w-full h-full bg-[#FAF7F2] overflow-hidden outline-hidden select-none cursor-default group"
    >
      {/* Live AI Agent Cursor Overlay */}
      <LiveAgentCursor
        visible={agentCursor.visible}
        x={agentCursor.x}
        y={agentCursor.y}
        agentName={agentCursor.agentName}
        actionText={agentCursor.actionText}
      />

      {/* Interactive Mode Badge & Keyboard Focus Ring */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2 pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
        <span className="px-3 py-1 rounded-full bg-white/95 text-[#0F766E] text-[10px] font-mono font-bold border border-[#D5CEBF] shadow-xs backdrop-blur-md flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488] animate-ping" />
          Interactive CDP Viewport ({inElectron ? 'Electron Webview' : 'Hardware Mouse/Scroll Forwarding'})
        </span>

        {isTypingFocus && (
          <span className="px-2 py-0.5 rounded-full bg-[#00F2FE]/15 text-[#0F766E] text-[10px] font-mono border border-[#0D9488]/40">
            Keyboard Active
          </span>
        )}
      </div>

      {isLoading && (
        <div className="absolute top-3 right-3 z-20 px-3 py-1 rounded-full bg-white/95 text-[#0F766E] text-[10px] font-mono font-bold border border-[#D5CEBF] shadow-xs flex items-center gap-1.5">
          <RefreshCw className="w-3 h-3 animate-spin text-[#00F2FE]" />
          <span>Dispatching CDP Input...</span>
        </div>
      )}

      {/* Native Electron Webview Tag (when in Electron) */}
      {inElectron ? (
        <div className="w-full h-full relative">
          <webview
            ref={webviewRef}
            src={url}
            // @ts-ignore
            allowpopups="true"
            partition="persist:autoforge"
            useragent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            className="w-full h-full"
            style={{ display: 'inline-flex', width: '100%', height: '100%' }}
          />
        </div>
      ) : screenshot ? (
        /* Real-Time Interactive Canvas (dual mode outside Electron) */
        <img
          src={`data:image/jpeg;base64,${screenshot}`}
          alt="Interactive Chromium Webpage"
          className="w-full h-full object-contain pointer-events-none select-none"
        />
      ) : (
        /* Standby state */
        <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-3">
          <Globe className="w-10 h-10 text-slate-600 animate-pulse" />
          <p className="text-slate-400">Loading live interactive Chromium session for {url}...</p>
        </div>
      )}
    </div>
  );
};
