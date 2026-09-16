/**
 * P0.VR.OPUS-NATIVE1 — Phase 24: NativeOpusVsCursorGap.
 *
 * An honest comparison of what the native runtime can do today against what
 * Cursor does for the same work. `blocksCursorExit` marks the rows that must
 * be closed before Cursor stops being required for routine Opus design work;
 * a MISSING_NATIVE row that does not block exit is a convenience, not a
 * dependency.
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
    cursor: 'Arbitrary edits to any file, plus file creation and deletion.',
    native: 'Surgical find/replace patches against a per-surface write allowlist. No creation, no deletion.',
    status: 'MISSING_NATIVE',
    blocksCursorExit: true,
    note: 'Sufficient for refinement work, which is the target. Reconstruction sprints that add components still need Cursor until file creation and multi-file scaffolding exist.',
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
    cursor: 'Handles large cross-cutting refactors across dozens of files.',
    native: 'Single-surface scope with a dependency-expanded read boundary.',
    status: 'MISSING_NATIVE',
    blocksCursorExit: false,
    note: 'Out of scope for design refinement. Not a blocker for the target workflow.',
  },
  {
    capability: 'session continuity',
    cursor: 'Long-lived conversation with memory across a sprint.',
    native: 'Single-run. A follow-up starts a new run with freshly compiled context.',
    status: 'MISSING_NATIVE',
    blocksCursorExit: true,
    note: 'Request-changes currently ends the run. Threading a review note into a continuation run is the next piece of work.',
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
