#!/usr/bin/env node
/**
 * Builds IDNTY question bank + field map from IDNTY_DIMENSION_SCHEMA.json.
 * Regenerate after schema edits: node scripts/idnty/build-idnty-intake-artifacts.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const REPO = path.resolve(import.meta.dirname, '../..');
const INTAKE = path.join(REPO, 'docs/site00/idnty/intake');
const schema = JSON.parse(fs.readFileSync(path.join(INTAKE, 'IDNTY_DIMENSION_SCHEMA.json'), 'utf8'));

const ENTRY_STATES = ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'];

/** Question templates per dimension — field-targeted, not client-as-designer. */
const QUESTION_TEMPLATES = {
  IDNTY_01_TRUTH: {
    business_definition: {
      text: 'In one plain sentence, what does your business actually do day to day?',
      purpose: 'Anchor business truth before interpretation.',
      answer_type: 'SHORT_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    customer_need: {
      text: 'What are customers trying to fix, change, get, feel, or accomplish when they come to you?',
      purpose: 'Resolve primary customer need without positioning jargon.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    primary_job_to_be_done: {
      text: 'What job would customers hire you for if they described it to a friend?',
      purpose: 'Jobs-to-be-done anchor for truth and promise.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_02'],
    },
    founder_conviction: {
      text: 'Why does this business need to exist — what do you personally refuse to compromise on?',
      purpose: 'Capture founder conviction for interpretation, not slogans.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_02'],
    },
    business_purpose: {
      text: 'Beyond revenue, what outcome do you want your business to create in the world?',
      purpose: 'Purpose signal for truth and personality boundaries.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00'],
    },
    core_value_created: {
      text: 'What would customers miss tomorrow if you disappeared?',
      purpose: 'Core value created — anti-generic positioning input.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    critical_business_boundary: {
      text: 'What types of work, clients, or offers are outside your scope even if profitable?',
      purpose: 'Business boundary for truth and authority.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    non_negotiables: {
      text: 'What standards will you not bend on — quality, ethics, speed, price, or service?',
      purpose: 'Non-negotiables for authority and personality.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    anti_identity: {
      text: 'What do you never want to become, even if it would make more money?',
      purpose: 'Anti-identity guardrail for position and expression.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    misunderstandings: {
      text: 'What do people currently misunderstand about what you do or who you serve?',
      purpose: 'Correct misconceptions before verbal system work.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    business_future: {
      text: 'Where is the business heading in the next 3–5 years (markets, products, scale)?',
      purpose: 'Future context for evolution and expression.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_02', 'IDNTY_03'],
    },
    business_model_context: {
      text: 'How do you make money, and who pays you (model in plain language)?',
      purpose: 'Business model context for position and language.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    product_service_scope: {
      text: 'List your core products or services today (what is in scope for this identity).',
      purpose: 'Scope boundary for expression contexts.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
  },
  IDNTY_02_POSITION: {
    category: {
      text: 'What category do customers think you are in today — and is that accurate?',
      purpose: 'Category resolution without forcing a tagline.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    category_tension: {
      text: 'Is your category crowded, outdated, or misleading for what you actually deliver?',
      purpose: 'Category tension for differentiation.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_01', 'IDNTY_02'],
    },
    alternatives: {
      text: 'What other options does your customer consider besides you?',
      purpose: 'Alternative set for position.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    competitors: {
      text: 'Name direct competitors or substitutes you are often compared to.',
      purpose: 'Competitive set — may overlap alternatives.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_01', 'IDNTY_02'],
    },
    customer_comparison_set: {
      text: 'What inaccurate comparisons do you hear (e.g. “you are like X” when you are not)?',
      purpose: 'Comparison correction for position and language.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    desired_role: {
      text: 'Which role is closest to how you want to be understood?',
      purpose: 'Desired market role — not logo style.',
      answer_type: 'SINGLE_SELECT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
      options: ['SPECIALIST', 'PARTNER', 'PLATFORM', 'DESTINATION', 'SERVICE', 'PRODUCT', 'SYSTEM', 'COMMUNITY', 'OTHER'],
    },
    differentiation: {
      text: 'Where do common alternatives disappoint your customer — and where do you deliver?',
      purpose: 'Differentiation from behavior, not adjectives alone.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    market_gap: {
      text: 'What gap in the market do you believe you fill?',
      purpose: 'Market gap narrative for SITE 00 synthesis.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_02'],
    },
    premium_position: {
      text: 'Should the brand feel premium, accessible, or mixed — and why?',
      purpose: 'Premium/accessibility axis for position and palette.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    accessibility_position: {
      text: 'Who must feel welcome immediately — and who is not the primary audience?',
      purpose: 'Accessibility vs focus for position.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_02'],
    },
    trust_position: {
      text: 'What must a stranger trust about you before they buy (proof, tone, people, process)?',
      purpose: 'Trust position for expression and authority.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    industry_relationship: {
      text: 'How should the brand relate to industry norms — lead, comply, or challenge?',
      purpose: 'Industry relationship for language and visual grammar.',
      answer_type: 'SINGLE_SELECT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
      options: ['LEAD', 'COMPLY', 'CHALLENGE', 'MIXED'],
    },
  },
  IDNTY_03_PROMISE: {
    before_state: {
      text: 'Describe your customer’s situation before they work with you (stress, chaos, gap).',
      purpose: 'Before state for promise and verbal system.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    after_state: {
      text: 'Describe the situation after you deliver well — what feels different?',
      purpose: 'After state for promise synthesis.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    functional_promise: {
      text: 'What practically gets easier or more reliable because of you?',
      purpose: 'Functional promise — SITE 00 writes lines from this.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    emotional_promise: {
      text: 'What emotional relief or confidence should customers feel?',
      purpose: 'Emotional promise input — not client-written taglines.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    customer_transformation: {
      text: 'What transformation are you selling (identity, capability, status, peace)?',
      purpose: 'Transformation frame for promise and personality.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_02'],
    },
    what_becomes_easier: {
      text: 'Name three things that become easier when a customer chooses you.',
      purpose: 'Concrete promise fodder.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    what_worry_disappears: {
      text: 'Which worries or risks should feel reduced after engaging with you?',
      purpose: 'Risk reduction for promise and trust.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    next_capability_unlocked: {
      text: 'What becomes possible next for the customer after the first win with you?',
      purpose: 'Longer arc promise.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_02'],
    },
    short_term_value: {
      text: 'What value should be obvious in the first week or first transaction?',
      purpose: 'Short-term value for messaging hierarchy.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    long_term_value: {
      text: 'What long-term relationship or outcome do loyal customers get?',
      purpose: 'Long-term value for evolution brands.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_02', 'IDNTY_03'],
    },
  },
  IDNTY_04_PERSONALITY: {
    primary_personality: {
      text: 'When your brand speaks, who is in the room — operator, partner, guide, challenger, or other?',
      purpose: 'Primary personality role — not three adjectives.',
      answer_type: 'SINGLE_SELECT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
      options: ['OPERATOR', 'PARTNER', 'GUIDE', 'CHALLENGER', 'HOST', 'OTHER'],
    },
    relationship_energy: {
      text: 'Should customers feel guided, served, coached, or co-building with you?',
      purpose: 'Relationship energy for voice genome.',
      answer_type: 'BEHAVIORAL_CONTRAST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
    },
    distinctive_character: {
      text: 'What quirky or distinctive character could belong in your brand world (without becoming a mascot gimmick)?',
      purpose: 'Distinctive character archetype seed.',
      answer_type: 'FREE_TEXT',
      entry_states: ['IDNTY_00', 'IDNTY_02'],
    },
    behavioral_axes: {
      text: 'On each pair, where should the brand usually sit: formal↔casual, bold↔restrained, warm↔cool?',
      purpose: 'Behavioral axes via contrast, not adjective picking.',
      answer_type: 'BEHAVIORAL_CONTRAST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    tone_boundaries: {
      text: 'What tones are off-limits (bro humor, corporate stiffness, hype, pity, etc.)?',
      purpose: 'Tone boundaries for language and verbal system.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    stress_behavior: {
      text: 'When something goes wrong, should the brand sound calm, direct, apologetic, or procedural?',
      purpose: 'Stress behavior for error/status copy.',
      answer_type: 'BEHAVIORAL_CONTRAST',
      entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    success_behavior: {
      text: 'When things go well, should celebration be quiet, confident, or enthusiastic?',
      purpose: 'Success behavior for verbal system.',
      answer_type: 'BEHAVIORAL_CONTRAST',
      entry_states: ['IDNTY_01', 'IDNTY_02'],
    },
    authority_behavior: {
      text: 'When stating facts or rules, should the brand sound like law, counsel, or experienced peer?',
      purpose: 'Authority behavior for trust and UI.',
      answer_type: 'BEHAVIORAL_CONTRAST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    },
    social_behavior: {
      text: 'On social, should the brand observe, teach, celebrate customers, or stay mostly quiet?',
      purpose: 'Social behavior for expression contexts.',
      answer_type: 'SINGLE_SELECT',
      entry_states: ['IDNTY_01', 'IDNTY_02'],
      options: ['OBSERVE', 'TEACH', 'CELEBRATE_CUSTOMERS', 'QUIET', 'MIXED'],
    },
    formality: { text: 'How formal should everyday communication feel (1 very casual – 5 very formal)?', purpose: 'Formality axis.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    warmth: { text: 'How warm should the brand feel in first contact (1 cool – 5 warm)?', purpose: 'Warmth axis.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    energy: { text: 'Energy level in core touchpoints (1 calm – 5 high)?', purpose: 'Energy for expression.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    expressiveness: { text: 'Expressiveness (1 minimal – 5 vivid)?', purpose: 'Expressiveness bound.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    premium_level: { text: 'Should the personality feel utilitarian, professional, or elevated?', purpose: 'Premium personality level.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'], options: ['UTILITARIAN', 'PROFESSIONAL', 'ELEVATED', 'MIXED'] },
    industry_fluency: { text: 'Should the brand speak fluent industry jargon, plain language, or translated expert?', purpose: 'Industry fluency for language dimension.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'], options: ['FLUENT_JARGON', 'PLAIN', 'TRANSLATED_EXPERT'] },
    voice_genome: {
      text: 'Which archetypes should modulate your voice by context (primary backbone, relationship carrier, distinctive character)?',
      purpose: 'Voice genome structure — weights are indicative; modulation overrides math.',
      answer_type: 'STRUCTURED_LIST',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'],
      interpretation_notes: 'Supports primary_archetype + relationship_archetype + distinctive_character_archetype with optional_weights and contextual_modulation.',
    },
  },
  IDNTY_05_LANGUAGE: {
    founder_lexicon: { text: 'Words or phrases you already use that feel unmistakably you.', purpose: 'Founder lexicon capture.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    customer_lexicon: { text: 'How do customers describe their problem in their own words?', purpose: 'Customer lexicon for verbal system.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    industry_lexicon: { text: 'Which industry terms must be used correctly vs avoided as empty buzzwords?', purpose: 'Industry lexicon boundaries.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    owned_language: { text: 'Any coined terms or product names you want to protect as owned language?', purpose: 'Owned language registry.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    prohibited_language: { text: 'Words or claims you refuse to use (legal, ethical, or brand reasons).', purpose: 'Prohibited language list.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    overused_industry_language: { text: 'What clichés in your industry make you cringe?', purpose: 'Anti-cliché language guard.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    technical_language_tolerance: { text: 'How technical may customer-facing copy be (1 plain only – 5 expert)?', purpose: 'Technical tolerance.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    pricing_language: { text: 'How should pricing be talked about (transparent, consultative, tiered, custom)?', purpose: 'Pricing language behavior.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    customer_naming: { text: 'What do you call customers (clients, members, shippers, partners)?', purpose: 'Customer naming convention.', answer_type: 'SHORT_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    product_naming: { text: 'Naming pattern for products (descriptive, metaphor, acronym, family)?', purpose: 'Product naming rules input.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02'] },
    status_language: { text: 'How should operational status read (on the road, in review, delayed)?', purpose: 'Status copy behavior.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    support_language: { text: 'Support tone: troubleshooting peer, concierge, or policy desk?', purpose: 'Support language behavior.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
  },
  IDNTY_06_VERBAL_SYSTEM: {
    master_message: { text: 'If you had ten seconds with a ideal customer, what must they understand (not a tagline — the idea)?', purpose: 'Master message raw signal — SITE 00 synthesizes lines.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    master_tagline: { text: 'Existing tagline to preserve or challenge (if any).', purpose: 'Tagline equity check — optional client input.', answer_type: 'EXISTING_VALUE_CONFIRMATION', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    positioning_line: { text: 'How do you currently explain what you are in one line (even if imperfect)?', purpose: 'Positioning line seed for synthesis.', answer_type: 'SHORT_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    product_promise: { text: 'What promise belongs on your core offer (startup to scale, first mile to last)?', purpose: 'Product promise input — not client final copy.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    secondary_brand_lines: { text: 'Secondary lines or campaign themes you want kept or retired.', purpose: 'Secondary line inventory.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    headline_behavior: { text: 'Should headlines lead with outcome, category, or provocation?', purpose: 'Headline behavior rules.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    subhead_behavior: { text: 'Subheads: explain, qualify, or prove?', purpose: 'Subhead behavior.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    CTA_behavior: { text: 'CTA style: direct command, invitation, or operational next step?', purpose: 'CTA behavior for UI and marketing.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    status_behavior: { text: 'Status messages: terse system, human sentence, or branded phrase?', purpose: 'Status copy behavior.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    error_behavior: { text: 'When something fails, what must the user feel (informed, respected, unblocked)?', purpose: 'Error copy behavior.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    success_behavior: { text: 'Success confirmations: minimal tick or moment of recognition?', purpose: 'Success copy behavior.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    campaign_language: { text: 'Campaign language: evergreen only, seasonal bursts, or narrative arcs?', purpose: 'Campaign language strategy.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_02', 'IDNTY_03'], options: ['EVERGREEN', 'SEASONAL', 'NARRATIVE', 'MIXED'] },
    naming_rules: { text: 'Rules for naming features, tiers, and programs.', purpose: 'Naming rules for verbal system.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    voice_examples: { text: 'Paste 2–3 sentences you love that sound like you (yours or admired).', purpose: 'Voice examples for calibration.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02'] },
    voice_anti_examples: { text: 'Paste 2–3 sentences that would feel wrong on your site.', purpose: 'Voice anti-examples.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
  },
  IDNTY_07_MARK: {
    name_equity: { text: 'Is the company name itself the primary equity, or must a symbol carry recognition?', purpose: 'Name vs symbol equity — not logo style quiz.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    symbolic_requirements: { text: 'Should the mark symbolize anything specific, or stay abstract?', purpose: 'Symbolic requirements.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    symbolic_meaning: { text: 'If a symbol is used, what meaning must it hold (if any)?', purpose: 'Symbolic meaning — evidence required to lock.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    mark_independence_requirement: { text: 'Must the mark work without the name at small sizes (app icon, favicon, uniform patch)?', purpose: 'Mark independence requirement.', answer_type: 'BINARY', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    small_scale_requirement: { text: 'Smallest real-world placement you care about (favicon, embroidery, truck door)?', purpose: 'Small scale constraints.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    institutional_vs_personal: { text: 'Should the mark feel institutional or founder-personal?', purpose: 'Institutional vs personal mark tone.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    editorial_vs_technical: { text: 'Mark tone: editorial wordmark, engineered badge, or hybrid?', purpose: 'Editorial vs technical mark.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    architectural_vs_organic: { text: 'Geometry preference: architectural/grid or organic/hand?', purpose: 'Mark geometry signal — not style order.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_02'] },
    luxury_vs_utility: { text: 'Mark should signal luxury, utility, or both?', purpose: 'Luxury vs utility for mark and type.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    existing_symbol_equity: { text: 'Upload or describe existing logo/symbol equity to preserve.', purpose: 'Existing symbol evidence.', answer_type: 'ASSET_UPLOAD', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    prohibited_symbols: { text: 'Symbols or motifs that are off-limits (cliché, cultural, competitor)?', purpose: 'Prohibited symbols list.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    cliche_risk: { text: 'What obvious symbols would feel wrong for your category?', purpose: 'Cliché risk for mark exploration.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    application_contexts: { text: 'Where must the mark appear in the first year (list contexts)?', purpose: 'Mark application contexts.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
  },
  IDNTY_08_PALETTE: {
    existing_color_equity: { text: 'List colors with real equity (hex, print, vehicle, uniform) and where they live.', purpose: 'Color equity evidence — not favorites.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    non_negotiable_colors: { text: 'Colors that must be preserved or honored in any refresh.', purpose: 'Non-negotiable colors.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    emotional_temperature: { text: 'What should the brand feel like before someone reads a word?', purpose: 'Emotional temperature for palette logic.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    warm_cool_axis: { text: 'Warm vs cool overall — and why?', purpose: 'Warm/cool axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    light_dark_axis: { text: 'Light vs dark dominant environments?', purpose: 'Light/dark axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    earth_digital_axis: { text: 'Earth/material vs digital/screen-native?', purpose: 'Earth/digital axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_02'] },
    quiet_high_contrast_axis: { text: 'Quiet/minimal vs high-contrast/alert?', purpose: 'Contrast temperament.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    soft_structured_axis: { text: 'Soft/atmospheric vs structured/geometric color?', purpose: 'Soft/structured axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    familiar_unexpected_axis: { text: 'Familiar/category-safe vs unexpected/category-breaking color?', purpose: 'Familiar/unexpected axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_02'] },
    industry_color_cliches: { text: 'Which industry colors should be avoided?', purpose: 'Industry cliché colors.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    material_associations: { text: 'Materials the brand should evoke (steel, paper, asphalt, linen)?', purpose: 'Material associations for palette and grammar.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    environment_associations: { text: 'Environments the palette should feel at home in (office, road, warehouse, home)?', purpose: 'Environment associations.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    accessibility_requirements: { text: 'Accessibility requirements (contrast, color-blind, regulatory)?', purpose: 'Accessibility constraints.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
  },
  IDNTY_09_TYPE: {
    reading_density: { text: 'Typical reading load: headlines only, scan paragraphs, or long-form?', purpose: 'Reading density for type system.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'], options: ['HEADLINES', 'SCAN', 'LONGFORM', 'MIXED'] },
    display_need: { text: 'Need for large display typography (hero, signage, billboards)?', purpose: 'Display need.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    numeric_data_need: { text: 'How prominent are numbers, tables, and dashboards?', purpose: 'Numeric/data typography need.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    editorial_need: { text: 'Editorial/story typography importance?', purpose: 'Editorial type need.', answer_type: 'SCALE', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    technical_need: { text: 'Technical/spec typography importance?', purpose: 'Technical type need.', answer_type: 'SCALE', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    humanity_need: { text: 'Human/handwritten warmth needed anywhere?', purpose: 'Humanity in type.', answer_type: 'BINARY', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    timeless_vs_contemporary: { text: 'Timeless/classic vs contemporary/digital type feel?', purpose: 'Timeless/contemporary axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    voice_scale: { text: 'Type should whisper, speak, or announce by default?', purpose: 'Voice scale for hierarchy.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    signage_behavior: { text: 'Physical signage typography needs (distance, glow, regulatory)?', purpose: 'Signage behavior.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02'] },
    document_behavior: { text: 'Document/PDF typography priorities (contracts, invoices, reports)?', purpose: 'Document behavior.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    UI_behavior: { text: 'Product UI typography: dense tool, spacious consumer, or operational dashboard?', purpose: 'UI type behavior.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'], options: ['DENSE_TOOL', 'SPACIOUS', 'OPERATIONAL_DASHBOARD', 'MIXED'] },
    body_readability_priority: { text: 'Body readability vs brand character — which wins at small sizes?', purpose: 'Body readability priority.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
  },
  IDNTY_10_VISUAL_GRAMMAR: {
    brand_world: { text: 'Describe the world the brand lives in (place, era, industry reality) — not a mood board order.', purpose: 'Brand world before imagery generation.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    physical_place_metaphor: { text: 'Is there a physical place metaphor (office, road, workshop, home)?', purpose: 'Place metaphor for visual grammar.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    lighting: { text: 'Lighting character: daylight office, night highway, studio, mixed?', purpose: 'Lighting for visual grammar.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    materiality: { text: 'Dominant materials and surfaces (metal, paper, glass, fabric, asphalt).', purpose: 'Materiality signal.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    imagery_subjects: { text: 'Subjects that must appear in brand imagery (people, fleet, product, places).', purpose: 'Imagery subjects.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    people_presence: { text: 'People in imagery: founders, crews, customers, or product-only?', purpose: 'People presence rules.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'], options: ['FOUNDERS', 'CREWS', 'CUSTOMERS', 'PRODUCT_ONLY', 'MIXED', 'NONE'] },
    product_presence: { text: 'How should product/service show up visually (hero, contextual, diagram)?', purpose: 'Product presence.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    documentary_vs_commercial: { text: 'Imagery: documentary truth vs commercial polish?', purpose: 'Documentary vs commercial axis.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    editorial_vs_systemic: { text: 'Layouts: editorial spreads vs systematic grids?', purpose: 'Editorial vs systemic.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    cinematic_vs_functional: { text: 'Visual drama: cinematic moments vs always-functional clarity?', purpose: 'Cinematic vs functional.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    spatiality: { text: 'Depth and space: flat UI, shallow stage, or deep environmental?', purpose: 'Spatiality for grammar and expression.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    polish_level: { text: 'Finish level: raw/operational vs refined/luxury?', purpose: 'Polish level.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    real_vs_abstract: { text: 'Photography/real vs illustration/abstract balance?', purpose: 'Real vs abstract.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    composition: { text: 'Composition bias: centered authority, left-weighted UI, dynamic diagonal?', purpose: 'Composition bias.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02'] },
    texture: { text: 'Texture: clean flat, grain, physical imperfection?', purpose: 'Texture character.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_01', 'IDNTY_02'] },
    motion_character: { text: 'Motion: static/steady, purposeful transitions, or energetic?', purpose: 'Motion character for digital expression.', answer_type: 'BEHAVIORAL_CONTRAST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    prohibited_visual_cliches: { text: 'Visual clichés to avoid in your category.', purpose: 'Prohibited visual clichés.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
  },
  IDNTY_11_EXPRESSION: {
    expression_contexts: {
      text: 'Which brand surfaces matter in the next 12 months? Select all that apply.',
      purpose: 'Expression context catalog — branches per-context follow-ups.',
      answer_type: 'MULTI_SELECT',
      entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
      options: ['PUBLIC_SITE', 'CLIENT_PORTAL', 'PRODUCT_UI', 'SOCIAL', 'EMAIL', 'DOCUMENTS', 'INVOICES', 'PACKAGING', 'APP', 'INTERNAL_OFFICE', 'PHYSICAL_SIGNAGE', 'ADS', 'VIDEO', 'UNIFORMS', 'VEHICLES', 'OTHER'],
    },
  },
  IDNTY_12_AUTHORITY: {
    final_creative_authority: { text: 'Who has final say on brand decisions (name one role or person)?', purpose: 'Final creative authority — must be explicit.', answer_type: 'APPROVAL_SELECTION', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'], must_be_asked: true },
    consulted_roles: { text: 'Who must be consulted but does not have final veto?', purpose: 'Consulted roles.', answer_type: 'ROLE_SELECTION', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    existing_locked_elements: { text: 'List brand elements that are legally or contractually locked.', purpose: 'Locked elements inventory.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    challengeable_elements: { text: 'What existing brand elements are open to challenge in this engagement?', purpose: 'Challengeable elements.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02'] },
    non_changeable_elements: { text: 'What must not change in this phase (even if imperfect)?', purpose: 'Non-changeable elements.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    approval_threshold: { text: 'What level of review is required before anything goes live?', purpose: 'Approval threshold.', answer_type: 'SINGLE_SELECT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'], options: ['FOUNDER_ONLY', 'FOUNDER_PLUS_ONE', 'COMMITTEE', 'CLIENT_STAKEHOLDER_SIGNOFF'] },
    anti_approval_signal: { text: 'What responses mean “not approved” for you (vague praise, silence, etc.)?', purpose: 'Anti-approval signals.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    positive_authority_signal: { text: 'What responses mean “approved to proceed”?', purpose: 'Positive approval signals.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    required_final_kit: { text: 'What must be in the final brand kit for you to call identity complete?', purpose: 'Required final kit checklist.', answer_type: 'STRUCTURED_LIST', entry_states: ['IDNTY_02', 'IDNTY_03'] },
    review_process: { text: 'Describe your preferred review rounds (async, live, board, etc.).', purpose: 'Review process contract.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'] },
    decision_conflict_resolution: { text: 'If you and SITE 00 disagree, how should conflicts be resolved?', purpose: 'Conflict resolution for authority dimension.', answer_type: 'FREE_TEXT', entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'], must_be_asked: true },
  },
};

const questions = [];
const fieldMap = [];

function addEvidenceQuestion(dimensionId, fieldId, entryState) {
  const qid = `Q_${dimensionId}_${fieldId}_EVIDENCE_${entryState}`;
  questions.push({
    question_id: qid,
    dimension_id: dimensionId,
    question_text: `Upload or link evidence for ${fieldId.replace(/_/g, ' ')} (partial/evolution/build-ready).`,
    question_purpose: 'Evidence capture for equity and verification.',
    answer_type: 'ASSET_UPLOAD',
    required_or_optional: 'optional',
    entry_states: [entryState],
    branch_conditions: [{ when: 'entry_state', in: [entryState] }, { when: 'has_existing_equity', equals: true }],
    field_targets: [`${dimensionId}.${fieldId}`],
    evidence_targets: [fieldId],
    interpretation_notes: 'Evidence may supersede self-reported answers when conflicting.',
    founder_review_relevance: 'high',
    client_review_relevance: 'medium',
    sensitivity: 'medium',
    can_be_inferred: false,
    must_be_asked: false,
    repeat_policy: 'once_per_engagement',
    notes: 'Auto-generated evidence prompt for state 01+.',
  });
  fieldMap.push({ question_id: qid, field_targets: [`${dimensionId}.${fieldId}`], resolution: 'evidence' });
}

for (const dimensionId of schema.canonical_dimensions) {
  const dim = schema.dimensions[dimensionId];
  const templates = QUESTION_TEMPLATES[dimensionId] ?? {};
  for (const field of dim.fields) {
    const tpl = templates[field.field_id];
    if (!tpl) {
      if (field.required) {
        console.warn(`Missing template for required field ${dimensionId}.${field.field_id}`);
      }
      continue;
    }
    const qid = `Q_${dimensionId}_${field.field_id}`;
    const entry_states = tpl.entry_states ?? ENTRY_STATES;
    questions.push({
      question_id: qid,
      dimension_id: dimensionId,
      question_text: tpl.text,
      question_purpose: tpl.purpose,
      answer_type: tpl.answer_type,
      required_or_optional: field.required ? 'required' : 'optional',
      entry_states,
      branch_conditions: [{ when: 'entry_state', in: entry_states }],
      field_targets: [`${dimensionId}.${field.field_id}`],
      evidence_targets: tpl.answer_type === 'ASSET_UPLOAD' ? [field.field_id] : [],
      interpretation_notes: tpl.interpretation_notes ?? '',
      founder_review_relevance: dimensionId === 'IDNTY_12_AUTHORITY' ? 'critical' : 'medium',
      client_review_relevance: 'high',
      sensitivity: dimensionId === 'IDNTY_12_AUTHORITY' ? 'high' : 'medium',
      can_be_inferred: tpl.can_be_inferred ?? false,
      must_be_asked: tpl.must_be_asked ?? field.required,
      repeat_policy: 'once_per_engagement_unless_evolution',
      notes: tpl.options ? `options:${tpl.options.join('|')}` : '',
    });
    fieldMap.push({ question_id: qid, field_targets: [`${dimensionId}.${field.field_id}`], resolution: 'question' });
    if (['IDNTY_01', 'IDNTY_02', 'IDNTY_03'].some((s) => entry_states.includes(s)) && field.field_id !== 'expression_contexts') {
      for (const st of ['IDNTY_01', 'IDNTY_02', 'IDNTY_03']) {
        if (entry_states.includes(st)) addEvidenceQuestion(dimensionId, field.field_id, st);
      }
    }
  }
}

// Per-context expression follow-ups (branch from expression_contexts selection)
const exprDim = schema.dimensions.IDNTY_11_EXPRESSION.fields[0];
for (const ctx of exprDim.context_catalog) {
  const qid = `Q_IDNTY_11_EXPRESSION_${ctx}_PROFILE`;
  questions.push({
    question_id: qid,
    dimension_id: 'IDNTY_11_EXPRESSION',
    question_text: `For ${ctx.replace(/_/g, ' ')}, describe premium, functional, energy, and trust levels needed.`,
    question_purpose: 'Per-context expression attributes.',
    answer_type: 'STRUCTURED_LIST',
    required_or_optional: 'optional',
    entry_states: ['IDNTY_00', 'IDNTY_01', 'IDNTY_02', 'IDNTY_03'],
    branch_conditions: [{ when: 'expression_contexts_selected', includes: ctx }],
    field_targets: [`IDNTY_11_EXPRESSION.expression_contexts.${ctx}`],
    evidence_targets: [],
    interpretation_notes: 'Only asked when context is selected.',
    founder_review_relevance: 'medium',
    client_review_relevance: 'high',
    sensitivity: 'low',
    can_be_inferred: true,
    must_be_asked: false,
    repeat_policy: 'once_per_context',
    notes: 'Branch child of expression_contexts multi-select.',
  });
  fieldMap.push({ question_id: qid, field_targets: [`IDNTY_11_EXPRESSION.expression_contexts.${ctx}`], resolution: 'question' });
}

const bank = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  total_questions: questions.length,
  questions,
};

fs.writeFileSync(path.join(INTAKE, 'IDNTY_QUESTION_BANK.json'), `${JSON.stringify(bank, null, 2)}\n`);
fs.writeFileSync(
  path.join(INTAKE, 'IDNTY_QUESTION_FIELD_MAP.json'),
  `${JSON.stringify({ schemaVersion: 1, mappings: fieldMap, total_mappings: fieldMap.length }, null, 2)}\n`,
);

console.log(`Wrote ${questions.length} questions and ${fieldMap.length} field mappings.`);
