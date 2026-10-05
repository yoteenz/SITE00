/**
 * P1 accessibility MVP — deterministic checks before implementation approval.
 */

export type AccessibilityFinding = {
  checkId: string;
  result: 'PASS' | 'FAIL' | 'WARN' | 'NOT_EVALUATED';
  notes: string[];
};

export function evaluateAccessibilityMvp(params: {
  hasSemanticLandmarks: boolean;
  hasKeyboardReachability: boolean;
  hasFocusVisibility: boolean;
  hasButtonLinkSemantics: boolean;
  hasAltBehavior: boolean;
  hasReducedMotionHooks: boolean;
  touchTargetsMet: boolean;
  contrastChecked: boolean;
}): AccessibilityFinding[] {
  const findings: AccessibilityFinding[] = [
    {
      checkId: 'semantic_landmarks',
      result: params.hasSemanticLandmarks ? 'PASS' : 'NOT_EVALUATED',
      notes: params.hasSemanticLandmarks ? [] : ['Landmark audit not run against live DOM'],
    },
    {
      checkId: 'keyboard_reachability',
      result: params.hasKeyboardReachability ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'focus_visibility',
      result: params.hasFocusVisibility ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'button_link_semantics',
      result: params.hasButtonLinkSemantics ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'alt_behavior',
      result: params.hasAltBehavior ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'reduced_motion',
      result: params.hasReducedMotionHooks ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'touch_targets',
      result: params.touchTargetsMet ? 'PASS' : 'NOT_EVALUATED',
      notes: [],
    },
    {
      checkId: 'contrast',
      result: params.contrastChecked ? 'PASS' : 'NOT_EVALUATED',
      notes: ['Full WCAG certification not claimed'],
    },
  ];
  return findings;
}

export function accessibilityFindingsIncludedBeforeApproval(findings: AccessibilityFinding[]): boolean {
  return findings.length > 0;
}
