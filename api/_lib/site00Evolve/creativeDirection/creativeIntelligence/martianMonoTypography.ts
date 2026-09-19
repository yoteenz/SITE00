/**
 * Martian Mono — SITE 00 HOST UI typography probe.
 * Client creative paths MUST use typographyProvenance.buildDirectionDerivedTypographyRoles().
 */

import type { DirectionDerivedTypographyRoles, MartianMonoTypographyRoles } from '../../../../../shared/site00-brand-lore/typographyProvenance.js';
import {
  buildDirectionDerivedTypographyRoles,
  inspectHostUiTypography,
  typographyRolesCondensedPromptBlock as provenanceCondensedBlock,
  typographyRolesPromptBlock as provenancePromptBlock,
} from '../../../../../shared/site00-brand-lore/typographyProvenance.js';

export type { MartianMonoTypographyRoles, DirectionDerivedTypographyRoles };

/** @deprecated Client creative must use buildDirectionDerivedTypographyRoles — this is HOST UI only. */
export function inspectMartianMonoAvailability(): MartianMonoTypographyRoles {
  const host = inspectHostUiTypography();
  const derived = buildDirectionDerivedTypographyRoles();
  return {
    ...derived,
    martianMonoAvailable: host.available,
    actualSource: host.cssSource,
  };
}

export function buildClientTypographyRolesForProduction(): DirectionDerivedTypographyRoles {
  return buildDirectionDerivedTypographyRoles({
    typographyIdentityStatus: 'UNRESOLVED',
    provenance: 'DIRECTION_DERIVED',
  });
}

export function typographyRolesCondensedPromptBlock(roles: DirectionDerivedTypographyRoles): string[] {
  return provenanceCondensedBlock(roles);
}

export function typographyRolesPromptBlock(roles: DirectionDerivedTypographyRoles): string[] {
  return provenancePromptBlock(roles);
}

export { inspectHostUiTypography, buildDirectionDerivedTypographyRoles };
