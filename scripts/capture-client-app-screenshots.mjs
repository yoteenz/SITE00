#!/usr/bin/env node
/**
 * Capture 25 client app QA screenshots (P0.APP.2).
 * Requires dev server on :5174.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const DEV_BASE = process.env.SITE00_DEV_BASE ?? 'http://127.0.0.1:5174';
const OUT_DIR = process.env.SITE00_QA_OUT ?? '/opt/cursor/artifacts';

const SCREENS = [
  { screen: 1, name: 'SPLASH', route: '/app', screenshot: 'client-app-screen-01-splash.png' },
  { screen: 2, name: 'PROJECT SELECT', route: '/app/preview/select', screenshot: 'client-app-screen-02-project-select.png' },
  { screen: 3, name: 'PROJECT PULSE', route: '/app/preview/fixture-app-ndxbook', screenshot: 'client-app-screen-03-project-pulse.png' },
  { screen: 4, name: 'OPPORTUNITY HOME', route: '/app/preview/fixture-app-website-only', screenshot: 'client-app-screen-04-opportunity.png' },
  { screen: 5, name: 'PROJECT MAP', route: '/app/preview/fixture-app-ndxbook/project/map', screenshot: 'client-app-screen-05-project-map.png' },
  { screen: 6, name: 'THE BUILD', route: '/app/preview/fixture-app-ndxbook/project/build', screenshot: 'client-app-screen-06-the-build.png' },
  { screen: 7, name: 'MILESTONES', route: '/app/preview/fixture-app-ndxbook/project/milestones', screenshot: 'client-app-screen-07-milestones.png' },
  { screen: 8, name: 'CLIENT TASKS', route: '/app/preview/fixture-app-identity-website/project/tasks', screenshot: 'client-app-screen-08-client-tasks.png' },
  { screen: 9, name: 'DECISIONS', route: '/app/preview/fixture-app-ndxbook/project/decisions', screenshot: 'client-app-screen-09-decisions.png' },
  { screen: 10, name: 'ACTIVITY', route: '/app/preview/fixture-app-ndxbook/project/activity', screenshot: 'client-app-screen-10-activity.png' },
  { screen: 11, name: 'REVIEWS QUEUE', route: '/app/preview/fixture-app-ndxbook/reviews', screenshot: 'client-app-screen-11-review-queue.png' },
  { screen: 12, name: 'REVIEW DETAIL', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02', screenshot: 'client-app-screen-12-review-detail.png' },
  { screen: 13, name: 'COMPARE', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/compare', screenshot: 'client-app-screen-13-compare.png' },
  { screen: 14, name: 'COMMENTS', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/comments', screenshot: 'client-app-screen-14-comments.png' },
  { screen: 15, name: 'ANNOTATIONS', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/annotations', screenshot: 'client-app-screen-15-annotations.png' },
  { screen: 16, name: 'APPROVAL', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/approve', screenshot: 'client-app-screen-16-approval.png' },
  { screen: 17, name: 'REVISION', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/revision', screenshot: 'client-app-screen-17-revision.png' },
  { screen: 18, name: 'VERSION HISTORY', route: '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02/history', screenshot: 'client-app-screen-18-version-history.png' },
  { screen: 19, name: 'INBOX', route: '/app/preview/fixture-app-ndxbook/inbox', screenshot: 'client-app-screen-19-inbox.png' },
  { screen: 20, name: 'LIBRARY', route: '/app/preview/fixture-app-ndxbook/library', screenshot: 'client-app-screen-20-library.png' },
  { screen: 21, name: 'LIBRARY CATEGORY', route: '/app/preview/fixture-app-ndxbook/library/approved-identity', screenshot: 'client-app-screen-21-library-category.png' },
  { screen: 22, name: 'FILE VIEWER', route: '/app/preview/fixture-app-ndxbook/library/approved-identity/file-1', screenshot: 'client-app-screen-22-file-viewer.png' },
  { screen: 23, name: 'BEHIND PROJECT', route: '/app/preview/fixture-app-ndxbook/project/behind', screenshot: 'client-app-screen-23-behind-project.png' },
  { screen: 24, name: 'POST-LAUNCH HOME', route: '/app/preview/fixture-app-post-launch', screenshot: 'client-app-screen-24-post-launch-home.png' },
  { screen: 25, name: 'POST-LAUNCH OPPORTUNITY', route: '/app/preview/fixture-app-post-launch-opportunity', screenshot: 'client-app-screen-25-post-launch-opportunity.png' },
];

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const { chromium } = await import('playwright');
  const browser = await chromium.launch({ headless: true });

  try {
    for (const screen of SCREENS) {
      const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
      const url = `${DEV_BASE}${screen.route}`;
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(screen.route === '/app' ? 400 : 700);
      const outPath = join(OUT_DIR, screen.screenshot);
      await page.screenshot({ path: outPath, fullPage: true });
      console.log(`Captured ${String(screen.screen).padStart(2, '0')} ${screen.name} → ${outPath}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
