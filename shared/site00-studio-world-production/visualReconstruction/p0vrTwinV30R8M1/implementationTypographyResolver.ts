export type TypographyRole = 'HOST_LABEL' | 'PROJECT_DISPLAY' | 'PROJECT_BODY' | 'MONO_STATUS' | 'BUTTON' | 'NAV';

export function resolveTypographyRole(objectKey: string, category: string, ownership: string): TypographyRole {
  if (ownership === 'SITE_00_HOST' || objectKey.startsWith('host-')) {
    return category === 'NAV_ITEM' ? 'NAV' : 'HOST_LABEL';
  }
  if (category === 'BUTTON' || category === 'CONTROL') return 'BUTTON';
  if (objectKey.includes('headline')) return 'PROJECT_DISPLAY';
  if (objectKey.includes('subcopy') || category === 'TEXT') return 'PROJECT_BODY';
  if (category === 'STATUS' || category === 'BADGE') return 'MONO_STATUS';
  if (category === 'NAV_ITEM') return 'NAV';
  return 'PROJECT_BODY';
}

export function typographyStylesForRole(role: TypographyRole): Record<string, string> {
  switch (role) {
    case 'HOST_LABEL':
      return {
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: '10px',
        fontWeight: '600',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      };
    case 'PROJECT_DISPLAY':
      return {
        fontFamily: '"Archivo Black", "Helvetica Neue", sans-serif',
        fontSize: '22px',
        fontWeight: '900',
        lineHeight: '1.05',
        letterSpacing: '-0.02em',
        textTransform: 'uppercase',
      };
    case 'PROJECT_BODY':
      return {
        fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: '400',
        lineHeight: '1.35',
      };
    case 'MONO_STATUS':
      return {
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: '10px',
        fontWeight: '500',
        letterSpacing: '0.06em',
      };
    case 'BUTTON':
      return {
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: '10px',
        fontWeight: '700',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      };
    case 'NAV':
      return {
        fontFamily: '"IBM Plex Mono", ui-monospace, monospace',
        fontSize: '9px',
        fontWeight: '600',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
      };
    default:
      return {};
  }
}
