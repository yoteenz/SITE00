import {
  resolveTypographyRole,
  typographyStylesForRole,
  type TypographyRole,
} from '../p0vrTwinV30R8M1/implementationTypographyResolver.js';

export type AuthorityTextRole =
  | 'HOST_NAV'
  | 'PROJECT_LABEL'
  | 'SECTION_LABEL'
  | 'DISPLAY_HEADLINE'
  | 'SUPPORT_COPY'
  | 'BUTTON_LABEL'
  | 'METADATA'
  | 'STATUS'
  | 'CARD_TITLE'
  | 'CARD_BODY';

export function resolveAuthorityTextRole(objectKey: string, category: string): AuthorityTextRole {
  if (objectKey.startsWith('host-nav-')) return 'HOST_NAV';
  if (objectKey === 'context-project-label') return 'PROJECT_LABEL';
  if (objectKey.includes('headline')) return 'DISPLAY_HEADLINE';
  if (objectKey.includes('subcopy')) return 'SUPPORT_COPY';
  if (category === 'BUTTON' || category === 'CONTROL') return 'BUTTON_LABEL';
  if (objectKey.includes('readiness') || objectKey.includes('checklist')) return 'STATUS';
  if (['grounding-card', 'blueprint-card', 'overlay-card', 'assets-card', 'function-card'].includes(objectKey)) {
    return 'CARD_TITLE';
  }
  if (category === 'TEXT') return 'CARD_BODY';
  if (objectKey.includes('history') || objectKey.includes('amendment')) return 'METADATA';
  return 'SECTION_LABEL';
}

export function typographyStylesForAuthorityRole(role: AuthorityTextRole): Record<string, string> {
  switch (role) {
    case 'HOST_NAV':
      return { fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '600' };
    case 'PROJECT_LABEL':
      return { fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: '700' };
    case 'DISPLAY_HEADLINE':
      return { fontSize: '20px', lineHeight: '1.05', fontWeight: '900', letterSpacing: '-0.02em', textTransform: 'uppercase' };
    case 'SUPPORT_COPY':
      return { fontSize: '12px', lineHeight: '1.35', fontWeight: '400', maxLines: '3' };
    case 'BUTTON_LABEL':
      return { fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: '700' };
    case 'CARD_TITLE':
      return { fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: '700' };
    case 'METADATA':
    case 'STATUS':
      return { fontSize: '9px', letterSpacing: '0.06em', fontFamily: '"IBM Plex Mono", monospace' };
    default:
      return { fontSize: '11px', lineHeight: '1.3' };
  }
}

export function resolveCombinedTypographyStyles(
  objectKey: string,
  category: string,
  ownership: string,
): Record<string, string> {
  const legacyRole: TypographyRole = resolveTypographyRole(objectKey, category, ownership);
  const authorityRole = resolveAuthorityTextRole(objectKey, category);
  return {
    ...typographyStylesForRole(legacyRole),
    ...typographyStylesForAuthorityRole(authorityRole),
    color: ownership === 'SITE_00_HOST' ? '#eaeaea' : '#f5f5f5',
  };
}
