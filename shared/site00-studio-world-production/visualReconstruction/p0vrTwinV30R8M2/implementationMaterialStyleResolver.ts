export type ControlVisualRole = 'PRIMARY' | 'SECONDARY' | 'SELECTED' | 'LOCKED' | 'NEUTRAL' | 'SYSTEM';

export function resolveControlVisualRole(objectKey: string, category: string): ControlVisualRole {
  if (objectKey === 'select-mobile-btn') return 'SELECTED';
  if (objectKey === 'select-desktop-btn') return 'NEUTRAL';
  if (objectKey === 'lock-pair-btn') return 'LOCKED';
  if (objectKey.startsWith('host-')) return 'SYSTEM';
  if (['promote-mobile-btn', 'primary-next-action'].includes(objectKey)) return 'PRIMARY';
  if (['promote-desktop-btn', 'pair-review-btn', 'refine-btn', 'regen-btn', 'inspect-btn'].includes(objectKey)) {
    return 'SECONDARY';
  }
  if (category === 'NAV_ITEM') return 'NEUTRAL';
  if (category === 'BUTTON' || category === 'CONTROL') return 'SECONDARY';
  return 'NEUTRAL';
}

export function materialStylesForControl(role: ControlVisualRole, ownership: string): Record<string, string> {
  const host = ownership === 'SITE_00_HOST';
  switch (role) {
    case 'PRIMARY':
      return {
        background: '#c8ff00',
        color: '#0a0a0a',
        border: '1px solid #b8ef00',
        fontWeight: '700',
      };
    case 'SELECTED':
      return {
        background: '#1a1a1a',
        color: '#c8ff00',
        border: '2px solid #c8ff00',
        boxShadow: 'inset 0 0 0 1px #c8ff00',
      };
    case 'LOCKED':
      return {
        background: '#111',
        color: '#eaeaea',
        border: '1px dashed #666',
      };
    case 'SECONDARY':
      return {
        background: host ? '#1a1a1a' : '#161616',
        color: '#f0f0f0',
        border: '1px solid #333',
      };
    case 'SYSTEM':
      return {
        background: '#050505',
        color: '#bdbdbd',
        border: '1px solid #222',
      };
    case 'NEUTRAL':
    default:
      return {
        background: 'transparent',
        color: host ? '#eaeaea' : '#ddd',
        border: '1px solid #2a2a2a',
      };
  }
}

export function materialStylesForSurface(key: string, category: string, ownership: string): Record<string, string> {
  const host = ownership === 'SITE_00_HOST';
  if (category === 'SURFACE' || category === 'PANEL') {
    if (key.includes('authority')) {
      return { background: '#0f0f0f', border: '1px solid #2a2a2a', borderRadius: '4px' };
    }
    return {
      background: host ? '#0a0a0a' : '#111111',
      border: host ? '1px solid #222' : '1px solid #333',
      borderRadius: '4px',
    };
  }
  if (category === 'ARTIFACT' || category === 'THUMBNAIL') {
    return { background: '#0d0d0d', border: '1px solid #333', borderRadius: '4px' };
  }
  if (category === 'IMAGE') {
    return { background: '#000', overflow: 'hidden', borderRadius: '4px', border: '1px solid #444' };
  }
  if (category === 'PROGRESS') {
    return { background: '#1a1a1a', border: '1px solid #444', borderRadius: '999px' };
  }
  return { background: 'transparent' };
}
