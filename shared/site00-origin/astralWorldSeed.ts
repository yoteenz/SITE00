/**
 * Astral World initial client-supplied source material — CLIENT TRUTH only.
 * Do not promote any item to brand/world/visual canon.
 */

import type { OriginCategory } from './categories.js';

export type AstralWorldTruthSeed = {
  category: OriginCategory;
  title: string;
  content: string | Record<string, unknown>;
  truthLabel: 'CLIENT_CONFIRMED' | 'CLIENT_PROPOSED';
  source: string;
};

export const ASTRAL_WORLD_TRUTH_SEEDS: readonly AstralWorldTruthSeed[] = [
  {
    category: 'PROJECT_OVERVIEW',
    title: 'Project identity',
    content:
      'Astral World — a digital world for tarot readers and clients where users can choose a reader or choose an environment and be routed into that reading experience.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'PROJECT_TYPE',
    title: 'Project classification',
    content: { projectType: 'WORLD', experienceClass: 'WORLD' },
    truthLabel: 'CLIENT_CONFIRMED',
    source: 'P0.B project registration',
  },
  {
    category: 'CURRENT_BRAND_STATE',
    title: 'Current client brand state',
    content:
      'Concept exists. Identity not finalized. Public brand name not finalized.',
    truthLabel: 'CLIENT_CONFIRMED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'CLIENT_CONCEPT',
    title: 'Core client concept',
    content:
      'A digital world for tarot readers and clients where users can choose a reader or choose an environment and be routed into that reading experience.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'ENVIRONMENT_CONCEPTS',
    title: 'Client-supplied environment concepts',
    content: {
      concepts: [
        { label: 'Tarot Tent / Tarot Suite', status: 'CLIENT_PROPOSED', workingLabel: 'Tarot Suite' },
        { label: 'Mall / on-the-spot reading environment', status: 'CLIENT_PROPOSED', workingLabel: 'Astral Mall' },
        { label: 'Coffee shop environment with Sims-like social feeling', status: 'CLIENT_PROPOSED', workingLabel: 'Coffee Shop' },
      ],
      note: 'Working labels are internal planning notes — not canonical environment names.',
    },
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'CLIENT_FLOW',
    title: 'Core client experience routing',
    content: {
      paths: [
        'Choose a reader first → route client to that reader location/environment',
        'Choose a world/environment first → show readers currently or primarily associated with that environment',
      ],
    },
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'READER_MODEL',
    title: 'Reader platform idea',
    content:
      'Different readers can operate on the platform. Each reader may choose a primary environment.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'TARGET_USERS',
    title: 'Target users',
    content: { primary: ['tarot readers', 'tarot clients / seekers'] },
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'BUSINESS_MODEL',
    title: 'Client business model direction',
    content: {
      subscription: 'Clients may subscribe/pay a weekly fee for readings',
      membership: 'Membership may eventually be tier-based',
      note: 'No final tier names, prices, entitlements, rollover rules, or billing logic defined.',
    },
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'PRODUCT_IDEAS',
    title: 'Custom tarot concept',
    content: {
      description:
        'Client has created rough-draft customized tarot cards using family members and personal references.',
      interests: [
        'personalized tarot imagery',
        'recognizable real people',
        'family relationships',
        'modern personal details',
        'traditional tarot archetypes reinterpreted through personal imagery',
      ],
      note: 'Do not infer a final visual style beyond supplied references.',
    },
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'MERCHANDISE_IDEAS',
    title: 'Merchandise / product ideas',
    content: {
      items: [
        'customized cartoon tarot decks',
        'personalized tarot cards',
        'tarot cloths',
        'tarot merchandise',
      ],
    },
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'PLATFORM_CONCEPTS',
    title: 'Platform evolution direction',
    content:
      'The concept may evolve from a single-reader site into a multi-reader platform. Treat as client business/product direction, not finalized platform architecture.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'CONSTRAINTS',
    title: 'Ingestion boundary constraints',
    content: {
      doNotAutoCanonize: true,
      doNotGenerateVisualIdentity: true,
      doNotGenerateWorldConcepts: true,
      doNotStartWorldFormation: true,
    },
    truthLabel: 'CLIENT_CONFIRMED',
    source: 'SITE 00 Origin system boundary',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final public brand name',
    content: 'Public brand name not finalized. Whether "Astral World" is master brand, universe name, or working project name is undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final environment naming',
    content: 'Final naming for Tarot Suite, Astral Mall, Coffee Shop environments not decided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final visual identity',
    content: 'Visual identity not finalized.',
    truthLabel: 'CLIENT_CONFIRMED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final membership structure',
    content: 'Tier names, prices, entitlements, rollover rules, and billing logic undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Reader compensation / platform commission',
    content: 'Final reader compensation and platform commission model undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final session formats',
    content: 'Session format options and delivery mechanics undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final marketplace scope',
    content: 'Marketplace scope and reader discovery mechanics undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Custom tarot product workflow',
    content: 'Workflow for customized/personalized tarot deck production undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
  {
    category: 'UNRESOLVED_DECISIONS',
    title: 'Final WORLD architecture',
    content: 'Final world architecture and technical platform shape undecided.',
    truthLabel: 'CLIENT_PROPOSED',
    source: 'P0.C founder sprint intake',
  },
] as const;

/** Source reference metadata for client-created tarot concept art (no canon promotion). */
export const ASTRAL_WORLD_SOURCE_REFERENCES = [
  {
    assetKey: 'astral-world-ref-tarot-family-deck-draft',
    displayName: 'Custom tarot deck draft — family member references',
    description:
      'Rough-draft customized tarot cards using family members and personal references. Evidence of desired personalization and tarot-card reinterpretation.',
    referenceType: 'CLIENT_CREATED_CONCEPT_ART' as const,
  },
  {
    assetKey: 'astral-world-ref-tarot-personal-archetypes',
    displayName: 'Personal archetype tarot reinterpretations',
    description:
      'Examples indicating interest in recognizable real people, family relationships, and traditional tarot archetypes through personal imagery.',
    referenceType: 'CLIENT_CREATED_CONCEPT_ART' as const,
  },
] as const;
