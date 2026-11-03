import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = path.resolve(import.meta.dirname, '..');
const AUDIT = path.join(ROOT, 'JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1');

const REQUIRED = [
  'JURNL_CURRENT_PRODUCT_UTILITY_BASELINE.md',
  'JURNL_DAILY_FINANCIAL_JOURNEY_AUDIT.md',
  'JURNL_SUBSCRIPTION_MANAGEMENT_REFINEMENT.md',
  'JURNL_BILLS_AND_OBLIGATIONS_AUDIT.md',
  'JURNL_OBLIGATION_FUNDING_AND_RESERVATION_MODEL.md',
  'JURNL_PROACTIVE_FINANCIAL_ASSISTANCE_BLUEPRINT.md',
  'JURNL_TODAY_OPERATING_EXPERIENCE_AUDIT.md',
  'JURNL_CROSS_FAMILY_FINANCIAL_COORDINATION_MAP.md',
  'JURNL_PLAIN_LANGUAGE_AUDIT.csv',
  'JURNL_FUNCTIONAL_COPY_REPLACEMENT_MATRIX.md',
  'JURNL_FINANCIAL_TASK_FRICTION_REPORT.md',
  'JURNL_FINANCIAL_INTEGRITY_AND_REGRESSION_MATRIX.md',
  'JURNL_PERSONAL_ACCOUNTING_ASSISTANT_IMPLEMENTATION_ROADMAP.md',
  'JURNL_FOUNDER_PRODUCT_UTILITY_REVIEW.md',
  'JURNL_CURRENT_STATE_FEATURE_MATRIX.json',
  'JURNL_QA_JOURNEY_RESULTS.json',
];

describe('JURNL product utility audit deliverables', () => {
  it('includes all required manifest artifacts', () => {
    for (const f of REQUIRED) {
      expect(fs.existsSync(path.join(AUDIT, f)), f).toBe(true);
    }
  });

  it('plain language CSV has extracted rows', () => {
    const csv = fs.readFileSync(path.join(AUDIT, 'JURNL_PLAIN_LANGUAGE_AUDIT.csv'), 'utf8');
    const lines = csv.trim().split('\n');
    expect(lines.length).toBeGreaterThan(50);
  });
});
