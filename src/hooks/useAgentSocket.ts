import { useState, useEffect, useRef, useCallback } from 'react';
import { AgentEvent, ApprovalRequest } from '../types';

export function useAgentSocket() {
  const [connected, setConnected] = useState(false);
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [activeApproval, setActiveApproval] = useState<ApprovalRequest | null>(null);
  const [activeAgent, setActiveAgent] = useState<string>('Idle');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = useCallback(() => {
    const wsUrl = (window.location.protocol === 'https:' ? 'wss://' : 'ws://') + 
                  (window.location.hostname || '127.0.0.1') + ':8000/ws';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      console.log('[AutoForge WS] Connected to orchestrator backend');
    };

    ws.onclose = () => {
      setConnected(false);
      console.log('[AutoForge WS] Disconnected. Reconnecting in 3s...');
      setTimeout(connect, 3000);
    };

    ws.onmessage = (message) => {
      try {
        const data: AgentEvent = JSON.parse(message.data);
        setEvents((prev) => [data, ...prev.slice(0, 80)]);

        if (data.type === 'INTENT_LOCKED' && data.intentToken) {
          setActiveToken(data.intentToken);
          setIsProcessing(true);
        } else if (data.type === 'STEP_START') {
          setActiveAgent(data.agent || 'Agent');
          setCurrentStep(data.stepIndex || 0);
          setTotalSteps(data.totalSteps || 0);
        } else if (data.type === 'APPROVAL_REQUIRED') {
          setActiveApproval({
            approvalId: data.approvalId!,
            tool: data.tool || 'Action',
            input: data.input || {},
            intentToken: data.intentToken,
            intentTokenVerified: data.intentTokenVerified
          });
        } else if (data.type === 'TASK_FINISHED' || data.type === 'STEP_FAILED') {
          setIsProcessing(false);
          setActiveAgent('Idle');
        }
      } catch (err) {
        console.error('[AutoForge WS] Error parsing message:', err);
      }
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);

  const submitTask = (prompt: string, mode: string = 'build') => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setIsProcessing(true);
      wsRef.current.send(JSON.stringify({
        type: 'SUBMIT_TASK',
        prompt,
        mode
      }));
    } else {
      console.warn('Backend WebSocket not ready, attempting HTTP fallback...');
      fetch('http://127.0.0.1:8000/api/task/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode }),
      }).catch(console.error);
    }
  };

  const respondApproval = (approvalId: string, approved: boolean) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'APPROVAL_DECISION',
        approvalId,
        approved
      }));
    } else {
      fetch('http://127.0.0.1:8000/api/task/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalId, approved }),
      }).catch(console.error);
    }
    setActiveApproval(null);
  };

  return {
    connected,
    events,
    activeToken,
    activeApproval,
    activeAgent,
    currentStep,
    totalSteps,
    isProcessing,
    submitTask,
    respondApproval,
  };
}
