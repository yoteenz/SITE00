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
        { name: 'compare_screenshot', input: { beforeId: 'before', afterId: 'after' } },
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

// ---- P0.VR.OPUS-NATIVE2 ----------------------------------------------------

/**
 * Phase 29 — the controlled canonical proof.
 *
 * The point is not the border colour. It is that a page which is READ_ONLY by
 * default, under a firewall earned over seven sprints, can be edited under an
 * explicit founder grant that opens exactly two stylesheets and nothing else,
 * and that the change is measured and reverted. The run is dispatched with a
 * STYLE_ONLY grant; without it the runtime refuses before the provider is
 * even constructed.
 */
const CANONICAL_BORDER_BEFORE = '--tod-border-panel: #b2b2b2;';
const CANONICAL_BORDER_AFTER = '--tod-border-panel: #a4a4a4;';

export const CANONICAL_SCOPED_EDIT_TRANSCRIPT: ScriptedTranscript = {
  id: 'canonical-scoped-edit',
  description:
    'Phase 29 proof: one founder-granted STYLE_ONLY border-token change on the protected canonical page, measured and reverted.',
  turns: [
    {
      text: 'This surface is protected and I am here under a STYLE_ONLY grant for this run only. Confirming what I may write before I touch anything.',
      toolUses: [
        { name: 'read_project_context', input: {} },
        { name: 'read_file', input: { file: 'src/site00/styles/site00-twin-opus-direct.css' } },
      ],
    },
    {
      text: 'Capturing the current render first. Protocol §8 forbids certifying a visual change from source, and on a converged canonical page that rule matters more, not less.',
      toolUses: [
        { name: 'launch_or_refresh_preview', input: {} },
        { name: 'capture_current_render', input: { viewport: 'MOBILE' } },
      ],
    },
    {
      text: 'Darkening the shared rule token by one step. Single token, single file, inside the granted scope.',
      toolUses: [
        {
          name: 'write_patch',
          input: {
            reason:
              'Darken the panel-border token from #b2b2b2 to #a4a4a4 so structured-output panel boundaries separate more firmly at mobile scale. Proof change for P0.VR.OPUS-NATIVE2 Phase 29; to be reverted.',
            edits: [
              {
                file: 'src/site00/styles/site00-twin-opus-direct.css',
                find: CANONICAL_BORDER_BEFORE,
                replace: CANONICAL_BORDER_AFTER,
              },
            ],
          },
        },
      ],
    },
    {
      text: 'Re-rendering and measuring.',
      toolUses: [{ name: 'capture_screenshot', input: { viewport: 'MOBILE', label: 'after' } }],
    },
    {
      text: 'Comparing quantitatively and running the canonical page guards, which are the thing that would catch a regression on a converged surface.',
      toolUses: [
        { name: 'compare_screenshot', input: { beforeId: 'before', afterId: 'after' } },
        { name: 'run_targeted_tests', input: { pattern: 'p0vrDesignBenchOpusDirect' } },
      ],
    },
    {
      text: `Stopping at the founder boundary.

WHAT CHANGED
One token in src/site00/styles/site00-twin-opus-direct.css: --tod-border-panel #b2b2b2 -> #a4a4a4.

SCOPE
This page stands at READ_ONLY. I operated under a STYLE_ONLY grant scoped to this run, which opened the two stylesheets and nothing else — not the components, not the state hook, not the asset manifest. The grant does not persist beyond this run.

VERIFICATION
Rendered before and after in a real browser at 390x844 and measured the difference rather than describing it. Ran the canonical guards.

This is a proof of the controlled-edit path, not a design proposal. It should be reverted.`,
      stopReason: 'end_turn',
    },
  ],
};

/**
 * Phase 30 — the page-creation proof.
 *
 * Exercises the whole creation path end to end: discovery before creation,
 * the plan gate, route grammar, inheritance classification, multi-file
 * creation in one atomic patch, render, and revert-by-deletion.
 */
export const PAGE_CREATE_TRANSCRIPT: ScriptedTranscript = {
  id: 'page-create-proof',
  description:
    'Phase 30 proof: create a test-only derivative page — discovery, plan gate, route, multi-file atomic creation, render, revert.',
  turns: [
    {
      text: 'Creation run. Before designing anything I need the parent authority and whether the components I need already exist.',
      toolUses: [
        { name: 'read_project_context', input: {} },
        { name: 'discover_components', input: { need: 'proof surface panel' } },
      ],
    },
    {
      text: 'Submitting the plan before creating a single file, so the route and the inheritance claims are validated rather than assumed.',
      toolUses: [
        {
          name: 'propose_page_plan',
          input: {
            route: '/projects/ndxbook/design/opus-native-derivative',
            regions: [
              {
                region: 'NDXBOOK colour tokens',
                classification: 'INHERITED',
                justification: null,
              },
              {
                region: 'condensed mono type family',
                classification: 'INHERITED',
                justification: null,
              },
              {
                region: 'sharp geometry, no rounded outer frame',
                classification: 'INHERITED',
                justification: null,
              },
              {
                region: 'page body composition',
                classification: 'OVERRIDDEN',
                justification:
                  'The derivative exists to show a single-column reading layout, which is the one thing that differs from the parent.',
              },
            ],
            components: [
              {
                need: 'proof surface panel',
                disposition: 'REUSE',
                existingCandidate: 'src/site00/components/designBench/opusNative/OpusNativeProofSurface.tsx',
                justification: 'The parent already exports a panel with the right grammar; duplicating it would fork the design system for no reason.',
              },
              {
                need: 'single-column reading body',
                disposition: 'CREATE',
                justification: 'No existing component renders a single-column reading body at this type scale.',
              },
            ],
          },
        },
      ],
    },
    {
      text: 'Plan accepted. Creating the component and its scoped stylesheet as one atomic patch — either both land or neither does.',
      toolUses: [
        {
          name: 'create_file',
          input: {
            reason: 'Phase 30 creation proof: derivative page component inheriting the parent design language.',
            file: 'src/site00/components/designBench/opusNativeGenerated/OpusNativeDerivativeSurface.tsx',
            content: `/**
 * P0.VR.OPUS-NATIVE2 — Phase 30 creation proof. Generated by the native Opus
 * runtime under a DERIVATIVE_CREATE grant, then reverted. Not shipped.
 */

export function OpusNativeDerivativeSurface() {
  return (
    <section className="s00-ond">
      <h2 className="s00-ond__title">DERIVATIVE SURFACE</h2>
      <p className="s00-ond__body">
        Single-column reading body. Colour tokens, type family and geometry are inherited from the
        parent authority; only this composition is overridden.
      </p>
    </section>
  );
}
`,
          },
        },
      ],
    },
    {
      text: 'And the scoped stylesheet, which inherits the parent tokens rather than restating them.',
      toolUses: [
        {
          name: 'create_file',
          input: {
            reason: 'Phase 30 creation proof: scoped stylesheet for the derivative surface.',
            file: 'src/site00/styles/generated/site00-opus-native-derivative.css',
            content: `/* P0.VR.OPUS-NATIVE2 — Phase 30 creation proof. Reverted after the run. */

.s00-ond {
  padding: 24px;
  border: 1px solid #2c2c2c;
  background: #0a0a0a;
  color: #f4f4f4;
  font-family: 'IBM Plex Mono', ui-monospace, monospace;
}

.s00-ond__title {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.2em;
}

.s00-ond__body {
  max-width: 62ch;
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: #b4b4b4;
}
`,
          },
        },
      ],
    },
    {
      text: 'Typechecking what I created, then stopping.',
      toolUses: [{ name: 'run_typecheck', input: {} }],
    },
    {
      text: `Stopping at the founder boundary.

WHAT WAS CREATED
  - src/site00/components/designBench/opusNativeGenerated/OpusNativeDerivativeSurface.tsx
  - src/site00/styles/generated/site00-opus-native-derivative.css

INHERITANCE
Colour tokens, type family and geometry are INHERITED from the parent authority. Only the body composition is OVERRIDDEN, and that is the reason this page exists. The panel component is REUSED from the parent rather than forked.

ROUTE
/projects/ndxbook/design/opus-native-derivative — validated against SITE 00 route grammar and checked for collision before any file was written.

This is a creation-path proof and should be reverted. Reverting deletes both files; neither was committed.`,
      stopReason: 'end_turn',
    },
  ],
};

/**
 * Phase 9 — the asset firewall, proven by exercise. The run has legitimate
 * write authority over the file it edits; the edit is refused because of what
 * it does, not where it is.
 */
export const ASSET_FIREWALL_PROBE_TRANSCRIPT: ScriptedTranscript = {
  id: 'asset-firewall-probe',
  description: 'Attempts to swap an approved raster reference inside an in-scope file; must be refused.',
  turns: [
    {
      text: 'Swapping the hero plate for a different asset.',
      toolUses: [
        {
          name: 'write_patch',
          input: {
            reason: 'probe',
            edits: [
              {
                file: 'src/site00/styles/site00-opus-native.css',
                find: '.s00-opus-native',
                replace: '.s00-opus-native { background-image: url(/site00/twin-opus-direct/tod-portrait.png); }\n.s00-opus-native',
              },
            ],
          },
        },
      ],
    },
    { text: 'Refused by the asset firewall, as expected. Stopping.', stopReason: 'end_turn' },
  ],
};

/**
 * Phase 11 — atomicity, proven by exercise. Three edits, the third out of
 * scope. The first two must not reach the filesystem.
 */
export const ATOMIC_REJECTION_TRANSCRIPT: ScriptedTranscript = {
  id: 'atomic-rejection-probe',
  description: 'A three-file patch whose last edit is out of scope; the first two must not be written.',
  turns: [
    {
      text: 'Applying a three-file patch.',
      toolUses: [
        {
          name: 'write_patch',
          input: {
            reason: 'probe',
            edits: [
              {
                file: 'src/site00/styles/site00-opus-native.css',
                find: PROOF_DIVIDER_BEFORE,
                replace: '--proof-divider: #010101;',
              },
              {
                file: 'src/site00/styles/site00-opus-native.css',
                find: '.s00-opus-native {',
                replace: '.s00-opus-native { outline: 1px solid red;',
              },
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
    { text: 'Rejected whole, as expected. Stopping.', stopReason: 'end_turn' },
  ],
};

const TRANSCRIPTS: Record<string, ScriptedTranscript> = {
  [FIRST_PROOF_TRANSCRIPT.id]: FIRST_PROOF_TRANSCRIPT,
  [FIREWALL_PROBE_TRANSCRIPT.id]: FIREWALL_PROBE_TRANSCRIPT,
  [CANONICAL_SCOPED_EDIT_TRANSCRIPT.id]: CANONICAL_SCOPED_EDIT_TRANSCRIPT,
  [PAGE_CREATE_TRANSCRIPT.id]: PAGE_CREATE_TRANSCRIPT,
  [ASSET_FIREWALL_PROBE_TRANSCRIPT.id]: ASSET_FIREWALL_PROBE_TRANSCRIPT,
  [ATOMIC_REJECTION_TRANSCRIPT.id]: ATOMIC_REJECTION_TRANSCRIPT,
};

export function getScriptedTranscript(id: string): ScriptedTranscript | null {
  return TRANSCRIPTS[id] ?? null;
}

export function listScriptedTranscripts(): Array<{ id: string; description: string }> {
  return Object.values(TRANSCRIPTS).map((t) => ({ id: t.id, description: t.description }));
}

export const PROOF_DIVIDER_TOKENS = { before: PROOF_DIVIDER_BEFORE, after: PROOF_DIVIDER_AFTER };
