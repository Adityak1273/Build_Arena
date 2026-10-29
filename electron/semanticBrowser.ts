import { WebContents } from 'electron';

export interface SemanticAXNode {
  axNodeId: string;
  backendNodeId: number;
  frameId: string;
  role: string;
  name: string;
  value?: string;
  interactive: boolean;
}

export class SemanticBrowserEngine {
  private debuggerAttached = false;

  constructor(private webContents: WebContents) {}

  public async attachDebugger(): Promise<void> {
    if (!this.debuggerAttached) {
      try {
        this.webContents.debugger.attach('1.3');
        await Promise.all([
          this.webContents.debugger.sendCommand('DOM.enable'),
          this.webContents.debugger.sendCommand('Accessibility.enable'),
          this.webContents.debugger.sendCommand('Page.enable'),
          this.webContents.debugger.sendCommand('Network.enable'),
          this.webContents.debugger.sendCommand('Runtime.enable'),
        ]);
        this.debuggerAttached = true;
      } catch (err) {
        console.warn('[SemanticBrowserEngine] Debugger attach note:', err);
      }
    }
  }

  public async captureFusedSemanticTree(): Promise<SemanticAXNode[]> {
    await this.attachDebugger();
    try {
      const frameTreeRes: any = await this.webContents.debugger.sendCommand('Page.getFrameTree');
      const rootFrameId = String(frameTreeRes?.frameTree?.frame?.id || 'root');

      const [axTreeRes] = await Promise.all([
        this.webContents.debugger.sendCommand('Accessibility.getFullAXTree', { frameId: rootFrameId }) as Promise<any>,
        this.webContents.debugger.sendCommand('DOMSnapshot.captureSnapshot', {
          computedStyles: ['display', 'visibility', 'opacity'],
          includeDOMRects: true,
        }).catch(() => null),
      ]);

      const interactiveRoles = new Set(['button', 'link', 'textbox', 'checkbox', 'combobox', 'menuitem', 'tab']);
      const fusedNodes: SemanticAXNode[] = [];

      for (const node of axTreeRes?.nodes || []) {
        if (node.ignored) continue;
        const axNodeId = String(node.nodeId);
        const role = node.role?.value || 'generic';
        const name = (node.name?.value || '').trim();

        if (interactiveRoles.has(role) || name.length > 0) {
          fusedNodes.push({
            axNodeId,
            backendNodeId: node.backendDOMNodeId,
            frameId: rootFrameId,
            role,
            name,
            value: node.value?.value,
            interactive: interactiveRoles.has(role),
          });
        }
      }
      return fusedNodes;
    } catch (e) {
      console.error('[SemanticBrowserEngine] Error capturing tree:', e);
      return [];
    }
  }

  public async verifyAndClickBackendNode(backendNodeId: number): Promise<{ verified: boolean; axDiffCount: number; error?: string; urlChanged?: boolean }> {
    const preUrl = this.webContents.getURL();
    const preTree = await this.captureFusedSemanticTree();
    let clickDispatched = false;

    try {
      const { model }: any = await this.webContents.debugger.sendCommand('DOM.getBoxModel', { backendNodeId });
      if (!model || !model.content) {
        return { verified: false, axDiffCount: 0, error: `Node #${backendNodeId} has no computed box model geometry` };
      }

      const x = (model.content[0] + model.content[2]) / 2;
      const y = (model.content[1] + model.content[5]) / 2;

      await this.webContents.debugger.sendCommand('Input.dispatchMouseEvent', {
        type: 'mousePressed', x, y, button: 'left', clickCount: 1,
      });
      await this.webContents.debugger.sendCommand('Input.dispatchMouseEvent', {
        type: 'mouseReleased', x, y, button: 'left', clickCount: 1,
      });
      clickDispatched = true;
    } catch (e: any) {
      return { verified: false, axDiffCount: 0, error: `Click dispatch failed: ${e.message}` };
    }

    // Wait for DOM mutation or navigation
    await new Promise((resolve) => setTimeout(resolve, 600));
    
    const postUrl = this.webContents.getURL();
    const postTree = await this.captureFusedSemanticTree();
    const axDiffCount = Math.abs(postTree.length - preTree.length);
    const urlChanged = postUrl !== preUrl;

    // Observable postcondition assertion: either URL changed or accessibility tree mutated
    const observableChange = urlChanged || axDiffCount > 0;

    return {
      verified: clickDispatched && observableChange,
      axDiffCount,
      urlChanged,
      error: observableChange ? undefined : 'Click dispatched but no observable state change occurred in DOM or URL'
    };
  }
}
