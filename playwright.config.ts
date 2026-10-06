import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.JURNL_E2E_BASE_URL ?? 'http://127.0.0.1:5174';

export default defineConfig({
  timeout: 90_000,
  testDir: './e2e/jurnl',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.GITHUB_ACTIONS),
  retries: process.env.GITHUB_ACTIONS ? 1 : 0,
  workers: process.env.GITHUB_ACTIONS ? 2 : undefined,
  outputDir: 'playwright-test-results',
  reporter: [
    ['list'],
    ['json', { outputFile: 'test-results/jurnl-e2e-report.json' }],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
  },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 5'], viewport: { width: 393, height: 852 } } },
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
  ],
  webServer: process.env.JURNL_E2E_SKIP_WEBSERVER ?
    undefined
  : {
      command: process.env.JURNL_E2E_WEBSERVER_CMD ?? 'npm run build && npm run preview -- --port 5174 --strictPort --host 127.0.0.1',
      url: `${baseURL}/`,
      reuseExistingServer: !process.env.GITHUB_ACTIONS,
      timeout: 600_000,
    },
});
