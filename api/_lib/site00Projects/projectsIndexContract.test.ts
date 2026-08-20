import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  assertNoDemoProjectsInIndex,
  getSite00ProjectsIndexPayload,
  listSite00FounderProjects,
} from './projectResolver.js';
import { resetNdxbookImportMemory, runNdxbookLegacyImport } from '../site00Evolve/providers/ndxbookLegacyImportService.js';
import { resetCreativeDirectionMemory } from '../site00Evolve/creativeDirection/engagementService.js';
import { resetPage001Memory } from '../site00Evolve/providers/page001CandidateService.js';

describe('GET /api/site00/projects?action=index runtime contract', () => {
  beforeEach(async () => {
    process.env.EVOLVE_USE_MEMORY = '1';
    resetNdxbookImportMemory();
    resetCreativeDirectionMemory();
    resetPage001Memory();
    await runNdxbookLegacyImport({ approvedBy: 'founder@test.com' });
  });

  it('projects API handler module exports default function', async () => {
    const mod = await import('../../site00/projects.js');
    expect(typeof mod.default).toBe('function');
  });

  it('resolver index returns three canonical founder projects', async () => {
    const projects = await listSite00FounderProjects();
    expect(projects.length).toBe(3);
    assertNoDemoProjectsInIndex(projects);
    expect(projects.map((p) => p.slug).sort()).toEqual(['frontal-slayer', 'ndxbook', 'studio-world']);
  });

  it('index payload includes ok summary contract', async () => {
    const payload = await getSite00ProjectsIndexPayload([]);
    expect(payload.ok).toBe(true);
    expect(payload.summary.founderIndex).toBe(3);
    expect(payload.summary.total).toBe(3);
    expect(payload.projects.some((p) => p.slug === 'ndxbook')).toBe(true);
  });

  it('route registration present in vite local api config', () => {
    const viteApi = readFileSync(join(process.cwd(), 'scripts/vite-site00-local-api.mjs'), 'utf8');
    expect(viteApi).toContain('/api/site00/projects');
  });
});
