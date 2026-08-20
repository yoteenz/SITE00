import {
  emailBodyLines,
  emailCredentialCard,
  emailCTA,
  emailDataGrid,
  emailDocument,
  emailFooter,
  emailGraphicBlock,
  emailHeadlineBlock,
  emailHeader,
  emailInputList,
  emailOuterTable,
  emailSignalModules,
} from './primitives.js';
import type { EmailArchetype, EmailClassification, EmailTemplateDefinition, EmailTemplateVars, EmailTheme } from './types.js';

export type ArchetypeRenderInput = {
  template: EmailTemplateDefinition;
  vars: EmailTemplateVars;
  subject: string;
  preheader: string;
  headline: string;
  subheadline?: string;
};

function themeOf(template: EmailTemplateDefinition, vars: EmailTemplateVars): EmailTheme {
  return vars.theme ?? template.defaultTheme ?? 'light';
}

function ctaVariant(template: EmailTemplateDefinition, theme: EmailTheme): 'red' | 'black' | 'white' {
  if (template.archetype === 'studio-portal' && theme === 'dark') return 'white';
  if (template.archetype === 'access-credential') return 'red';
  if (template.archetype === 'launch-authorization') return theme === 'dark' ? 'white' : 'black';
  return theme === 'dark' ? 'white' : 'red';
}

function graphicVariant(archetype: EmailArchetype): 'target' | 'portal' | 'artifact' | 'radar' | undefined {
  switch (archetype) {
    case 'access-credential':
      return 'target';
    case 'studio-portal':
      return 'portal';
    case 'milestone-artifact':
    case 'production-complete':
      return 'artifact';
    case 'system-check':
    case 'signal-editorial':
      return 'radar';
    case 'review-dossier':
      return 'portal';
    case 'launch-authorization':
      return 'target';
    case 'location-live':
      return 'artifact';
    default:
      return 'target';
  }
}

export function renderArchetypeHtml(input: ArchetypeRenderInput): string {
  const { template, vars, subject, preheader, headline, subheadline } = input;
  const theme = themeOf(template, vars);
  const familyLabel = vars.familyLabel ?? template.familyLabel;
  const ctaUrl = vars.ctaUrl ?? 'https://site00.com';
  const parts: string[] = [];

  parts.push(emailHeader({ familyLabel, theme }));

  if (template.archetype === 'access-credential') {
    parts.push(
      emailHeadlineBlock({
        accentScript: vars.accentScript ?? 'Welcome to',
        headline,
        subheadline,
        theme,
      }),
    );
    parts.push(emailCredentialCard(vars, theme));
  } else if (template.archetype === 'signal-editorial') {
    parts.push(
      emailHeadlineBlock({
        headline: vars.issueNumber ? `SITE 00 SIGNAL — ISSUE ${vars.issueNumber}` : headline,
        subheadline,
        theme: 'light',
      }),
    );
    if (vars.signalModules?.length) parts.push(emailSignalModules(vars.signalModules));
    else parts.push(emailBodyLines(vars.bodyLines ?? [subheadline ?? ''], 'light'));
  } else {
    parts.push(
      emailHeadlineBlock({
        accentScript: vars.accentScript,
        headline,
        subheadline,
        theme,
      }),
    );

    if (template.archetype !== 'status-notice' && template.archetype !== 'internal-notice') {
      parts.push(
        emailGraphicBlock({
          label: template.name,
          theme,
          variant: graphicVariant(template.archetype),
        }),
      );
    }

    if (vars.dataFields?.length) parts.push(emailDataGrid(vars.dataFields, theme));
    if (vars.inputItems?.length) parts.push(emailInputList(vars.inputItems, theme));
    if (vars.bodyLines?.length) parts.push(emailBodyLines(vars.bodyLines, theme));
  }

  parts.push(emailCTA(template.ctaLabel, ctaUrl, theme, ctaVariant(template, theme)));
  parts.push(emailFooter(template.classification, template.archetype === 'signal-editorial' ? 'light' : theme));

  const body = emailOuterTable(parts.join(''), template.archetype === 'signal-editorial' ? 'light' : theme);
  return emailDocument({ title: subject, preheader, theme: template.archetype === 'signal-editorial' ? 'light' : theme, body });
}

export function classificationLabel(c: EmailClassification): string {
  switch (c) {
    case 'transactional':
      return 'TRANSACTIONAL';
    case 'operational':
      return 'OPERATIONAL';
    case 'production':
      return 'PRODUCTION';
    case 'marketing':
      return 'MARKETING';
    case 'internal':
      return 'INTERNAL';
  }
}
