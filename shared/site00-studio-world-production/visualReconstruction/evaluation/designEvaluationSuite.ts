/**
 * Aggregated design + brand evaluation modules (P0.VR.1A).
 */

export type PaletteSample = {
  dominantSurface: string;
  luminance: number;
  clientAccentRatio: number;
  hostAccentRatio: number;
  inkRatio: number;
  randomAccentDetected: boolean;
};

export type EvaluationInput = {
  renderBuffer?: Buffer;
  cssSnapshot?: Record<string, string>;
  regionMetrics?: RegionMetricInput[];
  viewport: { width: number; height: number };
  artworkHeavy?: boolean;
  focalRegion?: string;
};

export type RegionMetricInput = {
  regionId: string;
  role: string;
  bounds: { width: number; height: number };
  artworkAreaRatio?: number;
  borderRadius?: number;
  hasBorder?: boolean;
  gapAfter?: number;
};

function parseHexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  if (h.length < 6) return 0.5;
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function evaluateReferencePalette(input: EvaluationInput & { targetPaper?: string; targetLime?: string; targetHostRed?: string }): PaletteSample & { score: number } {
  const bg = input.cssSnapshot?.background ?? input.cssSnapshot?.['--ndx-paper'] ?? '#0f0f0f';
  const luminance = parseHexLuminance(bg.startsWith('#') ? bg : '#0f0f0f');
  const limeRatio = input.cssSnapshot?.limeRatio ? parseFloat(input.cssSnapshot.limeRatio) : 0.05;
  const hostRatio = input.cssSnapshot?.hostRedRatio ? parseFloat(input.cssSnapshot.hostRedRatio) : 0.02;
  const randomAccent = input.cssSnapshot?.randomBlue === 'true';

  const score =
    luminance >= 0.75 ? 0.95 : luminance >= 0.55 ? 0.6 : 0.2;

  return {
    dominantSurface: bg,
    luminance,
    clientAccentRatio: limeRatio,
    hostAccentRatio: hostRatio,
    inkRatio: 0.15,
    randomAccentDetected: randomAccent,
    score,
  };
}

export function evaluateWorkspaceLuminosity(palette: Pick<PaletteSample, 'luminance'>, target = 0.85): { passed: boolean; score: number; failures: string[] } {
  const failures: string[] = [];
  if (palette.luminance < 0.55) failures.push('FAIL_DARK_PRIMARY_WORKSPACE');
  if (palette.luminance < target - 0.15) failures.push('FAIL_REFERENCE_LUMINOSITY_MISMATCH');
  return {
    passed: failures.length === 0,
    score: Math.min(1, palette.luminance / target),
    failures,
  };
}

export function evaluateBrandAccentAuthority(palette: Pick<PaletteSample, 'clientAccentRatio' | 'hostAccentRatio' | 'randomAccentDetected'>, limeMin = 0.02, limeMax = 0.18): { passed: boolean; score: number; failures: string[] } {
  const failures: string[] = [];
  if (palette.clientAccentRatio < limeMin) failures.push('FAIL_NDX_LIME_ABSENT');
  if (palette.clientAccentRatio > limeMax) failures.push('FAIL_NDX_LIME_TOO_DOMINANT');
  if (palette.hostAccentRatio > palette.clientAccentRatio * 1.5) failures.push('FAIL_HOST_RED_REPLACING_CLIENT_ACCENT');
  if (palette.randomAccentDetected) failures.push('FAIL_RANDOM_ACCENT_COLOR');
  const score = failures.length ? 0.4 : 0.92;
  return { passed: failures.length === 0, score, failures };
}

export function evaluateHostClientVisualAuthority(palette: Pick<PaletteSample, 'clientAccentRatio' | 'hostAccentRatio'>): { passed: boolean; score: number; failures: string[] } {
  const failures: string[] = [];
  if (palette.hostAccentRatio > 0.12) failures.push('FAIL_HOST_ACCENT_LEAKAGE');
  return { passed: failures.length === 0, score: palette.hostAccentRatio < 0.08 ? 0.9 : 0.5, failures };
}

export function evaluateArtworkAuthority(
  regions: RegionMetricInput[],
  artworkHeavy: boolean,
): { score: number; artworkShare: number; chromeShare: number; failures: string[] } {
  let artwork = 0;
  let chrome = 0;
  for (const r of regions) {
    const area = r.bounds.width * r.bounds.height;
    if (r.role === 'IMAGE' || r.artworkAreaRatio) artwork += area * (r.artworkAreaRatio ?? 0.7);
    else if (r.role.includes('NAV') || r.role === 'GLOBAL_SHELL') chrome += area;
  }
  const total = artwork + chrome || 1;
  const artworkShare = artwork / total;
  const failures: string[] = [];
  if (artworkHeavy && artworkShare < 0.35) failures.push('FAIL_ARTWORK_SHRUNK_BY_UI');
  if (artworkHeavy && artworkShare < 0.25) failures.push('FAIL_ARTWORK_AUTHORITY');
  return {
    score: artworkHeavy ? Math.min(1, artworkShare / 0.45) : 0.85,
    artworkShare,
    chromeShare: chrome / total,
    failures,
  };
}

export function evaluateContainerRepetition(regions: RegionMetricInput[]): { repetitionIndex: number; score: number; failures: string[] } {
  const signatures = regions.map((r) => `${r.borderRadius ?? 6}-${r.hasBorder ?? true}`);
  const unique = new Set(signatures).size;
  const repetitionIndex = regions.length > 0 ? 1 - unique / regions.length : 0;
  const failures = repetitionIndex > 0.75 ? ['FAIL_UNIFORM_CARD_SYSTEM', 'FAIL_EXCESSIVE_CONTAINERIZATION'] : [];
  return {
    repetitionIndex,
    score: 1 - repetitionIndex * 0.8,
    failures,
  };
}

export function evaluateSpatialRhythm(regions: RegionMetricInput[]): { variance: number; score: number; failures: string[] } {
  const gaps = regions.map((r) => r.gapAfter ?? 16).filter((g) => g > 0);
  if (gaps.length < 2) return { variance: 0, score: 0.7, failures: [] };
  const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((s, g) => s + (g - mean) ** 2, 0) / gaps.length;
  const failures = variance < 4 ? ['FAIL_SPATIAL_RHYTHM'] : [];
  return { variance, score: Math.min(1, variance / 64), failures };
}

export function evaluateDesignGrammarMatch(input: {
  palette: ReturnType<typeof evaluateReferencePalette>;
  luminosity: ReturnType<typeof evaluateWorkspaceLuminosity>;
  accent: ReturnType<typeof evaluateBrandAccentAuthority>;
  artwork: ReturnType<typeof evaluateArtworkAuthority>;
  container: ReturnType<typeof evaluateContainerRepetition>;
  spatial: ReturnType<typeof evaluateSpatialRhythm>;
}): { score: number; failures: string[]; dimensions: Record<string, number> } {
  const failures = [
    ...input.luminosity.failures,
    ...input.accent.failures,
    ...input.artwork.failures,
    ...input.container.failures,
    ...input.spatial.failures,
  ];
  if (input.palette.luminance < 0.5) failures.push('FAIL_GENERIC_DASHBOARD_GRAMMAR');
  const dimensions = {
    compositionalHierarchy: input.artwork.score,
    artworkAuthority: input.artwork.score,
    containerDependence: input.container.score,
    spatialRhythm: input.spatial.score,
    palette: input.palette.score,
    luminosity: input.luminosity.score,
    accent: input.accent.score,
  };
  const score =
    Object.values(dimensions).reduce((a, b) => a + b, 0) / Object.keys(dimensions).length;
  return { score, failures: [...new Set(failures)], dimensions };
}

export function evaluateBrandEssenceMatch(input: {
  palette: Pick<PaletteSample, 'luminance'>;
  designGrammarScore: number;
  traitsMatched: number;
  traitsTotal: number;
}): { score: number; passed: boolean; failures: string[] } {
  const traitRatio = input.traitsTotal > 0 ? input.traitsMatched / input.traitsTotal : 0.5;
  const score = input.designGrammarScore * 0.6 + traitRatio * 0.4;
  const failures = score < 0.6 ? ['FAIL_BRAND_ESSENCE_MISMATCH'] : [];
  if (input.palette.luminance < 0.55) failures.push('FAIL_DARK_PRIMARY_WORKSPACE');
  return { score, passed: score >= 0.65, failures };
}

export function evaluateCompositionalSimilarity(dimensions: Record<string, number>): { score: number; asymmetryIndex: number; cardRepetitionIndex: number } {
  const values = Object.values(dimensions);
  const mean = values.reduce((a, b) => a + b, 0) / (values.length || 1);
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length || 1);
  return {
    score: mean,
    asymmetryIndex: Math.min(1, variance * 4),
    cardRepetitionIndex: 1 - dimensions.containerDependence,
  };
}

export function evaluateFocalHierarchy(focalRegion: string | undefined, regionScores: Array<{ role: string; weight: number }>): { passed: boolean; order: string[]; failures: string[] } {
  const sorted = [...regionScores].sort((a, b) => b.weight - a.weight);
  const order = sorted.map((r) => r.role);
  const failures: string[] = [];
  if (order[0] && focalRegion && order[0] !== focalRegion && !order[0]?.includes(focalRegion)) {
    failures.push('FAIL_SYSTEM_CHROME_DOMINANCE');
  }
  return { passed: failures.length === 0, order, failures };
}

export function evaluateTypographicCharacterMatch(hierarchyVariance: number): { score: number; failures: string[] } {
  const failures = hierarchyVariance < 0.15 ? ['FAIL_TYPOGRAPHIC_RHYTHM', 'FAIL_SCALE_CONTRAST'] : [];
  return { score: Math.min(1, hierarchyVariance * 3), failures };
}

export function evaluateSurfaceGrammar(surfaceMix: number): { score: number; failures: string[] } {
  const failures = surfaceMix < 0.25 ? ['FAIL_SURFACE_VOCABULARY'] : [];
  return { score: surfaceMix, failures };
}

export function buildRelationalAlignmentGraph(regions: RegionMetricInput[]): { nodes: string[]; edges: Array<{ from: string; to: string; kind: string }>; score: number } {
  const nodes = regions.map((r) => r.regionId);
  const edges: Array<{ from: string; to: string; kind: string }> = [];
  for (let i = 1; i < regions.length; i++) {
    edges.push({ from: regions[i - 1]!.regionId, to: regions[i]!.regionId, kind: 'FOLLOWS' });
  }
  return { nodes, edges, score: edges.length > 0 ? 0.8 : 0.5 };
}

export function generateDesignDisconnectHeatmap(failures: string[]): { hotspots: Array<{ regionId: string; severity: 'LOW' | 'MEDIUM' | 'HIGH'; code: string }> } {
  return {
    hotspots: failures.map((code) => ({
      regionId: 'workspace',
      severity: code.includes('DARK') || code.includes('ARTWORK') ? 'HIGH' : code.includes('LIME') ? 'MEDIUM' : 'LOW',
      code,
    })),
  };
}
