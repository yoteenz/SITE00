/**
 * P0.VR.OPUS-NATIVE1 — Phase 24: NativeOpusVsCursorGap.
 *
 * An honest comparison of what the native runtime can do today against what
 * Cursor does for the same work. `blocksCursorExit` marks the rows that must
 * be closed before Cursor stops being required for routine Opus design work;
 * a MISSING_NATIVE row that does not block exit is a convenience, not a
 * dependency.
 *
 * P0.VR.OPUS-NATIVE2 — Phase 33 reassessment. Three of the four exit blockers
 * closed this sprint: editing now includes file creation and atomic
 * multi-file patches, and request-changes continues a thread instead of
 * ending it. Git remains open and remains deliberate. One row moved the other
 * way: embedding the agent in DESIGN made "where the founder works" a real
 * comparison rather than a hypothetical one, and native now wins it.
 */

import type { NativeOpusVsCursorGapRow } from '../../../shared/site00-opus-native/types.js';

export const NATIVE_OPUS_VS_CURSOR_GAP: NativeOpusVsCursorGapRow[] = [
  {
    capability: 'context',
    cursor: 'Rediscovers the surface every run by searching the repository from scratch.',
    native: 'Compiles the surface from the design registry: component, styles, state hook, golden, contracts, lineage — declared, not searched.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'This is the native runtime\'s structural advantage: SITE 00 already knows what a page is made of.',
  },
  {
    capability: 'prompt caching',
    cursor: 'Opaque. The founder cannot see or control what is cached.',
    native: 'Explicit cache breakpoint after the stable tiers; cache read/write tokens recorded on every receipt.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'The measured saving is on the receipt rather than inferred from a bill.',
  },
  {
    capability: 'repo inspection',
    cursor: 'Unrestricted read across the whole repository.',
    native: 'read_file and search_code, scoped to a dependency-expanded allowlist.',
    status: 'PARITY',
    blocksCursorExit: false,
    note: 'Narrower on purpose. Broader reading is available by raising dependencyDepth or the mode.',
  },
  {
    capability: 'editing',
    cursor: 'Arbitrary edits to any file, plus file creation and deletion, with no capability boundary.',
    native: 'Surgical find/replace and create_file against a capability-resolved allowlist, under a run-scoped founder grant.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'Closed in NATIVE2. Cursor can edit more; native is the only one of the two that can state, before spending anything, exactly which files a run may touch and refuse the rest.',
  },
  {
    capability: 'browser render',
    cursor: 'Playwright driven ad hoc through shell, re-invented per sprint.',
    native: 'launch_or_refresh_preview plus a fixed viewport matrix as first-class tools.',
    status: 'PARITY',
    blocksCursorExit: false,
    note: 'Native is more repeatable; Cursor is more flexible when a sprint needs an unusual harness.',
  },
  {
    capability: 'screenshots',
    cursor: 'Ad hoc scripts, results read back as images.',
    native: 'capture_screenshot and capture_current_render return the image to the model as visual context.',
    status: 'PARITY',
    blocksCursorExit: false,
    note: null as unknown as string,
  },
  {
    capability: 'visual comparison',
    cursor: 'Bespoke sharp-based audit scripts written per sprint.',
    native: 'compare_screenshot returns an overall and per-band changed-pixel percentage every run.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'Quantitative comparison is built in rather than rebuilt each sprint.',
  },
  {
    capability: 'golden reference',
    cursor: 'Whatever file the sprint author remembered to attach.',
    native: 'Registered per surface with assetId, version, content hash, measured dimensions and approval state.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'Removes the failure mode where a run works from the wrong or a stale reference.',
  },
  {
    capability: 'testing',
    cursor: 'Any command, any suite.',
    native: 'run_typecheck and run_targeted_tests with a validated pattern; no general command execution.',
    status: 'PARITY',
    blocksCursorExit: false,
    note: 'Covers the verification the protocol actually requires.',
  },
  {
    capability: 'iteration',
    cursor: 'Effectively unbounded; the founder notices cost afterwards.',
    native: 'Per-mode iteration, token and spend ceilings, checked before each dispatch.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'The reason this runtime exists.',
  },
  {
    capability: 'cost accounting',
    cursor: 'None per run. Cost is a monthly subscription line.',
    native: 'A receipt per run with tokens, cache split, USD and cost per page, per refinement and per project.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: null as unknown as string,
  },
  {
    capability: 'git',
    cursor: 'Full branch, commit, push and PR management.',
    native: 'None by design. Approval leaves the patch in the working tree for a human commit.',
    status: 'MISSING_NATIVE',
    blocksCursorExit: true,
    note: 'Deliberate for now — keeping the agent out of git is what guarantees it cannot reach main. Shipping a change still requires a human or Cursor.',
  },
  {
    capability: 'revert',
    cursor: 'git checkout, and only if the work was committed or stashed first.',
    native: 'Exact pre-run bytes captured before the first write; revert restores content, not an approximation.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: null as unknown as string,
  },
  {
    capability: 'founder review',
    cursor: 'Prose summary in chat; the founder reads a diff elsewhere.',
    native: 'A structured review package — patch, before/after renders, typecheck, tests, cost — behind a hard approval gate.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'The agent structurally cannot self-approve.',
  },
  {
    capability: 'multi-file reasoning',
    cursor: 'Handles large cross-cutting refactors across dozens of files. Partial application on failure is normal.',
    native: 'Atomic multi-file patch sets within one surface: planned and validated in full, then written, or not written at all.',
    status: 'PARITY',
    blocksCursorExit: false,
    note: 'Cursor still reaches further across the repo. Native is the safer of the two at the scope it covers, because a rejected patch leaves nothing behind.',
  },
  {
    capability: 'session continuity',
    cursor: 'Long-lived conversation. Context grows unbounded and is re-sent, so a late turn costs more than an early one.',
    native: 'DesignAgentSession threads runs; request-changes dispatches a continuation against a derived compaction rather than a replayed transcript.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'Closed in NATIVE2. The compaction is derived from what happened — a tool call that failed is recorded as a rejected approach whether or not the model mentioned it, which a self-summarised chat history does not do.',
  },

  // ---- P0.VR.OPUS-NATIVE2 — rows this sprint made comparable -------------

  {
    capability: 'page creation',
    cursor: 'Creates pages freely. Route, inheritance and component reuse are whatever the model decided that day.',
    native: 'PAGE_CREATE behind a validated plan: route grammar and collision checked, every parent-required region classified INHERITED / OVERRIDDEN / NEW with justification, and component reuse decided before creation.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'Cursor is faster at creating a page. Native is the only one that can refuse to create the wrong one.',
  },
  {
    capability: 'where the founder works',
    cursor: 'A separate editor. The founder leaves DESIGN, describes the page in prose, and returns to look.',
    native: 'A dock inside DESIGN. Project, page, view, viewport, golden and write scope are compiled from what is on screen.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'The point of the sprint. Describing a page you are already looking at is the tax this removes.',
  },
  {
    capability: 'asset authority',
    cursor: 'None. Nothing stops a design pass from replacing an approved raster reference.',
    native: 'Asset mutation is BLOCKED by default at every capability level and checked against edit content, not file path.',
    status: 'BETTER_NATIVE',
    blocksCursorExit: false,
    note: 'Directly answers the regression OPUS-ASSET-PERSISTENCE1 was called in to fix.',
  },
  {
    capability: 'preview in deployed environments',
    cursor: 'Not applicable; Cursor runs where the repository is.',
    native: 'Environment-aware origin resolution. A deployed API container reports PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT rather than pretending.',
    status: 'MISSING_NATIVE',
    blocksCursorExit: false,
    note: 'The visual loop needs a checkout, a dev server and a browser in the same place. A stateless API container is the wrong host for it, and an always-on preview service is not built.',
  },
  {
    capability: 'live model access from the cloud VM',
    cursor: 'Cursor supplies the model. No key management for the founder.',
    native: 'Needs ANTHROPIC_API_KEY in the environment that runs the loop. It is set on Railway, which has no repository or browser, and absent from the cloud dev VM, which has both.',
    status: 'MISSING_NATIVE',
    blocksCursorExit: true,
    note: 'The only remaining blocker that is not deliberate. It is a credential placement problem, not a code problem: the same key in Cursor Cloud secrets makes the live loop runnable where the tools already work.',
  },
];

export function summariseGap() {
  const parity = NATIVE_OPUS_VS_CURSOR_GAP.filter((row) => row.status === 'PARITY').length;
  const betterNative = NATIVE_OPUS_VS_CURSOR_GAP.filter((row) => row.status === 'BETTER_NATIVE').length;
  const missingNative = NATIVE_OPUS_VS_CURSOR_GAP.filter((row) => row.status === 'MISSING_NATIVE').length;
  const blockers = NATIVE_OPUS_VS_CURSOR_GAP.filter((row) => row.blocksCursorExit).map((row) => row.capability);

  return {
    parity,
    betterNative,
    missingNative,
    cursorExitReady: (blockers.length === 0 ? 'YES' : blockers.length <= 3 ? 'PARTIAL' : 'NO') as
      | 'YES'
      | 'NO'
      | 'PARTIAL',
    blockers,
  };
}
