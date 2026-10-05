/**
 * C1.0 — Assemble Entry 002 narrative synthesis input from canon sources.
 */

import type {
  CreativeThinkingHandoff,
  NarrativeSynthesisInput,
} from '../../../../shared/site00-expression-engine/narrative-synthesis/types.js';
import {
  ENTRY_002_SUBJECT,
  ENTRY_002_THESIS,
  NDXBOOK_PROOF_BRAND_ID,
} from '../../../../shared/site00-expression-engine/constants.js';
import { CHAPTER_01_ID } from '../chapter01Canon.js';
import { buildEntry001ChapterMapping, buildEntry002ChapterMapping } from '../chapterEntryMappings.js';
import {
  ENTRY_002_ARTIFACT_ID,
  ENTRY_002_TERRITORY_ID,
  ENTRY_002_WORLD_ID,
} from '../entry002Blueprint.js';
import { buildEntry002ReelTreatmentAuthority } from '../entry002ReelTreatment.js';
import { compileEntry002FinalCinematicStoryboardPanelManifest } from '../entry002FinalCinematicStoryboardPanelManifest.js';

export function buildCreativeThinkingHandoffForEntry002(): CreativeThinkingHandoff {
  const mapping = buildEntry002ChapterMapping();
  return {
    strongestTerritories: [
      {
        territoryId: ENTRY_002_TERRITORY_ID,
        whyItMatters: 'Edit-suite metaphor reframes cultural memory — strongest story potential for relabeling thesis.',
      },
    ],
    metaphor: 'Cultural memory as physical edit — nostalgia is a re-edit, not object change.',
    worldCandidates: [mapping.world],
    artifactCandidates: [mapping.artifact, mapping.interjectionDevice],
    creativeTension: 'Present praise vs archived mockery of identical visual codes.',
    riskProfile: 'Moderate — requires same-subject proof and earned interjection.',
    visualOpportunity: 'Phone scroll glitch + receipt pull + edit-suite dimensional lift.',
  };
}

export function buildEntry002NarrativeSynthesisInput(
  appetite?: NarrativeSynthesisInput['founderCreativeAppetite'],
): NarrativeSynthesisInput {
  const mapping = buildEntry002ChapterMapping();
  const treatment = buildEntry002ReelTreatmentAuthority();
  const panels = compileEntry002FinalCinematicStoryboardPanelManifest();
  const entry001 = buildEntry001ChapterMapping();

  return {
    entryId: 'entry-002',
    entryNumber: 2,
    chapterId: CHAPTER_01_ID,
    brandId: NDXBOOK_PROOF_BRAND_ID,
    subject: mapping.subject,
    topic: '2016 IG BADDIE FASHION',
    thesis: ENTRY_002_THESIS,
    lockedPremise: mapping.premise ?? null,
    lockedContradiction: mapping.contradiction,
    chapterArgumentGrammar: mapping.argumentBeats.map((b) => b.label),
    creativeTerritories: [
      {
        territoryId: ENTRY_002_TERRITORY_ID,
        label: mapping.world,
        narrativePotential: 'Archival contradiction via edit-suite metaphor',
      },
    ],
    selectedTerritoryId: ENTRY_002_TERRITORY_ID,
    worldCandidates: [
      {
        worldId: ENTRY_002_WORLD_ID,
        label: mapping.world,
        narrativeFunction: 'EDIT',
      },
    ],
    artifactCandidates: [
      {
        artifactId: ENTRY_002_ARTIFACT_ID,
        label: mapping.artifact,
        narrativeRole: 'ARCHIVE',
      },
    ],
    visualMechanisms: ['profile scroll glitch', 'receipt pull', 'then/now alignment'],
    interjectionCandidates: [mapping.interjection, mapping.interjectionDevice],
    brandLore: ['NDXBOOK — culture gets a re-edit'],
    brandPersonality: ['Sharp', 'Investigative', 'Quotable interjections'],
    founderCreativeAppetite: appetite ?? {
      risk: 'MEDIUM',
      abstraction: 'MEDIUM',
      wit: 'HIGH',
      polarization: 'MEDIUM',
      rawness: 'MEDIUM',
      density: 'MEDIUM',
      surprise: 'MEDIUM',
      directorLatitude: 'MEDIUM',
      boundaries: 'Brand truth overrides appetite',
    },
    priorEntryLineage: [
      {
        entryId: entry001.entryId,
        worldId: entry001.worldId ?? null,
        artifactId: entry001.artifactId ?? null,
        argumentShape: entry001.argumentBeats.map((b) => b.label),
        interjectionDevice: entry001.interjectionDevice,
      },
    ],
    continuityConstraints: [
      'NDX distinct from subject woman',
      'Same fashion codes across eras when arguing relabeling',
      'Phone is device — edit suite is world',
    ],
    formatContext: ['REEL primary', 'CAROUSEL/STORY/X/TIKTOK derivatives after final reel'],
    platformContext: ['INSTAGRAM-native discovery grammar'],
    creativeBoundaries: ['Do not collapse into Entry 001 TV broadcast logic'],
    treatmentCoreStory: treatment.coreStory,
    panelBeatSeeds: panels.map((p) => ({ beatId: p.beatId, storyFunction: p.storyFunction })),
  };
}
