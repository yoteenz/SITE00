import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const isCi = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

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
        'tests/p0vr*.test.ts',
        'tests/desktopOverviewCaptureLive.test.ts',
        'tests/pageConceptPipelineFounderReviewLive.test.ts',
        'tests/parentChildNavigationLinkageP0PCI2.test.ts',
        'tests/screenAuthorityIngestion.test.ts',
        'tests/site00ExperienceEngineSprintA.test.ts',
        'shared/site00-brand-lore/embodiedCharacterVisualCastingP05E4C.test.ts',
      ]
    : [];

const FORENSIC_RASTER_NODE = path.resolve(
  __dirname,
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/loadForensicRaster.node.ts',
);

export default defineConfig({
  define: isCi
    ? {
        'import.meta.env.VITE_JURNL_SERVER_PERSISTENCE': JSON.stringify(
          process.env.VITE_JURNL_SERVER_PERSISTENCE || '1',
        ),
        'import.meta.env.VITE_API_BASE': JSON.stringify(process.env.VITE_API_BASE || 'https://api.site00.com'),
        'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(
          process.env.VITE_SUPABASE_URL || 'https://ci-placeholder.supabase.co',
        ),
        'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY || 'ci-placeholder-anon'),
      }
    : {},
  plugins: [
    react(),
    {
      name: 'vitest-forensic-raster-node',
      enforce: 'pre',
      resolveId(source) {
        if (
          source.endsWith('loadForensicRaster.browser.js') ||
          source.endsWith('loadForensicRaster.browser.ts') ||
          source === FORENSIC_RASTER_NODE.replace(/\.ts$/, '.js')
        ) {
          return FORENSIC_RASTER_NODE;
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  test: {
    env: isCi
      ? {
          VITE_JURNL_SERVER_PERSISTENCE: '1',
          VITE_API_BASE: process.env.VITE_API_BASE || 'https://api.site00.com',
          VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'https://ci-placeholder.supabase.co',
          VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'ci-placeholder-anon',
        }
      : undefined,
    setupFiles: [
      'tests/setup/vitestEnv.ts',
      'tests/setup/pageConceptTestDefaults.ts',
      'tests/setup/primeNdxbookAuthorityIngestion.ts',
    ],
    testTimeout: isCi ? 120_000 : 60_000,
    hookTimeout: isCi ? 120_000 : 60_000,
    /** Supabase integration suites contend when every file runs wide parallel on CI runners. */
    fileParallelism: isCi ? false : undefined,
    poolOptions: isCi ? { threads: { maxThreads: 2, minThreads: 1 } } : undefined,
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.worktrees/**', ...ciSprintSnapshotExcludes],
  },
});
