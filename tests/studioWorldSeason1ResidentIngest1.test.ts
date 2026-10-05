import { describe, expect, it } from 'vitest';

import {
  findActorByCatalogueNumber,
  getProductionCastingResidentTalentCatalogue,
  getStudioWorldActorCatalogue,
  listStudioWorldResidentTalentActors,
} from '../shared/site00-studio-world/acting-catalogue/index.js';
import {
  getStudioWorldSeason1Relationships,
  getStudioWorldSeason1ResidentDossiers,
  validateCastRoleOverridesForResident,
} from '../shared/site00-studio-world/resident-intelligence/index.js';
import { findResidentDossierById } from '../shared/site00-studio-world/resident-intelligence/season1-ensemble/residents.js';

describe('P0.STUDIOOS.PRODUCTION.EXPRESSION.STUDIOWORLD-RESIDENT-INGEST1', () => {
  it('exposes exactly 8 canonical Studio World residents to Production intelligence', () => {
    const dossiers = getStudioWorldSeason1ResidentDossiers();
    expect(dossiers).toHaveLength(8);
    expect(dossiers.every((d) => d.sourceResidentId.startsWith('SW-RESIDENT-'))).toBe(true);
  });

  it('uses SW resident IDs and Zuri Xu is canonical (no Hale)', () => {
    const zuri = findResidentDossierById('SW-RESIDENT-002')!;
    expect(zuri.canonicalName).toBe('ZURI XU');
    const names = getStudioWorldSeason1ResidentDossiers().flatMap((d) => [d.canonicalName, ...d.aliases]);
    expect(names.some((n) => /\bHale\b/i.test(n))).toBe(false);
  });

  it('preserves Marlowe age 54 and larger-body requirement', () => {
    const marlowe = findResidentDossierById('SW-RESIDENT-007')!;
    expect(marlowe.agePresentation).toBe('54');
    expect(marlowe.identityConstraints.join(' ')).toMatch(/Larger-bodied/i);
    const actor = listStudioWorldResidentTalentActors().find((a) => a.catalogueNumber === 'SW-RESIDENT-007')!;
    expect(actor.build).toMatch(/Larger-bodied/i);
  });

  it('preserves Caspian fluid sexuality and EV OPEN sexuality', () => {
    expect(findResidentDossierById('SW-RESIDENT-005')!.sexuality).toBe('Fluid');
    expect(findResidentDossierById('SW-RESIDENT-008')!.sexuality).toBe('OPEN');
  });

  it('preserves Noa Okinawan family context and protected open fields', () => {
    const noa = findResidentDossierById('SW-RESIDENT-004')!;
    expect(noa.culturalContext?.join(' ')).toMatch(/Okinawan/i);
    expect(noa.protectedOpenFields).toContain('noaFamilyIdentities');
  });

  it('blocks Iona glam as default identity via role override validation', () => {
    const iona = findResidentDossierById('SW-RESIDENT-006')!;
    const bad = validateCastRoleOverridesForResident(iona, { contextualGlamMode: 'permanent glam default' });
    expect(bad.ok).toBe(false);
    const ok = validateCastRoleOverridesForResident(iona, { contextualGlamMode: 'contextual event glam' });
    expect(ok.ok).toBe(true);
  });

  it('rejects cast-role overrides that mutate resident canon', () => {
    const etta = findResidentDossierById('SW-RESIDENT-001')!;
    const res = validateCastRoleOverridesForResident(etta, { ethnicity: 'changed', wardrobe: 'editorial black' });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.rejectedKeys).toContain('ethnicity');
  });

  it('uses residents as active Casting dataset — not legacy generic mock roster', () => {
    const casting = getProductionCastingResidentTalentCatalogue();
    expect(casting.actors).toHaveLength(8);
    expect(casting.actors.some((a) => a.stageName === 'Jordan Reyes')).toBe(false);
    expect(casting.actors.some((a) => a.stageName === 'ETTA VALE')).toBe(true);
  });

  it('keeps client-cast SW-017 for Entry 002 assignment lookup but not in resident casting pool', () => {
    expect(findActorByCatalogueNumber('SW-017')?.stageName).toBe('Maya Okonkwo');
    expect(listStudioWorldResidentTalentActors().some((a) => a.catalogueNumber === 'SW-017')).toBe(false);
    expect(getStudioWorldActorCatalogue().actors.some((a) => a.catalogueNumber === 'SW-017')).toBe(true);
  });

  it('ingests relationship graph and camera behavior on dossiers', () => {
    expect(getStudioWorldSeason1Relationships().length).toBeGreaterThanOrEqual(8);
    expect(findResidentDossierById('SW-RESIDENT-001')!.cameraBehavior).toMatch(/ignores camera/i);
    expect(findResidentDossierById('SW-RESIDENT-007')!.cameraBehavior).toMatch(/knows where camera/i);
  });

  it('carries anti-flattening rules per resident', () => {
    expect(findResidentDossierById('SW-RESIDENT-002')!.antiFlatteningRules.join(' ')).toMatch(/generic Asian/i);
  });
});
