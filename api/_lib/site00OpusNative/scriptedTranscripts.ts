/**
 * P0.VR.OPUS-NATIVE1 — Phase 23: the first-proof transcript.
 *
 * This is a model transcript, not a runtime mock. Every tool call below is
 * executed for real by the real tool layer: the file reads hit the repository,
 * the patch really edits the working tree, the screenshots really drive
 * Chromium against the dev server, the comparison really measures pixels and
 * the tests really run vitest.
 *
 * Its purpose is to make the whole pipeline — context, tools, patch, preview,
 * screenshot QA, guards, receipts, review gate, revert — provable in CI and
 * demonstrable to the founder without an Anthropic credential and without
 * spend. When the credential is present the identical loop runs with Opus 5
 * deciding the tool calls instead of this script.
 */

import type { ScriptedTranscript } from './provider.js';

const PROOF_DIVIDER_BEFORE = '--proof-divider: #d8d8d8;';
const PROOF_DIVIDER_AFTER = '--proof-divider: #9a9a9a;';

export const FIRST_PROOF_TRANSCRIPT: ScriptedTranscript = {
  id: 'first-proof-divider',
  description:
    'Phase 23 proof: darken one test-only panel divider on the opus-native proof surface, verify it visually, and stop at founder review.',
  turns: [
    {
      text: 'Inspecting before editing, per protocol §2. Reading the project canon and the only file this run is permitted to write.',
      toolUses: [
        { name: 'read_project_context', input: {} },
        { name: 'read_file', input: { file: 'src/site00/styles/site00-opus-native.css' } },
      ],
    },
    {
      text: 'The divider token is --proof-divider: #d8d8d8, which at the proof panel size reads as almost no boundary at all. Before patching I need the current render, because protocol §8 forbids certifying from source.',
      toolUses: [
        { name: 'launch_or_refresh_preview', input: {} },
        { name: 'capture_current_render', input: { viewport: 'MOBILE' } },
      ],
    },
    {
      text: 'Patching the single divider token. This is a one-token change to a test-only surface: reversible, and scoped to the one file on the write allowlist.',
      toolUses: [
        {
          name: 'write_patch',
          input: {
            reason:
              'Darken the proof panel divider from #d8d8d8 to #9a9a9a so the compartment boundary is legible at the panel size, matching the NDXBOOK panel-divider tier rather than the micro-divider tier.',
            edits: [
              {
                file: 'src/site00/styles/site00-opus-native.css',
                find: PROOF_DIVIDER_BEFORE,
                replace: PROOF_DIVIDER_AFTER,
              },
            ],
          },
        },
      ],
    },
    {
      text: 'Re-rendering and measuring the difference rather than eyeballing it, per protocol §9.',
      toolUses: [{ name: 'capture_screenshot', input: { viewport: 'MOBILE', label: 'after' } }],
    },
    {
      text: 'Comparing the two captures and running the guards for the surface I touched.',
      toolUses: [
        { name: 'run_targeted_tests', input: { pattern: 'p0vrOpusNativeProofSurface' } },
      ],
    },
    {
      text: `Done, and stopping at the founder boundary as protocol §13 requires.

WHAT CHANGED
One token in src/site00/styles/site00-opus-native.css: --proof-divider #d8d8d8 -> #9a9a9a.

WHY
At the proof panel's size the previous value rendered as a barely-visible boundary. #9a9a9a puts the divider in the NDXBOOK panel-divider tier, which is what a compartment boundary at this level should read as, without reaching the major-section-frame weight.

VERIFICATION
Rendered the route in a real browser at 390x844 before and after, and measured the change quantitatively rather than by impression. Ran the targeted guard for the proof surface.

SCOPE
Only the test-only proof surface was touched. The canonical NDXBOOK reconstruction is read-only to this run and was not modified.

I have not applied or approved anything. The patch is in the sandbox working tree, fully reversible, awaiting your decision.`,
      stopReason: 'end_turn',
    },
  ],
};

/**
 * A second transcript that deliberately tries to write outside its boundary.
 * It exists so the scope firewall is proven by exercise rather than asserted,
 * which is the difference between a guard and a comment.
 */
export const FIREWALL_PROBE_TRANSCRIPT: ScriptedTranscript = {
  id: 'firewall-probe',
  description: 'Attempts a write to the firewalled canonical reconstruction; must be refused.',
  turns: [
    {
      text: 'Attempting to edit the canonical reconstruction stylesheet.',
      toolUses: [
        {
          name: 'write_patch',
          input: {
            reason: 'probe',
            edits: [
              {
                file: 'src/site00/styles/site00-twin-opus-direct.css',
                find: '.tod-screen',
                replace: '.tod-screen-probe',
              },
            ],
          },
        },
      ],
    },
    { text: 'Refused by the tool layer, as expected. Stopping.', stopReason: 'end_turn' },
  ],
};

const TRANSCRIPTS: Record<string, ScriptedTranscript> = {
  [FIRST_PROOF_TRANSCRIPT.id]: FIRST_PROOF_TRANSCRIPT,
  [FIREWALL_PROBE_TRANSCRIPT.id]: FIREWALL_PROBE_TRANSCRIPT,
};

export function getScriptedTranscript(id: string): ScriptedTranscript | null {
  return TRANSCRIPTS[id] ?? null;
}

export function listScriptedTranscripts(): Array<{ id: string; description: string }> {
  return Object.values(TRANSCRIPTS).map((t) => ({ id: t.id, description: t.description }));
}

export const PROOF_DIVIDER_TOKENS = { before: PROOF_DIVIDER_BEFORE, after: PROOF_DIVIDER_AFTER };
