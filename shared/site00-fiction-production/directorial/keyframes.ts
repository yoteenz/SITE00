import type { DirectorialFinding, Keyframe, ProductionPlan } from './types.js';

/**
 * Keyframe provenance (sprint V2 §13). A generated frame names what it derives from; a reused frame names an approved asset;
 * an extracted frame names the approved shot and position it comes from. Outputs stay null until a real job returns one.
 */
export function validateKeyframes(plan: ProductionPlan, approvedAssets: ReadonlySet<string>): DirectorialFinding[] {
  const out: DirectorialFinding[] = [];
  const add = (severity: DirectorialFinding['severity'], code: string, subject: string, detail: string) => out.push({ severity, code, subject, detail });
  const byId = new Map<string, Keyframe>();
  for (const k of plan.keyframes) {
    if (byId.has(k.keyframeId)) add('ERROR', 'KEYFRAME_DUPLICATE_ID', k.keyframeId, 'duplicate keyframe id');
    byId.set(k.keyframeId, k);
  }
  const order = new Map(plan.shots.map((s, i) => [s.shotId, i]));
  for (const k of plan.keyframes) {
    for (const u of k.usedBy) if (!order.has(u)) add('ERROR', 'KEYFRAME_USED_BY', k.keyframeId, `used by unknown shot ${u}`);
    if (k.output !== null) add('ERROR', 'KEYFRAME_OUTPUT', k.keyframeId, 'output must stay null until a provider job returns one');
    if (k.source === 'GENERATE') {
      if (!k.spec) add('ERROR', 'KEYFRAME_SPEC', k.keyframeId, 'a generated keyframe needs a full composition spec');
      if (k.candidates < 1) add('ERROR', 'KEYFRAME_CANDIDATES', k.keyframeId, 'a generated keyframe needs at least one candidate');
      if (!k.derivesFrom.length && !k.noReferenceJustification) add('ERROR', 'KEYFRAME_PROVENANCE', k.keyframeId, 'no reference and no recorded reason for working without one');
      for (const d of k.derivesFrom) if (!byId.has(d) && !approvedAssets.has(d)) add('ERROR', 'KEYFRAME_PROVENANCE', k.keyframeId, `derives from ${d}, which is neither a planned keyframe nor an approved asset`);
    }
    if (k.source === 'REUSE_APPROVED' && (!k.reuseOf || !approvedAssets.has(k.reuseOf))) add('ERROR', 'KEYFRAME_REUSE', k.keyframeId, `reuseOf ${k.reuseOf ?? '(none)'} is not an approved asset`);
    if (k.source === 'EXTRACT_FROM_APPROVED_FOOTAGE') {
      const src = k.extractFrom;
      const shot = src ? plan.shots.find((s) => s.shotId === src.shotId) : undefined;
      if (!src || !shot) add('ERROR', 'KEYFRAME_EXTRACT', k.keyframeId, 'extraction names no existing source shot');
      else {
        if (!shot.generated) add('ERROR', 'KEYFRAME_EXTRACT', k.keyframeId, `${src.shotId} is not generated footage`);
        for (const u of k.usedBy) if ((order.get(u) ?? -1) <= (order.get(src.shotId) ?? 0) && src.position === 'LAST_FRAME') add('WARNING', 'KEYFRAME_EXTRACT_ORDER', k.keyframeId, `${u} plays before its source ${src.shotId}`);
      }
      if (k.candidates !== 0) add('ERROR', 'KEYFRAME_CANDIDATES', k.keyframeId, 'an extracted frame costs no generation');
    }
    if (k.source === 'NOT_NEEDED' && (k.candidates !== 0 || k.essential)) add('ERROR', 'KEYFRAME_NOT_NEEDED', k.keyframeId, 'an unnecessary keyframe is neither essential nor generated');
  }
  const visiting = new Set<string>();
  const done = new Set<string>();
  const visit = (id: string, path: string[]) => {
    if (done.has(id)) return;
    if (visiting.has(id)) {
      add('ERROR', 'KEYFRAME_CYCLE', id, `derivation cycle: ${[...path, id].join(' → ')}`);
      return;
    }
    visiting.add(id);
    for (const d of byId.get(id)?.derivesFrom ?? []) if (byId.has(d)) visit(d, [...path, id]);
    visiting.delete(id);
    done.add(id);
  };
  for (const k of plan.keyframes) visit(k.keyframeId, []);
  for (const s of plan.shots.filter((x) => x.generated)) {
    const start = s.startFrameRef ? byId.get(s.startFrameRef) : undefined;
    if (!start) add('ERROR', 'START_FRAME_MISSING', s.shotId, `start frame ${s.startFrameRef ?? '(none)'} is not a planned keyframe`);
    else if (!start.usedBy.includes(s.shotId)) add('ERROR', 'START_FRAME_LINK', s.shotId, `${start.keyframeId} does not list ${s.shotId} in usedBy`);
    if (s.endFrameRef && !byId.has(s.endFrameRef)) add('ERROR', 'END_FRAME_MISSING', s.shotId, `end frame ${s.endFrameRef} is not a planned keyframe`);
  }
  const specs = new Map<string, string>();
  for (const k of plan.keyframes.filter((x) => x.source === 'GENERATE' && x.spec)) {
    const key = JSON.stringify(k.spec);
    if (specs.has(key)) add('WARNING', 'KEYFRAME_REDUNDANT', k.keyframeId, `same composition as ${specs.get(key)}`);
    else specs.set(key, k.keyframeId);
  }
  return out;
}

/** A keyframe is blocked when it, or anything it derives from, is blocked. */
export function effectiveBlockers(plan: ProductionPlan): Map<string, string[]> {
  const byId = new Map(plan.keyframes.map((k) => [k.keyframeId, k]));
  const memo = new Map<string, string[]>();
  const resolve = (id: string, seen: Set<string>): string[] => {
    if (memo.has(id)) return memo.get(id)!;
    const k = byId.get(id);
    if (!k || seen.has(id)) return [];
    seen.add(id);
    const own = [...k.blockedBy];
    for (const d of k.derivesFrom) for (const b of resolve(d, seen)) own.push(`${d}: ${b}`);
    for (const d of k.extractFrom ? [k.extractFrom.shotId] : []) {
      const startRef = plan.shots.find((s) => s.shotId === d)?.startFrameRef;
      if (startRef) for (const b of resolve(startRef, seen)) own.push(`${d} via ${startRef}: ${b}`);
    }
    const uniq = [...new Set(own)];
    memo.set(id, uniq);
    return uniq;
  };
  return new Map(plan.keyframes.map((k) => [k.keyframeId, resolve(k.keyframeId, new Set())]));
}

export function keyframeCounts(plan: ProductionPlan) {
  const k = plan.keyframes;
  const blocked = effectiveBlockers(plan);
  return {
    total: k.length,
    essential: k.filter((x) => x.essential).length,
    generate: k.filter((x) => x.source === 'GENERATE').length,
    reuse: k.filter((x) => x.source === 'REUSE_APPROVED').length,
    extract: k.filter((x) => x.source === 'EXTRACT_FROM_APPROVED_FOOTAGE').length,
    notNeeded: k.filter((x) => x.source === 'NOT_NEEDED').length,
    imagesToGenerate: k.filter((x) => x.source === 'GENERATE').reduce((a, x) => a + x.candidates, 0),
    blocked: [...blocked.values()].filter((b) => b.length).length,
    byKind: k.reduce<Record<string, number>>((acc, x) => ({ ...acc, [x.kind]: (acc[x.kind] ?? 0) + 1 }), {}),
  };
}

/** References before the frames that derive from them. */
export function keyframeProductionOrder(plan: ProductionPlan): string[] {
  const byId = new Map(plan.keyframes.map((k) => [k.keyframeId, k]));
  const out: string[] = [];
  const seen = new Set<string>();
  const visit = (id: string) => {
    if (seen.has(id) || !byId.has(id)) return;
    seen.add(id);
    for (const d of byId.get(id)!.derivesFrom) visit(d);
    out.push(id);
  };
  for (const k of plan.keyframes) visit(k.keyframeId);
  return out;
}
