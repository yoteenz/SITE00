import type { ImageRequirement, SafeZoneMap, SafeZoneRegion } from './visualSurgeryTypes';

export function compileSafeZoneMaps(requirements: ImageRequirement[]): SafeZoneMap[] {
  return requirements
    .filter((r) => r.grok_required && r.safe_zones.length > 0)
    .map((r) => {
      const regions: SafeZoneRegion[] = [];
      if (r.clear_zones.includes('UI_CLEAR_ZONE')) {
        regions.push({
          kind: 'UI_CLEAR_ZONE',
          bbox: { x: 0, y: 0, w: 1, h: 0.12 },
          label: 'Header clear',
        });
        regions.push({
          kind: 'NAV_OVERLAY_ZONE',
          bbox: { x: 0, y: 0.88, w: 1, h: 0.12 },
          label: 'Bottom nav clear',
        });
      }
      if (r.safe_zones.includes('FOCAL_ZONE') && r.focus_region) {
        regions.push({
          kind: 'FOCAL_ZONE',
          bbox: r.focus_region,
          label: 'Primary focal architecture',
        });
      }
      if (r.safe_zones.includes('NO_FOCAL_DETAIL_ZONE') && r.negative_space.central_clear_region) {
        regions.push({
          kind: 'NO_FOCAL_DETAIL_ZONE',
          bbox: r.negative_space.central_clear_region,
          label: 'Keep quiet for cards/UI',
        });
      }
      if (r.safe_zones.includes('CROP_SAFE_ZONE')) {
        regions.push({
          kind: 'CROP_SAFE_ZONE',
          bbox: { x: 0.05, y: 0.05, w: 0.9, h: 0.9 },
          label: 'Responsive crop safe',
        });
      }
      return {
        asset_id: r.asset_id,
        regions,
        overlay_relative_path: `safe-zones/${r.asset_id.replace(/\./g, '_')}_SAFE_ZONES.png`,
      };
    });
}
