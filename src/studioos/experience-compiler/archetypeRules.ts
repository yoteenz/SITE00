import { isBuildReadyVerification, resolveProductFamily } from './productFamily';

export function classifyArchetypeForNode(
  route: string,
  screenType: string,
  family?: string,
): { primary: string; secondary: string | null } {
  const r = route.split('?')[0];
  const fam = family ?? resolveProductFamily(r);

  if (screenType === 'desktop_branch') return { primary: 'DESKTOP_BRANCH', secondary: null };
  if (screenType === 'expanded_panel') return { primary: 'ENTRY', secondary: 'ROUTE_SELECTOR' };
  if (r.includes('/checkout')) {
    if (r.includes('payment')) return { primary: 'PAYMENT', secondary: 'CHECKOUT' };
    return { primary: 'CHECKOUT', secondary: null };
  }
  if (fam === 'AUTH') return { primary: 'AUTH', secondary: null };
  if (screenType === 'result') return { primary: 'RESULT', secondary: null };
  if (r.endsWith('/review') || screenType === 'review') return { primary: 'REVIEW', secondary: 'MULTI_STEP_INTAKE' };
  if (isBuildReadyVerification(r)) {
    if (r.includes('verification') || r.includes('authority-check')) {
      return { primary: 'VERIFICATION', secondary: 'MULTI_STEP_INTAKE' };
    }
    if (r.includes('evidence')) return { primary: 'UPLOAD', secondary: 'MULTI_STEP_INTAKE' };
  }
  if (screenType === 'question' || screenType === 'assessment_landing') {
    if (r.includes('audience') || r.includes('other-specify') || r.includes('goals')) {
      return { primary: 'TEXT_INPUT', secondary: 'MULTI_STEP_INTAKE' };
    }
    if (screenType === 'assessment_landing') return { primary: 'HUB', secondary: 'MULTI_STEP_INTAKE' };
    return { primary: 'SINGLE_SELECT', secondary: 'MULTI_STEP_INTAKE' };
  }
  if (r === '/origin/locations' || fam === 'LOCATIONS') return { primary: 'LOCATIONS', secondary: null };
  if (fam === 'LOCATIONS_CHILD') return { primary: 'CONTENT', secondary: null };
  if (r === '/idnty/state' || screenType === 'state_landing') return { primary: 'STATE_SELECTOR', secondary: null };
  if (r === '/bldr/state' || r.includes('path=')) return { primary: 'ROUTE_SELECTOR', secondary: 'STATE_SELECTOR' };
  if (r === '/evolve/state' || (fam === 'PUBLIC_EVOLVE' && r.includes('path='))) {
    return { primary: 'ROUTE_SELECTOR', secondary: null };
  }
  if (r === '/' || r === '/origin') return { primary: 'ENTRY', secondary: null };
  if (fam === 'PUBLIC_EVOLVE' && (r === '/evolve' || r.startsWith('/evolve/marketing'))) {
    return { primary: 'HUB', secondary: null };
  }
  if (fam === 'BLDR' && (r === '/bldr' || r === '/bldr/start')) return { primary: 'HUB', secondary: null };
  return { primary: 'HUB', secondary: null };
}
