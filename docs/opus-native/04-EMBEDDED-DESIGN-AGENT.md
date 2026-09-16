# Embedded design agent (`P0.VR.OPUS-NATIVE2`)

NATIVE1 produced a runtime on a laboratory route. NATIVE2 moves it into the
DESIGN workspace and gives it enough authority to do real page work without
handing an agent the repository.

## Where the founder works now

The agent is a right-edge dock (`DesignAgentDock`) mounted as a sibling of the
page it serves, never inside it: the canonical reconstruction is under a write
firewall and is CSS-scaled, so an agent panel mounted within it would both
modify protected source and inherit a transform that makes the panel
illegible. The dock renders on any registered design surface and targets what
the founder is already looking at — project, page, route, view mode, viewport
and golden are read from the router, the registry and the shell's own
presentation state rather than typed.

`/projects/:projectSlug/design/opus-native` is preserved as the diagnostic
route: provider state, tool inventory, preview readiness and scripted replays.

## Write authority is a ladder, not a switch

`READ_ONLY → STYLE_ONLY → COMPONENT_ONLY → PAGE_EDIT → PAGE_CREATE → DERIVATIVE_CREATE`

Each surface declares a **standing mode** (what an agent has by default) and a
**ceiling** (`maxGrantableWriteMode`, the most a founder can grant at all). An
intent implies a required mode; when the required mode exceeds the standing
mode the run is refused before any spend with `WRITE_ACCESS_REQUIRED`, and the
dock shows the page, the exact files the grant would open, the capability
requested and the reason. A grant applies to one run.

The canonical page `twin-opus-direct` stands at `READ_ONLY` with a ceiling of
`COMPONENT_ONLY`: a founder can authorise a border-token correction and cannot
accidentally authorise page creation on the approved reconstruction.

## The asset firewall reads edits, not paths

Grok owns generated raster identity. `checkAssetMutation` inspects the content
of a proposed edit, so swapping an image reference inside a stylesheet the
agent is legitimately allowed to write is refused. `ASSET_MUTATION_ALLOWED` is
false unless a founder grant says otherwise.

## Patches are atomic

`applyPatch` plans and validates every edit and creation — scope, creatability,
anchor uniqueness, overwrite, asset guard — before writing a single byte. A
multi-file patch with one out-of-scope file changes nothing on disk. Creation
is a first-class part of the patch record, so revert deletes files the run
made as well as restoring the bytes it changed.

## Page creation is gated on a plan

`CREATE_*` intents require a `PageCreationContract`, and the model must get a
`propose_page_plan` accepted before `create_file` will do anything. The plan is
checked mechanically: route grammar and collisions, region classification
(`INHERITED` / `OVERRIDDEN` / `NEW`, each override justified, parent-required
regions forced to `INHERITED`), and a component disposition (`REUSE` /
`EXTEND` / `FORK` / `CREATE`) for each need, which must follow a
`discover_components` search.

## Preview

The NATIVE1 failure was a hard-bound `127.0.0.1:5174`, which does not exist in
a deployed environment. `previewEnvironment.ts` resolves per environment and
reports a named state — `PREVIEW_ORIGIN_UNCONFIGURED`, `BROWSER_NOT_INSTALLED`,
`PREVIEW_PROCESS_NOT_RUNNING`, `ROUTE_404`,
`PREVIEW_NOT_SUPPORTED_IN_THIS_ENVIRONMENT` — each with a remedy and no secret.

## Sessions and continuation

`DesignAgentSession` is scoped to a project/page/task thread and holds run
lineage, founder feedback, patches and visual snapshots. REQUEST CHANGES starts
a continuation run with `parentRunId` and a compacted `SESSION_STATE` block
(current task, approved facts, failed approaches, current design state, open
request, latest screenshot, patch state) rather than a replayed transcript.

## Mode fit

A mode whose hard ceiling the projected cost would hit mid-loop is refused at
estimate time with a recommendation, because a run that stops between "patch"
and "compare" leaves an unverified edit on disk — which is worse than not
running.

## Local operation

The dock reads the surface registry over the API. A Vite dev server without the
API proxy serves `/api/...` as source, the registry read fails, and the dock
renders as `AGENT UNAVAILABLE` with the remedy rather than hiding:

```bash
PORT=3001 npm run start:api
VITE_DEV_PROXY_TARGET=http://127.0.0.1:3001 npx vite --port 5190 --host 127.0.0.1
```

On a cloud VM, also clear `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME` for that shell:
otherwise the HMR client points at the tunnel, fails its handshake and reloads
the page every few hundred milliseconds, which resets any panel state.

## Proofs

`node scripts/design-bench/opus-native2/proofs.mjs` drives the real endpoint
and records every claim this sprint makes. Only the model's decisions are
scripted; the tools execute for real.
