export function auditTwinV4LiveDomForRasterCheat(input: {
  liveHtml: string;
  goldenUrl: string;
}): { violations: string[]; runtimeRasterUsage: number } {
  const violations: string[] = [];
  if (input.liveHtml.includes(input.goldenUrl) && input.liveHtml.includes('background-image')) {
    violations.push('GOLDEN_URL_USED_AS_BACKGROUND');
  }
  if (input.liveHtml.includes('data-testid="twin-v4-live-reconstruction"') && input.liveHtml.includes('<img')) {
    const liveSection = input.liveHtml.split('twin-v4-live-reconstruction')[1]?.slice(0, 2000) ?? '';
    if (liveSection.includes(input.goldenUrl)) {
      violations.push('GOLDEN_URL_INSIDE_LIVE_RECONSTRUCTION');
    }
  }
  return { violations, runtimeRasterUsage: violations.length };
}
