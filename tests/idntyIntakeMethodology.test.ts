import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const REPO = path.resolve(import.meta.dirname, '..');
const INTAKE = path.join(REPO, 'docs/site00/idnty/intake');

function readJson(name: string): unknown {
  return JSON.parse(fs.readFileSync(path.join(INTAKE, name), 'utf8'));
}

describe('IDNTY intake methodology artifacts', () => {
  const schema = readJson('IDNTY_DIMENSION_SCHEMA.json') as {
    canonical_dimensions: string[];
    dimensions: Record<string, { fields: { field_id: string; required?: boolean }[] }>;
  };
  const bank = readJson('IDNTY_QUESTION_BANK.json') as {
    questions: { question_id: string; field_targets: string[]; entry_states: string[] }[];
  };
  const fieldMap = readJson('IDNTY_QUESTION_FIELD_MAP.json') as {
    mappings: { question_id: string; field_targets: string[] }[];
  };
  const aio = readJson('AIO_IDNTY_INTAKE_VALIDATION_CASE.json') as {
    validation_result: string;
    dimensions: Record<string, unknown>;
  };

  it('defines exactly 12 canonical dimensions', () => {
    expect(schema.canonical_dimensions).toHaveLength(12);
    expect(schema.canonical_dimensions[0]).toBe('IDNTY_01_TRUTH');
    expect(schema.canonical_dimensions[11]).toBe('IDNTY_12_AUTHORITY');
  });

  it('maps every required field to at least one question', () => {
    const targeted = new Set<string>();
    for (const q of bank.questions) {
      for (const t of q.field_targets) targeted.add(t);
    }
    const missing: string[] = [];
    for (const dimId of schema.canonical_dimensions) {
      for (const f of schema.dimensions[dimId].fields) {
        if (!f.required) continue;
        const key = `${dimId}.${f.field_id}`;
        const covered =
          targeted.has(key) ||
          [...targeted].some((t) => t.startsWith(`${dimId}.${f.field_id}`));
        if (!covered) missing.push(key);
      }
    }
    expect(missing, `Orphan required fields: ${missing.join(', ')}`).toEqual([]);
  });

  it('has no orphan questions without field targets', () => {
    const orphans = bank.questions.filter((q) => !q.field_targets?.length);
    expect(orphans.map((q) => q.question_id)).toEqual([]);
  });

  it('field map aligns with question bank ids', () => {
    const qids = new Set(bank.questions.map((q) => q.question_id));
    for (const m of fieldMap.mappings) {
      expect(qids.has(m.question_id), m.question_id).toBe(true);
    }
  });

  it('AIO validation case passes with 12 dimensions', () => {
    expect(aio.validation_result).toBe('PASS');
    expect(Object.keys(aio.dimensions)).toHaveLength(12);
  });

  it('includes voice genome and authority in AIO case', () => {
    const personality = aio.dimensions.IDNTY_04_PERSONALITY as { voice_genome?: unknown };
    const authority = aio.dimensions.IDNTY_12_AUTHORITY as { interpreted_fields?: unknown };
    expect(personality.voice_genome).toBeTruthy();
    expect(authority.interpreted_fields).toBeTruthy();
  });

  it('does not use banned client-as-designer question patterns in core bank', () => {
    const banned = [/what kind of logo/i, /what colors do you like/i, /pick three adjectives/i];
    const hits = bank.questions.filter((q) => {
      const text = (q as { question_text?: string }).question_text ?? '';
      return banned.some((re) => re.test(text));
    });
    expect(hits.map((h) => h.question_id)).toEqual([]);
  });
});
