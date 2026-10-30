import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { SemanticAXNode } from '../types';

export interface ActionResult {
  success: boolean;
  action: 'navigate' | 'click' | 'type' | 'extract';
  target: string;
  url: string;
  title: string;
  screenshotBase64: string;
  domExcerpt: string;
  extractedText?: string;
  error?: string;
  executionTimeMs: number;
}

export class BrowserController {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private isInitializing: boolean = false;

  public async initialize(): Promise<void> {
    if (this.page && !this.page.isClosed()) {
      return;
    }

    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 100));
      }
      return;
    }

    this.isInitializing = true;
    try {
      this.browser = await chromium.launch({
        headless: true,
        args: [
          '--remote-debugging-port=9222',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-blink-features=AutomationControlled'
        ]
      });

      this.context = await this.browser.newContext({
        viewport: { width: 1280, height: 800 },
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
      });

      this.page = await this.context.newPage();
      await this.page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined
        });
      });
      await this.page.goto('about:blank');
    } catch (err: any) {
      console.error('[BrowserController] Launch failed:', err.message);
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  public resolveSmartUrl(rawUrl: string): string {
    const trimmed = (rawUrl || '').trim();
    if (!trimmed) return 'https://news.ycombinator.com';

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('about:')) {
      return trimmed;
    }

    if (trimmed.includes('.') && !trimmed.includes(' ') && !trimmed.includes('://')) {
      return `https://${trimmed}`;
    }

    return `https://duckduckgo.com/?q=${encodeURIComponent(trimmed)}`;
  }

  public cleanDuckDuckGoUrl(l: string): string {
    try {
      const u = new URL(l, 'https://duckduckgo.com');
      const x = u.searchParams.get('uddg');
      return x ? decodeURIComponent(x) : l;
    } catch {
      return l;
    }
  }

  /**
   * Resilient dual-engine search navigation:
   * Tries Google first; if blocked, captcha'd, or timed out, seamlessly switches to DuckDuckGo.
   */
  public async searchEngine(
    query: string,
    logCallback?: (msg: string) => void
  ): Promise<{
    engine: string;
    url: string;
    results: Array<{ title: string; link: string; snippet: string }>;
  }> {
    await this.initialize();
    if (!this.page) {
      return { engine: 'none', url: '', results: [] };
    }

    const g = 'https://www.google.com/search?hl=en&num=10&q=' + encodeURIComponent(query);
    try {
      await this.page.goto(g, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const r = await this.page.$$eval('div.g', (els) =>
        els
          .map((e) => ({
            title: (e.querySelector('h3') as HTMLElement)?.innerText || '',
            link: (e.querySelector('a') as HTMLAnchorElement)?.href || '',
            snippet:
              (e.querySelector('div[data-sncf], .VwiC3b, .s3v9rd') as HTMLElement)?.innerText || ''
          }))
          .filter((x) => x.title && x.link)
      );

      if (r.length > 0) {
        return { engine: 'Google', url: g, results: r.slice(0, 6) };
      }
    } catch {
      // Fall through to DuckDuckGo fallback
    }

    const msg = 'Google blocked or showed a consent/captcha page. Switching to DuckDuckGo.';
    if (logCallback) {
      logCallback(msg);
    } else {
      console.log(`[BrowserController] ${msg}`);
    }

    const d = 'https://html.duckduckgo.com/html/?q=' + encodeURIComponent(query);
    try {
      await this.page.goto(d, { waitUntil: 'domcontentloaded', timeout: 20000 });
      const r = await this.page.$$eval('.result', (els) =>
        els
          .map((e) => ({
            title: (e.querySelector('.result__a') as HTMLElement)?.innerText || '',
            link:
              (e.querySelector('.result__a') as HTMLAnchorElement)?.getAttribute('href') || '',
            snippet: (e.querySelector('.result__snippet') as HTMLElement)?.innerText || ''
          }))
          .filter((x) => x.title)
      );

      return {
        engine: 'DuckDuckGo',
        url: d,
        results: r.slice(0, 6).map((x) => ({ ...x, link: this.cleanDuckDuckGoUrl(x.link) }))
      };
    } catch {
      return { engine: 'none', url: d, results: [] };
    }
  }

  public async executeAction(
    action: 'navigate' | 'click' | 'type' | 'extract',
    target: string,
    value?: string
  ): Promise<ActionResult> {
    const startTime = Date.now();
    await this.initialize();

    if (!this.page) {
      throw new Error('Browser page could not be initialized.');
    }

    let extractedText = '';
    let actionError: string | undefined;

    try {
      switch (action) {
        case 'navigate': {
          const resolvedUrl = this.resolveSmartUrl(target);
          try {
            await this.page.goto(resolvedUrl, {
              waitUntil: 'domcontentloaded',
              timeout: 30000
            });
          } catch (navErr: any) {
            if (navErr.message?.includes('ERR_ABORTED')) {
              await this.page.waitForLoadState('domcontentloaded', { timeout: 10000 }).catch(() => {});
              if (!this.page.url().includes('about:blank')) {
                break;
              }
            }
            // Auto-recovery retry
            await this.page.goto(resolvedUrl, {
              waitUntil: 'domcontentloaded',
              timeout: 15000
            }).catch(() => {});
          }
          break;
        }

        case 'click': {
          await this.page.waitForSelector(target, { timeout: 8000, state: 'visible' });
          await this.page.click(target, { timeout: 5000 });
          await this.page.waitForLoadState('domcontentloaded').catch(() => {});
          break;
        }

        case 'type': {
          await this.page.waitForSelector(target, { timeout: 8000, state: 'visible' });
          await this.page.fill(target, value || '');
          break;
        }

        case 'extract': {
          if (target && target !== 'body' && target !== 'page') {
            const locator = this.page.locator(target);
            const count = await locator.count();
            if (count > 0) {
              const texts = await locator.allInnerTexts();
              extractedText = texts.join('\n');
            } else {
              extractedText = await this.page.evaluate(() => document.body?.innerText || '');
            }
          } else {
            extractedText = await this.page.evaluate(() => document.body?.innerText || '');
          }
          break;
        }

        default:
          throw new Error(`Unsupported action: ${action}`);
      }
    } catch (err: any) {
      actionError = err.message || String(err);
      console.warn(`[BrowserController] Action ${action} on '${target}' failed:`, actionError);
    }

    // Capture telemetry snapshot
    let screenshotBase64 = '';
    let domExcerpt = '';
    let currentUrl = 'about:blank';
    let currentTitle = '';

    try {
      currentUrl = this.page.url();
      currentTitle = await this.page.title().catch(() => '');
      domExcerpt = await this.page
        .evaluate(() => {
          const text = document.body ? document.body.innerText || '' : '';
          return text.replace(/\s+/g, ' ').trim().slice(0, 1500);
        })
        .catch(() => '');

      const buffer = await this.page.screenshot({
        type: 'jpeg',
        quality: 75
      });
      screenshotBase64 = buffer.toString('base64');
    } catch (snapErr: any) {
      console.warn('[BrowserController] Screenshot / DOM capture warning:', snapErr.message);
    }

    const executionTimeMs = Date.now() - startTime;

    return {
      success: !actionError,
      action,
      target,
      url: currentUrl,
      title: currentTitle,
      screenshotBase64,
      domExcerpt,
      extractedText: extractedText || undefined,
      error: actionError,
      executionTimeMs
    };
  }

  public async captureAXTree(): Promise<SemanticAXNode[]> {
    await this.initialize();
    if (!this.page) return [];

    try {
      // Use CDP session to get authentic accessibility tree from Chromium
      const client = await this.page.context().newCDPSession(this.page);
      const { nodes } = await client.send('Accessibility.getFullAXTree');

      const semanticNodes: SemanticAXNode[] = [];
      for (const node of nodes || []) {
        const nameVal = node.name ? String(node.name.value || '') : '';
        const roleVal = node.role ? String(node.role.value || '') : 'generic';
        const descVal = node.description ? String(node.description.value || '') : undefined;
        const valVal = node.value ? String(node.value.value || '') : undefined;

        // Skip nameless, insignificant generic nodes
        if (!nameVal && (roleVal === 'generic' || roleVal === 'none' || roleVal === 'InlineTextBox')) {
          continue;
        }

        semanticNodes.push({
          nodeId: String(node.nodeId),
          backendDOMNodeId: node.backendDOMNodeId || 0,
          role: roleVal,
          name: nameVal || roleVal,
          description: descVal,
          value: valVal,
          disabled: Boolean((node as any).disabled?.value),
          focused: Boolean((node as any).focused?.value),
          children: node.childIds ? node.childIds.map(String) : []
        });
      }

      await client.detach().catch(() => {});
      return semanticNodes;
    } catch (err: any) {
      console.warn('[BrowserController] CDP AXTree extraction fallback:', err.message);

      // DOM fallback when CDP accessibility domain is restricted
      const fallbackNodes = await this.page.evaluate(() => {
        const interactive = document.querySelectorAll(
          'a, button, input, textarea, select, [role="button"], h1, h2, h3, nav, main, header, footer'
        );
        const result: Array<{
          nodeId: string;
          backendDOMNodeId: number;
          role: string;
          name: string;
          value?: string;
        }> = [];

        interactive.forEach((el, index) => {
          const role = el.getAttribute('role') || el.tagName.toLowerCase();
          const name = (el.textContent || (el as HTMLInputElement).placeholder || (el as HTMLInputElement).value || '')
            .trim()
            .slice(0, 100);
          if (name) {
            result.push({
              nodeId: `dom-${index + 1}`,
              backendDOMNodeId: index + 100,
              role,
              name,
              value: (el as HTMLInputElement).value || undefined
            });
          }
        });
        return result;
      });

      return fallbackNodes.map((fn) => ({
        ...fn,
        children: []
      }));
    }
  }

  public async getCurrentState(): Promise<{
    url: string;
    title: string;
    screenshotBase64: string;
    domExcerpt: string;
  }> {
    await this.initialize();
    if (!this.page) {
      return { url: 'about:blank', title: '', screenshotBase64: '', domExcerpt: '' };
    }

    const url = this.page.url();
    const title = await this.page.title().catch(() => '');
    const domExcerpt = await this.page
      .evaluate(() => (document.body ? document.body.innerText || '' : '').replace(/\s+/g, ' ').trim().slice(0, 1500))
      .catch(() => '');

    let screenshotBase64 = '';
    try {
      const buffer = await this.page.screenshot({ type: 'jpeg', quality: 75 });
      screenshotBase64 = buffer.toString('base64');
    } catch {
      // ignore
    }

    return { url, title, screenshotBase64, domExcerpt };
  }

  public async interact(params: {
    type: 'click' | 'wheel' | 'type' | 'key' | 'hover';
    x?: number;
    y?: number;
    deltaX?: number;
    deltaY?: number;
    text?: string;
    key?: string;
  }): Promise<{
    success: boolean;
    url: string;
    title: string;
    screenshotBase64: string;
    error?: string;
  }> {
    await this.initialize();
    if (!this.page) {
      throw new Error('Browser page is not initialized');
    }

    try {
      if (params.type === 'click' && typeof params.x === 'number' && typeof params.y === 'number') {
        await this.page.mouse.click(params.x, params.y);
        await this.page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
      } else if (params.type === 'wheel') {
        await this.page.mouse.wheel(params.deltaX || 0, params.deltaY || 100);
      } else if (params.type === 'type' && params.text) {
        await this.page.keyboard.type(params.text);
      } else if (params.type === 'key' && params.key) {
        await this.page.keyboard.press(params.key);
      } else if (params.type === 'hover' && typeof params.x === 'number' && typeof params.y === 'number') {
        await this.page.mouse.move(params.x, params.y);
      }

      await new Promise((r) => setTimeout(r, 100));

      const state = await this.getCurrentState();
      return {
        success: true,
        url: state.url,
        title: state.title,
        screenshotBase64: state.screenshotBase64
      };
    } catch (err: any) {
      const state = await this.getCurrentState().catch(() => ({ url: 'about:blank', title: '', screenshotBase64: '' }));
      return {
        success: false,
        url: state.url,
        title: state.title,
        screenshotBase64: state.screenshotBase64,
        error: err.message
      };
    }
  }

  public async close(): Promise<void> {
    try {
      if (this.page) {
        await this.page.close().catch(() => {});
        this.page = null;
      }
      if (this.context) {
        await this.context.close().catch(() => {});
        this.context = null;
      }
      if (this.browser) {
        await this.browser.close().catch(() => {});
        this.browser = null;
      }
    } catch (err: any) {
      console.error('[BrowserController] Error closing browser:', err.message);
    }
  }
}

export const browserController = new BrowserController();
