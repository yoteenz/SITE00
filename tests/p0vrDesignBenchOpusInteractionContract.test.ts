import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import {
  TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE,
  TWIN_OPUS_DIRECT_VIEW_MODES,
} from '../src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace';

/**
 * P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1
 *
 * The interaction contract is only useful while it still describes the code it
 * cites. These guards fail when the contract and the architecture drift apart,
 * which is the failure mode that would quietly turn an approved contract into a
 * misleading one before Composer ever reads it.
 */

const CONTRACT_DIR = 'docs/design-workspace';

function readRepo(relative: string): string {
  return readFileSync(path.resolve(process.cwd(), relative), 'utf8');
}

function readContractDoc(name: string): string {
  return readRepo(path.join(CONTRACT_DIR, name));
}

const contract = JSON.parse(readContractDoc('composer-contract.json')) as Record<string, any>;
const inventory = readContractDoc('01-ELEMENT-INVENTORY.md');
const decisions = readContractDoc('07-INHERITANCE-AND-FOUNDER-DECISIONS.md');

const AUTHORITY_TYPES =
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceAuthorityTypes.ts';
const FEATURE_DEFINITIONS =
  'shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceFeatureAuthority/featureDefinitionsV1.ts';

describe('P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1 — document set', () => {
  it('ships every deliverable document', () => {
    for (const name of [
      'README.md',
      '01-ELEMENT-INVENTORY.md',
      '02-AUTHORITY-STATE-MACHINE.md',
      '03-STATE-MODEL.md',
      '04-ROUTES-AND-PAGES.md',
      '05-OVERLAYS-ASYNC-PERMISSIONS-EVENTS.md',
      '06-PARITY-RESPONSIVE-ACCESSIBILITY.md',
      '07-INHERITANCE-AND-FOUNDER-DECISIONS.md',
      'composer-contract.json',
    ]) {
      expect(readContractDoc(name).length).toBeGreaterThan(400);
    }
  });

  it('keeps the inventory arithmetic self-consistent', () => {
    const sections = Object.values(contract.INTERACTION_INVENTORY.sections) as Array<{
      elements: number;
      interactive: number;
    }>;
    const totals = contract.INTERACTION_INVENTORY.totals;

    expect(sections.reduce((sum, s) => sum + s.elements, 0)).toBe(totals.elements);
    expect(sections.reduce((sum, s) => sum + s.interactive, 0)).toBe(totals.interactive);
    expect(totals.elements - totals.interactive).toBe(totals.nonInteractive);
    expect(inventory).toContain(`| **Total** | **${totals.elements}** | **${totals.interactive}** |`);
  });

  it('gives every inventoried section a table in the inventory document', () => {
    for (const sectionId of Object.keys(contract.INTERACTION_INVENTORY.sections)) {
      expect(inventory).toContain(`· \`${sectionId}\``);
    }
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1 — bound to real architecture', () => {
  it('keeps every shipped authority event and adds only the three R1 authorised it', () => {
    const source = readRepo(AUTHORITY_TYPES);
    const shipped = source
      .split('export type AuthorityPipelineEventType =')[1]
      .split(';')[0]
      .match(/'([A-Z_]+)'/g)!
      .map((member) => member.replace(/'/g, ''));

    expect(shipped.length).toBeGreaterThan(0);
    // R1 (FD-08) authorised exactly three additions as a typed schema change.
    const authorisedAdditions = ['MOVED_TO_BUILD', 'CANDIDATE_REFINED', 'CANDIDATE_REGENERATED'];
    const union = contract.HISTORY_EVENTS.existingUnion as string[];
    for (const member of shipped) expect(union).toContain(member);
    expect([...union].sort()).toEqual([...shipped, ...authorisedAdditions].sort());
  });

  it('cites only feature ids that exist in the design workspace feature manifest', () => {
    const manifest = readRepo(FEATURE_DEFINITIONS);
    const cited = [
      'design_workspace_context',
      'design_workspace_navigation',
      'viewport_control',
      'active_design_target',
      'concept_candidate_gallery',
      'compare_concepts',
      'refine_concept',
      'regenerate_concept',
      'inspect_candidate',
      'select_mobile_master_candidate',
      'select_desktop_master_candidate',
      'promote_mobile_viewport_master',
      'promote_desktop_viewport_master',
      'replace_viewport_master',
      'review_authority_pair',
      'lock_authority_pair',
      'inspect_project_grounding',
      'inspect_blueprint',
      'inspect_overlay',
      'inspect_assets',
      'inspect_function_mapping',
      'compiler_readiness',
      'move_to_build',
      'technical_details',
      'design_history',
      'feature_change_history',
      'master_amendment_status',
      'contextual_next_action',
    ];

    for (const featureId of cited) {
      expect(manifest).toContain(`'${featureId}'`);
      expect(inventory + decisions).toContain(featureId);
    }
  });

  it('uses only authority states that the pipeline types declare', () => {
    const source = readRepo(AUTHORITY_TYPES);
    const pairStates = contract.STATE_MODEL.keys.authorityPair.values as string[];
    const masterStates = contract.STATE_MODEL.keys.mobileMaster.values as string[];
    const candidateStates = contract.STATE_MODEL.keys.candidateViewportStates.values as string[];

    for (const state of [...pairStates, ...masterStates, ...candidateStates]) {
      expect(source).toContain(`'${state}'`);
    }
  });

  it('records the states the sprint proposed but the architecture does not have', () => {
    const source = readRepo(AUTHORITY_TYPES);
    const machine = readContractDoc('02-AUTHORITY-STATE-MACHINE.md');

    for (const absent of ['UNDER_REVIEW', 'REPLACE_PENDING', 'PAIR_UNLOCKED']) {
      expect(source).not.toContain(`'${absent}'`);
      expect(machine).toContain(absent);
    }
  });

  it('matches the live view mode model', () => {
    expect(contract.VIEW_MODES.values).toEqual([...TWIN_OPUS_DIRECT_VIEW_MODES]);
    expect(contract.VIEW_MODES.default).toBe(TWIN_OPUS_DIRECT_DEFAULT_VIEW_MODE);

    const workspace = readRepo(
      'src/site00/components/designBench/opusDirect/twinOpusDirectWorkspace.ts',
    );
    const key = contract.VIEW_MODES.persistence.replace('sessionStorage:', '');
    expect(workspace).toContain(key);
    expect(workspace).toContain('sessionStorage');
  });
});

describe('P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1 — contract discipline', () => {
  it('adds no routes and no child pages', () => {
    expect(contract.ROUTE_MAP.newRoutesRequired).toBe(0);
    expect(contract.ROUTE.childRoutes).toEqual([]);
    expect(contract.ROUTE.grandchildRoutes).toEqual([]);
    expect(contract.CHILD_PAGE_MAP.confirmedChildPages).toBe(0);
    expect(contract.CHILD_PAGE_MAP.confirmedGrandchildPages).toBe(0);
  });

  it('documents every decision it declares', () => {
    // R1 resolved all nine, so the open list is empty and the resolved list carries them.
    expect(contract.UNRESOLVED_DECISIONS).toEqual([]);
    const ids = (contract.founderDecisions as Array<{ id: string }>).map((entry) => entry.id);
    expect(ids.length).toBe(9);
    expect(new Set(ids).size).toBe(ids.length);

    for (const id of ids) {
      expect(decisions).toContain(`### ${id} —`);
    }

    // Every FD referenced anywhere in the document set must be one of the declared ids.
    const referenced = new Set(
      [inventory, decisions, readContractDoc('04-ROUTES-AND-PAGES.md')]
        .join('\n')
        .match(/FD-\d\d/g) ?? [],
    );
    for (const ref of referenced) {
      expect(ids).toContain(ref);
    }
  });

  it('holds generation actions behind the existing server spend guard', () => {
    expect(contract.COST_GUARDS.costBearingElements).toEqual(['DW-CAND-001', 'DW-CAND-002']);
    expect(contract.COST_GUARDS.serverGuard).toContain('founderConfirmedSpend');
    expect(contract.COST_GUARDS.required.join(' ')).toContain('must not hardcode true');
    expect(readRepo('shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/designWorkspaceFeatureAuthority/featureDefinitionsV1.ts'))
      .toContain('regenerate_concept');
  });

  it('keeps canonical and list semantically identical', () => {
    const parity = readContractDoc('06-PARITY-RESPONSIVE-ACCESSIBILITY.md');
    expect(parity).toContain('`CANONICAL_LIST_SEMANTIC_PARITY: PASS`');
    expect(parity).not.toContain('| FAIL |');
  });

  it('documents productionized composer contract (P0.VR.DESIGN-PRODUCTION1)', () => {
    expect(contract.status).toBe('COMPOSER_PRODUCTIONIZED');
    expect(contract.COMPOSER_CONTRACT_STATUS).toBe('FROZEN_FOR_PRODUCTIONIZATION');
  });
});
