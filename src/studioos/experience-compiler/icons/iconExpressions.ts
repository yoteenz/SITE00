import type { ProjectExperienceIntelligence } from '../map2/map2Types';
import type { IconExpression } from './iconTypes';

export function deriveIconExpression(project_id: string, intelligence?: ProjectExperienceIntelligence | null): IconExpression {
  const ambitious = intelligence?.creative_appetite === 'AMBITIOUS';
  return {
    project_id,
    dimensionality: ambitious ? '2.5D' : '2D',
    structure: ambitious ? 'HYBRID' : 'LINE',
    stroke_weight: ambitious ? 'Medium-weight dimensional stroke' : '1.5px functional stroke',
    corner_language: 'Soft geometric — aligned to brand atelier craft',
    geometric_language: intelligence?.brand_name.includes('LUMINA') ? 'Instrument + lens motifs' : 'Product-family geometry from experience grammar',
    depth: ambitious ? 'Subtle bevel + material depth' : 'Flat with selective highlight',
    materials: ambitious ? 'Brushed metal + satin polymer accents' : 'Neutral UI materials',
    brand_color_use: 'Primary brand accent on active/selected only',
    active_state: 'Accent fill + increased contrast',
    selected_state: 'Filled brand token + outline',
    disabled_state: '40% opacity neutral',
    alert_state: 'Warm alert accent — never baked-in text labels',
    app_nav_expression: 'Simplified silhouette — max 2 material reads at 24px',
    small_size_simplification: 'Drop interior detail below 20px; preserve silhouette',
    derived_from_brand: intelligence?.brand_name ?? project_id,
  };
}
