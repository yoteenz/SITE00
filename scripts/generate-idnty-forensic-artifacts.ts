/**
 * One-off generator for IDNTY intake forensic JSON artifacts (audit sprint).
 * Run: npx tsx scripts/generate-idnty-forensic-artifacts.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { IDNTY_ASSESSMENT_STATES, type IdntyAssessmentStep } from '../src/site00/config/idnty-assessment';
import { IDNTY_LORE_QUESTIONS } from '../shared/site00-brand-lore/idnty-lore-questions';
import { IDNTY_PERSONALITY_QUESTIONS } from '../shared/site00-brand-lore/idnty-personality-questions';
import { SITE00_ROUTES } from '../src/site00/config/routes';
import { IDNTY_BRAND_STATE_TO_ASSESSMENT } from '../src/site00/config/idnty-assessment-brand-map';
import { resolveIdntyStateDestination } from '../src/site00/config/idnty-diagnostic';

const OUT = path.join(process.cwd(), 'docs/site00/idnty');

type QuestionRow = Record<string, unknown>;

function mapAssessmentStep(
  stateSlug: string,
  stateTitle: string,
  stepIndex: number,
  step: IdntyAssessmentStep,
): QuestionRow {
  return {
    questionId: `${stateSlug}:${step.id}`,
    section: stateTitle,
    step: stepIndex + 1,
    visibleLabel: step.title,
    supportingCopy: step.subtitle ?? null,
    placeholder: step.placeholder ?? null,
    helpCopy: null,
    inputType: step.type,
    options: (step.options ?? []).map((o) => ({ id: o.id, label: o.label, description: o.description ?? null })),
    defaultValue: null,
    required: step.required ?? false,
    optional: !step.required,
    validation:
      step.required && step.type === 'textarea'
        ? 'THIS FIELD IS REQUIRED.'
        : step.required
          ? 'SELECT AT LEAST ONE OPTION.'
          : null,
    errorCopy:
      step.required && step.type === 'textarea'
        ? 'THIS FIELD IS REQUIRED.'
        : step.required
          ? 'SELECT AT LEAST ONE OPTION.'
          : null,
    conditional: false,
    condition: null,
    dependencies: [],
    dataKey: step.id,
    storageDestination: `localStorage.site00_idnty_assessment_v1.answers.${stateSlug}.${step.id}`,
    component: 'IdntyStepForm / IdentityCalibrationMobileStep',
    sourceFile: 'src/site00/config/idnty-assessment.ts',
    reachability: 'LIVE',
    flow: 'public-assessment',
  };
}

function mapLoreOrPersonality(
  q: {
    id: string;
    title: string;
    subtitle?: string;
    helper?: string;
    type: string;
    options?: { id: string; label: string; description?: string }[];
    maxLength?: number;
    required?: boolean;
    placeholder?: string;
    skippable?: boolean;
    domain: string;
    responseMode?: string;
    maxSelections?: number;
    selectionGuidance?: string;
  },
  flow: string,
  reachability: string,
  sourceFile: string,
  stepIndex: number,
): QuestionRow {
  return {
    questionId: q.id,
    section: flow === 'lore' ? 'BRAND WORLD / LORE' : 'BRAND PERSONALITY',
    step: stepIndex + 1,
    visibleLabel: q.title.replace(/\n/g, ' '),
    supportingCopy: [q.subtitle, q.helper].filter(Boolean).join(' ') || null,
    placeholder: q.placeholder ?? null,
    helpCopy: q.selectionGuidance ?? null,
    inputType: q.type,
    responseMode: q.responseMode ?? null,
    options: (q.options ?? []).map((o) => ({ id: o.id, label: o.label, description: o.description ?? null })),
    defaultValue: null,
    required: q.required ?? false,
    optional: q.skippable ?? true,
    validation: null,
    errorCopy: null,
    conditional: true,
    condition: 'Adaptive subset via resolveActiveLoreSteps (project flow) or full registry',
    dependencies: [],
    dataKey: q.id,
    storageDestination:
      flow === 'lore'
        ? 'localStorage.site00_idnty_assessment_v1.loreAnswers OR project lore API'
        : 'localStorage.site00_idnty_assessment_v1.personalityAnswers OR project personality replay',
    component: flow === 'lore' ? 'IdentityLoreStepForm / ProjectLoreCalibrationFlow' : 'PersonalityReplayIntakeStep',
    sourceFile,
    domain: q.domain,
    maxLength: q.maxLength ?? null,
    maxSelections: q.maxSelections ?? null,
    reachability,
    flow,
  };
}

const assessmentQuestions: QuestionRow[] = [];
let assessmentStepCount = 0;
for (const state of Object.values(IDNTY_ASSESSMENT_STATES)) {
  state.steps.forEach((step, i) => {
    assessmentQuestions.push(mapAssessmentStep(state.slug, state.title, i, step));
    assessmentStepCount += 1;
  });
}

const loreQuestions = IDNTY_LORE_QUESTIONS.map((q, i) =>
  mapLoreOrPersonality(
    q,
    'lore',
    'LIVE on /projects/:slug/calibrate; UNREACHABLE on public /idnty/*/world/* (PostPurchaseIntelligenceRedirect)',
    'shared/site00-brand-lore/idnty-lore-questions.ts',
    i,
  ),
);

const personalityQuestions = IDNTY_PERSONALITY_QUESTIONS.map((q, i) =>
  mapLoreOrPersonality(
    q,
    'personality',
    'LIVE on /projects/:slug/personality-replay/*; UNREACHABLE on public /idnty/*/personality/*',
    'shared/site00-brand-lore/idnty-personality-questions.ts',
    i,
  ),
);

const inventory = {
  generatedAt: new Date().toISOString(),
  sprint: 'P0.SITE00.IDNTY-INTAKE-FORENSIC-MAP1',
  totals: {
    publicAssessmentQuestions: assessmentStepCount,
    loreQuestions: IDNTY_LORE_QUESTIONS.length,
    personalityQuestions: IDNTY_PERSONALITY_QUESTIONS.length,
    allRegistryQuestions: assessmentStepCount + IDNTY_LORE_QUESTIONS.length + IDNTY_PERSONALITY_QUESTIONS.length,
  },
  questions: [...assessmentQuestions, ...loreQuestions, ...personalityQuestions],
};

const routeMap = {
  generatedAt: new Date().toISOString(),
  entryRoutes: [
    { path: SITE00_ROUTES.idnty, component: 'Site00IdntyPage', auth: 'none', status: 'LIVE' },
    { path: SITE00_ROUTES.idntyState, component: 'IdntyStatePage', auth: 'none', status: 'LIVE' },
    { path: SITE00_ROUTES.idntyStateDesktop, component: 'IdntyStatePage (desktop artboard)', auth: 'none', status: 'LIVE' },
    { path: '/identity', component: 'Navigate → /idnty', auth: 'none', status: 'LEGACY_ALIAS' },
    { path: '/idnty/:stateSlug/*', component: 'IdntyAssessmentRouterPage', auth: 'none', status: 'LIVE' },
    { path: '/idnty/:stateSlug/desktop/*', component: 'IdntyAssessmentRouterPage', auth: 'none', status: 'LIVE' },
    { path: SITE00_ROUTES.idntySignInSecurity, component: 'IdntySignInSecurityPage', auth: 'none', status: 'LIVE' },
    { path: '/projects/:projectSlug/calibrate', component: 'ProjectLoreCalibrationPage', auth: 'project', status: 'LIVE' },
    { path: '/projects/:projectSlug/personality-replay/*', component: 'ProjectPersonalityReplayPage', auth: 'project', status: 'LIVE' },
  ],
  brandStateToAssessment: IDNTY_BRAND_STATE_TO_ASSESSMENT,
  stateDestinations: {
    mobile: Object.fromEntries(
      (['starting-at-zero', 'some-pieces', 'ready-evolution', 'build-ready'] as const).map((id) => [
        id,
        resolveIdntyStateDestination(id, false),
      ]),
    ),
    desktop: Object.fromEntries(
      (['starting-at-zero', 'some-pieces', 'ready-evolution', 'build-ready'] as const).map((id) => [
        id,
        resolveIdntyStateDestination(id, true),
      ]),
    ),
  },
  happyPathByState: Object.values(IDNTY_ASSESSMENT_STATES).map((s) => ({
    stateSlug: s.slug,
    flow: [
      'ENTRY /idnty/state (pick brand state)',
      `LANDING /idnty/${s.slug}`,
      ...s.steps.map((st) => `STEP /idnty/${s.slug}/${st.id}`),
      `REVIEW /idnty/${s.slug}/review`,
      `DISCOVERY-RESULT /idnty/${s.slug}/discovery-result`,
      'NOTE: /complete not on happy path; completeAssessment() not called from review',
      'NOTE: /world/* and /personality/* → PostPurchaseIntelligenceRedirect on public routes',
    ],
  })),
  legacy: {
    needsCohesionSlug: 'needs-cohesion → redirect some-pieces-exist',
    source: 'src/site00/config/idnty-assessment.ts migrateLegacyNeedsCohesionSlug',
  },
};

const dataLineage = {
  generatedAt: new Date().toISOString(),
  objects: [
    {
      object: 'IdntyAssessmentRecord (client)',
      key: 'site00_idnty_assessment_v1',
      owner: 'browser localStorage',
      writeLocation: 'src/site00/hooks/useIdntyAssessment.ts',
      readLocation: 'useIdntyAssessment, useBldrAssessment.readIdntyLoreSnapshot, readIdntyPrefill',
      statusField: 'submissionStatus draft|complete',
      completionField: 'submissionStatus complete + currentStep complete',
      status: 'ACTIVE',
    },
    {
      object: 'site00-idnty-server-intake-id',
      key: 'site00-idnty-server-intake-id',
      owner: 'browser localStorage',
      writeLocation: 'src/site00/hooks/useIntakeSync.ts',
      readLocation: 'intakesApi',
      statusField: 'IntakeStatus on server row',
      completionField: 'submittedAt when submit() succeeds',
      status: 'ACTIVE',
    },
    {
      object: 'site00_idnty_submissions',
      key: 'id (uuid)',
      owner: 'Supabase',
      writeLocation: 'api/_lib/site00Intakes/supabaseStore.ts',
      readLocation: 'intakesApi, admin IntakesPage, identityCommercial.ts',
      statusField: 'status',
      completionField: 'submitted_at',
      status: 'ACTIVE',
    },
  ],
  downstreamConsumers: [
    {
      consumer: 'DiscoveryResultPanel / diagnoseIdentityNeed',
      dataReceived: 'stateSlug + assessment answers',
      source: 'useIdntyAssessment.getAnswersForState',
      when: 'After review → discovery-result',
      purpose: 'Display recommendation classifications',
      wiring: 'LIVE',
    },
    {
      consumer: 'useBldrAssessment prefill',
      dataReceived: 'identityState, answers.project, loreAnswers subset',
      source: 'localStorage site00_idnty_assessment_v1',
      when: 'BLDR assessment start',
      purpose: 'Prefill builder class / site type',
      wiring: 'PARTIAL (localStorage only, no server merge proven on BLDR start)',
    },
    {
      consumer: 'intakesApi / admin Intake Inbox',
      dataReceived: 'draftPayload autosave patches',
      source: 'useIntakeSync autosave from useIdntyAssessment',
      when: 'Each step + ensureStarted on landing',
      purpose: 'Ops visibility, guest email, commercial_state',
      wiring: 'PARTIALLY WIRED (no payment checkout on public happy path)',
    },
    {
      consumer: 'ProjectLoreCalibrationFlow',
      dataReceived: 'IDNTY_LORE_QUESTIONS answers → project API',
      source: 'ProjectLoreCalibrationPage',
      when: 'Post-project creative direction readiness',
      purpose: 'Brand lore canon for production',
      wiring: 'LIVE (project-scoped, not public /idnty)',
    },
    {
      consumer: 'PersonalityReplayIntake',
      dataReceived: 'IDNTY_PERSONALITY_QUESTIONS',
      source: 'ProjectPersonalityReplayPage',
      when: 'Validation / creative direction pipeline',
      purpose: 'Personality replay experiments',
      wiring: 'LIVE (project-scoped)',
    },
  ],
};

const diagnosticStates = [
  { code: '00', label: 'FOUNDATION', brandStateId: 'starting-at-zero', assessmentSlug: 'starting-at-zero' },
  { code: '01', label: 'REFINE', brandStateId: 'some-pieces', assessmentSlug: 'some-pieces-exist' },
  { code: '02', label: 'EVOLVE', brandStateId: 'ready-evolution', assessmentSlug: 'ready-for-evolution' },
  { code: '03', label: 'BUILD READY', brandStateId: 'build-ready', assessmentSlug: 'build-ready' },
];

const overlapRows = assessmentQuestions.map((q) => {
  const dataKey = String(q.dataKey);
  const stateSlug = String(q.questionId).split(':')[0];
  let diagnosticAlreadyAnswers: 'YES' | 'NO' | 'PARTIAL' = 'NO';
  let why = 'Diagnostic selects brand state only; does not capture step-level answers.';
  if (dataKey === 'assets' || dataKey === 'cohesion-diagnostic') {
    diagnosticAlreadyAnswers = 'PARTIAL';
    why = 'State 01 SOME PIECES implies partial brand; asset checklist still needed for specifics.';
  }
  if (stateSlug === 'build-ready' && (dataKey === 'services' || dataKey === 'scope')) {
    diagnosticAlreadyAnswers = 'PARTIAL';
    why = 'BUILD READY declaration implies identity complete; scope/services still collected for BLDR routing.';
  }
  const diagState = diagnosticStates.find((d) => d.assessmentSlug === stateSlug);
  return {
    questionId: q.questionId,
    dataKey,
    diagnosticState: diagState ? `${diagState.code} ${diagState.label}` : 'UNKNOWN',
    currentPurpose: q.visibleLabel,
    diagnosticAlreadyAnswers,
    safeToPrepopulate: diagnosticAlreadyAnswers === 'YES' ? 'YES' : diagnosticAlreadyAnswers === 'PARTIAL' ? 'UNKNOWN' : 'NO',
    safeToSkip: 'UNKNOWN',
    why,
  };
});

const foundationMatrix = assessmentQuestions.map((q) => {
  const slug = String(q.questionId).split(':')[0];
  const key = String(q.dataKey);
  const cols = {
    FOUNDATION: 'NOT_APPLICABLE' as string,
    REFINE: 'NOT_APPLICABLE' as string,
    EVOLVE: 'NOT_APPLICABLE' as string,
  };
  if (slug === 'starting-at-zero') cols.FOUNDATION = q.required ? 'REQUIRED' : 'RELEVANT';
  if (slug === 'some-pieces-exist') cols.REFINE = q.required ? 'REQUIRED' : key === 'other-specify' || key === 'gaps' ? 'OPTIONAL' : 'REQUIRED';
  if (slug === 'ready-for-evolution') cols.EVOLVE = q.required ? 'REQUIRED' : 'RELEVANT';
  if (slug === 'build-ready') {
    /* build-ready is separate column in sprint — map to BUILD_READY row scope */
  }
  return { questionId: q.questionId, dataKey: key, stateSlug: slug, ...cols, BUILD_READY: slug === 'build-ready' ? (q.required ? 'REQUIRED' : 'RELEVANT') : 'NOT_APPLICABLE' };
});

fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, 'IDNTY-INTAKE-QUESTION-INVENTORY.json'), JSON.stringify(inventory, null, 2));
fs.writeFileSync(path.join(OUT, 'IDNTY-INTAKE-ROUTE-MAP.json'), JSON.stringify(routeMap, null, 2));
fs.writeFileSync(path.join(OUT, 'IDNTY-INTAKE-DATA-LINEAGE.json'), JSON.stringify(dataLineage, null, 2));
fs.writeFileSync(path.join(OUT, 'IDNTY-DIAGNOSTIC-OVERLAP-MATRIX.json'), JSON.stringify({ generatedAt: new Date().toISOString(), overlap: overlapRows, foundationRefineEvolveMatrix: foundationMatrix }, null, 2));

console.log('Wrote forensic JSON to', OUT);
