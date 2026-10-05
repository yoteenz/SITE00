import type { TwinV2RenderPrimitivePolicy } from './types.js';
import type { RenderPrimitive } from './types.js';

export const TWIN_V2_RENDER_PRIMITIVE_POLICY: TwinV2RenderPrimitivePolicy = {
  text: 'DOM',
  button: 'DOM',
  nav: 'DOM',
  metric: 'DOM',
  progress: 'DOM_CSS',
  status: 'DOM_CSS',
  divider: 'CSS',
  border: 'CSS',
  icon: 'SVG',
  simpleGraphic: 'SVG_CSS',
  photo: 'IMAGE_ASSET',
  illustration: 'IMAGE_ASSET',
  texture: 'IMAGE_ASSET',
};

export function renderPrimitiveForRole(role: string, type: string): RenderPrimitive {
  const r = role.toLowerCase();
  if (type === 'image' && (r.includes('photo') || r.includes('media') || r.includes('editorial'))) {
    return 'IMAGE_ASSET';
  }
  if (r.includes('divider') || r.includes('border')) return 'CSS_GRAPHIC';
  if (r.includes('ndx') || r.includes('overlay') || r.includes('icon')) return 'SVG_GRAPHIC';
  if (r.includes('nav') || r.includes('button') || r.includes('cta') || r.includes('control')) {
    return r.includes('nav') ? 'DOM_CONTROL' : 'DOM_CONTROL';
  }
  if (r.includes('progress') || r.includes('track') || r.includes('fill')) return 'DOM_STRUCTURE';
  if (r.includes('metric') || r.includes('activity') || r.includes('row')) return 'DOM_TEXT';
  return 'DOM_TEXT';
}

export function isForbiddenNonImageRaster(role: string, primitive: RenderPrimitive): boolean {
  if (primitive !== 'IMAGE_ASSET' && primitive !== 'MEDIA_ASSET') return false;
  const r = role.toLowerCase();
  return (
    r.includes('nav') ||
    r.includes('metric') ||
    r.includes('progress') ||
    r.includes('activity') ||
    r.includes('masthead') ||
    r.includes('button') ||
    r.includes('title')
  );
}

export function stripDebugCopy(text: string): string {
  return text.replace(/^Preserve function:\s*/i, '').trim();
}
