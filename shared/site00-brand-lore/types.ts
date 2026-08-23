/**
 * SITE 00 — Brand Lore Intelligence types.
 *
 * Canonical model for structured brand-world intelligence collected upstream of Creative
 * Direction. Raw founder answers live in intake draft/submitted payloads; synthesized lore
 * lives in BrandLoreProfile with full provenance.
 */

/** Internal lore domain keys — not exposed verbatim to clients. */
export type BrandLoreDomain =
  | 'EMOTIONAL_FIRST_IMPRESSION'
  | 'AUDIENCE_RELATIONSHIP'
  | 'BRAND_BELIEF'
  | 'CULTURAL_OPPOSITION'
  | 'CORE_OBSESSIONS'
  | 'WORLD_METAPHOR'
  | 'MATERIAL_VOCABULARY'
  | 'SYMBOLIC_VOCABULARY'
  | 'REFERENCE_LINEAGE'
  | 'CURRENT_REFERENCE_SIGNALS'
  | 'CREATIVE_TENSIONS'
  | 'AUTHENTIC_LANGUAGE'
  | 'ANTI_LANGUAGE'
  | 'SOCIAL_SIGNAL'
  | 'AUDIENCE_RITUAL'
  | 'MEMORY_GOAL'
  | 'DESIRED_MYTHOLOGY'
  | 'FUTURE_WORLD'
  | 'CREATIVE_ANTI_PATTERNS';

export type LoreFieldClassification =
  | 'RAW_FOUNDER_INPUT'
  | 'SYNTHESIZED'
  | 'FOUNDER_CONFIRMED'
  | 'REFERENCE'
  | 'UNKNOWN';

export type FounderConfirmationState = 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'NOT_APPLICABLE';

/** How a reference was captured. UPLOAD is a known gap in this sprint — see
 * api/_lib/site00BrandLore/loreSynthesis.ts (referenceEvidence derivation) and the
 * "KNOWN GAPS" section of the productionization conclusion: there is no canonical
 * client-facing binary upload pipeline yet, so every reference this sprint produces is TEXT. */
export type ReferenceSource = 'TEXT' | 'URL' | 'UPLOAD';

export type ReferenceRole =
  | 'FEELS_LIKE_US'
  | 'DOES_NOT_FEEL_LIKE_US'
  | 'VISUAL_LANGUAGE'
  | 'MATERIAL'
  | 'COLOR'
  | 'TYPOGRAPHY'
  | 'IMAGERY'
  | 'COMPOSITION'
  | 'CULTURAL_REFERENCE'
  | 'OTHER';

/**
 * A single piece of evidence the founder associated with their brand world — NOT canon (XXII).
 * Downstream Creative Direction consumes REFERENCE + founderNote + Brand Lore together; it never
 * treats a reference as "copy this". assetId is reserved for the future canonical upload/asset
 * vault integration (site00Assts) — null until that pipeline exists (known gap, see above).
 */
export type BrandLoreReferenceEntry = {
  referenceId: string;
  source: ReferenceSource;
  assetId: string | null;
  intakeId: string | null;
  projectId: string | null;
  organizationId: string | null;
  founderNote: string;
  referenceRole: ReferenceRole;
  createdAt: string;
};

/** Provenance-backed value for one synthesized lore field. */
export type BrandLoreField<T = unknown> = {
  value: T;
  classification: LoreFieldClassification;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  /** Lore question step id(s) that contributed. */
  sourceAnswerIds: string[];
  /** Selected option ids when answer is compound multi-select. */
  sourceSelectionIds?: string[];
  sourceType: 'IDENTITY_LORE' | 'BUILDER_EXPERIENCE' | 'CONTENT_BRAIN' | 'INHERITED' | 'UNKNOWN';
  founderConfirmationState: FounderConfirmationState;
  updatedAt: string;
};

export type BrandLoreProfile = {
  id: string;
  organizationId: string | null;
  projectId: string | null;
  sourceIntakeId: string | null;
  /** CONTENT_BRAIN = reconciled from pre-existing org intelligence, not a founder intake — see
   * api/_lib/site00BrandLore/ndxbookReconciliation.ts (XXV/XXVI). Never fabricated; only genuinely
   * equivalent business facts are mapped, and it never overwrites a real IDENTITY/BUILDER profile. */
  sourceIntakeType: 'IDENTITY' | 'BUILDER' | 'CONTENT_BRAIN' | null;

  brandWorld: BrandLoreField<string | null>;
  /** Compound audience roles — multiple simultaneous truths preserved as label array. */
  audienceRelationship: BrandLoreField<string[]>;
  brandBelief: BrandLoreField<string | null>;
  culturalOpposition: BrandLoreField<string[]>;
  coreObsessions: BrandLoreField<string | null>;
  emotionalPromise: BrandLoreField<string[]>;
  creativeTensions: BrandLoreField<string[]>;
  worldMetaphor: BrandLoreField<string | null>;
  materialVocabulary: BrandLoreField<string[]>;
  symbolicVocabulary: BrandLoreField<string[]>;
  referenceLineage: BrandLoreField<string | null>;
  currentReferenceSignals: BrandLoreField<string | null>;
  authenticLanguageSamples: BrandLoreField<string[]>;
  antiLanguage: BrandLoreField<string[]>;
  socialSignal: BrandLoreField<string | null>;
  audienceRitual: BrandLoreField<string[]>;
  memoryGoal: BrandLoreField<string | null>;
  desiredMythology: BrandLoreField<string | null>;
  futureWorld: BrandLoreField<string | null>;
  creativeAntiPatterns: BrandLoreField<string[]>;
  signatureDeviceSeeds: BrandLoreField<string | null>;

  /** Raw answers preserved verbatim — never lossy. */
  rawLoreAnswers: Record<string, string | string[]>;

  /** Evidence, not canon (XXII) — see BrandLoreReferenceEntry. Never confirmable to FOUNDER_CONFIRMED. */
  referenceEvidence: BrandLoreReferenceEntry[];

  contextClassification: BrandExpressionContext | null;
  readinessState: CreativeDirectionReadinessState;
  readinessMissingDomains: ReadinessDomain[];

  /** Monotonically increments on every durable save — see supabaseStore.ts saveBrandLoreProfile(). */
  profileVersion: number;

  /** Behavioral personality canon — how the brand acts, speaks, jokes, reacts (upstream of Creative Direction). */
  brandPersonality?: import('./personalityTypes.js').BrandPersonalityProfile | null;

  /**
   * Founder exploration envelope — how far creative may push before feeling wrong.
   * NOT brand personality, NOT visual canon. Brand wins on conflict.
   */
  founderCreativeAppetite?: import('./founderCreativeAppetite/types.js').FounderCreativeAppetiteProfile | null;

  createdAt: string;
  updatedAt: string;
};

/** Brand expression context — consumed by Creative Direction for proof-artifact selection. */
export type BrandExpressionContext =
  | 'SOCIAL_FIRST_EDITORIAL'
  | 'ECOMMERCE_FIRST'
  | 'SERVICE_BUSINESS'
  | 'PRODUCT_PLATFORM'
  | 'CREATOR_BRAND'
  | 'ENTERTAINMENT_MEDIA'
  | 'PHYSICAL_RETAIL'
  | 'HOSPITALITY'
  | 'HYBRID'
  | 'OTHER';

export type CreativeDirectionReadinessState =
  | 'CONTEXT_INCOMPLETE'
  | 'CONTEXT_PARTIAL'
  | 'CORE_DIRECTION_READY';

/** Required domains before Creative Direction may auto-proceed. */
export type ReadinessDomain =
  | 'PURPOSE'
  | 'AUDIENCE_RELATIONSHIP'
  | 'WORLDVIEW'
  | 'EMOTIONAL_PROMISE'
  | 'CULTURAL_TENSION'
  | 'PRIMARY_EXPRESSION_CONTEXT'
  | 'REFERENCE_CONTEXT'
  | 'ANTI_DIRECTION';

export type OptionalEnrichmentDomain =
  | 'MATERIAL_VOCABULARY'
  | 'SYMBOLIC_VOCABULARY'
  | 'AUTHENTIC_LANGUAGE'
  | 'RITUAL'
  | 'MYTHOLOGY'
  | 'FUTURE_WORLD';

/** Builder experience translation domains — digital behavior, not identity lore. */
export type BuilderExperienceDomain =
  | 'PRIMARY_ENTRY_BEHAVIOR'
  | 'DIGITAL_METAPHOR'
  | 'NAVIGATION_BEHAVIOR'
  | 'DYNAMIC_SYSTEM_PRIORITIES'
  | 'DIGITAL_ANTI_PATTERNS'
  | 'SIGNATURE_EXPERIENCES'
  | 'PHYSICAL_EXTENSIONS'
  | 'PERSISTENT_USER_STATE'
  | 'REPEAT_VISIT_BEHAVIOR'
  | 'EXPERIENCE_DEPTH'
  | 'SIGNATURE_DIGITAL_ADVANTAGE';

export type BuilderExperienceProfile = {
  primaryEntryBehavior: BrandLoreField<string | null>;
  digitalMetaphor: BrandLoreField<string | null>;
  navigationBehavior: BrandLoreField<string | null>;
  dynamicSystemPriorities: BrandLoreField<string[]>;
  digitalAntiPatterns: BrandLoreField<string | null>;
  signatureExperiences: BrandLoreField<string[]>;
  physicalExtensions: BrandLoreField<string[]>;
  persistentUserState: BrandLoreField<string[]>;
  repeatVisitBehavior: BrandLoreField<string | null>;
  experienceDepth: BrandLoreField<string | null>;
  signatureDigitalAdvantage: BrandLoreField<string | null>;
  rawExperienceAnswers: Record<string, string | string[]>;
  /** Snapshot of inherited Identity lore at time of Builder start — not re-asked. */
  inheritedLoreSnapshot: Partial<BrandLoreProfile> | null;
  /** Snapshot of inherited Identity personality — Builder translates, does not redefine. */
  inheritedBrandPersonalitySnapshot?: Partial<
    import('./personalityTypes.js').BrandPersonalityProfile
  > | null;
  /** Digital translation of upstream personality — not second identity canon. */
  personalityTranslation?: import('./personalityTypes.js').BuilderPersonalityTranslationProfile | null;
};

/** Maps lore question step id → internal domain. */
export const LORE_STEP_TO_DOMAIN: Record<string, BrandLoreDomain> = {
  feeling: 'EMOTIONAL_FIRST_IMPRESSION',
  role: 'AUDIENCE_RELATIONSHIP',
  belief: 'BRAND_BELIEF',
  enemy: 'CULTURAL_OPPOSITION',
  obsession: 'CORE_OBSESSIONS',
  world: 'WORLD_METAPHOR',
  objects: 'MATERIAL_VOCABULARY',
  evidence: 'REFERENCE_LINEAGE',
  lineage: 'REFERENCE_LINEAGE',
  now: 'CURRENT_REFERENCE_SIGNALS',
  contradiction: 'CREATIVE_TENSIONS',
  language: 'AUTHENTIC_LANGUAGE',
  line: 'ANTI_LANGUAGE',
  status: 'SOCIAL_SIGNAL',
  ritual: 'AUDIENCE_RITUAL',
  memory: 'MEMORY_GOAL',
  symbol: 'SYMBOLIC_VOCABULARY',
  myth: 'DESIRED_MYTHOLOGY',
  future: 'FUTURE_WORLD',
  'no-go': 'CREATIVE_ANTI_PATTERNS',
};

export const BUILDER_EXPERIENCE_STEP_TO_DOMAIN: Record<string, BuilderExperienceDomain> = {
  arrival: 'PRIMARY_ENTRY_BEHAVIOR',
  'digital-metaphor': 'DIGITAL_METAPHOR',
  movement: 'NAVIGATION_BEHAVIOR',
  alive: 'DYNAMIC_SYSTEM_PRIORITIES',
  'anti-website': 'DIGITAL_ANTI_PATTERNS',
  'signature-moment': 'SIGNATURE_EXPERIENCES',
  physical: 'PHYSICAL_EXTENSIONS',
  persistence: 'PERSISTENT_USER_STATE',
  return: 'REPEAT_VISIT_BEHAVIOR',
  depth: 'EXPERIENCE_DEPTH',
  advantage: 'SIGNATURE_DIGITAL_ADVANTAGE',
};
