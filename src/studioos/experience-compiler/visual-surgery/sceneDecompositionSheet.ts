import type { SceneDecomposition } from './visualSurgeryTypes';

export function renderSceneDecompositionSheet(decomp: SceneDecomposition): string {
  const lines = [
    `# ${decomp.authority_id}`,
    'SCENE DECOMPOSITION',
    '',
    `Route: ${decomp.route}`,
    `Viewport: ${decomp.viewport.w}x${decomp.viewport.h}`,
    '',
  ];
  for (const layer of decomp.layers) {
    lines.push(
      `## ${layer.layer_id}`,
      `- **${layer.ownership_type}** — ${layer.label}`,
      `- z-index: ${layer.z_index}`,
      `- bbox: x=${layer.bbox.x.toFixed(2)} y=${layer.bbox.y.toFixed(2)} w=${layer.bbox.w.toFixed(2)} h=${layer.bbox.h.toFixed(2)}`,
      `- slot: ${layer.asset_slot_id ?? '—'}`,
      `- ${layer.generated_or_live}`,
      '',
    );
  }
  return lines.join('\n');
}
