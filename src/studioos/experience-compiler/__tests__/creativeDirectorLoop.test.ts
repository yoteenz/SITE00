import { describe, expect, it, beforeEach } from 'vitest';
import { compileCreativeContextPack, contextSourcePriorityLabel } from '../../../../shared/studioos-experience-compiler/creativeDirector/contextPackCompiler.js';
import { validateTaskOutput } from '../../../../shared/studioos-experience-compiler/creativeDirector/outputValidation.js';
import { translateFounderMessageToRevision } from '../../../../shared/studioos-experience-compiler/creativeDirector/revisionTranslator.js';
import { downstreamGateReadiness, compileVisualAuthorityModelHandoff } from '../../../../shared/studioos-experience-compiler/creativeDirector/handoffs.js';
import {
  applyFounderJudgmentToThread,
  createCreativeThread,
  runCreativeDirectorAgent,
} from '../../../../api/_lib/experienceCompilerCreativeDirector/creativeDirectorAgent.js';
import { resetExperienceCompilerCreativeDirectorStore, saveThread } from '../../../../api/_lib/experienceCompilerCreativeDirector/store.js';
import {
  creativeDirectorRuntimeBlocked,
  normalizeCreativeDirectorModelId,
  validateModelIdentifier,
} from '../../../../api/_lib/experienceCompilerCreativeDirector/config.js';
import {
  canPromoteJudgmentToApproval,
  isQuarantinedTestJudgment,
  TEST_JUDGMENT_PREFIX,
} from '../../../../shared/studioos-experience-compiler/creativeDirector/judgmentQuarantine.js';
import { buildCreativeHistoryLines } from '../../../../shared/studioos-experience-compiler/creativeDirector/historyAdapter.js';
import { bootstrapSite00IngestWorkspace } from '../workspace/bootstrap';
import { buildCreativeDirectorSnapshot } from '../creativeDirector/workspaceSnapshot';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ExperienceCompilerCreativeDirectorPanel } from '../../../site00/components/studio/ExperienceCompilerCreativeDirectorPanel';

beforeEach(() => {
  resetExperienceCompilerCreativeDirectorStore();
});

describe('CreativeContextPack', () => {
  it('compiles deterministic manifest sections with priority rules documented', async () => {
    expect(contextSourcePriorityLabel()[0]).toContain('APPROVED');
    const ws = bootstrapSite00IngestWorkspace('site00');
    const snapshot = buildCreativeDirectorSnapshot(ws);
    const thread = await createCreativeThread({
      project_id: ws.project_id,
      project_slug: 'site00',
      title: 'SITE 00 → YOUR SPACE → CREATIVE ARCHITECTURE',
      task_mode: 'CONCEPT_TERRITORIES',
    });
    const pack = compileCreativeContextPack({
      snapshot,
      thread,
      task_mode: 'CONCEPT_TERRITORIES',
      approved_artifacts: [],
      rejected_directions: ['too operational dashboard'],
    });
    expect(pack.manifest.length).toBeGreaterThan(3);
    expect(pack.rejected_directions).toContain('too operational dashboard');
    expect(JSON.stringify(pack.task_relevant_context)).toContain('your_space_seed');
  });
});

describe('structured output validation', () => {
  it('requires exactly 3 concept territories', () => {
    const bad = validateTaskOutput('CONCEPT_TERRITORIES', { territories: [{ name: 'A' }] });
    expect(bad.ok).toBe(false);
    const good = validateTaskOutput('CONCEPT_TERRITORIES', {
      territories: [
        territory('T1', 'Alpha Threshold'),
        territory('T2', 'Client Vault'),
        territory('T3', 'Operations Gallery'),
      ],
      creative_rationale: 'Distinct spatial metaphors',
    });
    expect(good.ok).toBe(true);
  });
});

describe('founder revision translator', () => {
  it('maps natural language into preserve/reject instructions', () => {
    const rev = translateFounderMessageToRevision(
      'I like territory 2, but it feels too operational. Make it more personal and owned by the client.',
    );
    expect(rev.founder_note).toContain('territory 2');
    expect(rev.requested_change).toMatch(/client ownership/i);
  });
});

describe('CreativeDirectorAgent persistence', () => {
  it('creates thread and blocks live model in vitest without corrupting state', async () => {
    const ws = bootstrapSite00IngestWorkspace('site00');
    const snapshot = buildCreativeDirectorSnapshot(ws);
    const thread = await createCreativeThread({
      project_id: ws.project_id,
      project_slug: 'site00',
      title: 'YOUR SPACE',
      task_mode: 'CONCEPT_TERRITORIES',
    });
    expect(creativeDirectorRuntimeBlocked()?.code).toBe('MODEL_RUNTIME_BLOCKED');
    const result = await runCreativeDirectorAgent({
      thread_id: thread.thread_id,
      snapshot,
      founder_initiated: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok && 'blocked' in result) {
      expect(result.blocked?.missing).toContain('LIVE_MODEL_CALLS_DISABLED_IN_VITEST');
    }
  });

  it('records founder judgment for next run context', async () => {
    const thread = await createCreativeThread({
      project_id: 'p1',
      project_slug: 'site00',
      title: 't',
      task_mode: 'CONCEPT_TERRITORIES',
    });
    const withArt = {
      ...thread,
      active_artifact_id: 'art1',
      artifacts: [
        {
          artifact_id: 'art1',
          thread_id: thread.thread_id,
          project_id: 'p1',
          task_mode: 'CONCEPT_TERRITORIES' as const,
          context_pack_id: 'ctx',
          model: 'test',
          parent_artifact_ids: [],
          founder_judgment_ids: [],
          created_at: new Date().toISOString(),
          approval_state: 'AWAITING_FOUNDER' as const,
          superseded_by: null,
          payload: { territories: [] },
        },
      ],
    };
    await saveThread(withArt);
    const updated = await applyFounderJudgmentToThread({
      thread_id: thread.thread_id,
      artifact_id: 'art1',
      action: 'PUSH_FURTHER',
      founder_note: 'More personal',
    });
    expect(updated?.judgments).toHaveLength(1);
    expect(updated?.run_status).toBe('REVISION_REQUESTED');
  });
});

describe('model config', () => {
  it('strips reasoning suffix from model id', () => {
    expect(normalizeCreativeDirectorModelId('gpt-5.6-sol-medium')).toBe('gpt-5.6-sol');
    const v = validateModelIdentifier('gpt-5.6-sol-medium');
    expect(v.ok).toBe(false);
    expect(validateModelIdentifier('gpt-5.6-sol').ok).toBe(true);
  });
});

describe('test judgment quarantine', () => {
  it('blocks LOVE_IT promotion for TEST_JUDGMENT_ONLY notes', () => {
    const note = `${TEST_JUDGMENT_PREFIX}: promising territory B for proof only`;
    expect(isQuarantinedTestJudgment(note)).toBe(true);
    expect(canPromoteJudgmentToApproval('LOVE_IT', note)).toBe(false);
    expect(canPromoteJudgmentToApproval('LOVE_IT', 'Real founder note')).toBe(true);
  });

  it('marks quarantined lines in history adapter', async () => {
    const thread = await createCreativeThread({
      project_id: 'p1',
      project_slug: 'site00',
      title: 't',
      task_mode: 'CONCEPT_TERRITORIES',
    });
    const withJudgment = {
      ...thread,
      judgments: [
        {
          judgment_id: 'j1',
          artifact_id: 'a1',
          thread_id: thread.thread_id,
          project_id: 'p1',
          action: 'PROMISING' as const,
          founder_note: `${TEST_JUDGMENT_PREFIX} note`,
          preserve: [],
          reject: [],
          combine_with: null,
          requested_change: 'test',
          created_at: new Date().toISOString(),
        },
      ],
    };
    const lines = buildCreativeHistoryLines(withJudgment);
    expect(lines.some((l) => l.quarantined)).toBe(true);
  });
});

describe('lineage and handoffs', () => {
  it('computes downstream readiness without bypassing asset surgery', () => {
    const readiness = downstreamGateReadiness([]);
    expect(readiness.asset_surgery).toBe(false);
    expect(readiness.composer).toBe(false);
    const handoff = compileVisualAuthorityModelHandoff({ artifacts: [], founder_constraints: [] });
    expect(handoff).toBeNull();
  });
});

describe('workspace UI shell', () => {
  it('renders creative director 3-column workspace markup (no fabricated territories)', () => {
    const ws = bootstrapSite00IngestWorkspace('site00');
    const html = renderToStaticMarkup(createElement(ExperienceCompilerCreativeDirectorPanel, { state: ws }));
    expect(html).toContain('ec-cd__grid');
    expect(html).toContain('Project intelligence');
    expect(html).toContain('Founder judgment');
    expect(html).toContain('No structured territories yet');
    const outDir = 'docs/studioos/experience-compiler/CREATIVE-DIRECTOR-LOOP1';
    mkdirSync(outDir, { recursive: true });
    writeFileSync(`${outDir}/proof-desktop-markup.html`, `<!doctype html><body>${html}</body>`);
  });
});

describe('security', () => {
  it('client API module does not embed server API keys', () => {
    const src = readFileSync('src/site00/services/experienceCompilerCreativeDirectorApi.ts', 'utf8');
    expect(src).not.toMatch(/process\.env\.OPENAI_API_KEY/);
    expect(src).not.toMatch(/sk-[a-zA-Z0-9]/);
  });
});

function territory(id: string, name: string) {
  return {
    territory_id: id,
    name,
    core_idea: 'idea',
    spatial_metaphor: 'metaphor',
    emotional_objective: 'feel',
    experience_logic: 'logic',
    information_architecture: 'ia',
    interaction_language: 'ix',
    visual_language: 'vis',
    mobile_expression: 'm',
    tablet_expression: 't',
    desktop_expression: 'd',
    app_expression: 'a',
    image_authority_needs: [],
    live_code_needs: [],
    risks: [],
    failure_conditions: [],
    project_alignment: 'align',
  };
}
