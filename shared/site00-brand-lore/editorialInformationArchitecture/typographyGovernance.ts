/**
 * NDX Typography Behavior System — Marketing Expression governance.
 */

import type { BrandMarketingArtifact } from '../brandMarketingExpression/types.js';
import type { TypographyRole, TypographyRoleAssignment } from './types.js';

export function assignTypographyRoles(params: {
  artifact: BrandMarketingArtifact;
  primaryHook: string;
  secondaryReveal: string | null;
  primaryTrace: string;
  metadataLabels: string[];
}): TypographyRoleAssignment[] {
  const assignments: TypographyRoleAssignment[] = [
    {
      elementId: 'headline',
      text: params.primaryHook.toUpperCase(),
      role: 'DISPLAY',
      isNdxAuthored: true,
      uppercaseRequired: true,
    },
  ];

  if (params.secondaryReveal) {
    assignments.push({
      elementId: 'secondary-reveal',
      text: params.secondaryReveal.toUpperCase(),
      role: 'DISPLAY',
      isNdxAuthored: true,
      uppercaseRequired: true,
    });
  }

  for (const ev of params.artifact.visibleEvidence.slice(0, 2)) {
    assignments.push({
      elementId: `evidence-${ev.slice(0, 12)}`,
      text: ev.toUpperCase(),
      role: 'DOCUMENT',
      isNdxAuthored: true,
      uppercaseRequired: true,
    });
  }

  if (params.primaryTrace) {
    assignments.push({
      elementId: 'primary-trace',
      text: params.primaryTrace.toUpperCase(),
      role: 'HUMAN_TRACE',
      isNdxAuthored: true,
      uppercaseRequired: true,
    });
  }

  for (const label of params.metadataLabels) {
    assignments.push({
      elementId: `meta-${label.slice(0, 8)}`,
      text: label.toUpperCase(),
      role: 'DOCUMENT',
      isNdxAuthored: true,
      uppercaseRequired: true,
    });
  }

  assignments.push({
    elementId: 'source-screenshot',
    text: 'AUTHENTIC SOURCE — MIXED CASE PRESERVED',
    role: 'SOURCE_TEXT',
    isNdxAuthored: false,
    uppercaseRequired: false,
  });

  return assignments;
}

export function everyNdxAuthoredElementHasRole(assignments: TypographyRoleAssignment[]): boolean {
  return assignments.filter((a) => a.isNdxAuthored).every((a) => a.role !== 'SOURCE_TEXT');
}

export function unknownTypographyRoleFails(role: TypographyRole | 'UNKNOWN'): boolean {
  return role === 'UNKNOWN';
}

export function ndxAuthoredCopyIsUppercase(assignments: TypographyRoleAssignment[]): boolean {
  return assignments
    .filter((a) => a.isNdxAuthored && a.uppercaseRequired)
    .every((a) => a.text === a.text.toUpperCase());
}

export function sourceArtifactsMayPreserveMixedCase(assignments: TypographyRoleAssignment[]): boolean {
  const sources = assignments.filter((a) => a.role === 'SOURCE_TEXT');
  return sources.some((s) => !s.uppercaseRequired);
}

export function displayDistinctFromDocument(assignments: TypographyRoleAssignment[]): boolean {
  const hasDisplay = assignments.some((a) => a.role === 'DISPLAY');
  const hasDocument = assignments.some((a) => a.role === 'DOCUMENT');
  return hasDisplay && hasDocument;
}

export function humanTraceNotUsedAsBodyCopy(assignments: TypographyRoleAssignment[]): boolean {
  const traceCount = assignments.filter((a) => a.role === 'HUMAN_TRACE').length;
  const documentCount = assignments.filter((a) => a.role === 'DOCUMENT').length;
  return traceCount <= 2 && documentCount >= traceCount;
}

export function multipleHandwritingIdentitiesFail(handwritingStyles: string[]): boolean {
  const unique = new Set(handwritingStyles.filter(Boolean));
  return unique.size > 1;
}

export function typographyRoleAssignmentComplete(assignments: TypographyRoleAssignment[]): boolean {
  return assignments.length > 0 && !assignments.some((a) => a.isNdxAuthored && !a.role);
}
