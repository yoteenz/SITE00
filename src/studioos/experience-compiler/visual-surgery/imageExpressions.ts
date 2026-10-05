import type { ImageExpression } from './visualSurgeryTypes';

export function deriveImageExpression(project_id: string): ImageExpression {
  return {
    project_id,
    camera_language: 'Architectural hero — calm eye-level with subtle wide lens',
    lens_behavior: 'Minimal distortion; environment plates favor 24–35mm equivalent',
    viewpoint: 'Guest standing at threshold of experience chamber',
    perspective: 'One-point with centered axis for command centers',
    composition: 'Strong vertical axis; negative space reserved for live UI overlays',
    lighting: 'Soft daylight, red accent bounce on structural inserts',
    material_palette: 'Luminous white ceramic, glass, polished stone, red structural metal',
    brand_color_behavior: 'Red only on structural logic — never on ambient fill',
    neutral_color_behavior: 'Warm white midtones, no gray mud',
    depth: 'Layered atmospheric depth without busy foreground clutter',
    atmosphere: 'Clean premium studio-world — not generic stock',
    realism: 'High-end architectural visualization realism',
    contrast: 'Legible midtones with crisp accent edges',
    texture: 'Fine grain on stone; glass clarity without noise',
    human_presence: 'None unless editorial family explicitly requires',
    object_scale: 'Monumental architecture, human-scale machines',
    negative_space: 'First-class — clear zones for cards and nav',
    motion_potential: 'Static plates; implied motion via linework in live SVG',
    crop_behavior: 'Master environment extends laterally on desktop — same world',
    surface_relationship: 'One visual family across mobile/tablet/desktop/app',
  };
}
