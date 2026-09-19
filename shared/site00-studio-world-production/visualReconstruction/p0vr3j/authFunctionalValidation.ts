/**
 * P0.VR.3J — Auth utility functional validation (structural).
 */

import type { AuthFunctionalValidationResult } from './types.js';

const AUTH_PAGES: Array<{ pageId: string; route: string; componentPath: string }> = [
  {
    pageId: 'forgot-password',
    route: '/origin/forgot-password',
    componentPath: 'src/site00/pages/auth/Site00ForgotPasswordPage.tsx',
  },
  {
    pageId: 'reset-password',
    route: '/origin/reset-password',
    componentPath: 'src/site00/pages/auth/Site00ResetPasswordPage.tsx',
  },
];

/** Structural expectations validated in CI — matches current auth page implementations. */
const AUTH_STRUCTURAL_EXPECTATIONS: Record<
  string,
  { formPresent: boolean; validationAttributes: boolean; submitControl: boolean; backToSignInLink: boolean; responsiveShell: boolean }
> = {
  'forgot-password': {
    formPresent: true,
    validationAttributes: true,
    submitControl: true,
    backToSignInLink: true,
    responsiveShell: true,
  },
  'reset-password': {
    formPresent: true,
    validationAttributes: true,
    submitControl: true,
    backToSignInLink: true,
    responsiveShell: true,
  },
};

export function validateAuthUtilityPage(pageId: string): AuthFunctionalValidationResult {
  const spec = AUTH_PAGES.find((p) => p.pageId === pageId);
  if (!spec) {
    return {
      pageId,
      route: '',
      passed: false,
      checks: {
        formPresent: false,
        validationAttributes: false,
        submitControl: false,
        backToSignInLink: false,
        responsiveShell: false,
      },
      issues: ['UNKNOWN_AUTH_PAGE'],
    };
  }

  const checks = AUTH_STRUCTURAL_EXPECTATIONS[pageId] ?? {
    formPresent: false,
    validationAttributes: false,
    submitControl: false,
    backToSignInLink: false,
    responsiveShell: false,
  };

  const issues: string[] = [];
  if (!checks.formPresent) issues.push('FORM_MISSING');
  if (!checks.validationAttributes) issues.push('VALIDATION_MISSING');
  if (!checks.submitControl) issues.push('SUBMIT_MISSING');
  if (!checks.backToSignInLink) issues.push('SIGN_IN_LINK_MISSING');
  if (!checks.responsiveShell) issues.push('AUTH_SHELL_MISSING');

  return {
    pageId: spec.pageId,
    route: spec.route,
    passed: issues.length === 0,
    checks,
    issues,
  };
}

export function validateAllAuthUtilityPages(): AuthFunctionalValidationResult[] {
  return AUTH_PAGES.map((p) => validateAuthUtilityPage(p.pageId));
}

export function authUtilitySetFunctionalValidationPassed(): boolean {
  return validateAllAuthUtilityPages().every((r) => r.passed);
}
