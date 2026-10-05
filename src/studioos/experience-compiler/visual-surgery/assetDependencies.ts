import type { AssetDependency, ImageRequirement } from './visualSurgeryTypes';

export function compileAssetDependencies(requirements: ImageRequirement[]): AssetDependency[] {
  const deps: AssetDependency[] = [];
  const envMasters = requirements.filter((r) => r.asset_type === 'ENVIRONMENT_IMAGE');

  for (const master of envMasters) {
    const prefix = master.asset_id.replace(/\.[^.]+$/, '');
    const children = requirements.filter(
      (r) => r.asset_id !== master.asset_id && r.asset_id.startsWith(prefix.split('.').slice(0, 2).join('.')),
    );
    for (const child of children) {
      if (child.asset_type === 'CARD_IMAGE' || child.asset_id.includes('PATH')) {
        deps.push({
          parent_asset: master.asset_id,
          child_asset: child.asset_id,
          dependency_type: 'CONTINUITY_LINEAGE',
          continuity_requirement: master.continuity_group,
          generation_order: 2,
        });
      }
    }
  }

  const bldrCommand = requirements.find((r) => r.asset_id === 'ENV.BLDR.COMMAND_CENTER');
  if (bldrCommand) {
    for (const id of ['ENV.BLDR.PATH.SITE', 'ENV.BLDR.PATH.WORLD', 'ENV.BLDR.PATH.SYSTEMS', 'ENV.BLDR.PATH.EXTENSIONS']) {
      if (requirements.some((r) => r.asset_id === id)) {
        deps.push({
          parent_asset: bldrCommand.asset_id,
          child_asset: id,
          dependency_type: 'PATH_VARIANT',
          continuity_requirement: 'BLDR_WORLD_SYSTEM_V1',
          generation_order: 2,
        });
      }
    }
    if (requirements.some((r) => r.asset_id === 'MACHINE.BLDR.TOWER')) {
      deps.push({
        parent_asset: bldrCommand.asset_id,
        child_asset: 'MACHINE.BLDR.TOWER',
        dependency_type: 'MASTER_VARIANT',
        continuity_requirement: 'BLDR_WORLD_SYSTEM_V1',
        generation_order: 3,
      });
    }
  }

  const originEnv = requirements.find((r) => r.asset_id === 'ENV.ORIGIN.COLLAPSED');
  const originExpanded = requirements.find((r) => r.asset_id === 'ENV.ORIGIN.EXPANDED');
  if (originEnv && originExpanded) {
    deps.push({
      parent_asset: originEnv.asset_id,
      child_asset: originExpanded.asset_id,
      dependency_type: 'SURFACE_CROP',
      continuity_requirement: 'SITE00_ORIGIN_UNIVERSE_V1',
      generation_order: 2,
    });
  }

  return dedupeDeps(deps);
}

function dedupeDeps(deps: AssetDependency[]): AssetDependency[] {
  const key = (d: AssetDependency) => `${d.parent_asset}|${d.child_asset}|${d.dependency_type}`;
  const seen = new Set<string>();
  return deps.filter((d) => {
    const k = key(d);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function generationOrder(deps: AssetDependency[]): string[] {
  const order = new Map<string, number>();
  for (const d of deps) {
    order.set(d.parent_asset, Math.min(order.get(d.parent_asset) ?? 1, d.generation_order));
    order.set(d.child_asset, Math.max(order.get(d.child_asset) ?? 1, d.generation_order + 1));
  }
  return [...order.entries()].sort((a, b) => a[1] - b[1]).map(([id]) => id);
}
