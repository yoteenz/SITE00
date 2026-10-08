/**
 * P0.JURNL.EMAIL-ENGINE.CANONICAL-ARCHITECTURE-AND-CREATIVE-INFRASTRUCTURE1 — export the JURNL email engine
 * (single source: shared/jurnl-email-engine) into "JURNL EMAILS v1/": manifests + schemas, system docs, one contract
 * folder per email, and README stubs for the folders that stay empty until authorities are approved.
 *
 *   npx tsx scripts/jurnl/email-engine-export.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import * as E from '../../shared/jurnl-email-engine/index.js';

const json = (v: unknown) => `${JSON.stringify(v, null, 2)}\n`;
const md = (lines: (string | false | null | undefined)[]) => `${lines.filter((l): l is string => typeof l === 'string').join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
const bullets = (items: readonly string[]) => items.map((i) => `- ${i}`).join('\n');
const GEN = `Generated from \`${E.JURNL_EMAIL_SYSTEM.source}\` by \`scripts/jurnl/email-engine-export.ts\`. Edit the source, then re-export.`;
const table = (head: string[], rows: string[][]) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map((c) => c.replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)].join('\n');

function doctrineMd(): string {
  const D = E.CREATIVE_DOCTRINE;
  return md([
    `# ${E.JURNL_EMAIL_SYSTEM.name} — creative doctrine`,
    '',
    GEN,
    '',
    `> ${D.statement}`,
    '',
    `**${E.JURNL_EMAIL_SYSTEM.centralIdea.app}** is the app. **${E.JURNL_EMAIL_SYSTEM.centralIdea.email}** is the email.`,
    '',
    '## Principles',
    bullets(D.principles),
    '',
    '## JURNL emails are not',
    bullets(D.isNot),
    '',
    '## They feel like receiving',
    bullets(D.feelsLike),
    '',
    `**Legacy:** ${D.legacyRule}`,
    '',
    '## Layer model',
    table(['Layer', 'Name', 'Owner', 'Holds'], E.LAYER_MODEL.map((l) => [l.id, l.name, l.owner, l.holds.join(', ') + (l.optional ? ' (optional)' : '')])),
    '',
    `**${E.LAYER_HARD_RULE}**`,
    '',
    '## Ownership: image vs live HTML',
    table(['Generated / static imagery may own', 'Live HTML must own'], Array.from({ length: Math.max(E.OWNERSHIP_MATRIX.imageMayOwn.length, E.OWNERSHIP_MATRIX.htmlMustOwn.length) }, (_, i) => [E.OWNERSHIP_MATRIX.imageMayOwn[i] ?? '', E.OWNERSHIP_MATRIX.htmlMustOwn[i] ?? ''])),
    '',
    '## Restraint',
    `**${E.RESTRAINT_RULE.formula}**`,
    '',
    E.RESTRAINT_RULE.never,
    '',
    E.RESTRAINT_RULE.perFamilyCeiling,
    '',
    '## Typography',
    table(['Role', 'Face', 'Case', 'Desktop px', 'Mobile px', 'Tracking', 'Note'], E.TYPOGRAPHY.map((t) => [t.role, t.face, t.caseRule, t.desktopPx.join('–'), t.mobilePx.join('–'), t.tracking, t.note])),
    '',
    `Stacks: serif \`${E.TYPE_STACKS.EDITORIAL_SERIF}\`; sans \`${E.TYPE_STACKS.SANS}\`. ${E.TYPE_STACKS.note}`,
    '',
    '## Voice',
    `Is: ${E.VOICE.is.join(', ')}. Is not: ${E.VOICE.isNot.join(', ')}.`,
    '',
    '## Financial nudges',
    `**${E.NUDGE_COPY_CONSTRAINT.rule}**`,
    '',
    `Avoid: ${E.NUDGE_COPY_CONSTRAINT.avoid.join('; ')}.`,
    '',
    `Prefer: ${E.NUDGE_COPY_CONSTRAINT.prefer.join(' · ')}`,
    '',
    '## Material grammar',
    `- **Base:** ${E.MATERIAL_GRAMMAR.base.join(', ')}`,
    `- **Contrast:** ${E.MATERIAL_GRAMMAR.contrast.join(', ')}`,
    `- **Signature details:** ${E.MATERIAL_GRAMMAR.signature.join(', ')}`,
    `- **HTML tokens:** ${Object.entries(E.MATERIAL_GRAMMAR.tokens).map(([k, v]) => `${k} ${v}`).join(' · ')}`,
    bullets(E.MATERIAL_GRAMMAR.motifCaps),
    '',
    '## Families',
    table(['Family', 'Artifact grammar', 'Mood', 'Consent', 'Expressiveness', 'Environment art'], E.EMAIL_FAMILIES.map((f) => [`${f.id} ${f.name}`, f.artifactGrammar.join(', '), f.mood, f.consentClasses.join(', '), String(f.expressiveness), f.environmentArt])),
    '',
    `Inheritance: ${E.FAMILY_INHERITANCE.join(' → ')}. ${E.INHERITANCE_RULE}`,
    '',
    '## Failures this system prevents',
    table(['Failure', 'Prevention'], E.PREVENTED_FAILURES.map((p) => [p.failure, p.prevention])),
  ]);
}

function familiesMd(): string {
  return md([
    '# Email families',
    '',
    GEN,
    ...E.EMAIL_FAMILIES.flatMap((f) => [
      '',
      `## ${f.id} — ${f.name}`,
      '',
      f.purpose,
      '',
      `- **Examples:** ${f.examples.join('; ')}`,
      `- **Artifact grammar:** ${f.artifactGrammar.join(' / ')}`,
      `- **Mood:** ${f.mood}`,
      `- **Visual language:** ${f.visualLanguage.join(', ')}`,
      `- **Forbidden:** ${f.forbidden.join('; ')}`,
      `- **Consent classes:** ${f.consentClasses.join(', ')}`,
      `- **Expressiveness:** ${f.expressiveness} / 5 · **environment art:** ${f.environmentArt} · **max personalization:** ${f.maxPersonalization}`,
      `- **Priorities:** ${f.priorities.join('; ')}`,
      `- **Lineage:** ${f.lineage.join(', ')}`,
      `- **Components:** ${E.EMAIL_COMPONENTS.filter((c) => c.families.includes(f.id)).map((c) => `${c.id} ${c.name}`).join(', ')}`,
    ]),
  ]);
}

function componentsMd(): string {
  return md([
    '# Email components (EC01–EC17)',
    '',
    GEN,
    ...E.EMAIL_COMPONENTS.flatMap((c) => [
      '',
      `## ${c.id} — ${c.name}`,
      '',
      c.purpose,
      '',
      `- **Families:** ${c.families.join(', ')} · **consent classes:** ${c.consentClasses.join(', ')}`,
      `- **HTML owns:** ${c.html.join('; ')}`,
      `- **Image may own:** ${c.image.length ? c.image.join('; ') : 'nothing'}`,
      `- **Desktop:** ${c.responsive.desktop}`,
      `- **Mobile:** ${c.responsive.mobile}`,
      `- **Accessibility:** ${c.accessibility.join(' ')}`,
      `- **Live data:** ${c.dynamicData.length ? c.dynamicData.join(', ') : 'none (static copy)'}`,
      `- **Variants:** ${c.variants.join(', ')}`,
      `- **Never:** ${c.forbidden.join('; ')}`,
    ]),
  ]);
}

function consentMd(): string {
  return md([
    '# Consent model: transactional / lifecycle / marketing firewall',
    '',
    GEN,
    '',
    'Source truth: JURNL has no email consent, no email preferences and no unsubscribe concept today. The consent keys that exist (`DATA_REMEMBER`, `LINKED_ACCOUNTS`, `NO_DATA_SALE`, the AI keys, `ASK_JURNL_CONTEXT`) are not email permissions; `settings.notificationsEnabled` is stored but unused; the NOTIFICATIONS row on the account page is not implemented. This model adds nothing to live consent.',
    '',
    '## Classes',
    ...E.CONSENT_CLASSES.flatMap((c) => ['', `### ${c.id}`, '', c.definition, '', `- Examples: ${c.examples.join('; ')}`, `- Requires opt-in: ${c.requiresOptIn ? 'YES' : 'NO'} · unsubscribe required: ${c.requiresUnsubscribe ? 'YES' : 'NO'} · marketing content: ${c.marketingContentAllowed ? 'ALLOWED' : 'FORBIDDEN'} · sends when marketing declined: ${c.sendsWhenMarketingDeclined ? 'YES' : 'NO'}`, bullets(c.rules)]),
    '',
    '## Firewall',
    bullets(E.FIREWALL_RULES),
    '',
    '## Preference categories (conceptual)',
    table(['Category', 'Class', 'Default', 'User can turn off', 'Supported today', 'Proposed consent key'], E.PREFERENCE_CATEGORIES.map((p) => [p.label, p.consentClass, p.defaultOn ? 'ON' : 'OFF', p.userCanDisable ? 'YES' : 'NO', p.supportedToday ? 'YES' : 'NO', p.proposedConsentKey ?? '—'])),
    '',
    bullets(E.PREFERENCE_RULES),
  ]);
}

function triggersMd(): string {
  return md([
    '# Trigger contracts',
    '',
    GEN,
    '',
    'Each email contract specifies: EMAIL_ID · FAMILY · PURPOSE · TRIGGER_EVENT · ELIGIBILITY · SUPPRESSION_RULES · COOLDOWN · PERSONALIZATION_INPUTS · CTA_DESTINATION · CONSENT_CLASS · PRIORITY · DUPLICATE_GUARD · DELIVERY_STATE.',
    '',
    '## Trigger events (against repository truth)',
    table(['Event', 'Brief name', 'Status', 'Source', 'Fires', 'Needs'], E.TRIGGER_EVENTS.map((t) => [t.id, t.briefName, t.status, t.source, t.fires, t.dependencies.join('; ')])),
    '',
    bullets(E.TRIGGER_RULES),
    '',
    '## Per email',
    table(
      ['Email', 'Event', 'Consent', 'Priority', 'Cooldown', 'Personalization', 'CTA route', 'Duplicate guard', 'Delivery'],
      E.EMAIL_CONTRACTS.map((e) => [`${e.id} ${e.name}`, e.trigger.triggerEvent, e.trigger.consentClass, e.trigger.priority, e.trigger.cooldown, e.trigger.personalization, e.trigger.ctaDestination, e.trigger.duplicateGuard, e.trigger.deliveryState]),
    ),
    '',
    '## Personalization levels',
    table(['Level', 'Name', 'Allows', 'Rules'], E.PERSONALIZATION_LEVELS.map((p) => [p.level, p.name, p.allows.join(', '), p.rules.join(' ')])),
  ]);
}

function responsiveMd(): string {
  const R = E.RESPONSIVE_RULES;
  return md([
    '# Responsive email rules',
    '',
    GEN,
    '',
    table(['Viewport', 'Range (px)', 'Canonical', 'Note'], E.RESPONSIVE_VIEWPORTS.map((v) => [v.id, v.range.join('–'), String(v.canonical), v.note])),
    '',
    `- **Max content width:** ${R.maxContentWidth} px. ${R.outerCanvas}`,
    `- **Gutters:** desktop ${R.gutters.desktop} px, mobile ${R.gutters.mobile} px.`,
    `- **Text:** body ≥ ${R.text.bodyMinPx} px, legal ≥ ${R.text.legalMinPx} px, line height ${R.text.lineHeight}. ${R.text.note}`,
    `- **CTA:** ≥ ${R.cta.minHeightPx.desktop} px desktop, ≥ ${R.cta.minHeightPx.mobile} px mobile, ${R.cta.mobileWidth} on mobile. ${R.cta.note}`,
    `- **Edge-safe:** ${R.edgeSafe}`,
    `- **Column collapse:** ${R.columnCollapse}`,
    `- **Fallback background:** ${R.fallbackBackground}`,
    `- **Image-blocked:** ${R.imageBlocked}`,
    '',
    '### Stacking',
    bullets(R.stacking),
    '',
    '### Images',
    bullets(R.images),
    '',
    '### Crop rules',
    bullets(R.cropRules),
    '',
    '### Dark mode',
    bullets(R.darkMode),
    '',
    '## Email-safe implementation doctrine',
    bullets(E.EMAIL_SAFE_DOCTRINE),
    '',
    '## Accessibility gates',
    table(['Gate', 'Requirement'], E.ACCESSIBILITY_GATES.map((g) => [g.id, g.gate])),
    '',
    `## Client matrix\n\n${E.CLIENT_MATRIX.join(' · ')}`,
  ]);
}

function assetMd(): string {
  return md([
    '# Asset model',
    '',
    GEN,
    '',
    table(['Class', 'Layer', 'Definition', 'Rules'], E.EMAIL_ASSET_CLASSES.map((a) => [a.id, a.layer, a.definition, a.rules.join(' ')])),
    '',
    '## Lineage groups',
    table(['Group', 'Families', 'Emails', 'Materials', 'Founded by'], E.LINEAGE_GROUPS.map((g) => [g.id, g.families.join(', '), g.emails.join(', ') || '—', g.materials, g.founder ?? '—'])),
    '',
    '## Reuse rules',
    table(['Action', 'When', 'Never'], E.LINEAGE_RULES.map((r) => [r.action, r.when, r.never])),
    '',
    bullets(E.ASSET_RULES),
    '',
    '## Planned slots (nothing generated)',
    table(['Email', 'Slot', 'Class', 'Action', 'Note'], E.EMAIL_CONTRACTS.flatMap((e) => e.assetPlan.map((a) => [e.id, a.slot, a.assetClass, a.lineageAction, a.note]))),
  ]);
}

function lifecycleMd(): string {
  return md([
    '# Production lifecycle, pipeline and agent roles',
    '',
    GEN,
    '',
    table(['State', 'Meaning', 'Founder required'], E.PRODUCTION_STATES.map((s) => [s.state, s.meaning, s.requiresFounder ? 'YES' : '—'])),
    '',
    `**${E.APPROVAL_RULE}**`,
    '',
    '## Pipeline',
    table(['Step', 'Name', 'Owner', 'Output'], E.GENERATION_PIPELINE.map((p) => [String(p.step).padStart(2, '0'), p.name, p.owner.join(' + '), p.output])),
    '',
    `**${E.PIPELINE_HARD_RULE}**`,
    '',
    '## Agent responsibilities',
    table(['Role', 'Owns', 'Never'], E.AGENT_RESPONSIBILITIES.map((a) => [a.role, a.owns.join('; '), a.never.join('; ') || '—'])),
    '',
    '## Analytics',
    table(['Event', 'Note'], E.ANALYTICS_MODEL.events.map((a) => [a.id, a.note])),
    '',
    bullets(E.ANALYTICS_MODEL.guardrails),
  ]);
}

function providerInventoryMd(): string {
  return md([
    '# Provider inventory (repository truth)',
    '',
    GEN,
    '',
    table(['Area', 'Verdict', 'Finding', 'Paths'], E.PROVIDER_INVENTORY.map((p) => [p.area, p.verdict, p.finding, p.paths.map((x) => `\`${x}\``).join(', ')])),
    '',
    '## Decision',
    bullets(E.PROVIDER_DECISION),
  ]);
}

function providerContractMd(): string {
  return md([
    '# Provider-neutral implementation contract',
    '',
    GEN,
    '',
    'Types live in `shared/jurnl-email-engine/provider.ts`. A real adapter implements `EmailProvider` and calls `deliveryGuard` first; nothing in the creative system depends on a vendor.',
    '',
    table(
      ['Type', 'Role'],
      [
        ['EmailDefinition', 'Which email: id, family, consent class, preference category, personalization, template version.'],
        ['EmailRecipient', 'Supabase auth user id, address, verified flag, first name, time zone, locale.'],
        ['EmailPayload', 'Live L3–L5 values and links for one state; as-of time; fixture marker (refused by delivery).'],
        ['EmailTemplate', 'Versioned render(payload, assets) → subject, preheader, html, text.'],
        ['EmailAssetSet', 'The approved assets for a lineage group (slot, class, url, size, alt).'],
        ['EmailDeliveryRequest', 'Definition + recipient + payload + idempotency key + headers (List-Unsubscribe).'],
        ['EmailDeliveryResult', 'SENT / QUEUED / SUPPRESSED / DUPLICATE / FAILED / NOT_SENT_DRY_RUN / REFUSED_FIXTURE.'],
        ['EmailPreference', 'Category on/off with version, time and source (mirrors the consent record shape).'],
        ['EmailEvent', 'REQUESTED, SUPPRESSED, DELIVERED, BOUNCED, OPENED, CTA_CLICKED, DEEP_LINK_OPENED, UNSUBSCRIBED, PREFERENCE_CHANGED, CONVERSION_EVENT.'],
        ['EmailProvider', 'send(request, rendered) → result. Only implementation today: createDryRunEmailProvider (never sends).'],
      ],
    ),
    '',
    '## Rules',
    bullets([
      'Auth mail (A02, A08) is rendered by the auth provider (Supabase) from the approved authority; JURNL does not re-send it.',
      'Delivery refuses fixture payloads, unverified addresses (except A02) and categories that are off.',
      'Idempotency key = the contract’s duplicate guard; the send log is persisted (not in memory) when a provider is wired.',
      'Security links are never click-tracked.',
    ]),
  ]);
}

function previewMd(): string {
  return md([
    '# Preview / review / QA architecture',
    '',
    GEN,
    '',
    '## A preview shows',
    bullets(E.PREVIEW_FIELDS),
    '',
    '## Minimum viable preview',
    bullets(E.PREVIEW_ARCHITECTURE.minimumViable),
    '',
    `Not now: ${E.PREVIEW_ARCHITECTURE.notNow.join('; ')}.`,
    '',
    E.PREVIEW_ARCHITECTURE.review.join(' '),
    '',
    '## QA gates',
    `- **RESPONSIVE_QA:** ${E.QA_GATES.RESPONSIVE_QA.join('; ')}`,
    `- **DELIVERY_QA:** ${E.QA_GATES.DELIVERY_QA.join('; ')}`,
  ]);
}

function contractMd(e: E.EmailMessageContract): string {
  const fam = E.familyById(e.family);
  const t = e.trigger;
  const ev = E.TRIGGER_EVENTS.find((x) => x.id === t.triggerEvent)!;
  return md([
    `# ${e.id} — ${e.name}`,
    '',
    GEN,
    '',
    `**State:** ${e.productionState} · **founder approval:** ${e.founderApproval.status} · **delivery:** ${t.deliveryState}`,
    '',
    `**Family:** ${fam.id} ${fam.name}${e.traits.length ? ` (with ${e.traits.map((x) => E.familyById(x).name).join(', ')} traits)` : ''} · **message type:** ${e.messageType} · **lineage:** ${e.lineageGroup}`,
    '',
    e.purpose,
    '',
    '## Trigger contract',
    table(
      ['Field', 'Value'],
      [
        ['EMAIL_ID', e.id],
        ['FAMILY', `${fam.id} ${fam.name}`],
        ['PURPOSE', e.purpose],
        ['TRIGGER_EVENT', `${t.triggerEvent} (${ev.status})`],
        ['ELIGIBILITY', t.eligibility.join('; ')],
        ['SUPPRESSION_RULES', t.suppression.join('; ')],
        ['COOLDOWN', t.cooldown],
        ['PERSONALIZATION_INPUTS', `${t.personalizationInputs.join(', ')} (${t.personalization})`],
        ['CTA_DESTINATION', t.ctaDestination],
        ['CONSENT_CLASS', `${t.consentClass} · preference ${e.preferenceCategory}`],
        ['PRIORITY', t.priority],
        ['DUPLICATE_GUARD', t.duplicateGuard],
        ['DELIVERY_STATE', t.deliveryState],
      ],
    ),
    '',
    `Source: ${ev.source}`,
    '',
    `Needs before it can fire: ${ev.dependencies.join('; ')}.`,
    '',
    '## States',
    table(['State', 'When', 'Differs by'], e.states.map((s) => [s.id, s.when, s.differences])),
    '',
    `## Copy (${e.copy.status})`,
    table(
      ['Field', 'Draft'],
      [
        ['SUBJECT', e.copy.subject],
        ['PREHEADER', e.copy.preheader],
        ['FROM_NAME', e.copy.fromName],
        ['REPLY_TO_POLICY', e.copy.replyToPolicy],
        ['EYEBROW', e.copy.eyebrow],
        ['HEADLINE', e.copy.headline],
        ['MESSAGE_BODY', e.copy.body.join(' / ')],
        ['CTA', `${e.copy.cta.label} → ${e.copy.cta.destination}`],
        ...(e.copy.secondary ? [['SECONDARY', `${e.copy.secondary.label} → ${e.copy.secondary.destination}`]] : []),
        ...(e.copy.notice ? [['NOTICE', e.copy.notice]] : []),
        ['FALLBACK_TEXT', e.copy.fallbackText.replace(/\n/g, ' ⏎ ')],
      ],
    ),
    '',
    '## Composition',
    `- **Artifact:** ${e.artifact.join(' / ')}`,
    `- **Components (reading order):** ${e.components.map((c) => `${c} ${E.componentById(c).name}`).join(' → ')}`,
    `- **Primary editorial gesture (options):** ${e.authorityBrief.primaryGesture.join('; ')}`,
    `- **Secondary tactile detail (options):** ${e.authorityBrief.secondaryDetail.join('; ')}`,
    `- **Contrast anchor:** ${e.authorityBrief.contrastAnchor}`,
    `- **Environment:** ${e.authorityBrief.environment}`,
    `- **Avoid:** ${e.authorityBrief.avoid.join('; ')}`,
    `- **Live HTML (never image):** headline, body, ${t.personalizationInputs.join(', ')}, CTA, links, footer${e.trigger.consentClass === 'TRANSACTIONAL' ? ', security notice' : ', unsubscribe / preferences'}`,
    '',
    '## Planned assets (decomposed after the authority is approved; nothing generated)',
    table(['Slot', 'Class', 'Lineage action', 'Note'], e.assetPlan.map((a) => [a.slot, a.assetClass, a.lineageAction, a.note])),
    '',
    `Fixture: \`${e.fixture}\` (DEMO ONLY) in \`00_SYSTEM/fixtures.json\`.`,
  ]);
}

function copyDeckMd(): string {
  return md([
    '# Copy deck — subjects, preheaders, CTAs (DRAFT FOR FOUNDER REVIEW)',
    '',
    GEN,
    '',
    bullets(E.COPY_RULES),
    '',
    table(['Email', 'Subject', 'Preheader', 'Headline', 'CTA'], E.EMAIL_CONTRACTS.map((e) => [`${e.id} ${e.name}`, e.copy.subject, e.copy.preheader, e.copy.headline, e.copy.cta.label])),
  ]);
}

function batchReadinessMd(): string {
  return md([
    '# Readiness for P0.JURNL.EMAILS.FIRST-8-AUTHORITY-BATCH1',
    '',
    GEN,
    '',
    'The next sprint designs one full email authority per contract (mobile and desktop), with sample copy from the contract, for founder review. It must not decompose assets or implement templates.',
    '',
    'Each authority prompt carries, from the contract folder:',
    bullets([
      'family, artifact grammar and mood (00_SYSTEM/creative-doctrine.md, families.md)',
      'primary gesture, secondary detail, contrast anchor, environment and avoid list (Composition section)',
      'the draft copy and the live-content list — the authority shows sample copy, but every word, figure and button stays reproducible as HTML',
      'the restraint formula and the lineage group, so A01/A04, A02/A08 and A03/A06 share materials',
    ]),
    '',
    table(['Email', 'Family', 'Artifact', 'Lineage', 'Environment'], E.EMAIL_CONTRACTS.map((e) => [`${e.id} ${e.name}`, e.family, e.artifact.join(' / '), e.lineageGroup, e.authorityBrief.environment])),
    '',
    'Outputs land in each contract folder as `AUTHORITY_MOBILE` / `AUTHORITY_DESKTOP` with state AUTHORITY_IN_REVIEW. Founder approval is never inferred.',
  ]);
}

const folderReadme = (title: string, body: string[]) => md([`# ${title}`, '', ...body]);

export function buildJurnlEmailExports(): Record<string, string> {
  const out: Record<string, string> = {};
  const S = '00_SYSTEM';
  out['README.md'] = md([
    `# ${E.JURNL_EMAIL_SYSTEM.collection} — ${E.JURNL_EMAIL_SYSTEM.name}`,
    '',
    GEN,
    '',
    `Sprint \`${E.JURNL_EMAIL_SPRINT}\`. This folder holds the system that governs JURNL email. It does not hold any email design yet: the eight first emails are **CONTRACT_READY**, nothing has been generated, no template is implemented, and no email is sent.`,
    '',
    `> ${E.CREATIVE_DOCTRINE.statement}`,
    '',
    '| Folder | Holds |',
    '|---|---|',
    '| `00_SYSTEM/` | ontology, creative doctrine, families, consent model, trigger contracts, responsive rules, asset model, lifecycle, provider inventory and contract, preview / QA, analytics, fixtures |',
    ...E.EMAIL_CONTRACTS.map((e) => `| \`${e.folder}/\` | ${e.id} ${e.name}: contract (${e.family}) |`),
    '| `COMPONENTS/` | EC01–EC17 |',
    '| `MANIFESTS/` | seven manifests + JSON Schemas |',
    '| `COPY/` | copy deck (subjects, preheaders, CTAs) |',
    '| `REVIEW/` | founder review material; batch-1 readiness |',
    '| `SIDEKICK_ASSETS/`, `EMAIL_SHELLS/`, `RESPONSIVE/` | empty until authorities are approved |',
    '| `IMPLEMENTATION/` | guidance for template / provider work |',
    '',
    `Pipeline: ${E.GENERATION_PIPELINE.map((p) => p.name).join(' → ')}. ${E.PIPELINE_HARD_RULE}`,
  ]);
  out[`${S}/email-ontology.json`] = json({
    system: E.JURNL_EMAIL_SYSTEM,
    sprint: E.JURNL_EMAIL_SPRINT,
    inheritance: E.FAMILY_INHERITANCE,
    inheritance_rule: E.INHERITANCE_RULE,
    layers: E.LAYER_MODEL,
    layer_hard_rule: E.LAYER_HARD_RULE,
    families: E.EMAIL_FAMILIES.map((f) => ({ id: f.id, name: f.name })),
    emails: E.EMAIL_CONTRACTS.map((e) => ({ id: e.id, name: e.name, family: e.family, folder: e.folder })),
    components: E.EMAIL_COMPONENTS.map((c) => ({ id: c.id, name: c.name })),
    consent_classes: E.CONSENT_CLASSES.map((c) => c.id),
    preference_categories: E.PREFERENCE_CATEGORIES.map((p) => p.id),
    personalization_levels: E.PERSONALIZATION_LEVELS.map((p) => ({ level: p.level, name: p.name })),
    asset_classes: E.EMAIL_ASSET_CLASSES.map((a) => a.id),
    lineage_actions: E.LINEAGE_RULES.map((r) => r.action),
    production_states: E.PRODUCTION_STATES.map((s) => s.state),
    trigger_events: E.TRIGGER_EVENTS.map((t) => ({ id: t.id, status: t.status })),
  });
  out[`${S}/creative-doctrine.md`] = doctrineMd();
  out[`${S}/creative-doctrine.json`] = json({
    doctrine: E.CREATIVE_DOCTRINE,
    restraint: E.RESTRAINT_RULE,
    ownership: E.OWNERSHIP_MATRIX,
    typography: E.TYPOGRAPHY,
    type_stacks: E.TYPE_STACKS,
    voice: E.VOICE,
    nudge_copy: E.NUDGE_COPY_CONSTRAINT,
    materials: E.MATERIAL_GRAMMAR,
    prevented_failures: E.PREVENTED_FAILURES,
  });
  out[`${S}/families.md`] = familiesMd();
  out[`${S}/consent-model.md`] = consentMd();
  out[`${S}/consent-model.json`] = json({ classes: E.CONSENT_CLASSES, firewall: E.FIREWALL_RULES, preference_categories: E.PREFERENCE_CATEGORIES, preference_rules: E.PREFERENCE_RULES });
  out[`${S}/trigger-contracts.md`] = triggersMd();
  out[`${S}/trigger-contracts.json`] = json({ events: E.TRIGGER_EVENTS, rules: E.TRIGGER_RULES, personalization_levels: E.PERSONALIZATION_LEVELS, contracts: E.EMAIL_CONTRACTS.map((e) => e.trigger) });
  out[`${S}/responsive-rules.md`] = responsiveMd();
  out[`${S}/responsive-rules.json`] = json({ viewports: E.RESPONSIVE_VIEWPORTS, rules: E.RESPONSIVE_RULES, email_safe: E.EMAIL_SAFE_DOCTRINE, accessibility: E.ACCESSIBILITY_GATES, client_matrix: E.CLIENT_MATRIX });
  out[`${S}/asset-model.md`] = assetMd();
  out[`${S}/asset-model.json`] = json({ classes: E.EMAIL_ASSET_CLASSES, lineage_groups: E.LINEAGE_GROUPS, lineage_rules: E.LINEAGE_RULES, rules: E.ASSET_RULES });
  out[`${S}/production-lifecycle.md`] = lifecycleMd();
  out[`${S}/production-lifecycle.json`] = json({ states: E.PRODUCTION_STATES, approval_rule: E.APPROVAL_RULE, pipeline: E.GENERATION_PIPELINE, pipeline_rule: E.PIPELINE_HARD_RULE, agents: E.AGENT_RESPONSIBILITIES, analytics: E.ANALYTICS_MODEL });
  out[`${S}/provider-inventory.md`] = providerInventoryMd();
  out[`${S}/provider-inventory.json`] = json({ inventory: E.PROVIDER_INVENTORY, decision: E.PROVIDER_DECISION });
  out[`${S}/provider-contract.md`] = providerContractMd();
  out[`${S}/preview-qa-architecture.md`] = previewMd();
  out[`${S}/fixtures.json`] = json({ mark: E.FIXTURE_MARK, warning: 'DEMO / TEST DATA ONLY — never delivered.', recipient: E.FIXTURE_RECIPIENT, fixtures: E.EMAIL_FIXTURES, rules: E.FIXTURE_RULES });
  for (const e of E.EMAIL_CONTRACTS) {
    out[`${e.folder}/CONTRACT.md`] = contractMd(e);
    out[`${e.folder}/CONTRACT.json`] = json(e);
  }
  out['COMPONENTS/components.md'] = componentsMd();
  const manifests = E.buildManifests();
  for (const id of E.MANIFEST_IDS) {
    out[`MANIFESTS/${id}.json`] = json(manifests[id]);
    out[`MANIFESTS/schemas/${id}.schema.json`] = json(E.MANIFEST_SCHEMAS[id]);
  }
  out['COPY/copy-deck.md'] = copyDeckMd();
  out['REVIEW/BATCH1_READINESS.md'] = batchReadinessMd();
  out['REVIEW/README.md'] = folderReadme('Review', ['Founder review material lands here (authority boards, decisions with dates). Nothing is approved yet.']);
  out['SIDEKICK_ASSETS/README.md'] = folderReadme('Sidekick assets', ['Empty on purpose. Environments, inserts and thumbnails are decomposed from approved full email authorities (pipeline step 07) and fabricated in step 08. See `00_SYSTEM/asset-model.md`.']);
  out['EMAIL_SHELLS/README.md'] = folderReadme('Email shells', ['Empty on purpose. Artifact shells (letter stock, correspondence card, briefing sheet head, pinned note, milestone card) come from approved authorities, with every live-content zone left blank.']);
  out['RESPONSIVE/README.md'] = folderReadme('Responsive authorities', ['Empty on purpose. Mobile (375) and desktop (640) authorities and the image-blocked plan per email land here at pipeline step 06. Rules: `00_SYSTEM/responsive-rules.md`.']);
  out['IMPLEMENTATION/README.md'] = folderReadme('Implementation (COMPOSER)', [
    'Templates are built only from approved authorities and assets (pipeline steps 10–13).',
    '',
    bullets([
      'Email-safe doctrine, accessibility gates and client matrix: `00_SYSTEM/responsive-rules.md`.',
      'Provider-neutral contract: `00_SYSTEM/provider-contract.md` (`shared/jurnl-email-engine/provider.ts`).',
      'Fixtures for previews: `00_SYSTEM/fixtures.json` (refused by delivery).',
      'Auth mail (A02, A08) goes through Supabase Auth templates or a Send Email Hook; do not rewrite the auth flows.',
      'Update MANIFESTS through the source + export script; never hand-edit generated files.',
    ]),
  ]);
  return out;
}

if (process.argv[1] && /email-engine-export\.ts$/.test(process.argv[1])) {
  const root = path.resolve(E.JURNL_EMAIL_SYSTEM.root);
  const files = buildJurnlEmailExports();
  for (const [rel, body] of Object.entries(files)) {
    const file = path.join(root, rel);
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, body);
  }
  console.log(`exported ${Object.keys(files).length} files to ${E.JURNL_EMAIL_SYSTEM.root}/`);
}
