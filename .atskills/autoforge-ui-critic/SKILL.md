---
name: autoforge-ui-critic
description: Evaluates localhost web applications using AdaL Browser Use, checks console/network readiness, and enforces anti-boilerplate UI critique.
---

# AutoForge Multi-Agent UI Critique & Verification Workflow

When asked to build, refine, or verify a frontend feature in AutoForge:

1. **Launch & Inspect**: Use built-in Browser Use to open `http://localhost:3000`.
2. **Readiness Verification**: Confirm zero uncaught errors in the browser console and verify all `/api/*` network requests return HTTP 200.
3. **Visual Screenshot & Critique**: Capture a viewport screenshot. Evaluate typography hierarchy, dark-mode contrast ratios, and interactive state feedback.
4. **Auto-Iteration**: If the layout looks like a generic template or has alignment defects, edit the React component in `@src/components/`, reload the page, and re-verify before completing the turn.
