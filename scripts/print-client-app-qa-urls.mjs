#!/usr/bin/env node
/** Print client app fixture QA URLs for mobile browser / BrowserStack Live. */
const base = (process.env.SITE00_QA_BASE ?? 'http://127.0.0.1:5174').replace(/\/$/, '');

const routes = [
  ['Fixture select', '/app/preview/select'],
  ['NDXBOOK home', '/app/preview/fixture-app-ndxbook'],
  ['Reviews', '/app/preview/fixture-app-ndxbook/reviews'],
  ['Review detail', '/app/preview/fixture-app-ndxbook/reviews/review-identity-direction-02'],
  ['Inbox', '/app/preview/fixture-app-ndxbook/inbox'],
  ['Library', '/app/preview/fixture-app-ndxbook/library'],
  ['Splash', '/app'],
  ['Auth project list', '/app/projects'],
];

console.log(`SITE 00 client app QA base: ${base}\n`);
for (const [label, path] of routes) {
  console.log(`${label}: ${base}${path}`);
}
