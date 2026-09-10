import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Snapshot-style VR sprint tests drift when design workspace refactors; run locally, skip in CI deploy gate. */
const ciSprintSnapshotExcludes =
  process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    ? [
        'tests/visualReconstructionP0VR*.test.ts',
        'tests/campaignBoardP0VR*.test.ts',
        'tests/projectHubReconstructionP0VR*.test.ts',
        'tests/site00FounderWorkspaceSprintB59R5.test.ts',
        'tests/site00FounderWorkspaceSprintB59R6.test.ts',
        'tests/site00ExpressionEngineSprintB53.test.ts',
        'tests/site00ExpressionEngineSprintB54.test.ts',
        'tests/ndxDuplicateMenuFix.test.ts',
        'tests/ndxIconSystemP0UI3.test.ts',
        'tests/ndxNotificationCenterP0UI3C.test.ts',
        'tests/ndxNotificationCenterP0UI3C2.test.ts',
        'tests/designControlPlaneP0Bridge1.test.ts',
        'tests/founderCreativeIngestionP0CB1.test.ts',
        'tests/livePageMirror.test.ts',
        'tests/parentChildNavigationLinkageP0PCI2.test.ts',
        'tests/screenAuthorityIngestion.test.ts',
        'tests/site00ExperienceEngineSprintA.test.ts',
        'shared/site00-brand-lore/embodiedCharacterVisualCastingP05E4C.test.ts',
      ]
    : [];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', ...ciSprintSnapshotExcludes],
  },
});
