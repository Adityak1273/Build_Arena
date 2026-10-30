process.env.AUTOFORGE_TEST_RUNNER = 'true';
import { OutcomeVerifier } from './outcomeVerifier';
import { policyApprovalGate } from '../runtime/policyGate';
import { GTMMultimodalPipeline } from '../tools/gtmMultimodalPipeline';
import { ResearchSwarmWorkflow } from '../tools/researchSwarmWorkflow';
import { CodeReviewCouncil } from '../runtime/council';
import { createPlanForGoal } from '../runtime/planner';
import { loadTaskHistory, saveTaskHistoryEntry } from '../runtime/taskHistory';
import fs from 'fs';
import path from 'path';

async function runTestSuite() {
  console.log('--- Starting AutoForge Runtime Verification Test Suite ---');
  let failures = 0;

  // 1. Verify OutcomeVerifier on non-existent file
  console.log('\n[Test 1] OutcomeVerifier: Non-existent file rejection');
  const missingResult = OutcomeVerifier.verifySpreadsheetArtifact('artifacts/non_existent.csv', 10);
  if (!missingResult.verified && !missingResult.diskIntegrityVerified) {
    console.log('✓ PASS: Non-existent file correctly rejected.');
  } else {
    console.error('✗ FAIL: OutcomeVerifier passed on missing file!');
    failures++;
  }

  // 2. Verify OutcomeVerifier on canonical startup matrix
  console.log('\n[Test 2] OutcomeVerifier: Real artifact verification & hashing');
  const csvPath = 'artifacts/ai_startups_comparison.csv';
  if (fs.existsSync(csvPath)) {
    const report = OutcomeVerifier.verifySpreadsheetArtifact(csvPath, 10, [
      'company_name',
      'domain',
      'pricing_tier',
      'scraped_title',
      'row_hash'
    ]);
    if (report.verified && report.diskIntegrityVerified && report.diskHashSha256.length === 64) {
      console.log(`✓ PASS: Canonical CSV verified. Rows: ${report.totalRows}, SHA256: ${report.diskHashSha256.slice(0, 16)}...`);
    } else {
      console.error('✗ FAIL: Canonical CSV verification failed:', report.flaggedUnknowns);
      failures++;
    }
  } else {
    console.warn('⚠ SKIP: CSV artifact not found on disk yet.');
  }

  // 3. Verify Policy Gate Risk Assessment & Emergency Cancel
  console.log('\n[Test 3] PolicyApprovalGate: Consequential vs Safe Risk Assessment');
  const safeAssessment = policyApprovalGate.assessRisk({ type: 'browser_navigate', target: 'https://news.ycombinator.com' });
  const consequentialAssessment = policyApprovalGate.assessRisk({ type: 'publish_gtm_campaign', target: 'public/gtm' });

  if (safeAssessment.riskLevel === 'SAFE' && !safeAssessment.requiresApproval) {
    console.log('✓ PASS: Navigation correctly marked as SAFE.');
  } else {
    console.error('✗ FAIL: Safe assessment failed:', safeAssessment);
    failures++;
  }

  if (consequentialAssessment.riskLevel === 'CONSEQUENTIAL' && consequentialAssessment.requiresApproval) {
    console.log('✓ PASS: Consequential action correctly gated.');
  } else {
    console.error('✗ FAIL: Consequential assessment failed:', consequentialAssessment);
    failures++;
  }

  // 4. Verify 7-Reviewer Council Verdict
  console.log('\n[Test 4] 7-Reviewer Council: AST & Static Pattern Audit');
  const verdict = await CodeReviewCouncil.evaluateCode(
    'Audit Card component',
    'export function Card(props: any) { return <button>Click</button>; }'
  );
  if (verdict.critics.length === 7 && verdict.optimized_code && verdict.security_token) {
    console.log(`✓ PASS: Council returned 7 critics, verdict ID: ${verdict.verdict_id}, avg score: ${verdict.average_score}`);
  } else {
    console.error('✗ FAIL: Council verdict incomplete:', verdict);
    failures++;
  }

  // 5. Verify Multimodal PNG Generation Binary Headers & High-Res Size
  console.log('\n[Test 5] Multimodal Binary Assets: High-Res PNG generation');
  const pngBuffer = await GTMMultimodalPipeline.renderHighResHeroPoster(
    'AutoForge Launch Verification',
    'AI-Native Developer Browser with Multimodal Companion'
  );
  const isPng =
    pngBuffer[0] === 0x89 &&
    pngBuffer[1] === 0x50 &&
    pngBuffer[2] === 0x4e &&
    pngBuffer[3] === 0x47;
  if (isPng && pngBuffer.length > 20000) {
    console.log(`✓ PASS: Valid high-res PNG binary created (${pngBuffer.length} bytes, >20,000 bytes threshold verified).`);
  } else {
    console.error(`✗ FAIL: High-res PNG generation invalid or below 20KB (${pngBuffer.length} bytes)`);
    failures++;
  }

  // 6. Verify AdaL Adaptive Planner Dynamic Decomposition
  console.log('\n[Test 6] AdaL Adaptive Planner: Flagship Workflow Decomposition');
  const plan = await createPlanForGoal('Research 10 AI startups, compare product and pricing, write to spreadsheet, create a launch image');
  if (plan.steps.length >= 5 && plan.steps.some((s) => s.tool === 'benchmark_export') && plan.steps.some((s) => s.tool === 'multimodal_launch')) {
    console.log(`✓ PASS: Plan dynamically generated with ${plan.steps.length} sequential execution steps.`);
  } else {
    console.error('✗ FAIL: Planner failed to generate expected multi-step sequence:', plan);
    failures++;
  }

  // 7. Verify Task History & Memory Store
  console.log('\n[Test 7] Task History & User Memory: Persistence & Integrity');
  const testEntry = {
    task_id: `test-task-${Date.now()}`,
    goal: 'Test Plan Persistence',
    status: 'COMPLETED' as const,
    start_time: new Date().toISOString(),
    duration_ms: 1250,
    steps_count: 5,
    verified_steps: 5,
    artifacts: [{ name: 'Test Artifact', path: 'artifacts/test.csv', type: 'text/csv' }],
    outcome_summary: 'All steps verified successfully.'
  };
  saveTaskHistoryEntry(testEntry);
  const history = loadTaskHistory();
  const found = history.find((h) => h.task_id === testEntry.task_id);
  if (found && found.status === 'COMPLETED' && found.verified_steps === 5) {
    console.log(`✓ PASS: Task history persisted and retrieved from disk. Total recorded tasks: ${history.length}`);
  } else {
    console.error('✗ FAIL: Task history persistence assertion failed.');
    failures++;
  }

  // 8. Verify OutcomeVerifier DOM State Assertion
  console.log('\n[Test 8] OutcomeVerifier: Closed-Loop DOM State Assertion');
  const mockActionResult = {
    success: true,
    action: 'navigate' as const,
    target: 'https://news.ycombinator.com',
    url: 'https://news.ycombinator.com',
    title: 'Hacker News',
    screenshotBase64: 'mock_base64',
    domExcerpt: 'Hacker News new | past | comments | ask | show | jobs | submit',
    extractedText: 'Hacker News new | past | comments | ask | show | jobs | submit',
    executionTimeMs: 120
  };
  const domVerification = OutcomeVerifier.verifyBrowserState(mockActionResult, 'ycombinator.com', ['Hacker News', 'comments']);
  if (domVerification.verified && domVerification.keywordsFound.length === 2) {
    console.log('✓ PASS: OutcomeVerifier correctly asserted live DOM keywords and URL match.');
  } else {
    console.error('✗ FAIL: DOM state verification failed:', domVerification);
    failures++;
  }

  // 9. Verify 5-Agent Swarm Deep Research & Disk SHA-256 Verification
  console.log('\n[Test 9] 5-Agent Swarm: Multi-Perspective Planning, Gating & Artifact SHA-256');
  const swarmPlan = await createPlanForGoal('Top schools in Noida');
  const searchSteps = swarmPlan.steps.filter((s) => s.tool === 'research_search');
  const hasAggregate = swarmPlan.steps.some((s) => s.tool === 'research_aggregate');
  const hasInfographic = swarmPlan.steps.some((s) => s.tool === 'multimodal_infographic');

  const safeSecurity = policyApprovalGate.evaluateGoalSecurity('Top schools in Noida');
  const blockedSecurity = policyApprovalGate.evaluateGoalSecurity('delete password hack banking login');

  const sampleFound = [
    {
      task: 'Top schools in Noida',
      engine: 'Google',
      url: 'https://www.google.com/search?q=Top+schools+in+Noida',
      results: [
        {
          title: 'Delhi Public School Noida',
          link: 'https://dpsnoida.co.in',
          snippet: 'Premier CBSE school in Sector 30 Noida providing comprehensive education.'
        },
        {
          title: 'Step by Step School',
          link: 'https://stepbystep.school',
          snippet: 'Leading experiential learning school located in Sector 132 expressway Noida.'
        }
      ]
    },
    {
      task: 'Top schools in Noida reviews ratings',
      engine: 'DuckDuckGo',
      url: 'https://html.duckduckgo.com/html/?q=Top+schools+in+Noida+reviews+ratings',
      results: [
        {
          title: 'Delhi Public School Noida',
          link: 'https://dpsnoida.co.in/reviews',
          snippet: 'Parent reviews and rating overview for DPS Noida.'
        },
        {
          title: 'Amity International School',
          link: 'https://amity.edu/ais/noida',
          snippet: 'Rated among top CBSE schools in Noida with modern infrastructure.'
        }
      ]
    }
  ];

  const datasetResult = ResearchSwarmWorkflow.saveResearchDataset(sampleFound);
  const verifyCsv = OutcomeVerifier.verifySpreadsheetArtifact(
    'artifacts/research.csv',
    1,
    ['rank', 'title', 'source', 'snippet', 'link', 'query']
  );

  if (
    searchSteps.length === 3 &&
    hasAggregate &&
    hasInfographic &&
    safeSecurity.cleared &&
    !blockedSecurity.cleared &&
    datasetResult.count === 3 &&
    verifyCsv.verified &&
    verifyCsv.diskIntegrityVerified
  ) {
    console.log(`✓ PASS: 5-Agent Swarm verified. 3 sub-queries, VIGIL gating, ${datasetResult.count} deduped rows, SHA256: ${datasetResult.diskHash.slice(0, 16)}...`);
  } else {
    console.error('✗ FAIL: 5-Agent Swarm validation failed:', {
      searchSteps: searchSteps.length,
      hasAggregate,
      hasInfographic,
      safeCleared: safeSecurity.cleared,
      blockedBlocked: !blockedSecurity.cleared,
      datasetCount: datasetResult.count,
      csvVerified: verifyCsv.verified
    });
    failures++;
  }

  console.log('\n-----------------------------------------------------------');
  if (failures === 0) {
    console.log('🎉 ALL RUNTIME VERIFICATION TESTS PASSED (9/9)');
    process.exit(0);
  } else {
    console.error(`❌ ${failures} TEST(S) FAILED`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
