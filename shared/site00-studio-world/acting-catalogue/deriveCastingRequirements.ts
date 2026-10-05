/**
 * Derive CastingRequirement[] from Narrative Momentum (no provider spend).
 */

import type { NarrativeMomentumPlan } from '../../site00-expression-engine/narrative-momentum/types.js';
import type { CastingRequirement } from './types.js';

export function deriveCastingRequirementsFromNarrativePlan(
  plan: NarrativeMomentumPlan,
): CastingRequirement[] {
  const entry = plan.entryId;
  if (entry === 'entry-002') {
    return deriveEntry002CastingRequirements(plan);
  }
  return deriveGenericCastingRequirements(plan);
}

function deriveEntry002CastingRequirements(_plan: NarrativeMomentumPlan): CastingRequirement[] {
  return [
    {
      requirementId: 'cast-req-entry002-subject-woman',
      narrativeRole: 'SUBJECT WOMAN',
      storyFunction: 'Proof same woman across 2016 and 2026 cultural labels — fashion evidence anchor',
      approximateAgePresentation: 'Mid-to-late 20s reads consistently in both eras',
      presentationRequirements: 'Woman, recognizable face lock, not interchangeable model',
      performanceEnergy: 'Expressive everyday — nostalgia, skepticism, receipt moment',
      wardrobeContext: '2016 IG baddie codes vs 2026 contemporary return',
      era: '2016 + 2026 temporal split',
      requiredContinuity: 'SAME CHARACTER ACROSS TIME — one Actor, multiple temporal looks',
      screenImportance: 'HERO',
      specialVisualRequirements: 'Map to existing pre-storyboard subject woman authorities where approved',
      suggestedPresentation: 'WOMAN',
      suggestedRoleArchetypes: ['SUBJECT', 'INFLUENCER'],
    },
    {
      requirementId: 'cast-req-entry002-ndx-presence',
      narrativeRole: 'NDX INVESTIGATOR',
      storyFunction: 'Partial observer / interjector — never full hero face dominance',
      approximateAgePresentation: 'Adult, gender-neutral presentation acceptable',
      presentationRequirements: 'Hands, nails, partial frame — visibility partial_only',
      performanceEnergy: 'Understated intellectual interjection',
      wardrobeContext: 'Editorial investigator — minimal on-screen body',
      era: 'Present editorial',
      requiredContinuity: 'Nail and hand authority continuity',
      screenImportance: 'SUPPORTING',
      specialVisualRequirements: 'Existing ndx presence profile from storyboard gate',
      suggestedRoleArchetypes: ['OBSERVER', 'RESEARCHER'],
    },
    {
      requirementId: 'cast-req-entry002-commenter-ensemble',
      narrativeRole: '2016 COMMENTER / BACKGROUND CHORUS',
      storyFunction: 'Archival tone — mockery and hype as social chorus',
      approximateAgePresentation: 'Mixed 20s',
      presentationRequirements: 'Ensemble — may be looser continuity',
      performanceEnergy: 'Comedic / chaotic comment energy',
      wardrobeContext: 'Platform-native casual 2016',
      era: '2016',
      requiredContinuity: 'Recognizable recurring background optional — catalogue preferred',
      screenImportance: 'ENSEMBLE',
      specialVisualRequirements: 'No hero uncatalogued guard — ensemble tier',
      suggestedRoleArchetypes: ['COMMENTER', 'INFLUENCER'],
    },
  ];
}

function deriveGenericCastingRequirements(plan: NarrativeMomentumPlan): CastingRequirement[] {
  const lead: CastingRequirement = {
    requirementId: `cast-req-${plan.entryId}-lead`,
    narrativeRole: 'PRIMARY SUBJECT',
    storyFunction: plan.narrativeGoal,
    approximateAgePresentation: 'Adult — fit narrative',
    presentationRequirements: 'Catalogue actor required for hero tier',
    performanceEnergy: plan.reframe.transformationType,
    wardrobeContext: plan.creativeTerritoryLabel,
    era: 'Contemporary',
    requiredContinuity: 'Actor identity lock for hero',
    screenImportance: 'HERO',
    specialVisualRequirements: 'Derive from proof architecture',
    suggestedRoleArchetypes: ['SUBJECT'],
  };
  return [lead];
}
