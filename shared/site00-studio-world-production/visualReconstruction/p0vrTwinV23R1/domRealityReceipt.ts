import type { DOMRealityReceipt } from './types.js';
import type { ExecutableConceptObject } from './types.js';

export function buildDomRealityReceipt(objects: ExecutableConceptObject[]): DOMRealityReceipt {
  const textObjects = objects.filter(
    (o) => o.renderPrimitive === 'DOM_TEXT' || o.renderPrimitive === 'DOM_STRUCTURE',
  );
  const controls = objects.filter(
    (o) => o.renderPrimitive === 'DOM_CONTROL' || o.interaction === 'interactive',
  );
  const hasProgress = objects.some((o) => o.role.includes('progress'));
  const hasMetrics = objects.some((o) => o.role.includes('metric'));
  const hasActivity = objects.some((o) => o.role.includes('activity'));

  return {
    selectableTextObjects: textObjects.length,
    expectedTextObjects: Math.max(textObjects.length, 15),
    interactiveControls: controls.length,
    expectedControls: Math.max(controls.length, 3),
    liveProgressPrimitive: hasProgress,
    liveMetricsPrimitive: hasMetrics,
    liveActivityPrimitive: hasActivity,
    sectionRasterCount: 0,
    status: hasProgress && hasMetrics && hasActivity ? 'PASS' : 'FAIL',
  };
}
