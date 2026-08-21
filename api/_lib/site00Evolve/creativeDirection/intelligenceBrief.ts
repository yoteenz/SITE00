/** Intelligence briefing + creative brief synthesis from Content Brain */

import { getContentBrainByOrgId, getProfileByOrgId } from '../storeAdapter.js';
import { orgIdFromSlug } from '../orgRegistry.js';
import type { CreativeBrief, IntelligenceBriefSection } from './types.js';
import { randomUUID } from 'node:crypto';

const OPEN_QUESTIONS = [
  'Visual language',
  'Color system',
  'Typography',
  'Graphic grammar',
  'Image language',
  'Motion language',
  'Page architecture',
  'Brand marks / logo behavior',
  'Editorial hierarchy',
];

export async function loadCanonicalIntelligence(orgSlug: string): Promise<{
  sections: IntelligenceBriefSection[];
  referenceOnly: { indigoSlate: boolean; laceMastery: boolean };
  rejectedCount: number;
}> {
  const orgId = orgIdFromSlug(orgSlug)!;
  const profile = await getProfileByOrgId(orgId);
  const entries = await getContentBrainByOrgId(orgId);
  const meta = (profile?.metadata ?? {}) as Record<string, unknown>;

  const sections: IntelligenceBriefSection[] = [];

  const canon = entries.filter(
    (e) =>
      (e.metadata as Record<string, unknown>)?.entry_class === 'CANONICAL' ||
      (e as { entry_class?: string }).entry_class === 'CANONICAL',
  );

  for (const entry of canon) {
    const metaE = entry.metadata as Record<string, unknown>;
    const importKey = String(metaE?.import_key ?? entry.entry_type ?? '');
    if (importKey.includes('visual') || importKey.includes('ref.')) continue;

    sections.push({
      key: importKey || String(entry.entry_type),
      label: String(entry.title ?? entry.entry_type),
      value: summarizeEntryContent(entry),
      provenance: (metaE?.provenance as IntelligenceBriefSection['provenance']) ?? 'CANONICAL',
    });
  }

  if (profile?.positioning_summary) {
    sections.unshift({
      key: 'positioning',
      label: 'Positioning',
      value: profile.positioning_summary,
      provenance: 'CANONICAL',
    });
  }
  if (profile?.audience_summary) {
    sections.push({
      key: 'audience',
      label: 'Audience',
      value: profile.audience_summary,
      provenance: 'FOUNDER_CONFIRMED',
    });
  }
  if (profile?.primary_objective) {
    sections.push({
      key: 'primary_objective',
      label: 'Primary Objective',
      value: profile.primary_objective,
      provenance: 'FOUNDER_CONFIRMED',
    });
  }
  if (meta.public_name) {
    sections.push({
      key: 'public_name',
      label: 'Public Name',
      value: `${meta.public_name} / display ${meta.display_name ?? 'NDXBOOK'}`,
      provenance: 'FOUNDER_CONFIRMED',
    });
  }

  const indigoSlate = entries.some((e) => (e.metadata as Record<string, unknown>)?.import_key === 'ref.visual_dna');
  const laceMastery = entries.some((e) => (e.metadata as Record<string, unknown>)?.import_key === 'rejected.lace_mastery');
  const rejectedCount = entries.filter(
    (e) =>
      ['REJECTED', 'MISATTRIBUTED'].includes(String((e.metadata as Record<string, unknown>)?.entry_class ?? '')),
  ).length;

  return { sections, referenceOnly: { indigoSlate, laceMastery }, rejectedCount };
}

function summarizeEntryContent(entry: Record<string, unknown>): string {
  const content = entry.content as Record<string, unknown>;
  if (content?.text) return String(content.text);
  if (content?.schedule) return 'Programming cadence defined';
  if (content?.volumes) return 'Five launch volumes defined';
  if (typeof content === 'object' && content !== null) {
    const traits = (content as { traits?: string[] }).traits;
    if (traits) return traits.join(', ');
  }
  return String(entry.title ?? 'Canonical intelligence');
}

export function synthesizeCreativeBrief(
  orgSlug: string,
  sections: IntelligenceBriefSection[],
  entryCount: number,
): CreativeBrief {
  return {
    id: randomUUID(),
    organizationSlug: orgSlug,
    synthesizedAt: new Date().toISOString(),
    mustCommunicate: [
      'Every page makes you smarter — intelligence delivered as accessible short-form knowledge',
      'The index for everyday knowledge — structured, navigable, cumulative',
      'Five volumes (MONEY, BODY, MIND, TECH, CONSUMER) under one coherent visual system',
      'Curious adult audience — practical utility without condescension',
    ],
    mustFeelLike: [
      'Clear and sharp — immediate comprehension',
      'Curious — invites the next page',
      'Useful — actionable or memorable takeaway',
      'Slightly mysterious — depth without obscurity',
      'Modern editorial intelligence — not academic, not influencer-generic',
    ],
    mustNotFeelLike: [
      'Childish or cartoon educational content',
      'Preachy or fearmongering finance/wellness tropes',
      'Overly academic textbook density',
      'Generic productivity-hustle aesthetics',
      'Luxury beauty/editorial (Frontal Slayer language)',
      'Random explainer-channel sameness',
    ],
    visualTensions: [
      'Index structure vs. social-native spontaneity',
      'Cross-volume coherence vs. volume-specific identity',
      'Mysterious depth vs. instant clarity',
      'Scalable page system vs. distinctive brand ownership',
      'Educational authority vs. approachable curiosity',
    ],
    taxonomyInfluence: [
      'PAGE = atomic visual unit — numbered, repeatable architecture',
      'VOLUME = pillar color/texture differentiation without brand fragmentation',
      'CHAPTER = sub-structure within page hierarchy',
      'READER = human-centered, never audience-as-metric visual language',
    ],
    scaleConsiderations: [
      'System must support hundreds/thousands of Pages without visual fatigue',
      'Instagram 9:16 primary specimen — feed legibility at thumbnail scale',
      'Typography must survive motion and kinetic treatment',
    ],
    differentiation: [
      'Indexed knowledge architecture — not episodic content slop',
      'Volume-aware but brand-unified — not five separate sub-brands',
      'Voice-driven mystery — not shock-thumbnail bait',
      sections.find((s) => s.key === 'positioning')?.value ?? 'the index for everyday knowledge.',
    ],
    voiceConstraints: {
      preserve: ['clear', 'curious', 'sharp', 'useful', 'slightly mysterious'],
      reject: ['preachy', 'childish', 'overly academic', 'fearmongering'],
    },
    classification: 'PROPOSED',
    provenance: { source: 'CONTENT_BRAIN', entryCount },
    // NDXBOOK's primary public expression is social content, not a website — see
    // docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md §1. Other orgs remain unclassified
    // until their own Creative Direction pass explicitly sets this.
    primaryContext: orgSlug === 'ndxbook' ? 'SOCIAL_FIRST_EDITORIAL' : undefined,
  };
}

export { OPEN_QUESTIONS };
