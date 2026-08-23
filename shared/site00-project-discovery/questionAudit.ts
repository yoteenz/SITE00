/**
 * Deterministic question audit — Identity + Builder + World intake questions.
 */

export type QuestionAuditClassification =
  | 'KEEP_PUBLIC_DISCOVERY'
  | 'LIGHTEN_FOR_DISCOVERY'
  | 'MOVE_TO_PROJECT_INTELLIGENCE'
  | 'SPLIT_DISCOVERY_AND_INTELLIGENCE'
  | 'KEEP_AUTHORIZED_PROJECT_ONLY'
  | 'LEGACY_PRESERVE'
  | 'RETIRE_FROM_ACTIVE_FLOW';

export type QuestionAuditEntry = {
  questionId: string;
  currentRoute: string;
  currentSystem: string;
  currentPurpose: string;
  newClassification: QuestionAuditClassification;
  targetModule: string | null;
  publicOrPrivate: 'PUBLIC' | 'AUTHORIZED_PROJECT' | 'LEGACY';
  historicalCompatibility: boolean;
  migrationAction: string;
};

const IDNTY_OPERATIONAL: QuestionAuditEntry[] = [
  'project', 'goal', 'audience', 'timeline', 'budget',
  'assets', 'cohesion-diagnostic', 'other-specify', 'gaps',
  'pathways', 'goals', 'services', 'scope',
].flatMap((id) => [{
  questionId: id,
  currentRoute: '/idnty/:stateSlug/:stepId',
  currentSystem: 'IDENTITY_ASSESSMENT',
  currentPurpose: 'Operational scoping / discovery',
  newClassification: 'KEEP_PUBLIC_DISCOVERY' as const,
  targetModule: null,
  publicOrPrivate: 'PUBLIC' as const,
  historicalCompatibility: true,
  migrationAction: 'Retain in public discovery; tag PRE_PURCHASE_DISCOVERY provenance',
}]);

const IDNTY_LORE: QuestionAuditEntry[] = [
  'feeling', 'role', 'belief', 'enemy', 'obsession', 'world', 'objects', 'lineage',
  'now', 'contradiction', 'language', 'line', 'status', 'ritual', 'memory', 'symbol', 'myth', 'future', 'no-go',
].map((id) => ({
  questionId: id,
  currentRoute: '/idnty/:stateSlug/world/:stepId',
  currentSystem: 'IDENTITY_LORE',
  currentPurpose: 'Deep Brand Lore formation',
  newClassification: 'MOVE_TO_PROJECT_INTELLIGENCE' as const,
  targetModule: 'BRAND_LORE',
  publicOrPrivate: 'AUTHORIZED_PROJECT' as const,
  historicalCompatibility: true,
  migrationAction: 'Remove from public flow; retain for post-purchase BRAND_LORE module and project calibrate route',
}));

const IDNTY_PERSONALITY: QuestionAuditEntry[] = [
  'social-instinct', 'confidence', 'humor', 'humanity', 'disagreement', 'edge', 'charm',
  'observation', 'memorability', 'emotional-range', 'restraint', 'personality-tension',
  'social-reaction', 'self-correction', 'anti-personality',
].map((id) => ({
  questionId: id,
  currentRoute: '/idnty/:stateSlug/personality/:stepId',
  currentSystem: 'IDENTITY_PERSONALITY',
  currentPurpose: 'Deep Brand Personality formation',
  newClassification: 'MOVE_TO_PROJECT_INTELLIGENCE' as const,
  targetModule: 'BRAND_PERSONALITY',
  publicOrPrivate: 'AUTHORIZED_PROJECT' as const,
  historicalCompatibility: true,
  migrationAction: 'Remove from public flow; retain for post-purchase BRAND_PERSONALITY module',
}));

const BLDR_OPERATIONAL: QuestionAuditEntry[] = [
  'type', 'audience', 'features', 'content', 'technical', 'timeline', 'budget',
  'experience', 'roles', 'integrations', 'scale', 'need', 'context', 'workflows', 'data', 'security',
  'q1', 'q2', 'q3', 'q4', 'q5',
].map((id) => ({
  questionId: id,
  currentRoute: '/bldr/:classSlug/:stepId',
  currentSystem: 'BUILDER_ASSESSMENT',
  currentPurpose: 'Project/scope diagnosis',
  newClassification: 'KEEP_PUBLIC_DISCOVERY' as const,
  targetModule: null,
  publicOrPrivate: 'PUBLIC' as const,
  historicalCompatibility: true,
  migrationAction: 'Retain in public discovery',
}));

const BLDR_EXPERIENCE: QuestionAuditEntry[] = [
  'arrival', 'digital-metaphor', 'movement', 'alive', 'anti-website', 'signature-moment',
  'physical', 'persistence', 'return', 'depth', 'advantage',
].map((id) => ({
  questionId: id,
  currentRoute: '/bldr/:classSlug/experience/:stepId',
  currentSystem: 'BUILDER_EXPERIENCE',
  currentPurpose: 'Deep Experience Expression intelligence',
  newClassification: 'MOVE_TO_PROJECT_INTELLIGENCE' as const,
  targetModule: 'EXPERIENCE_INTENT',
  publicOrPrivate: 'AUTHORIZED_PROJECT' as const,
  historicalCompatibility: true,
  migrationAction: 'Remove from public Builder flow; assign to EXPERIENCE_INTENT module post-purchase',
}));

const WORLD_INTAKE: QuestionAuditEntry[] = [
  'business-model', 'entry-experience', 'founder-world-hypothesis', 'gaming-depth', 'hard-boundaries',
].map((id) => ({
  questionId: id,
  currentRoute: '/intake/:token',
  currentSystem: 'WORLD_GUEST_INTAKE',
  currentPurpose: 'Authorized guest project discovery',
  newClassification: 'KEEP_AUTHORIZED_PROJECT_ONLY' as const,
  targetModule: 'WORLD_READINESS',
  publicOrPrivate: 'AUTHORIZED_PROJECT' as const,
  historicalCompatibility: true,
  migrationAction: 'Reposition as authorized project intake; not public anonymous discovery',
}));

export const QUESTION_AUDIT_REGISTRY: QuestionAuditEntry[] = [
  ...IDNTY_OPERATIONAL,
  ...IDNTY_LORE,
  ...IDNTY_PERSONALITY,
  ...BLDR_OPERATIONAL,
  ...BLDR_EXPERIENCE,
  ...WORLD_INTAKE,
];

export function auditQuestionCount(): number {
  return QUESTION_AUDIT_REGISTRY.length;
}

export function auditCountByClassification(classification: QuestionAuditClassification): number {
  return QUESTION_AUDIT_REGISTRY.filter((e) => e.newClassification === classification).length;
}

export function historicalQuestionIdsPreserved(): boolean {
  return QUESTION_AUDIT_REGISTRY.every((e) => e.historicalCompatibility);
}

export function getAuditEntry(questionId: string): QuestionAuditEntry | undefined {
  return QUESTION_AUDIT_REGISTRY.find((e) => e.questionId === questionId);
}

export function isPublicDiscoveryQuestion(questionId: string): boolean {
  const entry = getAuditEntry(questionId);
  return entry?.newClassification === 'KEEP_PUBLIC_DISCOVERY' || entry?.newClassification === 'LIGHTEN_FOR_DISCOVERY';
}

export function isPostPurchaseIntelligenceQuestion(questionId: string): boolean {
  const entry = getAuditEntry(questionId);
  return (
    entry?.newClassification === 'MOVE_TO_PROJECT_INTELLIGENCE' ||
    entry?.newClassification === 'SPLIT_DISCOVERY_AND_INTELLIGENCE' ||
    entry?.newClassification === 'KEEP_AUTHORIZED_PROJECT_ONLY'
  );
}
