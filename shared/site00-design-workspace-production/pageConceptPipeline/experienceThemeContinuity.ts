/**
 * P0.VR.EXPERIENCE-THEME-CONTINUITY-AND-INTENTIONAL-CONTRAST-GUARD1
 */

import type { ExperienceExpressionAuthority, ExperienceExpressionVisualState } from './experienceExpressionAuthority.js';
import type { ExperienceExpressionPrompt } from './pageConceptExperienceExpressionPromptOrchestration.js';
import { isNdxbookOverviewExperiencePage } from './ndxbookOverviewExperienceExpressionContentSpec.js';

export type AuthorityTheme = 'LIGHT' | 'DARK' | 'MIXED';

export type ExperienceThemeMode = 'INHERIT_AUTHORITY' | 'INTENTIONAL_CONTRAST';

export type ThemeContinuityStatus =
  | 'THEME_MATCH'
  | 'INTENTIONAL_CONTRAST'
  | 'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW'
  | 'UNJUSTIFIED_THEME_DRIFT';

export type AuthorityThemeProfile = {
  authorityTheme: AuthorityTheme;
  dominantSurface: 'LIGHT' | 'DARK' | 'MIXED';
  secondarySurface: 'LIGHT' | 'DARK' | 'MIXED';
  textContrast: 'HIGH_ON_LIGHT' | 'HIGH_ON_DARK' | 'MIXED';
  accentBehavior: string;
  overlayBehavior: string;
};

export type ExperienceThemeContinuityReceipt = {
  ok: boolean;
  authorityTheme: AuthorityTheme;
  unjustifiedDriftStateIds: readonly string[];
  pendingContrastReviewStateIds: readonly string[];
  states: readonly {
    stateId: string;
    label: string;
    themeMode: ExperienceThemeMode;
    themeContinuityStatus: ThemeContinuityStatus;
    contrastRationale: string | null;
  }[];
};

export const INHERIT_AUTHORITY_THEME_PROMPT_BLOCK =
  "Preserve the approved authority's dominant light theme. Do not introduce a dark-mode interpretation.";

export const INTENTIONAL_CONTRAST_THEME_PROMPT_BLOCK =
  'Use a localized black interaction surface as an intentional contrast layer while preserving the light approved page beneath it.';

export function classifyAuthorityThemeProfile(input: {
  projectId: string;
  route: string;
  pageId?: string;
  screenId?: string;
  territoryLabel?: string | null;
  skinContractVersion?: string;
}): AuthorityThemeProfile {
  const ndxOverview = isNdxbookOverviewExperiencePage({
    projectId: input.projectId,
    route: input.route,
    pageId: input.pageId,
    screenId: input.screenId,
  });
  const territory = (input.territoryLabel ?? '').toLowerCase();
  const editorialLight =
    ndxOverview ||
    /editorial|signal|archival|paper|light|lime/.test(territory) ||
    input.projectId.toLowerCase() === 'ndxbook';

  const authorityTheme: AuthorityTheme = editorialLight ? 'LIGHT' : 'MIXED';

  return {
    authorityTheme,
    dominantSurface: authorityTheme === 'LIGHT' ? 'LIGHT' : 'MIXED',
    secondarySurface: authorityTheme === 'LIGHT' ? 'DARK' : 'MIXED',
    textContrast: authorityTheme === 'LIGHT' ? 'HIGH_ON_LIGHT' : 'MIXED',
    accentBehavior: 'Preserve lime accent placement and editorial signal blocks from approved authority.',
    overlayBehavior: 'Localized interaction layers may contrast; base page brightness must remain authority-consistent.',
  };
}

export function themePromptBlockForMode(mode: ExperienceThemeMode, contrastRationale: string | null): string {
  if (mode === 'INTENTIONAL_CONTRAST') {
    return [
      'THEME MODE: INTENTIONAL_CONTRAST',
      contrastRationale ? `CONTRAST RATIONALE: ${contrastRationale}` : 'CONTRAST RATIONALE: REQUIRED',
      INTENTIONAL_CONTRAST_THEME_PROMPT_BLOCK,
    ].join('\n');
  }
  return ['THEME MODE: INHERIT_AUTHORITY', INHERIT_AUTHORITY_THEME_PROMPT_BLOCK].join('\n');
}

export function promptForState(
  prompts: readonly ExperienceExpressionPrompt[] | undefined,
  state: ExperienceExpressionVisualState,
): ExperienceExpressionPrompt | null {
  if (!prompts?.length) return null;
  const type = state.sourceExpressionTypes?.[0];
  if (type) {
    const byType = prompts.find((p) => p.expressionType === type);
    if (byType) return byType;
  }
  return prompts.find((p) => p.stateId === state.stateId) ?? null;
}

export function classifyExperienceVisualStateTheme(input: {
  state: ExperienceExpressionVisualState;
  prompt: ExperienceExpressionPrompt | null;
  authorityTheme: AuthorityTheme;
}): Pick<
  ExperienceExpressionVisualState,
  'themeMode' | 'contrastRationale' | 'themeContinuityStatus' | 'outputThemeDominance'
> {
  const { state, prompt, authorityTheme } = input;
  if (state.sourceProvider === 'INHERITED_MOBILE') {
    return {
      themeMode: 'INHERIT_AUTHORITY',
      contrastRationale: null,
      themeContinuityStatus: 'THEME_MATCH',
      outputThemeDominance: authorityTheme === 'LIGHT' ? 'LIGHT' : 'MIXED',
    };
  }

  const themeMode = prompt?.themeMode ?? 'INHERIT_AUTHORITY';
  const contrastRationale = prompt?.contrastRationale ?? null;
  const dominance = state.outputThemeDominance ?? null;

  if (themeMode === 'INTENTIONAL_CONTRAST') {
    if (!contrastRationale?.trim()) {
      return {
        themeMode,
        contrastRationale: null,
        themeContinuityStatus: 'UNJUSTIFIED_THEME_DRIFT',
        outputThemeDominance: dominance ?? 'DARK',
      };
    }
    return {
      themeMode,
      contrastRationale,
      themeContinuityStatus: 'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW',
      outputThemeDominance: dominance ?? 'MIXED',
    };
  }

  if (authorityTheme === 'LIGHT' && dominance === 'DARK') {
    return {
      themeMode,
      contrastRationale: null,
      themeContinuityStatus: 'UNJUSTIFIED_THEME_DRIFT',
      outputThemeDominance: 'DARK',
    };
  }

  if (authorityTheme === 'LIGHT' && dominance === 'MIXED' && state.stateId === 'menu') {
    return {
      themeMode,
      contrastRationale:
        'The expanded navigation becomes a black archival index layer to distinguish navigation mode from the light editorial record beneath it.',
      themeContinuityStatus: 'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW',
      outputThemeDominance: 'MIXED',
    };
  }

  return {
    themeMode,
    contrastRationale: null,
    themeContinuityStatus: 'THEME_MATCH',
    outputThemeDominance: dominance ?? (authorityTheme === 'LIGHT' ? 'LIGHT' : 'MIXED'),
  };
}

export function applyExperienceThemeContinuityToAuthority(
  authority: ExperienceExpressionAuthority,
  profile: AuthorityThemeProfile,
): ExperienceExpressionAuthority {
  const visualStates = authority.visualStates.map((state) => {
    const prompt = promptForState(authority.expressionPrompts, state);
    const themeFields = classifyExperienceVisualStateTheme({
      state,
      prompt,
      authorityTheme: profile.authorityTheme,
    });
    return { ...state, ...themeFields };
  });
  return {
    ...authority,
    authorityThemeProfile: profile,
    visualStates,
  };
}

export function validateExperienceThemeContinuity(
  authority: ExperienceExpressionAuthority | null | undefined,
): ExperienceThemeContinuityReceipt {
  if (!authority) {
    return {
      ok: false,
      authorityTheme: 'MIXED',
      unjustifiedDriftStateIds: [],
      pendingContrastReviewStateIds: [],
      states: [],
    };
  }
  const profile =
    authority.authorityThemeProfile ??
    classifyAuthorityThemeProfile({
      projectId: authority.projectId,
      route: authority.expressionPrompts?.[0]?.route ?? '',
      pageId: authority.pageId,
    });

  const states = authority.visualStates.map((state) => {
    const prompt = promptForState(authority.expressionPrompts, state);
    const classified = classifyExperienceVisualStateTheme({
      state,
      prompt,
      authorityTheme: profile.authorityTheme,
    });
    return {
      stateId: state.stateId,
      label: state.label,
      themeMode: classified.themeMode ?? 'INHERIT_AUTHORITY',
      themeContinuityStatus: classified.themeContinuityStatus ?? 'THEME_MATCH',
      contrastRationale: classified.contrastRationale ?? null,
    };
  });

  const unjustifiedDriftStateIds = states
    .filter((s) => s.themeContinuityStatus === 'UNJUSTIFIED_THEME_DRIFT')
    .map((s) => s.stateId);
  const pendingContrastReviewStateIds = states
    .filter((s) => s.themeContinuityStatus === 'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW')
    .map((s) => s.stateId);

  const ok = unjustifiedDriftStateIds.length === 0;

  return {
    ok,
    authorityTheme: profile.authorityTheme,
    unjustifiedDriftStateIds,
    pendingContrastReviewStateIds,
    states,
  };
}

export function buildExperienceThemeHandoffLines(authority: ExperienceExpressionAuthority): string[] {
  const receipt = validateExperienceThemeContinuity(authority);
  const lines = [`AUTHORITY THEME: ${receipt.authorityTheme}`];
  for (const row of receipt.states) {
    if (row.stateId === 'base') continue;
    lines.push(
      `THEME · ${row.label}: mode=${row.themeMode} status=${row.themeContinuityStatus}${
        row.contrastRationale ? ` rationale=${row.contrastRationale}` : ''
      }`,
    );
  }
  return lines;
}

/** Heuristic when image analysis is unavailable — menu nav layers often read as localized dark contrast. */
export function inferOutputThemeDominance(state: ExperienceExpressionVisualState): 'LIGHT' | 'DARK' | 'MIXED' {
  if (state.sourceProvider === 'INHERITED_MOBILE') return 'LIGHT';
  if (state.stateId === 'menu') return 'MIXED';
  return 'LIGHT';
}

export function enrichExperienceAuthorityThemeContinuity(
  authority: ExperienceExpressionAuthority,
  ctx: { projectId: string; route: string; pageId?: string; screenId?: string; territoryLabel?: string | null },
): ExperienceExpressionAuthority {
  const profile = classifyAuthorityThemeProfile({
    projectId: ctx.projectId,
    route: ctx.route,
    pageId: ctx.pageId ?? authority.pageId,
    screenId: ctx.screenId,
    territoryLabel: ctx.territoryLabel,
  });
  const visualStates = authority.visualStates.map((state) => ({
    ...state,
    outputThemeDominance: state.outputThemeDominance ?? inferOutputThemeDominance(state),
  }));
  return applyExperienceThemeContinuityToAuthority({ ...authority, visualStates }, profile);
}

export function experienceThemeContinuityBlocksApproval(
  authority: ExperienceExpressionAuthority | null | undefined,
): { blocked: boolean; code: string | null; receipt: ExperienceThemeContinuityReceipt } {
  const receipt = validateExperienceThemeContinuity(authority);
  if (!receipt.ok) {
    return { blocked: true, code: 'EXPERIENCE_THEME_DRIFT', receipt };
  }
  return { blocked: false, code: null, receipt };
}

export function themeLabelForState(state: ExperienceExpressionVisualState): string {
  if (state.themeMode === 'INTENTIONAL_CONTRAST') return 'INTENTIONAL CONTRAST';
  return 'INHERITED';
}

export function founderThemeReviewLine(state: ExperienceExpressionVisualState): 'THEME MATCH' | 'CONTRAST REVIEW REQUIRED' {
  if (state.themeContinuityStatus === 'UNJUSTIFIED_THEME_DRIFT') return 'CONTRAST REVIEW REQUIRED';
  if (state.themeContinuityStatus === 'INTENTIONAL_CONTRAST_PENDING_FOUNDER_REVIEW') return 'CONTRAST REVIEW REQUIRED';
  if (state.themeContinuityStatus === 'INTENTIONAL_CONTRAST') return 'CONTRAST REVIEW REQUIRED';
  return 'THEME MATCH';
}

export function classifyExistingMenuOutputTheme(input: {
  authority: ExperienceExpressionAuthority;
  menuOutputThemeDominance?: 'LIGHT' | 'DARK' | 'MIXED';
}): ExperienceExpressionVisualState[] {
  const profile =
    input.authority.authorityThemeProfile ??
    classifyAuthorityThemeProfile({
      projectId: input.authority.projectId,
      route: input.authority.expressionPrompts?.[0]?.route ?? '',
      pageId: input.authority.pageId,
    });

  return input.authority.visualStates.map((state) => {
    if (state.stateId !== 'menu') return state;
    const dominance = input.menuOutputThemeDominance ?? state.outputThemeDominance ?? 'MIXED';
    const withDominance = { ...state, outputThemeDominance: dominance };
    const prompt = promptForState(input.authority.expressionPrompts, withDominance);
    const themeFields = classifyExperienceVisualStateTheme({
      state: withDominance,
      prompt,
      authorityTheme: profile.authorityTheme,
    });
    return { ...withDominance, ...themeFields };
  });
}
