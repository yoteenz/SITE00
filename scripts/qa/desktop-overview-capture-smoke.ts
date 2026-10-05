/**
 * Smoke: real Playwright desktop overview capture (no mocks).
 * Exit 0 only when QA passes.
 */
import { captureImplementationSnapshot } from '../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/implementationSnapshotCaptureEngine.js';

const baseUrl = process.env.SITE00_CAPTURE_BASE_URL ?? 'http://127.0.0.1:5174';

const snap = await captureImplementationSnapshot({
  projectId: 'ndxbook',
  screenId: 'overview',
  viewportClass: 'desktop',
  baseUrl,
  route: '/projects/ndxbook/overview',
});

if (!snap) {
  console.error('FAIL: capture returned null (unknown screen)');
  process.exit(1);
}

const report = {
  qaPassed: snap.qaPassed,
  qaIssues: snap.qaIssues,
  captureStatus: snap.captureStatus,
  error: snap.error,
  route: snap.route,
  resolvedRoute: snap.resolvedRoute,
  publicUrlPrefix: snap.publicUrl?.slice(0, 96) ?? '',
  width: snap.width,
  height: snap.height,
};

console.log(JSON.stringify(report, null, 2));

if (!snap.qaPassed || (snap.qaIssues?.length ?? 0) > 0) {
  console.error('FAIL: desktop overview capture QA');
  process.exit(1);
}

console.log('PASS: desktop overview capture');
process.exit(0);
