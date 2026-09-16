/**
 * P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1R1 — contract freeze guards.
 *
 * The point of the freeze is that Composer receives no ambiguity. These guards
 * fail if an unresolved marker reappears, if a decision loses its reasoning, or
 * if this semantics-only sprint acquires a visual change.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const read = (relative: string) => readFileSync(resolve(root, relative), 'utf8');

const contract = JSON.parse(read('docs/design-workspace/composer-contract.json'));
const resolutions = read('docs/design-workspace/08-FOUNDER-DECISION-RESOLUTIONS.md');
const serialised = JSON.stringify(contract);

const FD_IDS = ['FD-01', 'FD-02', 'FD-03', 'FD-04', 'FD-05', 'FD-06', 'FD-07', 'FD-08', 'FD-09'];

describe('OPUS-INTERACTION-CONTRACT1R1 — every founder decision is resolved', () => {
  it('carries all nine decisions', () => {
    expect(contract.founderDecisions.map((d: { id: string }) => d.id)).toEqual(FD_IDS);
  });

  it('gives each decision a non-empty answer and a target element', () => {
    for (const entry of contract.founderDecisions) {
      expect(entry.decision, entry.id).toBeTruthy();
      expect(String(entry.decision).length, entry.id).toBeGreaterThan(12);
      expect(entry.element, entry.id).toBeTruthy();
      expect(entry.question, entry.id).toBeTruthy();
    }
  });

  it('documents each decision in the resolutions document', () => {
    for (const id of FD_IDS) {
      expect(resolutions).toContain(`## ${id} —`);
      expect(resolutions).toContain(`${id.replace('-', '-')}_DECISION`);
    }
  });

  it('leaves the unresolved list empty', () => {
    expect(contract.UNRESOLVED_DECISIONS).toEqual([]);
  });

  it('has no FOUNDER_DECISION_REQUIRED or unresolved marker anywhere', () => {
    expect(serialised).not.toContain('FOUNDER_DECISION_REQUIRED');
    expect(serialised).not.toContain('"unresolved":');
  });

  it('sits at FOUNDER_APPROVAL_PENDING, not production-ready', () => {
    expect(contract.status).toBe('FOUNDER_APPROVAL_PENDING');
    expect(contract.COMPOSER_CONTRACT_STATUS).toBe('FOUNDER_APPROVAL_PENDING');
    expect(serialised).not.toContain('FROZEN_FOR_PRODUCTIONIZATION');
  });

  it('supersedes the R0 contract and records where the reasoning lives', () => {
    expect(contract.version).toBe('2.0.0');
    expect(contract.sprint).toBe('P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1R1');
    expect(contract.supersedes).toBe('P0.VR.DESIGNBENCH.OPUS-INTERACTION-CONTRACT1');
    expect(contract.resolutionsDocument).toBe('docs/design-workspace/08-FOUNDER-DECISION-RESOLUTIONS.md');
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — required sections', () => {
  it.each([
    'founderDecisions',
    'authorityModel',
    'readinessModel',
    'buildTransition',
    'permissionModel',
    'navigationModel',
    'sourceResolution',
    'targetSemantics',
    'spendGuard',
    'eventTaxonomy',
    'persistenceContract',
  ])('includes %s', (section) => {
    expect(contract[section]).toBeTruthy();
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — FD-05 authority arity', () => {
  it('keeps the authority pair at two viewports', () => {
    expect(contract.authorityModel.approvedViewports).toEqual(['MOBILE', 'DESKTOP']);
    expect(contract.authorityModel.derivedViewports).toEqual(['TABLET']);
    expect(contract.authorityModel.arity).toContain('PAIR');
  });

  it('keeps TABLET out of authority while leaving it a presentation viewport', () => {
    expect(contract.authorityModel.approvedViewports).not.toContain('TABLET');
    expect(contract.authorityModel.presentationViewportUnion).toContain('TABLET');
    expect(contract.authorityModel.derivedViewportContract.disabledReasonCode).toBe(
      'AUTHORITY_NOT_APPLICABLE_FOR_DERIVED_VIEWPORT',
    );
  });

  it('records why a third slot and a conditional slot were both rejected', () => {
    const rejected = contract.founderDecisions.find((d: { id: string }) => d.id === 'FD-05').rejected;
    expect(Object.keys(rejected).length).toBeGreaterThanOrEqual(3);
    for (const reason of Object.values(rejected)) expect(String(reason).length).toBeGreaterThan(20);
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — FD-07 readiness is deterministic', () => {
  const model = contract.readinessModel;

  it('computes from the receipt rather than preserving the mock value', () => {
    expect(model.source).toContain('scopedCompilerReadiness');
    expect(model.formula).toContain('passedGates / applicableGates');
    expect(model.currentComputedValues.mockValueRejected).toBe(82);
    expect(contract.founderDecisions.find((d: { id: string }) => d.id === 'FD-07').preserves82).toBe(false);
  });

  it('reproduces the stated percentages from the stated gate counts', () => {
    const { total } = model.gateCount;
    const applicable = total - 1; // move_to_build is NOT_APPLICABLE
    const blockedBuildGate = 1; // BUILD ACTION STATUS
    const approved = Math.round((100 * (applicable - blockedBuildGate)) / applicable);
    const notApproved = Math.round((100 * (applicable - blockedBuildGate - 1)) / applicable);
    expect(approved).toBe(model.currentComputedValues.withTranslationApproved);
    expect(notApproved).toBe(model.currentComputedValues.withoutTranslationApproved);
  });

  it('refuses to make the percentage a gate', () => {
    expect(model.percentageIsAGate).toBe(false);
    expect(model.readyThreshold).toBeNull();
    expect(model.readyLabelRule).toContain('blockers.length === 0');
  });

  it('defines all four status counts', () => {
    expect(Object.keys(model.countDefinitions).sort()).toEqual([
      'APPROVED ELEMENTS',
      'BLOCKERS',
      'PENDING DECISIONS',
      'WARNINGS',
    ]);
    for (const definition of Object.values(model.countDefinitions)) {
      expect(String(definition).length).toBeGreaterThan(15);
    }
  });

  it('states build eligibility as explicit conditions', () => {
    expect(model.buildEligibilityRule.length).toBeGreaterThanOrEqual(4);
    expect(model.buildEligibilityRule.join(' ')).toContain('PAIR_LOCKED');
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — FD-08 build transition', () => {
  const build = contract.buildTransition;

  it('makes BUILD a stage and a status, never a route', () => {
    expect(build.buildIs).toEqual(['WORKFLOW_STAGE', 'PACKAGE_STATUS']);
    expect(build.buildIsNot).toContain('ROUTE');
    expect(build.navigates).toBe(false);
    expect(build.destination).toBeNull();
  });

  it('names a typed event consistent with the existing union style', () => {
    expect(build.eventType).toBe('MOVED_TO_BUILD');
    expect(contract.eventTaxonomy.union).toContain('MOVED_TO_BUILD');
    for (const member of contract.eventTaxonomy.union) expect(member).toMatch(/^[A-Z][A-Z_]+$/);
  });

  it('replaces the hardcoded buildPass and keeps Composer handoff manual', () => {
    expect(build.stateTransition.buildPass).toContain('hardcoded false');
    expect(build.triggersComposerAutomatically).toBe(false);
    expect(build.triggeredBy).toBe('FOUNDER');
  });

  it('is forward-only and freezes the package', () => {
    expect(build.rollback).toContain('none');
    expect(build.frozenArtifacts.length).toBeGreaterThanOrEqual(5);
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — FD-06 review semantics and permissions', () => {
  const fd06 = contract.founderDecisions.find((d: { id: string }) => d.id === 'FD-06');

  it('separates the three controls, with only the lock committing', () => {
    expect(fd06.pairReview.stateChange).toBe(false);
    expect(fd06.reviewAuthority.stateChange).toBe(false);
    expect(fd06.pairReview.event).toBeNull();
    expect(fd06.reviewAuthority.event).toBeNull();
    expect(fd06.lockAuthority.event).toBe('PAIR_LOCKED');
  });

  it('gives REVIEW AUTHORITY a distinct job rather than duplicating PAIR REVIEW', () => {
    expect(fd06.reviewAuthority.treatment).not.toBe(fd06.pairReview.treatment);
    expect(fd06.reviewAuthority.shows.length).toBeGreaterThanOrEqual(5);
  });

  it('adopts only roles that exist in the codebase', () => {
    const roles = Object.keys(contract.permissionModel.roles);
    expect(roles).toContain('FOUNDER');
    expect(roles).not.toContain('EDITOR');
    expect(roles).not.toContain('VIEWER');
    expect(Object.keys(contract.permissionModel.rolesNotAdopted).sort()).toEqual(['EDITOR', 'VIEWER']);
  });

  it('keeps authorization server-side and never trusts UX context', () => {
    expect(contract.permissionModel.authorization).toBe('server-authoritative');
    expect(contract.permissionModel.uxContextIsAuthoritative).toBe(false);
  });

  it('restricts every mutating action to the founder', () => {
    for (const action of ['promote mobile', 'lock authority pair', 'move to build', 'regenerate concept']) {
      expect(contract.permissionModel.founderOnlyActions).toContain(action);
    }
    expect(contract.permissionModel.unlockPermission).toContain('does not exist');
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — navigation, target and source', () => {
  it('keeps the hamburger and the visible nav disjoint', () => {
    expect(contract.navigationModel.hamburger.listsDesignSections).toBe(false);
    expect(contract.navigationModel.disjointnessRule).toBeTruthy();
  });

  it('adds no routes anywhere in the resolution set', () => {
    expect(contract.navigationModel.newRoutesRequired).toBe(0);
    expect(contract.sourceResolution.newRoutesRequired).toBe(0);
    for (const entry of contract.founderDecisions) {
      if ('newRoutes' in entry) expect(entry.newRoutes, entry.id).toBe(0);
    }
  });

  it('keeps TARGET readonly and out of the route map', () => {
    expect(contract.targetSemantics.interactive).toBe(false);
    expect(contract.targetSemantics.appearsInRouteMap).toBe(false);
    expect(contract.targetSemantics.role).toBe('READONLY_DATA');
  });

  it('resolves SOURCE to a shared provenance drawer', () => {
    expect(contract.sourceResolution.destinationType).toBe('DRAWER');
    expect(contract.sourceResolution.destination).toBe('OV-PROVENANCE');
    expect(contract.sourceResolution.entryPoints).toContain('DW-AUTH-017');
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — spend guard is no longer bypassed', () => {
  it('names the real defect rather than describing the guard as absent', () => {
    expect(contract.spendGuard.defect).toContain('founderConfirmedSpend: true');
    expect(contract.spendGuard.defect).toContain('confirmation that never happened');
  });

  it('requires an estimate id to accompany confirmation', () => {
    expect(contract.spendGuard.required.confirmation).toContain('spendConfirmationId');
    expect(contract.spendGuard.required.hardcodingForbidden).toContain('never hardcode');
  });

  it('covers ceiling, cancel, provider failure and receipt', () => {
    for (const key of ['perRunLimit', 'cancel', 'providerFailure', 'receipt', 'projectBudget']) {
      expect(contract.spendGuard.required[key]).toBeTruthy();
    }
  });

  it('forbids hardcoding in the Composer preconditions', () => {
    expect(contract.COMPOSER_PRECONDITIONS.join(' ')).toContain('do not hardcode founderConfirmedSpend');
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — event taxonomy and persistence', () => {
  it('completes the union at eleven members with no generic names', () => {
    expect(contract.eventTaxonomy.union).toHaveLength(11);
    expect(contract.HISTORY_EVENTS.existingUnion).toEqual(contract.eventTaxonomy.union);
    expect(contract.HISTORY_EVENTS.missingMembers).toEqual([]);
  });

  it('gives every added event a payload contract', () => {
    for (const [name, payload] of Object.entries(contract.eventTaxonomy.added)) {
      expect(contract.eventTaxonomy.union).toContain(name);
      expect((payload as string[]).length).toBeGreaterThanOrEqual(7);
    }
  });

  it('distinguishes refine lineage from regenerate lineage in the payloads', () => {
    expect(contract.eventTaxonomy.added.CANDIDATE_REFINED).toContain('parentCandidateId');
    expect(contract.eventTaxonomy.added.CANDIDATE_REGENERATED).toContain('siblingOfCandidateId');
  });

  it('defines server persistence without claiming it was implemented', () => {
    expect(contract.persistenceContract.implementedInThisSprint).toBe(false);
    expect(contract.persistenceContract.canonicalStore).toContain('server');
    expect(contract.persistenceContract.versioning).toContain('optimistic concurrency');
    expect(contract.persistenceContract.localCache).toContain('cache only');
  });
});

describe('OPUS-INTERACTION-CONTRACT1R1 — no visual mutation', () => {
  const canonicalView = read('src/site00/components/designBench/opusDirect/TwinOpusDirectCanonicalView.tsx');
  const listView = read('src/site00/components/designBench/opusDirect/TwinOpusDirectListView.tsx');

  it('leaves the renderers resolving assets through the manifest, untouched by this sprint', () => {
    expect(canonicalView).toContain("from './twinOpusDirectAssetManifest'");
    expect(listView).toContain("from './twinOpusDirectAssetManifest'");
  });

  it('adds no route for any decision', () => {
    const routes = read('src/site00/config/routes.ts');
    expect(routes).not.toContain('provenance');
    expect(routes).not.toContain('campaign-archive');
    expect(routes).not.toContain('creative-context');
  });
});
