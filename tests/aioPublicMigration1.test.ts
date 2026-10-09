/**
 * P0.AIO.PUBLIC-WEBSITE.LIVE-LEGACY-AUDIT-RESPONSIVE-CREATIVE-RECONCILIATION-AND-MIGRATION-READINESS1 — the audit never
 * claims a production URL it could not verify; every current capability is classified with a test and evidence; issues
 * A–H are each re-verified and tied to a Composer task; the design record carries no price; the measured evidence shows
 * the long pages shorter and QA clean at the six sizes; nothing deployed, Brokerage paused; the exported docs in sync.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { aio as brain } from '../shared/studioos-experience-brain/index.js';
import { AIO_PM_DOCS_DIR, aioPublicMigrationFiles, aioPublicMigrationQualityGate } from '../scripts/studioos/aio-public-migration-export.js';

describe('The live / legacy audit', () => {
  it('validates clean', () => {
    expect(brain.validatePublicMigration()).toEqual([]);
  });

  it('never claims a production URL it did not verify', () => {
    expect(brain.AIO_PM_LIVE.production_url).toBeNull();
    expect(brain.AIO_PM_LIVE.verified).toBe(false);
    expect(brain.AIO_PM_STATUS.live_site).toMatch(/^NOT VERIFIED/);
    expect(brain.AIO_PM_STATUS.audit_basis).toMatch(/NOT PRODUCTION$/);
    expect(brain.AIO_PM_LIVE.screen_recordings).toMatch(/^NONE INSPECTED/);
  });

  it('notices a claimed production URL (the check is not vacuous)', () => {
    const live = brain.AIO_PM_LIVE as { production_url: string | null };
    live.production_url = 'https://example.com';
    try {
      expect(brain.validatePublicMigration()).toContain('a production URL is claimed — it was not verified');
    } finally {
      live.production_url = null;
    }
  });

  it('classifies every capability with a destination, a test and evidence', () => {
    expect(brain.AIO_PM_INVENTORY.length).toBeGreaterThanOrEqual(40);
    for (const r of brain.AIO_PM_INVENTORY) {
      expect(r.classes.length, r.id).toBeGreaterThan(0);
      expect(r.test && r.evidence && r.destination, r.id).toBeTruthy();
    }
    for (const id of ['contact', 'intake', 'login', 'signup', 'schedule', 'quote', 'request-submit', 'name-check', 'i18n', 'debug-icons']) expect(brain.AIO_PM_INVENTORY.find((r) => r.id === id), id).toBeTruthy();
  });

  it('re-verifies issues A–H against the source, each with a Composer task', () => {
    expect(brain.AIO_PM_ISSUES.map((i) => i.id)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']);
    for (const i of brain.AIO_PM_ISSUES) expect(brain.AIO_PM_COMPOSER_TASKS.some((t) => t.id === i.task), i.id).toBe(true);
  });

  it('records the conflicts where the design must not simplify live behaviour', () => {
    const c = brain.AIO_PM_ROUTES.conflicts.join(' ');
    for (const w of ['CREATE ACCOUNT', 'SCHEDULE', 'LANGUAGE', 'BROKERAGE', 'GET STARTED']) expect(c).toContain(w);
  });
});

describe('The design and its evidence', () => {
  it('stays a candidate: nothing deployed, live app unchanged, Brokerage paused, privacy gaps open', () => {
    expect(brain.AIO_PM_STATUS.public_design).toMatch(/NOT DEPLOYED$/);
    expect(brain.AIO_PM_STATUS.live_app).toMatch(/^NOT CHANGED/);
    expect(brain.AIO_PM_STATUS.brokerage).toMatch(/^PAUSED/);
    expect(brain.AIO_PM_STATUS.security).toMatch(/PRIVACY GAPS STILL OPEN/);
    expect(brain.AIO_PM_RELEASE.map((s) => s.stage)).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09']);
  });

  it('measured: QA clean at six sizes; the long pages shorter', () => {
    const E = brain.AIO_PM_EVIDENCE;
    expect(E.qa.fail).toBe(0);
    expect(E.qa.sizes).toEqual(['s360', 'phone', 'tablet', 'tabletL', 'desktop', 'wide']);
    const at = (p: string) => E.scroll.find((x) => x.path === p)!;
    expect(at('/services').after.phone).toBeLessThan(at('/services').before.phone / 2);
    expect(at('/services/permitting').after.phone).toBeLessThan(at('/services/permitting').before.phone);
    expect(at('/roadmap').after.desktop).toBeLessThan(at('/roadmap').before.desktop);
    expect(at('/').after.desktop).toBeLessThan(at('/').before.desktop);
  });

  it('carries no price and keeps the retired hero asset out', () => {
    expect(JSON.stringify([brain.AIO_PM_DESIGN, brain.AIO_PM_ASSETS, brain.AIO_PM_ROUTES])).not.toMatch(/\$\s?\d/);
    expect(brain.AIO_PM_ASSETS.find((a) => /all-in-one-hero-truck/.test(a.asset))?.status).toMatch(/^RETIRED/);
  });
});

describe('Exports', () => {
  it('the twenty deliverables, README, JSON and gate are in sync with the record', () => {
    const files = aioPublicMigrationFiles();
    expect(Object.keys(files).filter((f) => /^\d\d_/.test(f))).toHaveLength(20);
    for (const [f, body] of Object.entries(files)) expect(readFileSync(`${AIO_PM_DOCS_DIR}/${f}`, 'utf8'), f).toBe(body);
    expect(aioPublicMigrationQualityGate().problems).toEqual([]);
  });
});
