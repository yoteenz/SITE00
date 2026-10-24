import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import * as X from '../shared/site00-fiction-production/index.js';
import { buildDirectorialDocs } from '../scripts/the-exchange/directorial-docs/build.js';
import { COPIED_DELIVERABLES, DOCS_DIR } from '../scripts/the-exchange/directorial-docs/md.js';

const root = process.cwd();
const read = (rel: string) => fs.readFileSync(path.join(root, rel), 'utf8');
const files = buildDirectorialDocs(root);
const review = files['00_FOUNDER_REVIEW_S1-01_DUSK.md'];

describe('THE EXCHANGE directorial engine V2 deliverables', () => {
  it('commits every generated deliverable exactly as rendered from committed data', () => {
    expect(Object.keys(files).length).toBe(24);
    for (const [name, body] of Object.entries(files)) expect(read(`${DOCS_DIR}/${name}`), name).toBe(body);
  });

  it('carries machine-readable deliverables as byte copies of the canonical files, not parallel registries', () => {
    for (const [name, from] of Object.entries(COPIED_DELIVERABLES)) expect(read(`${DOCS_DIR}/${name}`), name).toBe(read(from));
    const schema = JSON.parse(files['13_CHARACTER_PERFORMANCE_DIRECTION_SCHEMA.json']) as { baselines: unknown };
    expect(schema.baselines).toEqual(JSON.parse(JSON.stringify(X.Directorial.PERFORMANCE_BASELINES)));
  });

  it('keeps the founder review to sections A to I, with every open decision and no approval claims', () => {
    const headings = [...review.matchAll(/^## ([A-I])\. /gm)].map((m) => m[1]);
    expect(headings).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']);
    const packet = JSON.parse(read(X.scenePath('S1-01', X.SCENE_FILES.packet))) as X.Directorial.ScenePacket;
    for (const d of packet.sections['9_FOUNDER_DECISIONS']) expect(review).toContain(`| ${d.decisionId} |`);
    expect(review).toMatch(/DRAFT — FOUNDER REVIEW REQUIRED/);
    expect(review).toMatch(/No credits spent/);
    expect(review).toMatch(/did not verify them independently/);
    expect(review).not.toMatch(/\| NONE \|/);
    expect(review).not.toMatch(/production[- ]approved/i);
  });
});
