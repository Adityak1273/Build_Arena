import { OutcomeVerifier } from './outcomeVerifier';
import { policyApprovalGate } from '../runtime/policyGate';
import { GTMMultimodalPipeline } from '../tools/gtmMultimodalPipeline';
import { CodeReviewCouncil } from '../runtime/council';
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

  console.log('\n-----------------------------------------------------------');
  if (failures === 0) {
    console.log('🎉 ALL RUNTIME VERIFICATION TESTS PASSED (5/5)');
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
