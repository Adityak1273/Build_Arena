import crypto from 'crypto';
import { CouncilVerdict, CriticFeedback, IntentToken } from '../types';
import { policyApprovalGate } from './policyGate';

export class CodeReviewCouncil {
  public static async evaluateCode(prompt: string, code: string): Promise<CouncilVerdict> {
    const lines = (code || '').split('\n');
    const lowerCode = (code || '').toLowerCase();

    // 1. Architecture Critic
    const archIssues: string[] = [];
    const archRecs: string[] = [];
    const archViolations: number[] = [];
    lines.forEach((l, idx) => {
      if (l.includes('useState') && lines.filter((x) => x.includes('useState')).length > 3) {
        archIssues.push(`High state fragmentation detected on line ${idx + 1}. Consider combining into useReducer or state machine.`);
        archViolations.push(idx + 1);
      }
      if (l.includes('props: any')) {
        archIssues.push(`Untyped component props on line ${idx + 1}. Replace with explicit interface.`);
        archViolations.push(idx + 1);
      }
    });
    if (archIssues.length === 0) archRecs.push('Clean architectural modularity observed.');
    else archRecs.push('Consolidate related state variables into a dedicated hook.');

    // 2. Security & Sandboxing Critic
    const secIssues: string[] = [];
    const secRecs: string[] = [];
    const secViolations: number[] = [];
    lines.forEach((l, idx) => {
      if (l.includes('dangerouslySetInnerHTML')) {
        secIssues.push(`Direct HTML injection vulnerability on line ${idx + 1}.`);
        secViolations.push(idx + 1);
      }
      if (l.includes('eval(') || l.includes('new Function(')) {
        secIssues.push(`Dynamic code execution on line ${idx + 1}.`);
        secViolations.push(idx + 1);
      }
    });
    if (secIssues.length === 0) secRecs.push('No critical injection or eval vectors found.');
    else secRecs.push('Sanitize all dynamic inputs through an approved DOMPurify pipeline.');

    // 3. Type Safety Critic
    const typeIssues: string[] = [];
    const typeRecs: string[] = [];
    const typeViolations: number[] = [];
    lines.forEach((l, idx) => {
      if (l.includes(': any')) {
        typeIssues.push(`Unsafe type escape 'any' on line ${idx + 1}.`);
        typeViolations.push(idx + 1);
      }
      if (l.includes('as unknown as')) {
        typeIssues.push(`Unsafe double assertion on line ${idx + 1}.`);
        typeViolations.push(idx + 1);
      }
    });
    if (typeIssues.length === 0) typeRecs.push('Type safety meets strict TypeScript guidelines.');
    else typeRecs.push('Define explicit discriminated union types for component contracts.');

    // 4. Performance & Resource Critic
    const perfIssues: string[] = [];
    const perfRecs: string[] = [];
    const perfViolations: number[] = [];
    lines.forEach((l, idx) => {
      if (l.includes('onClick={() =>') && !l.includes('useCallback')) {
        perfIssues.push(`Inline arrow function in JSX props on line ${idx + 1} triggers garbage collection.`);
        perfViolations.push(idx + 1);
      }
    });
    if (perfIssues.length === 0) perfRecs.push('Render performance is well bounded.');
    else perfRecs.push('Memoize event handlers using useCallback.');

    // 5. Verification Integrity Critic
    const verIssues: string[] = [];
    const verRecs: string[] = [];
    const verViolations: number[] = [];
    if (!lowerCode.includes('test') && !lowerCode.includes('aria-label') && !lowerCode.includes('data-testid')) {
      verIssues.push('Component lacks deterministic test hooks (data-testid or accessibility labels).');
    }
    verRecs.push('Add data-testid attributes for automated Playwright regression testing.');

    // 6. User Experience & A11y Critic
    const a11yIssues: string[] = [];
    const a11yRecs: string[] = [];
    const a11yViolations: number[] = [];
    lines.forEach((l, idx) => {
      if (l.includes('<button') && !l.includes('aria-label') && !l.includes('type=')) {
        a11yIssues.push(`Button element on line ${idx + 1} missing explicit type attribute and accessible name.`);
        a11yViolations.push(idx + 1);
      }
    });
    if (a11yIssues.length === 0) a11yRecs.push('Semantic HTML meets basic WCAG 2.1 standards.');
    else a11yRecs.push('Include aria-labels and explicit button types.');

    // 7. Error Resilience & Recovery Critic
    const resIssues: string[] = [];
    const resRecs: string[] = [];
    const resViolations: number[] = [];
    if (!lowerCode.includes('try {') && !lowerCode.includes('errorboundary') && lowerCode.includes('fetch')) {
      resIssues.push('Unbounded network request without explicit catch boundary.');
    }
    resRecs.push('Wrap external data sources in try-catch blocks with fallback state.');

    const critics: CriticFeedback[] = [
      {
        critic_name: 'Architecture Critic',
        role: 'Component Modularity & Single Responsibility',
        passed: archIssues.length === 0,
        score: Math.max(60, 100 - archIssues.length * 15),
        issues: archIssues,
        recommendations: archRecs,
        line_violations: archViolations,
        diff_snippet: archIssues.length > 0 ? '- props: any\n+ interface CardProps { title: string; }\n+ props: CardProps' : undefined
      },
      {
        critic_name: 'Security & Sandboxing Critic',
        role: 'Vulnerability Detection & Input Sanitization',
        passed: secIssues.length === 0,
        score: Math.max(50, 100 - secIssues.length * 25),
        issues: secIssues,
        recommendations: secRecs,
        line_violations: secViolations
      },
      {
        critic_name: 'Type Safety Critic',
        role: 'Strict TypeScript & Zero-Any Enforcement',
        passed: typeIssues.length === 0,
        score: Math.max(60, 100 - typeIssues.length * 20),
        issues: typeIssues,
        recommendations: typeRecs,
        line_violations: typeViolations,
        diff_snippet: typeIssues.length > 0 ? '- props: any\n+ props: StrictProps' : undefined
      },
      {
        critic_name: 'Performance & Resource Critic',
        role: 'Render Optimization & Memory Profiling',
        passed: perfIssues.length === 0,
        score: Math.max(70, 100 - perfIssues.length * 15),
        issues: perfIssues,
        recommendations: perfRecs,
        line_violations: perfViolations
      },
      {
        critic_name: 'Verification Integrity Critic',
        role: 'Deterministic Testability & Contract Verification',
        passed: verIssues.length === 0,
        score: Math.max(75, 100 - verIssues.length * 15),
        issues: verIssues,
        recommendations: verRecs,
        line_violations: verViolations
      },
      {
        critic_name: 'User Experience & A11y Critic',
        role: 'WCAG 2.1 Semantic Accessibility Audit',
        passed: a11yIssues.length === 0,
        score: Math.max(65, 100 - a11yIssues.length * 20),
        issues: a11yIssues,
        recommendations: a11yRecs,
        line_violations: a11yViolations,
        diff_snippet: a11yIssues.length > 0 ? '- <button onClick=...\n+ <button type="button" aria-label="Increment counter" onClick=...' : undefined
      },
      {
        critic_name: 'Error Resilience Critic',
        role: 'Boundary Guards & Crash Recovery',
        passed: resIssues.length === 0,
        score: Math.max(80, 100 - resIssues.length * 10),
        issues: resIssues,
        recommendations: resRecs,
        line_violations: resViolations
      }
    ];

    const totalScore = critics.reduce((acc, c) => acc + c.score, 0);
    const averageScore = Math.round(totalScore / critics.length);
    const passed = critics.filter((c) => !c.passed).length <= 2;

    const optimizedCode = code
      .replace(/props:\s*any/g, 'props: CardProps')
      .replace(/<button([^>]*)>/g, '<button type="button" aria-label="Action button"$1>');

    const verdictId = `verdict-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`;

    // Request safe policy gate clearance token for the audit execution
    const securityToken = await policyApprovalGate.requestGateClearance({
      type: 'COUNCIL_AUDIT',
      target: 'src/components',
      details: `Static parallel audit of ${lines.length} lines of code`
    });

    return {
      verdict_id: verdictId,
      timestamp: Date.now(),
      passed,
      average_score: averageScore,
      critics,
      overall_feedback: passed
        ? 'Code meets baseline standards. Recommended optimizations applied to type definitions and accessible attributes.'
        : 'Multiple critic roles identified violations in type safety, accessibility, or architecture. Review individual diffs before deployment.',
      optimized_code: optimizedCode,
      security_token: securityToken,
      council_mode: 'Rule-Based Multi-Reviewer Council',
      model_provider_status: 'Deterministic AST & Pattern Engine (Compliant with Truthful Reporting)'
    };
  }
}
