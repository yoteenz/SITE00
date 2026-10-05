/**
 * P0.VR.8R1 — DesignContextLeakDetector — fail on cross-project bleed in active context.
 */

import type { DesignProjectThemeTokens } from './designProjectThemeTokens.js';
import { buildDesignProjectThemeTokens } from './designProjectThemeTokens.js';

export type DesignContextLeakFailure = {
  code:
    | 'LEAK_WRONG_PROJECT_PAGES'
    | 'LEAK_WRONG_BRAND_ACCENT'
    | 'LEAK_WRONG_CAPTURE_PROJECT'
    | 'LEAK_WRONG_AUTHORITY'
    | 'LEAK_WRONG_COMPLETION'
    | 'LEAK_SITE00_FALLBACK';
  message: string;
};

export type DesignContextLeakReport = {
  pass: boolean;
  failures: DesignContextLeakFailure[];
};

export function detectDesignContextLeaks(input: {
  activeDesignProjectId: string;
  contextProjectId: string;
  pageProjectIds?: string[];
  captureProjectIds?: string[];
  authorityProjectIds?: string[];
  completionProjectId?: string | null;
  themeTokens?: DesignProjectThemeTokens;
  allowSite00HostAccent?: boolean;
}): DesignContextLeakReport {
  const failures: DesignContextLeakFailure[] = [];

  if (input.contextProjectId !== input.activeDesignProjectId) {
    failures.push({
      code: 'LEAK_SITE00_FALLBACK',
      message: `Context project "${input.contextProjectId}" !== active "${input.activeDesignProjectId}"`,
    });
  }

  for (const pageProjectId of input.pageProjectIds ?? []) {
    if (pageProjectId !== input.activeDesignProjectId) {
      failures.push({
        code: 'LEAK_WRONG_PROJECT_PAGES',
        message: `Page record belongs to "${pageProjectId}" while active is "${input.activeDesignProjectId}"`,
      });
    }
  }

  for (const captureProjectId of input.captureProjectIds ?? []) {
    if (captureProjectId !== input.activeDesignProjectId) {
      failures.push({
        code: 'LEAK_WRONG_CAPTURE_PROJECT',
        message: `Capture belongs to "${captureProjectId}" while active is "${input.activeDesignProjectId}"`,
      });
    }
  }

  for (const authorityProjectId of input.authorityProjectIds ?? []) {
    if (authorityProjectId !== input.activeDesignProjectId && authorityProjectId !== 'GLOBAL') {
      failures.push({
        code: 'LEAK_WRONG_AUTHORITY',
        message: `Authority belongs to "${authorityProjectId}" while active is "${input.activeDesignProjectId}"`,
      });
    }
  }

  if (input.completionProjectId && input.completionProjectId !== input.activeDesignProjectId) {
    failures.push({
      code: 'LEAK_WRONG_COMPLETION',
      message: `Page completion belongs to "${input.completionProjectId}" while active is "${input.activeDesignProjectId}"`,
    });
  }

  const expectedTokens = buildDesignProjectThemeTokens(input.activeDesignProjectId);
  const tokens = input.themeTokens ?? expectedTokens;

  if (
    input.activeDesignProjectId === 'ndxbook' &&
    tokens.primaryAccent.toLowerCase() === '#eb1c24' &&
    !input.allowSite00HostAccent
  ) {
    failures.push({
      code: 'LEAK_WRONG_BRAND_ACCENT',
      message: 'NDXBOOK active but SITE 00 red accent detected on project editing surfaces',
    });
  }

  if (input.activeDesignProjectId === 'all-in-one-enterprises' && tokens.accentKey === 'STUDIO_GOLD') {
    failures.push({
      code: 'LEAK_WRONG_BRAND_ACCENT',
      message: 'AIO project using Studio World gold accent key',
    });
  }

  return { pass: failures.length === 0, failures };
}
