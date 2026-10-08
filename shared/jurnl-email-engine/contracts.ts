/**
 * The first eight message contracts (the creative batch test). CONTRACT_READY; nothing generated; founder approval not
 * given. Copy is a working draft for founder review: headlines follow the app's uppercase voice, body copy is sentence
 * case, subjects and preheaders are sentence case and never carry financial figures (they show on lock screens).
 */

import type { TriggerContract } from './triggers.js';
import type { ArtifactGrammar, EmailAssetClass, EmailComponentId, EmailFamilyId, EmailId, EmailProductionState, FounderApproval, LineageAction, PreferenceCategory } from './types.js';

export type EmailCopyDraft = {
  readonly status: 'DRAFT_FOR_FOUNDER_REVIEW';
  readonly subject: string;
  readonly preheader: string;
  readonly fromName: string;
  readonly replyToPolicy: string;
  readonly eyebrow: string;
  readonly headline: string;
  /** Sentence-case paragraphs; {tokens} are live HTML values. */
  readonly body: readonly string[];
  readonly cta: { readonly label: string; readonly destination: string };
  readonly secondary?: { readonly label: string; readonly destination: string };
  readonly notice?: string;
  /** Plain-text alternative (multipart/alternative). */
  readonly fallbackText: string;
};

export type EmailStateVariant = { readonly id: string; readonly when: string; readonly differences: string };

export type PlannedAsset = { readonly slot: string; readonly assetClass: EmailAssetClass; readonly lineageAction: LineageAction; readonly note: string };

export type EmailMessageContract = {
  readonly id: EmailId;
  readonly name: string;
  /** Folder under "JURNL EMAILS v1/". */
  readonly folder: string;
  readonly family: EmailFamilyId;
  /** Secondary family traits (hybrids). */
  readonly traits: readonly EmailFamilyId[];
  readonly messageType: string;
  readonly purpose: string;
  readonly preferenceCategory: PreferenceCategory;
  readonly trigger: TriggerContract;
  readonly states: readonly EmailStateVariant[];
  readonly copy: EmailCopyDraft;
  readonly artifact: readonly ArtifactGrammar[];
  /** Reading order. */
  readonly components: readonly EmailComponentId[];
  readonly authorityBrief: {
    readonly primaryGesture: readonly string[];
    readonly secondaryDetail: readonly string[];
    readonly contrastAnchor: string;
    readonly environment: string;
    readonly avoid: readonly string[];
  };
  readonly lineageGroup: string;
  /** Planned asset slots — decomposed from the approved authority later; nothing is generated now. */
  readonly assetPlan: readonly PlannedAsset[];
  readonly fixture: string;
  readonly productionState: EmailProductionState;
  readonly founderApproval: FounderApproval;
};

const NOT_REVIEWED: FounderApproval = { status: 'NOT_REVIEWED' };
const REPLY_SUPPORT = 'Replies reach a monitored JURNL support inbox (address fixed at provider integration). Never a no-reply address.';
const REPLY_SECURITY = 'Replies reach monitored support. The footer says JURNL will never ask for a password or code by email.';

export const EMAIL_CONTRACTS: readonly EmailMessageContract[] = [
  {
    id: 'A01',
    name: 'WELCOME TO JURNL',
    folder: '01_WELCOME',
    family: 'E01',
    traits: [],
    messageType: 'WELCOME',
    purpose: 'Mark the person’s arrival once their account is verified, and give one clear first step.',
    preferenceCategory: 'PRODUCT_SERVICE_UPDATES',
    trigger: {
      emailId: 'A01',
      triggerEvent: 'AUTH_EMAIL_CONFIRMED',
      eligibility: ['Account verified for the first time', 'Not a design-preview account'],
      suppression: ['Already sent (ever)', 'Account deleted', 'PRODUCT_SERVICE_UPDATES off'],
      cooldown: 'ONCE',
      personalizationInputs: ['firstName', 'setupStarted'],
      personalization: 'P1',
      ctaDestination: 'setup',
      consentClass: 'LIFECYCLE_SERVICE',
      priority: 'NORMAL',
      duplicateGuard: 'A01:{userId}',
      deliveryState: 'NOT_WIRED',
    },
    states: [
      { id: 'SETUP_NOT_STARTED', when: 'Setup draft not started', differences: 'CTA BEGIN SETUP → setup' },
      { id: 'SETUP_STARTED', when: 'Setup started before verification completed', differences: 'CTA CONTINUE SETUP → setup (resumes at resumeAt)' },
    ],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'Welcome to JURNL, {firstName}',
      preheader: 'Your financial life, beautifully organized. Here is where to begin.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SUPPORT,
      eyebrow: 'WELCOME',
      headline: 'YOUR JURNL IS OPEN.',
      body: [
        '{firstName}, JURNL keeps your money in one calm place: what is safe to spend, what is coming, and what you are planning for.',
        'Start with a few minutes of setup. JURNL works from what you tell it. Nothing is sold, and linked accounts stay optional.',
      ],
      cta: { label: 'BEGIN SETUP', destination: 'setup' },
      fallbackText: 'Welcome to JURNL.\n\nYour JURNL is open. Start with a few minutes of setup: {setupUrl}\n\nNothing is sold, and linked accounts stay optional.',
    },
    artifact: ['WELCOME_LETTER', 'INVITATION'],
    components: ['EC01', 'EC02', 'EC07', 'EC16', 'EC17'],
    authorityBrief: {
      primaryGesture: ['a folded welcome letter on heavy cream stock, cropped off the top edge', 'an invitation card leaning on a stone ledge'],
      secondaryDetail: ['olive blind-emboss on the card', 'a burgundy registration strip along one edge'],
      contrastAnchor: 'deep olive / black editorial ink headline on cream',
      environment: 'ARRIVAL still life: morning light on stone and linen, one olive sprig — no arch.',
      avoid: ['app screenshots', 'feature lists', 'confetti', 'a full loggia view'],
    },
    lineageGroup: 'ARRIVAL',
    assetPlan: [
      { slot: 'L1 arrival still life', assetClass: 'EMAIL_ENVIRONMENT', lineageAction: 'CREATE_NEW', note: 'Founds the ARRIVAL lineage; reused by A04.' },
      { slot: 'L2 welcome letter shell (top + edges)', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'CREATE_NEW', note: 'Blank stock; headline and copy stay HTML.' },
      { slot: 'olive emboss', assetClass: 'EMAIL_DECORATIVE_INSERT', lineageAction: 'CREATE_NEW', note: 'Shared ARRIVAL mark.' },
    ],
    fixture: 'FX_WELCOME',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A02',
    name: 'VERIFY YOUR EMAIL',
    folder: '02_VERIFY_EMAIL',
    family: 'E06',
    traits: [],
    messageType: 'EMAIL_VERIFICATION',
    purpose: 'Confirm the person owns the address before the account opens.',
    preferenceCategory: 'ACCOUNT_SECURITY',
    trigger: {
      emailId: 'A02',
      triggerEvent: 'AUTH_SIGNUP_CONFIRMATION_REQUESTED',
      eligibility: ['Sign-up or RESEND EMAIL on F01.02'],
      suppression: ['Address already verified', 'Provider rate limit reached'],
      cooldown: 'PT60S (provider rate limit governs resends)',
      personalizationInputs: ['recipientEmail', 'confirmationUrl', 'linkExpiry'],
      personalization: 'P1',
      ctaDestination: 'entry/verify-email',
      consentClass: 'TRANSACTIONAL',
      priority: 'CRITICAL',
      duplicateGuard: 'Provider-owned (Supabase Auth); one active confirmation link per address',
      deliveryState: 'PROVIDER_OWNED',
    },
    states: [
      { id: 'FIRST_SEND', when: 'On sign-up', differences: 'Standard copy' },
      { id: 'RESEND', when: 'RESEND EMAIL', differences: 'Notice adds: “This replaces the earlier link.”' },
    ],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'Verify your email for JURNL',
      preheader: 'One step to open your account. If this was not you, ignore this email.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SECURITY,
      eyebrow: 'ACCOUNT',
      headline: 'VERIFY YOUR EMAIL.',
      body: ['Confirm that {recipientEmail} is yours to finish opening your JURNL account.'],
      cta: { label: 'VERIFY MY EMAIL', destination: '{confirmationUrl} → entry/verify-email' },
      notice: 'This link expires {linkExpiry}. If you did not create a JURNL account, ignore this email; no account opens without this step.',
      fallbackText: 'Verify your email for JURNL.\n\nConfirm that {recipientEmail} is yours: {confirmationUrl}\n\nThis link expires {linkExpiry}. If you did not create a JURNL account, ignore this email.',
    },
    artifact: ['ACCESS_CREDENTIAL', 'PRIVATE_CORRESPONDENCE'],
    components: ['EC02', 'EC07', 'EC13', 'EC16'],
    authorityBrief: {
      primaryGesture: ['a private correspondence card, plain and centred, with generous margins'],
      secondaryDetail: ['a single blind emboss of the JURNL mark'],
      contrastAnchor: 'black ink headline and an olive button',
      environment: 'NONE — security mail carries no environment art.',
      avoid: ['environment art', 'marketing', 'red alert colours', 'anything that looks like phishing'],
    },
    lineageGroup: 'SECURE_CORRESPONDENCE',
    assetPlan: [
      { slot: 'L2 correspondence card shell', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'CREATE_NEW', note: 'Founds SECURE_CORRESPONDENCE; reused by A08.' },
      { slot: 'blind emboss mark', assetClass: 'EMAIL_DECORATIVE_INSERT', lineageAction: 'CREATE_NEW', note: 'Shared security mark.' },
    ],
    fixture: 'FX_VERIFY',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A03',
    name: 'FINISH SETTING UP JURNL',
    folder: '03_FINISH_SETUP',
    family: 'E05',
    traits: ['E02'],
    messageType: 'SETUP_REMINDER',
    purpose: 'Bring back someone who started setup and stopped, with only the steps they have left.',
    preferenceCategory: 'PRODUCT_SERVICE_UPDATES',
    trigger: {
      emailId: 'A03',
      triggerEvent: 'SETUP_INCOMPLETE',
      eligibility: ['Account verified', 'Setup started, not finished', '48 hours since verification'],
      suppression: ['Setup finished', 'Signed in within the last 24 hours', 'Already sent twice', 'PRODUCT_SERVICE_UPDATES off'],
      cooldown: 'P7D (maximum two sends)',
      personalizationInputs: ['firstName', 'remainingSteps[]', 'resumeAt'],
      personalization: 'P1',
      ctaDestination: 'setup',
      consentClass: 'LIFECYCLE_SERVICE',
      priority: 'NORMAL',
      duplicateGuard: 'A03:{userId}:{sendNumber}',
      deliveryState: 'NOT_WIRED',
    },
    states: [
      { id: 'EARLY', when: 'Most steps remaining', differences: 'Checklist shows all remaining steps' },
      { id: 'NEARLY_DONE', when: 'One or two steps remaining', differences: 'Headline: ALMOST THERE.' },
    ],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'Your JURNL is waiting where you left it',
      preheader: 'A few minutes finishes your setup, right where you stopped.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SUPPORT,
      eyebrow: 'SETUP',
      headline: 'PICK UP WHERE YOU LEFT OFF.',
      body: ['You started setting up JURNL. Finishing it lets JURNL show what is safe to spend, with your own numbers.'],
      cta: { label: 'FINISH SETUP', destination: 'setup' },
      fallbackText: 'Your JURNL is waiting where you left it.\n\nSteps left: {remainingSteps}\n\nFinish setup: {setupUrl}',
    },
    artifact: ['PINNED_NOTE', 'ANNOTATED_NOTE'],
    components: ['EC02', 'EC06', 'EC07', 'EC16', 'EC17'],
    authorityBrief: {
      primaryGesture: ['a pinned note with the remaining steps set like a printed checklist'],
      secondaryDetail: ['a brass clip or pin', 'pencil tick marks beside finished steps (decorative only)'],
      contrastAnchor: 'deep olive numerals',
      environment: 'NONE — a desk-surface crop at most.',
      avoid: ['guilt (“you forgot”)', 'progress bars as images', 'countdowns'],
    },
    lineageGroup: 'DESK_NOTE',
    assetPlan: [
      { slot: 'L2 pinned note shell', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'CREATE_NEW', note: 'Founds DESK_NOTE; derived by A06.' },
      { slot: 'brass clip', assetClass: 'EMAIL_DECORATIVE_INSERT', lineageAction: 'CREATE_NEW', note: 'Shared DESK_NOTE detail.' },
    ],
    fixture: 'FX_FINISH_SETUP',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A04',
    name: 'YOUR SAFE TO SPEND IS READY',
    folder: '04_STS_READY',
    family: 'E01',
    traits: ['E02'],
    messageType: 'SAFE_TO_SPEND_READY',
    purpose: 'Tell the person their Safe to Spend is real now, show it, and explain in one line how it is made.',
    preferenceCategory: 'PRODUCT_SERVICE_UPDATES',
    trigger: {
      emailId: 'A04',
      triggerEvent: 'SAFE_TO_SPEND_READY',
      eligibility: ['First time completeness is COMPLETE', 'Value > 0', 'Not within 12 hours of A01'],
      suppression: ['Already sent (ever)', 'Completeness not COMPLETE at send time', 'PRODUCT_SERVICE_UPDATES off'],
      cooldown: 'ONCE',
      personalizationInputs: ['firstName', 'safeToSpend', 'availableThrough', 'asOf', 'currency'],
      personalization: 'P2',
      ctaDestination: 'safe/why',
      consentClass: 'LIFECYCLE_SERVICE',
      priority: 'NORMAL',
      duplicateGuard: 'A04:{userId}',
      deliveryState: 'NOT_WIRED',
    },
    states: [{ id: 'READY', when: 'Completeness COMPLETE and value > 0', differences: 'Only state; other completeness values never send' }],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'Your Safe to Spend is ready',
      preheader: 'See what is safe to spend now, and how JURNL got there.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SUPPORT,
      eyebrow: 'SAFE TO SPEND',
      headline: 'YOUR NUMBER IS READY.',
      body: ['This is what is left after what is coming and what you chose to protect. It updates as your money moves.'],
      cta: { label: 'SEE WHY THIS AMOUNT', destination: 'safe/why' },
      secondary: { label: 'OPEN TODAY', destination: 'today' },
      fallbackText: 'Your Safe to Spend is ready.\n\nSafe to spend: {safeToSpend}, available through {availableThrough} (as of {asOf}).\n\nSee why: {safeWhyUrl}',
    },
    artifact: ['ENTRY_CARD', 'EDITORIAL_EXPLAINER'],
    components: ['EC01', 'EC03', 'EC02', 'EC08', 'EC16', 'EC17'],
    authorityBrief: {
      primaryGesture: ['an entry card that frames the live figure like a printed certificate'],
      secondaryDetail: ['a margin annotation line pointing to the figure (decorative rule only)'],
      contrastAnchor: 'the live serif figure in black ink',
      environment: 'ARRIVAL lineage (reused from A01), cropped differently.',
      avoid: ['the figure inside an image', 'the STS folder from the app as a screenshot'],
    },
    lineageGroup: 'ARRIVAL',
    assetPlan: [
      { slot: 'L1 arrival still life', assetClass: 'EMAIL_ENVIRONMENT', lineageAction: 'REUSE', note: 'From A01, new crop.' },
      { slot: 'L2 entry card shell', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'DERIVE', note: 'Derived from the A01 letter stock.' },
    ],
    fixture: 'FX_STS_READY',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A05',
    name: 'YOUR WEEK IN JURNL',
    folder: '05_WEEKLY_BRIEF',
    family: 'E03',
    traits: [],
    messageType: 'WEEKLY_BRIEF',
    purpose: 'A calm weekly brief: what is coming, what moved, and where Safe to Spend stands.',
    preferenceCategory: 'FINANCIAL_BRIEFS',
    trigger: {
      emailId: 'A05',
      triggerEvent: 'WEEKLY_BRIEF_READY',
      eligibility: ['FINANCIAL_BRIEFS on', 'Setup finished', 'At least one week since account verified'],
      suppression: ['FINANCIAL_BRIEFS off', 'No data at all (send A03 instead)', 'Already sent this week'],
      cooldown: 'P7D',
      personalizationInputs: ['firstName', 'weekOf', 'safeToSpend', 'availableThrough', 'upcomingItems[]', 'movedItems[]', 'insight?'],
      personalization: 'P3',
      ctaDestination: 'today',
      consentClass: 'LIFECYCLE_SERVICE',
      priority: 'LOW',
      duplicateGuard: 'A05:{userId}:{isoWeek}',
      deliveryState: 'NOT_WIRED',
    },
    states: [
      { id: 'HEALTHY', when: 'Safe to Spend COMPLETE and nothing overdue', differences: 'Status line: ON TRACK.' },
      { id: 'ATTENTION', when: 'An item is overdue or due today, or Safe to Spend fell below the buffer', differences: 'Status line: ONE THING NEEDS A LOOK. The item leads COMING.' },
      { id: 'INCOMPLETE_DATA', when: 'Safe to Spend PARTIAL / NEEDS_ACCOUNT', differences: 'Snapshot shows the honest incomplete copy; CTA COMPLETE MY PICTURE → setup/accounts' },
      { id: 'QUIET_WEEK', when: 'Nothing moved and nothing is coming', differences: 'Columns replaced by one line: A QUIET WEEK.' },
    ],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'Your week in JURNL',
      preheader: 'What is coming, what moved, and where you stand.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SUPPORT,
      eyebrow: 'WEEK OF {weekOf}',
      headline: 'YOUR WEEK, IN BRIEF.',
      body: ['Here is your week at a glance. Everything below comes from your JURNL as of {asOf}.'],
      cta: { label: 'OPEN MY WEEK', destination: 'today' },
      fallbackText: 'Your week in JURNL (week of {weekOf}).\n\nSafe to spend: {safeToSpend}\nComing: {upcomingSummary}\nMoved: {movedSummary}\n\nOpen your week: {todayUrl}',
    },
    artifact: ['BRIEFING_SHEET', 'LEDGER_INSERT', 'CLIPBOARD_BRIEF'],
    components: ['EC01', 'EC12', 'EC03', 'EC04', 'EC14', 'EC07', 'EC16', 'EC17'],
    authorityBrief: {
      primaryGesture: ['a clipped briefing sheet with ledger rules, the columns set as live HTML on the paper colour'],
      secondaryDetail: ['a brass clip at the head of the sheet'],
      contrastAnchor: 'serif figures in black ink, olive section labels',
      environment: 'BRIEFING lineage: a narrow desk crop (stone, linen, a pen) at the head only.',
      avoid: ['charts as images', 'any figure in an image', 'judgement words'],
    },
    lineageGroup: 'BRIEFING',
    assetPlan: [
      { slot: 'L1 briefing desk crop', assetClass: 'EMAIL_ENVIRONMENT', lineageAction: 'CREATE_NEW', note: 'Founds BRIEFING; monthly brief reuses it.' },
      { slot: 'L2 briefing sheet head (clip + torn top)', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'CREATE_NEW', note: 'Body of the sheet is an HTML paper cell.' },
    ],
    fixture: 'FX_WEEKLY_BRIEF',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A06',
    name: 'A PURCHASE MAY NEED A SECOND LOOK',
    folder: '06_PURCHASE_NUDGE',
    family: 'E05',
    traits: [],
    messageType: 'PURCHASE_SECOND_LOOK',
    purpose: 'Tell the person that a purchase they saved no longer fits their plan as well as it did, and what they can do.',
    preferenceCategory: 'REMINDERS_NUDGES',
    trigger: {
      emailId: 'A06',
      triggerEvent: 'PURCHASE_ATTENTION_DETECTED',
      eligibility: ['A saved purchase (status IDEA / PLANNING / READY) moved from FITS NOW to CLOSE or NOT YET', 'REMINDERS_NUDGES on'],
      suppression: ['The person checked or edited this purchase in the last 24 hours', 'Purchase PURCHASED or ARCHIVED', 'Any E05 nudge sent in the last 72 hours', 'REMINDERS_NUDGES off'],
      cooldown: 'P14D per purchase',
      personalizationInputs: ['purchaseName', 'purchaseAmount', 'category', 'affordability', 'fitsOn?'],
      personalization: 'P2',
      ctaDestination: 'purchases/{purchaseId}',
      consentClass: 'LIFECYCLE_SERVICE',
      priority: 'NORMAL',
      duplicateGuard: 'A06:{userId}:{purchaseId}:{affordability}',
      deliveryState: 'NOT_WIRED',
    },
    states: [
      { id: 'CLOSE', when: 'Affordability WAIT (CLOSE)', differences: 'Copy offers waiting until {fitsOn} if known' },
      { id: 'NOT_YET', when: 'Affordability NOT_YET', differences: 'Copy offers adjusting the amount or the plan' },
    ],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'A purchase may need a second look',
      preheader: 'Your plan changed since you saved it. You still have options.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SUPPORT,
      eyebrow: 'PURCHASES',
      headline: 'THIS MAY NEED A SECOND LOOK.',
      body: [
        'Your plan has changed since you saved {purchaseName}. Buying it now would change what is safe to spend.',
        'You still have options: wait a little, adjust the amount, or keep it as planned.',
      ],
      cta: { label: 'REVIEW THIS PURCHASE', destination: 'purchases/{purchaseId}' },
      fallbackText: 'A purchase may need a second look.\n\n{purchaseName} ({purchaseAmount}, {category}) — your plan has changed since you saved it. You still have options.\n\nReview it: {purchaseUrl}',
    },
    artifact: ['DESK_SLIP', 'SMALL_MEMO'],
    components: ['EC02', 'EC12', 'EC11', 'EC07', 'EC16', 'EC17'],
    authorityBrief: {
      primaryGesture: ['a small desk slip, set slightly askew, carrying the purchase as an index-card row'],
      secondaryDetail: ['a pencil line under the purchase name (decorative)'],
      contrastAnchor: 'burgundy status label (text), never a red alert',
      environment: 'NONE.',
      avoid: ['shame or fear language', '“overspent”', 'alarm colours', 'urgency'],
    },
    lineageGroup: 'DESK_NOTE',
    assetPlan: [{ slot: 'L2 desk slip shell', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'DERIVE', note: 'Derived from the A03 pinned note stock.' }],
    fixture: 'FX_PURCHASE_NUDGE',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A07',
    name: 'YOU REACHED A MILESTONE',
    folder: '07_MILESTONE',
    family: 'E04',
    traits: [],
    messageType: 'MILESTONE_GOAL_FUNDED',
    purpose: 'Acknowledge a real milestone — a goal fully set aside — warmly and precisely.',
    preferenceCategory: 'PRODUCT_SERVICE_UPDATES',
    trigger: {
      emailId: 'A07',
      triggerEvent: 'GOAL_REACHED',
      eligibility: ['Goal status became COMPLETE with completed_at', 'First time for this goal'],
      suppression: ['Goal deleted or reopened before send', 'Already sent for this goal', 'PRODUCT_SERVICE_UPDATES off'],
      cooldown: 'ONCE per goal',
      personalizationInputs: ['firstName', 'goalName', 'goalAmount', 'reachedOn'],
      personalization: 'P2',
      ctaDestination: 'goals/{goalId}',
      consentClass: 'LIFECYCLE_SERVICE',
      priority: 'NORMAL',
      duplicateGuard: 'A07:{userId}:{goalId}',
      deliveryState: 'NOT_WIRED',
    },
    states: [
      { id: 'GOAL_FUNDED', when: 'Goal COMPLETE', differences: 'Only implemented state' },
      { id: 'BUFFER_ESTABLISHED', when: 'PROPOSED — no source event yet', differences: 'Same template, seal and copy name the buffer' },
      { id: 'DEBT_PAID', when: 'PROPOSED — no source event yet', differences: 'Same template, copy names the debt' },
    ],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'You reached a milestone',
      preheader: '{goalName} is fully set aside and recorded in your plan.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SUPPORT,
      eyebrow: 'MILESTONE',
      headline: 'YOU REACHED A MILESTONE.',
      body: ['You have set aside the full {goalAmount} for {goalName}. It is recorded in your plan, and the money stays where you put it until you decide what comes next.'],
      cta: { label: 'SEE YOUR GOAL', destination: 'goals/{goalId}' },
      fallbackText: 'You reached a milestone.\n\n{goalName}: {goalAmount}, fully set aside on {reachedOn}.\n\nSee your goal: {goalUrl}',
    },
    artifact: ['MILESTONE_CARD', 'CEREMONIAL_NOTE'],
    components: ['EC01', 'EC09', 'EC02', 'EC07', 'EC16', 'EC17'],
    authorityBrief: {
      primaryGesture: ['a ceremonial card with a wax or blind-embossed seal beside the live goal name'],
      secondaryDetail: ['a burgundy ribbon or brass medallion'],
      contrastAnchor: 'rich burgundy against warm cream',
      environment: 'CEREMONIAL lineage: a stronger still life (linen, brass, olive), one classical fragment at most.',
      avoid: ['confetti', 'trophies', 'badges', 'streaks', 'the amount inside the seal'],
    },
    lineageGroup: 'CEREMONIAL',
    assetPlan: [
      { slot: 'L1 ceremonial still life', assetClass: 'EMAIL_ENVIRONMENT', lineageAction: 'CREATE_NEW', note: 'Founds CEREMONIAL; all milestone states reuse it.' },
      { slot: 'L2 milestone card shell', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'CREATE_NEW', note: 'Blank card.' },
      { slot: 'seal', assetClass: 'EMAIL_DECORATIVE_INSERT', lineageAction: 'CREATE_NEW', note: 'No text or numbers in the seal.' },
    ],
    fixture: 'FX_MILESTONE',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
  {
    id: 'A08',
    name: 'RESET YOUR ACCESS',
    folder: '08_RESET_ACCESS',
    family: 'E06',
    traits: [],
    messageType: 'PASSWORD_RESET',
    purpose: 'Let the person choose a new password, and tell them what to do if they did not ask.',
    preferenceCategory: 'ACCOUNT_SECURITY',
    trigger: {
      emailId: 'A08',
      triggerEvent: 'AUTH_PASSWORD_RESET_REQUESTED',
      eligibility: ['Reset requested on F01.05 for an existing account'],
      suppression: ['Provider rate limit reached'],
      cooldown: 'PT60S (provider rate limit governs)',
      personalizationInputs: ['recipientEmail', 'recoveryUrl', 'requestedAt', 'linkExpiry'],
      personalization: 'P1',
      ctaDestination: 'entry/new-password',
      consentClass: 'TRANSACTIONAL',
      priority: 'CRITICAL',
      duplicateGuard: 'Provider-owned (Supabase Auth); one active recovery link per address',
      deliveryState: 'PROVIDER_OWNED',
    },
    states: [{ id: 'REQUESTED', when: 'Reset requested', differences: 'Only state' }],
    copy: {
      status: 'DRAFT_FOR_FOUNDER_REVIEW',
      subject: 'Reset your JURNL password',
      preheader: 'Use this link to choose a new password. If you did not ask, ignore this email.',
      fromName: 'JURNL',
      replyToPolicy: REPLY_SECURITY,
      eyebrow: 'ACCOUNT',
      headline: 'RESET YOUR ACCESS.',
      body: ['We received a request to reset the password for {recipientEmail}.'],
      cta: { label: 'CHOOSE A NEW PASSWORD', destination: '{recoveryUrl} → entry/new-password' },
      notice: 'Requested {requestedAt}. This link expires {linkExpiry}. If you did not ask to reset your password, ignore this email; your password stays the same.',
      fallbackText: 'Reset your JURNL password.\n\nWe received a request to reset the password for {recipientEmail}. Choose a new password: {recoveryUrl}\n\nThis link expires {linkExpiry}. If you did not ask, ignore this email; your password stays the same.',
    },
    artifact: ['ACCESS_CREDENTIAL', 'FORMAL_NOTICE'],
    components: ['EC02', 'EC07', 'EC13', 'EC16'],
    authorityBrief: {
      primaryGesture: ['the SECURE_CORRESPONDENCE card, reused, with a formal notice layout'],
      secondaryDetail: ['the shared blind emboss'],
      contrastAnchor: 'black ink headline and an olive button',
      environment: 'NONE.',
      avoid: ['environment art', 'urgency theatre', 'marketing'],
    },
    lineageGroup: 'SECURE_CORRESPONDENCE',
    assetPlan: [
      { slot: 'L2 correspondence card shell', assetClass: 'EMAIL_ARTIFACT_SHELL', lineageAction: 'REUSE', note: 'From A02.' },
      { slot: 'blind emboss mark', assetClass: 'EMAIL_DECORATIVE_INSERT', lineageAction: 'REUSE', note: 'From A02.' },
    ],
    fixture: 'FX_RESET',
    productionState: 'CONTRACT_READY',
    founderApproval: NOT_REVIEWED,
  },
];

export const contractById = (id: EmailId): EmailMessageContract => {
  const c = EMAIL_CONTRACTS.find((x) => x.id === id);
  if (!c) throw new Error(`Unknown email ${id}`);
  return c;
};

/** Copy fields every contract must carry. */
export const COPY_FIELDS = ['SUBJECT', 'PREHEADER', 'FROM_NAME', 'REPLY_TO_POLICY', 'CTA', 'MESSAGE_BODY', 'FALLBACK_TEXT'] as const;
export const COPY_RULES = [
  'Subjects: sentence case, ≤ 50 characters, no emoji, no financial figures.',
  'Preheaders: 40–100 characters, sentence case, add to the subject rather than repeat it, no financial figures (lock-screen privacy).',
  'Headlines: uppercase, short, declarative — the app’s voice.',
  'Body: sentence case, two short paragraphs at most outside E03 / E07.',
  'CTA: uppercase verb + object; one primary CTA per email.',
  'Every {token} is live HTML filled from source truth at send time; a missing token selects the honest variant, never a placeholder.',
  'Every email has a plain-text fallback with the same facts and the same links.',
] as const;
