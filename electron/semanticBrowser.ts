/**
 * AutoForge Semantic Browser Engine
 * Chrome DevTools Protocol (CDP 1.3) Accessibility Tree Extraction & Postcondition Verification
 * Eliminates arbitrary fallback coordinates and distinguishes ACTION_DISPATCHED from OUTCOME_VERIFIED.
 */

export interface SemanticAXNode {
  nodeId: string;
  backendDOMNodeId: number;
  role: string;
  name: string;
  value?: string;
  description?: string;
  disabled?: boolean;
  focused?: boolean;
  children?: string[]; // child node IDs
}

export interface ClickVerificationResult {
  success: boolean;
  status: 'OUTCOME_VERIFIED' | 'ACTION_DISPATCHED' | 'DISPATCH_FAILED';
  backendDOMNodeId: number;
  urlChanged: boolean;
  initialUrl: string;
  newUrl: string;
  axDiffCount: number;
  message: string;
  targetRole?: string;
  targetName?: string;
  error?: string;
}

/**
 * Parses raw CDP Accessibility.getFullAXTree nodes into semantic developer-usable nodes.
 */
export function extractSemanticNodes(rawNodes: any[]): SemanticAXNode[] {
  if (!Array.isArray(rawNodes)) return [];

  const semanticNodes: SemanticAXNode[] = [];

  for (const node of rawNodes) {
    if (!node || !node.role) continue;

    const role = (node.role.value || node.role).toLowerCase();
    const name = node.name ? (node.name.value || String(node.name)).trim() : '';
    const value = node.value ? (node.value.value || String(node.value)) : undefined;
    const description = node.description ? (node.description.value || String(node.description)) : undefined;
    const backendDOMNodeId = node.backendDOMNodeId || 0;

    // Filter out uninformative layout noise unless it carries accessible names
    const isInteractive = [
      'button', 'link', 'heading', 'textbox', 'searchbox', 'checkbox',
      'radio', 'menuitem', 'tab', 'combobox', 'treeitem', 'switch',
      'article', 'main', 'navigation', 'search', 'form'
    ].includes(role);

    if (isInteractive || name.length > 0) {
      const childIds: string[] = Array.isArray(node.childIds) ? node.childIds : [];

      semanticNodes.push({
        nodeId: String(node.nodeId),
        backendDOMNodeId,
        role,
        name: name || `[Unnamed ${role}]`,
        value,
        description,
        disabled: Boolean(node.disabled?.value ?? node.disabled),
        focused: Boolean(node.focused?.value ?? node.focused),
        children: childIds
      });
    }
  }

  return semanticNodes;
}

/**
 * Computes difference count between two semantic AX snapshots.
 */
export function computeAXDiff(before: SemanticAXNode[], after: SemanticAXNode[]): number {
  const beforeKeys = new Set(before.map(n => `${n.role}:${n.name}:${n.backendDOMNodeId}`));
  const afterKeys = new Set(after.map(n => `${n.role}:${n.name}:${n.backendDOMNodeId}`));

  let diff = 0;
  for (const key of afterKeys) {
    if (!beforeKeys.has(key)) diff++;
  }
  for (const key of beforeKeys) {
    if (!afterKeys.has(key)) diff++;
  }
  return diff;
}

/**
 * Dispatches a native CDP mouse click to a backendDOMNodeId and verifies postconditions.
 * Postcondition verification strictly checks:
 * 1. URL changed (navigation triggered), OR
 * 2. Focused state was transferred to the target node, OR
 * 3. Specific AX tree delta was produced.
 * Never clicks at arbitrary (100, 100) fallback coordinates.
 */
export async function verifyAndClickBackendNode(
  dbg: Electron.Debugger,
  backendDOMNodeId: number,
  getCurrentUrl: () => string,
  fetchAXTree: () => Promise<SemanticAXNode[]>
): Promise<ClickVerificationResult> {
  const initialUrl = getCurrentUrl();
  const initialTree = await fetchAXTree();

  const targetNode = initialTree.find(n => n.backendDOMNodeId === backendDOMNodeId);
  const targetRole = targetNode?.role || 'node';
  const targetName = targetNode?.name || `ID #${backendDOMNodeId}`;

  // 1. Resolve authentic box model coordinates for the node via CDP
  let clickX: number | null = null;
  let clickY: number | null = null;

  try {
    const boxModel = await dbg.sendCommand('DOM.getBoxModel', { backendNodeId: backendDOMNodeId });
    if (boxModel && boxModel.model && boxModel.model.content) {
      const quad = boxModel.model.content; // [x1, y1, x2, y2, x3, y3, x4, y4]
      clickX = Math.round((quad[0] + quad[2] + quad[4] + quad[6]) / 4);
      clickY = Math.round((quad[1] + quad[3] + quad[5] + quad[7]) / 4);
    }
  } catch {
    // Attempt scroll into view then re-resolve
    try {
      await dbg.sendCommand('DOM.scrollIntoViewIfNeeded', { backendNodeId: backendDOMNodeId });
      const boxModel = await dbg.sendCommand('DOM.getBoxModel', { backendNodeId: backendDOMNodeId });
      if (boxModel?.model?.content) {
        const quad = boxModel.model.content;
        clickX = Math.round((quad[0] + quad[2] + quad[4] + quad[6]) / 4);
        clickY = Math.round((quad[1] + quad[3] + quad[5] + quad[7]) / 4);
      }
    } catch {
      clickX = null;
      clickY = null;
    }
  }

  // If node coordinates cannot be resolved, halt honestly instead of clicking arbitrary coordinates
  if (clickX === null || clickY === null) {
    return {
      success: false,
      status: 'DISPATCH_FAILED',
      backendDOMNodeId,
      urlChanged: false,
      initialUrl,
      newUrl: initialUrl,
      axDiffCount: 0,
      targetRole,
      targetName,
      message: `Failed to resolve bounding box coordinates for node #${backendDOMNodeId}. Aborted dispatch to prevent misclick.`,
      error: 'COORDINATES_UNRESOLVED'
    };
  }

  // 2. Dispatch native hardware mouse events via CDP Input domain at resolved coordinates
  try {
    await dbg.sendCommand('Input.dispatchMouseEvent', {
      type: 'mousePressed',
      x: clickX,
      y: clickY,
      button: 'left',
      clickCount: 1
    });

    await new Promise(resolve => setTimeout(resolve, 80));

    await dbg.sendCommand('Input.dispatchMouseEvent', {
      type: 'mouseReleased',
      x: clickX,
      y: clickY,
      button: 'left',
      clickCount: 1
    });
  } catch (err: any) {
    return {
      success: false,
      status: 'DISPATCH_FAILED',
      backendDOMNodeId,
      urlChanged: false,
      initialUrl,
      newUrl: initialUrl,
      axDiffCount: 0,
      targetRole,
      targetName,
      message: `CDP Input.dispatchMouseEvent failed: ${err.message}`,
      error: err.message
    };
  }

  // 3. Wait for layout settling / mutation / navigation
  await new Promise(resolve => setTimeout(resolve, 500));

  // 4. Observable postcondition check
  const newUrl = getCurrentUrl();
  const urlChanged = newUrl !== initialUrl;

  const postTree = await fetchAXTree();
  const axDiffCount = computeAXDiff(initialTree, postTree);

  // Check if target is now focused or URL changed
  const postTarget = postTree.find(n => n.backendDOMNodeId === backendDOMNodeId);
  const focusAcquired = Boolean(postTarget?.focused && !targetNode?.focused);

  const outcomeVerified = urlChanged || focusAcquired || axDiffCount > 0;
  const status = outcomeVerified ? 'OUTCOME_VERIFIED' : 'ACTION_DISPATCHED';

  let message = '';
  if (urlChanged) {
    message = `OUTCOME_VERIFIED: Navigation postcondition observed -> ${newUrl}`;
  } else if (focusAcquired) {
    message = `OUTCOME_VERIFIED: Focus postcondition observed on node #${backendDOMNodeId}`;
  } else if (axDiffCount > 0) {
    message = `OUTCOME_VERIFIED: Accessibility tree mutated with ${axDiffCount} delta nodes`;
  } else {
    message = `ACTION_DISPATCHED: Click sent to (${clickX}, ${clickY}), but no state change or URL navigation was observed yet.`;
  }

  return {
    success: outcomeVerified,
    status,
    backendDOMNodeId,
    urlChanged,
    initialUrl,
    newUrl,
    axDiffCount,
    targetRole,
    targetName,
    message
  };
}
