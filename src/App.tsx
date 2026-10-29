import React, { useState, useEffect, useRef } from 'react';
import { NavigationBar } from './components/NavigationBar';
import { TelemetryDrawer } from './components/TelemetryDrawer';
import { ApprovalModal } from './components/ApprovalModal';
import { BrowseMode } from './views/BrowseMode';
import { BuildMode } from './views/BuildMode';
import { AutomateMode } from './views/AutomateMode';
import { CreateMode } from './views/CreateMode';
import { ForgeMode, TelemetryEvent } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<ForgeMode>('browse');
  const [wsConnected, setWsConnected] = useState(false);
  const [telemetryEvents, setTelemetryEvents] = useState<TelemetryEvent[]>([]);
  const [isTelemetryOpen, setIsTelemetryOpen] = useState(false);

  // Approval modal state
  const [pendingIntent, setPendingIntent] = useState<any | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let reconnectTimeout: any = null;

    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        wsRef.current = ws;

        ws.onopen = () => {
          setWsConnected(true);
          addTelemetryEvent('WS_CONNECT', { message: 'Connected to AutoForge Backend Telemetry' });
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            addTelemetryEvent(parsed.type, parsed.data || parsed);

            if (parsed.type === 'APPROVAL_REQUEST') {
              setPendingIntent(parsed.data);
            } else if (parsed.type === 'APPROVAL_RESOLVED') {
              setPendingIntent(null);
            }
          } catch {
            addTelemetryEvent('RAW_MESSAGE', event.data);
          }
        };

        ws.onclose = () => {
          setWsConnected(false);
          reconnectTimeout = setTimeout(connectWebSocket, 2500);
        };

        ws.onerror = () => {
          setWsConnected(false);
        };
      } catch (err) {
        setWsConnected(false);
        reconnectTimeout = setTimeout(connectWebSocket, 3000);
      }
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const addTelemetryEvent = (type: string, payload: any) => {
    const newEvent: TelemetryEvent = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      payload,
    };
    setTelemetryEvents((prev) => [newEvent, ...prev.slice(0, 99)]);
  };

  const handleApproveIntent = async (intentId: string) => {
    try {
      await api.approveTask(intentId, 'APPROVED');
      setPendingIntent(null);
      addTelemetryEvent('APPROVAL_SENT', { intent_id: intentId, decision: 'APPROVED' });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectIntent = async (intentId: string) => {
    try {
      await api.approveTask(intentId, 'REJECTED');
      setPendingIntent(null);
      addTelemetryEvent('APPROVAL_REJECTED', { intent_id: intentId, decision: 'REJECTED' });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0a0d14] text-slate-100 font-sans">
      {/* Top Main Navigation Bar */}
      <NavigationBar
        activeMode={activeMode}
        onSelectMode={(mode) => setActiveMode(mode)}
        wsConnected={wsConnected}
        onToggleTelemetry={() => setIsTelemetryOpen(!isTelemetryOpen)}
        telemetryCount={telemetryEvents.length}
      />

      {/* 4 Core Modes */}
      <main className="flex-1 overflow-hidden relative">
        {activeMode === 'browse' && <BrowseMode />}
        {activeMode === 'build' && <BuildMode />}
        {activeMode === 'automate' && <AutomateMode />}
        {activeMode === 'create' && <CreateMode />}
      </main>

      {/* Real-Time WebSocket Telemetry Drawer */}
      <TelemetryDrawer
        isOpen={isTelemetryOpen}
        onClose={() => setIsTelemetryOpen(false)}
        events={telemetryEvents}
        onClear={() => setTelemetryEvents([])}
      />

      {/* Zero-Trust Human Approval Modal */}
      <ApprovalModal
        isOpen={Boolean(pendingIntent)}
        intent={pendingIntent}
        onApprove={handleApproveIntent}
        onReject={handleRejectIntent}
      />
    </div>
  );
};
