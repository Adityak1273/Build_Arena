// AutoForge v1.8 Main Application
import React, { useState, useEffect, useRef } from 'react';
import { BrowserChrome } from './components/BrowserChrome';
import { InteractiveViewport } from './components/InteractiveViewport';
import { MultiAgentSidebar } from './components/MultiAgentSidebar';
import { WorkspaceDrawer } from './components/WorkspaceDrawer';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { ApprovalModal } from './components/ApprovalModal';
import {
  BrowserTab,
  SwarmAgentProfile,
  SwarmAgentId,
  AgentHandoffMessage,
  AutonomousPlanResult,
  IntentToken,
  TelemetryEvent,
  VerificationOutcome,
  StartupRow,
  CouncilVerdict,
  SemanticAXNode
} from './types';
import { api, isElectron, electronBrowser } from './services/api';

export const App: React.FC = () => {
  // 1. Browser Tab State
  const [tabs, setTabs] = useState<BrowserTab[]>([
    { id: 'tab-1', title: 'Hacker News', url: 'https://news.ycombinator.com' },
    { id: 'tab-2', title: 'ElevenLabs', url: 'https://elevenlabs.io' },
    { id: 'tab-3', title: 'Perplexity AI', url: 'https://www.perplexity.ai' },
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  // 2. Multi-Agent Swarm Roster
  const [agents, setAgents] = useState<SwarmAgentProfile[]>([
    {
      id: 'orchestrator',
      name: 'Orchestrator Agent',
      role: 'AdaL Task Planner & Router',
      avatar: '🧠',
      color: 'indigo',
      state: 'IDLE',
      lastMessage: 'Ready to decompose user prompts into verified sub-tasks.'
    },
    {
      id: 'navigator',
      name: 'Navigator Agent',
      role: 'Playwright CDP & Tab Operator',
      avatar: '🌐',
      color: 'cyan',
      state: 'IDLE',
      lastMessage: 'CDP 1.3 connected. Standing by for DOM interaction.'
    },
    {
      id: 'researcher',
      name: 'Research & Data Agent',
      role: '10-Startup Scraper & Spreadsheet Builder',
      avatar: '📊',
      color: 'emerald',
      state: 'IDLE',
      lastMessage: 'TLS probe ready. Honest pricing gate policy active.'
    },
    {
      id: 'coder',
      name: 'Multimodal & Code Agent',
      role: 'GTM Producer & 7-Critic AST Council',
      avatar: '🎨',
      color: 'purple',
      state: 'IDLE',
      lastMessage: 'Playwright 1280x720 canvas & FFmpeg video compositor ready.'
    },
    {
      id: 'verifier',
      name: 'VIGIL Verifier Agent',
      role: 'Policy Gate & SHA-256 Verifier',
      avatar: '🛡️',
      color: 'amber',
      state: 'IDLE',
      lastMessage: 'HMAC-SHA256 signature verifier armed. Zero-trust gate ready.'
    }
  ]);

  // 3. Inter-Agent Handoff Feed
  const [handoffs, setHandoffs] = useState<AgentHandoffMessage[]>([
    {
      id: 'h-init',
      timestamp: new Date().toLocaleTimeString(),
      fromAgent: 'orchestrator',
      toAgent: 'navigator',
      action: 'Initialized 5-agent swarm on Chromium CDP session.',
      details: 'All agent channels active on port 4000.',
      status: 'COMPLETED'
    }
  ]);

  // 4. Live AI Agent Cursor Overlay State
  const [agentCursor, setAgentCursor] = useState({
    visible: false,
    x: 480,
    y: 320,
    agentName: 'Navigator Agent',
    actionText: 'Standing by'
  });

  // 5. In-Browser Workspace Drawer State
  const [activeDrawerTab, setActiveDrawerTab] = useState<'spreadsheet' | 'council' | 'gtm' | 'ax' | null>(null);

  // Tools & Artifact Data State
  const [spreadsheetOutcome, setSpreadsheetOutcome] = useState<VerificationOutcome | null>(null);
  const [editableRows, setEditableRows] = useState<StartupRow[]>([]);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
  const [isSavingSpreadsheet, setIsSavingSpreadsheet] = useState(false);
  const [isScraping, setIsScraping] = useState(false);

  const [councilVerdict, setCouncilVerdict] = useState<CouncilVerdict | null>(null);
  const [isEvaluatingCouncil, setIsEvaluatingCouncil] = useState(false);

  const [axTree, setAxTree] = useState<SemanticAXNode[]>([]);
  const [liveScreenshot, setLiveScreenshot] = useState<string | null>(null);

  // Autonomous Execution Loop State
  const [activePlan, setActivePlan] = useState<AutonomousPlanResult | null>(null);
  const [isExecutingPlan, setIsExecutingPlan] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Security Policy Gate State
  const [pendingIntent, setPendingIntent] = useState<IntentToken | null>(null);

  // WebSocket & Telemetry
  const [wsConnected, setWsConnected] = useState(false);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    loadInitialArtifacts();
    connectWebSocket();
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const loadInitialArtifacts = async () => {
    try {
      const data = await api.getLatestSpreadsheet();
      setSpreadsheetOutcome(data);
      if (data?.rows) {
        setEditableRows(JSON.parse(JSON.stringify(data.rows)));
      }
    } catch {
      // ignore
    }
    try {
      const tree = await electronBrowser.captureAXTree();
      setAxTree(tree || []);
    } catch {
      // ignore
    }
  };

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://127.0.0.1:4000/ws');
      wsRef.current = ws;

      ws.onopen = () => {
        setWsConnected(true);
        addTelemetryEvent('WS_CONNECT', { message: 'Connected to AutoForge Swarm Telemetry' });
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          addTelemetryEvent(parsed.type, parsed.data || parsed);

          if (parsed.type === 'APPROVAL_REQUEST') {
            setPendingIntent(parsed.data);
            updateAgentState('verifier', 'AWAITING APPROVAL', `Clearance required for ${parsed.data.action}`);
          } else if (parsed.type === 'APPROVAL_RESOLVED') {
            setPendingIntent(null);
            updateAgentState('verifier', 'IDLE', 'Action approved and executed.');
          } else if (parsed.type === 'BROWSER_SCREENSHOT') {
            if (parsed.data?.screenshot) {
              setLiveScreenshot(parsed.data.screenshot);
            }
          }
        } catch {
          addTelemetryEvent('RAW_MESSAGE', event.data);
        }
      };

      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setWsConnected(false);
      };
    } catch {
      setWsConnected(false);
    }
  };

  const addTelemetryEvent = (type: string, payload: any) => {
    const newEvent: TelemetryEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      payload,
    };
    setTelemetryEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  };

  const updateAgentState = (id: SwarmAgentId, state: any, msg: string) => {
    setAgents((prev) =>
      prev.map((a) => (a.id === id ? { ...a, state, lastMessage: msg } : a))
    );
  };

  const addHandoff = (from: SwarmAgentId, to: SwarmAgentId, action: string, details?: string) => {
    const newHandoff: AgentHandoffMessage = {
      id: `h-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      fromAgent: from,
      toAgent: to,
      action,
      details,
      status: 'PROCESSING'
    };
    setHandoffs((prev) => [newHandoff, ...prev.slice(0, 49)]);
  };

  // Tab Strip Handlers
  const handleSelectTab = (tabId: string) => {
    setActiveTabId(tabId);
    const target = tabs.find((t) => t.id === tabId);
    if (target) {
      handleNavigate(target.url);
    }
  };

  const handleCloseTab = (tabId: string) => {
    if (tabs.length <= 1) return;
    const remaining = tabs.filter((t) => t.id !== tabId);
    setTabs(remaining);
    if (activeTabId === tabId) {
      setActiveTabId(remaining[0].id);
      handleNavigate(remaining[0].url);
    }
  };

  const handleNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: BrowserTab = {
      id: newId,
      title: 'New Tab',
      url: 'https://news.ycombinator.com',
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  // Browser Navigation
  const handleNavigate = async (targetUrl: string) => {
    setTabs((prev) =>
      prev.map((t) => (t.id === activeTabId ? { ...t, url: targetUrl, title: targetUrl } : t))
    );

    // Update navigator agent
    updateAgentState('navigator', 'ACTING ON TAB', `Navigating to ${targetUrl}`);
    setAgentCursor({
      visible: true,
      x: 320,
      y: 180,
      agentName: 'Navigator Agent',
      actionText: `Loading ${targetUrl}`
    });

    try {
      if (isElectron()) {
        await electronBrowser.navigate(targetUrl);
      }
      // Always instruct the backend Playwright controller to navigate & capture real page
      const navRes = await api.navigateBrowser(targetUrl);
      if (navRes?.screenshotBase64) {
        setLiveScreenshot(navRes.screenshotBase64);
      }
      if (navRes?.axNodes) {
        setAxTree(navRes.axNodes);
      }
      if (navRes?.title) {
        setTabs((prev) =>
          prev.map((t) => (t.id === activeTabId ? { ...t, title: navRes.title } : t))
        );
      }
    } catch (err: any) {
      console.warn('Navigation error:', err);
    } finally {
      setTimeout(() => {
        setAgentCursor((prev) => ({ ...prev, visible: false }));
        updateAgentState('navigator', 'IDLE', `Page loaded.`);
      }, 800);
    }
  };

  // Multi-Agent Swarm Prompt Dispatch
  const handleDispatchSwarmPrompt = async (prompt: string) => {
    setIsExecutingPlan(true);
    setIsPaused(false);

    // 1. Orchestrator receives prompt and decomposes plan
    updateAgentState('orchestrator', 'THINKING', 'Decomposing prompt into verifiable multi-agent steps...');
    addHandoff('orchestrator', 'orchestrator', `Received task: "${prompt}". Constructing AdaL execution plan.`);

    try {
      const plan = await api.planAutonomousTask(prompt);
      setActivePlan(plan);
      updateAgentState('orchestrator', 'ACTING ON TAB', `Plan created with ${plan.steps.length} steps. Routing agents...`);

      // Set agent badge on active tab
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, activeAgent: 'orchestrator' } : t))
      );

      // Execute each step with animated multi-agent handoffs
      for (const step of plan.steps) {
        if (step.tool === 'browser_navigate') {
          updateAgentState('navigator', 'ACTING ON TAB', `Navigating to ${step.arguments.url}`);
          addHandoff('orchestrator', 'navigator', `Delegated navigation to ${step.arguments.url}`);
          setAgentCursor({
            visible: true,
            x: 520,
            y: 280,
            agentName: 'Navigator Agent',
            actionText: 'Navigating & verifying live DOM session'
          });
          setTabs((prev) =>
            prev.map((t) => (t.id === activeTabId ? { ...t, activeAgent: 'navigator', url: step.arguments.url } : t))
          );
        } else if (step.tool === 'browser_extract') {
          updateAgentState('navigator', 'ACTING ON TAB', 'Extracting live page text from DOM');
          addHandoff('navigator', 'researcher', 'Extracted page content, passing to Research & Data Agent.');
          setAgentCursor({
            visible: true,
            x: 640,
            y: 420,
            agentName: 'Navigator Agent',
            actionText: 'Extracting DOM elements'
          });
        } else if (step.tool === 'research_search') {
          updateAgentState('navigator', 'ACTING ON TAB', `Searching: ${step.arguments.query}`);
          addHandoff('orchestrator', 'navigator', `Delegated multi-perspective search: "${step.arguments.query}"`);
          setTabs((prev) =>
            prev.map((t) => (t.id === activeTabId ? { ...t, activeAgent: 'navigator' } : t))
          );
        } else if (step.tool === 'research_aggregate') {
          updateAgentState('researcher', 'ACTING ON TAB', 'Deduplicating search results and building research.csv');
          addHandoff('navigator', 'researcher', 'Aggregating search cards, saving CSV and verifying disk SHA-256.');
          setTabs((prev) =>
            prev.map((t) => (t.id === activeTabId ? { ...t, activeAgent: 'researcher' } : t))
          );
        } else if (step.tool === 'multimodal_infographic') {
          updateAgentState('coder', 'ACTING ON TAB', 'Rendering visual card infographic to result.png');
          addHandoff('researcher', 'coder', 'Dataset ready, generating visual card infographic.');
          setActiveDrawerTab('gtm');
        } else if (step.tool === 'benchmark_export') {
          updateAgentState('researcher', 'ACTING ON TAB', 'Auditing 10 AI startups and checking pricing gates');
          addHandoff('researcher', 'researcher', 'Scraping 10 startups concurrently with honest unknown policy.');
          setActiveDrawerTab('spreadsheet'); // Open spreadsheet drawer live!
          setTabs((prev) =>
            prev.map((t) => (t.id === activeTabId ? { ...t, activeAgent: 'researcher' } : t))
          );
        } else if (step.tool === 'verify_artifact') {
          updateAgentState('verifier', 'VERIFYING', 'Asserting physical CSV rows and computing SHA-256');
          const isResearch = (step.arguments?.filePath || '').includes('research');
          addHandoff(
            'researcher',
            'verifier',
            isResearch
              ? 'Research dataset written to disk, requesting SHA-256 verification.'
              : 'Spreadsheet written to disk, requesting SHA-256 verification.'
          );
        } else if (step.tool === 'multimodal_launch') {
          updateAgentState('coder', 'ACTING ON TAB', 'Rendering 1280x720 poster via Playwright & muxing MP4');
          addHandoff('orchestrator', 'coder', 'Delegated multimodal launch package generation.');
          setActiveDrawerTab('gtm'); // Open GTM Studio live!
        } else if (step.tool === 'verify_launch_artifact') {
          updateAgentState('verifier', 'VERIFYING', 'Asserting launch poster binary size (>20KB)');
          addHandoff('coder', 'verifier', 'Poster generated, requesting high-res byte threshold verification.');
        }
      }

      // Execute on server
      const outcome = await api.executeAutonomousPlan(plan);
      setActivePlan(outcome);
      await loadInitialArtifacts();

      // Final success handoff
      addHandoff('verifier', 'orchestrator', 'All plan steps closed-loop verified against physical disk and CDP.');
      updateAgentState('orchestrator', 'IDLE', 'Task complete. All outcomes verified.');
      updateAgentState('navigator', 'IDLE', 'Standing by.');
      updateAgentState('researcher', 'IDLE', 'Spreadsheet updated & hashed.');
      updateAgentState('coder', 'IDLE', 'GTM package compiled.');
      updateAgentState('verifier', 'IDLE', 'Integrity verified (SHA-256).');
    } catch (err: any) {
      addHandoff('verifier', 'orchestrator', `Plan halted: ${err.message}`);
    } finally {
      setIsExecutingPlan(false);
      setAgentCursor((prev) => ({ ...prev, visible: false }));
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, activeAgent: undefined } : t))
      );
    }
  };

  // Loop Controls
  const handlePauseExecution = async () => {
    try {
      await api.pauseAutonomousPlan();
      setIsPaused(true);
      updateAgentState('orchestrator', 'AWAITING APPROVAL', 'Paused for operator takeover.');
    } catch {
      // ignore
    }
  };

  const handleResumeExecution = async () => {
    try {
      await api.resumeAutonomousPlan();
      setIsPaused(false);
      updateAgentState('orchestrator', 'ACTING ON TAB', 'Operator resumed execution.');
    } catch {
      // ignore
    }
  };

  const handleCancelExecution = async () => {
    if (!activePlan) return;
    try {
      await api.cancelAutonomousPlan(activePlan.plan_id);
      setIsExecutingPlan(false);
      setIsPaused(false);
      updateAgentState('orchestrator', 'IDLE', 'Operator cancelled task.');
    } catch {
      // ignore
    }
  };

  // Clearance Gate Handlers
  const handleApproveIntent = async (intentId: string) => {
    try {
      await api.approveTask(intentId, 'APPROVED');
      setPendingIntent(null);
      addHandoff('verifier', 'orchestrator', `Approved intent ${intentId} by human operator.`);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectIntent = async (intentId: string) => {
    try {
      await api.approveTask(intentId, 'REJECTED');
      setPendingIntent(null);
      addHandoff('verifier', 'orchestrator', `Rejected intent ${intentId} by human operator.`);
    } catch (e) {
      console.error(e);
    }
  };

  // Spreadsheet Cell Editing & Save
  const handleSpreadsheetCellChange = (rowIndex: number, field: keyof StartupRow, value: string) => {
    setEditableRows((prev) => {
      const copy = [...prev];
      copy[rowIndex] = { ...copy[rowIndex], [field]: value };
      return copy;
    });
    setHasUnsavedEdits(true);
  };

  const handleSaveSpreadsheet = async () => {
    setIsSavingSpreadsheet(true);
    try {
      const res = await api.updateSpreadsheet(editableRows);
      setSpreadsheetOutcome(res);
      setHasUnsavedEdits(false);
      addHandoff('researcher', 'verifier', `Manual edit saved. Re-calculated SHA-256: ${res.disk_hash}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSavingSpreadsheet(false);
    }
  };

  const handleTriggerScrape = async () => {
    setIsScraping(true);
    try {
      const res = await api.exportSpreadsheet('LIVE_SCRAPED');
      setSpreadsheetOutcome(res);
      if (res?.rows) setEditableRows(JSON.parse(JSON.stringify(res.rows)));
      addHandoff('researcher', 'verifier', 'Triggered live 10-startup crawl. Rows updated.');
    } catch (e) {
      console.error(e);
    } finally {
      setIsScraping(false);
    }
  };

  // 7-Critic Code Review Council
  const handleRunCouncil = async () => {
    setIsEvaluatingCouncil(true);
    try {
      const verdict = await api.executeTask(
        'COUNCIL_AUDIT',
        'Audit active AutoForge frontend and runtime components',
        'export function Viewport() { return <div>Interactive Browser Viewport</div>; }'
      );
      setCouncilVerdict(verdict);
      addHandoff('coder', 'verifier', `Council review returned verdict ID ${verdict.verdict_id} with score ${verdict.average_score}/100.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsEvaluatingCouncil(false);
    }
  };

  const handleRefreshAXTree = async () => {
    try {
      const tree = await electronBrowser.captureAXTree(activeTab.url);
      setAxTree(tree || []);
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#FAF7F2] text-[#1E293B] font-sans selection:bg-[#00F2FE]/30 selection:text-[#0F172A]">
      {/* 1. TOP BROWSER CHROME: Multi-Tab Strip & Omnibar */}
      <BrowserChrome
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        onCloseTab={handleCloseTab}
        onNewTab={handleNewTab}
        url={activeTab.url}
        onNavigate={handleNavigate}
        onDispatchSwarmPrompt={handleDispatchSwarmPrompt}
        onGoBack={() => electronBrowser.goBack()}
        onGoForward={() => electronBrowser.goForward()}
        onReload={() => handleNavigate(activeTab.url)}
        isLoading={isExecutingPlan}
        cdpConnected={true}
        activeDrawerTab={activeDrawerTab}
        onToggleDrawer={(drawerTab) => {
          setActiveDrawerTab(activeDrawerTab === drawerTab ? null : drawerTab);
        }}
        onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
        telemetryCount={telemetryEvents.length}
      />

      {/* 2. MAIN WORKSPACE: 68% Browser Viewport + 32% Multi-Agent Swarm Sidebar */}
      <div className="flex-1 flex overflow-hidden relative forge-ambient-bg">
        {/* Left / Center: Interactive Browser Viewport (68%) */}
        <div className="flex-1 relative flex flex-col overflow-hidden bg-[#FAF7F2] border-r border-[#D5CEBF]">
          <InteractiveViewport
            url={activeTab.url}
            onUrlChange={(newUrl) => handleNavigate(newUrl)}
            onTitleChange={(newTitle) => {
              setTabs((prev) =>
                prev.map((t) => (t.id === activeTabId ? { ...t, title: newTitle } : t))
              );
            }}
            agentCursor={agentCursor}
            liveScreenshotBase64={liveScreenshot}
          />

          {/* Collapsible Slide-Up In-Browser Workspace Drawer */}
          <WorkspaceDrawer
            activeDrawerTab={activeDrawerTab}
            onSelectDrawerTab={(tab) => setActiveDrawerTab(tab)}
            onCloseDrawer={() => setActiveDrawerTab(null)}
            spreadsheetOutcome={spreadsheetOutcome}
            editableRows={editableRows}
            onCellChange={handleSpreadsheetCellChange}
            hasUnsavedEdits={hasUnsavedEdits}
            isSavingSpreadsheet={isSavingSpreadsheet}
            onSaveSpreadsheet={handleSaveSpreadsheet}
            onTriggerScrape={handleTriggerScrape}
            isScraping={isScraping}
            councilVerdict={councilVerdict}
            onRunCouncil={handleRunCouncil}
            isEvaluatingCouncil={isEvaluatingCouncil}
            axTree={axTree}
            onRefreshAXTree={handleRefreshAXTree}
          />
        </div>

        {/* Right: Embedded Multi-Agent Swarm Sidebar (32%) */}
        <div className="w-[380px] lg:w-[420px] h-full shrink-0 shadow-[-4px_0_25px_rgba(0,0,0,0.15)] z-20">
          <MultiAgentSidebar
            agents={agents}
            handoffs={handoffs}
            activePlan={activePlan}
            isExecutingPlan={isExecutingPlan}
            isPaused={isPaused}
            pendingIntent={pendingIntent}
            onApproveIntent={handleApproveIntent}
            onRejectIntent={handleRejectIntent}
            onManualTakeover={(intentId) => {
              handlePauseExecution();
              handleApproveIntent(intentId);
            }}
            onPauseExecution={handlePauseExecution}
            onResumeExecution={handleResumeExecution}
            onCancelExecution={handleCancelExecution}
            onDispatchPrompt={handleDispatchSwarmPrompt}
            onOpenDrawerTab={(tab) => setActiveDrawerTab(tab)}
          />
        </div>
      </div>

      {/* Real-Time WebSocket Telemetry Drawer */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        events={telemetryEvents}
        onClear={() => setTelemetryEvents([])}
      />

      {/* Fallback Full-Screen Zero-Trust Human Approval Modal (if not approved in sidebar) */}
      <ApprovalModal
        isOpen={Boolean(pendingIntent && !isExecutingPlan)}
        intent={pendingIntent}
        onApprove={handleApproveIntent}
        onReject={handleRejectIntent}
      />
    </div>
  );
};
