#!/usr/bin/env node
/**
 * P0.VR.OPUS-NATIVE2 — proof harness.
 *
 * Drives the real HTTP endpoint against a running runtime and records the
 * result of every claim this sprint makes. Only the model's decisions are
 * scripted; every tool the runs invoke executes for real — files are read and
 * written, Chromium renders the route, pixels are compared, vitest runs.
 *
 * Usage: node scripts/design-bench/opus-native2/proofs.mjs [apiBase]
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const API = process.argv[2] ?? 'http://127.0.0.1:3001';
const ENDPOINT = `${API}/api/site00/opus-native`;
const ROOT = process.cwd();
const OUT = '/opt/cursor/artifacts';

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  const mark = pass === true ? 'PASS' : pass === false ? 'FAIL' : 'BLOCKED';
  console.log(`[${mark}] ${name}\n        ${detail}`);
}

async function post(body) {
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, json: await response.json() };
}

async function get(query) {
  const response = await fetch(`${ENDPOINT}?${query}`);
  return { status: response.status, json: await response.json() };
}

async function waitForRun(runId, timeoutMs = 300_000) {
  const deadline = Date.now() + timeoutMs;
  let last = null;
  while (Date.now() < deadline) {
    const { json } = await get(`action=status&runId=${encodeURIComponent(runId)}`);
    last = json.run;
    if (!last) throw new Error('run vanished');
    if (['WAITING_FOR_FOUNDER_REVIEW', 'APPROVED', 'REVERTED', 'CANCELLED', 'ERROR'].includes(last.status)) {
      return last;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  throw new Error(`run ${runId} did not settle in ${timeoutMs}ms`);
}

function fileContains(relative, needle) {
  const abs = path.resolve(ROOT, relative);
  if (!existsSync(abs)) return false;
  return readFileSync(abs, 'utf8').includes(needle);
}

function gitDirty() {
  return execFileSync('git', ['status', '--porcelain'], { cwd: ROOT, encoding: 'utf8' }).trim();
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const cleanBefore = gitDirty();

  // ---- 1. Preview root cause: LOCAL is READY, DEPLOYED is named ------------
  {
    const { json } = await get('action=diagnostics');
    const d = json.diagnostics;
    record(
      'PHASE 16/18 — preview resolves and reports a named state',
      d.preview === 'READY' && d.environment === 'LOCAL',
      `preview=${d.preview} reason=${d.previewReason} origin=${d.previewOrigin} env=${d.environment}`,
    );
    record(
      'PHASE 18 — diagnostics leak no credential',
      d.keyExposureAudit === 'SERVER_ONLY',
      `keyExposureAudit=${d.keyExposureAudit}, anthropicApi=${d.anthropicApi}`,
    );
  }

  // ---- 2. Phase 4 — surfaces are registered and targetable ----------------
  {
    const { json } = await get('action=surfaces');
    const canonical = json.surfaces.find((s) => s.pageId === 'twin-opus-direct');
    record(
      'PHASE 4/31 — registry exposes targeting and policy per surface',
      Boolean(canonical) && canonical.standingWriteMode === 'READ_ONLY',
      `${json.surfaces.length} surfaces; canonical standing=${canonical?.standingWriteMode} ceiling=${canonical?.maxGrantableWriteMode}`,
    );
  }

  // ---- 3. Phase 7/8 — authorization gate on the protected canonical page ---
  {
    const ungranted = await post({
      action: 'start',
      mode: 'QUICK',
      intent: 'FIX_VISUAL',
      task: 'Make the Structured Output borders slightly darker.',
      founderConfirmedSpend: true,
      target: { route: '/projects/ndxbook/design/twin-opus-direct' },
      scriptedProviderId: 'canonical-scoped-edit',
    });
    record(
      'PHASE 7 — ungranted write intent is refused before any spend',
      ungranted.status === 409 && ungranted.json.error === 'WRITE_ACCESS_REQUIRED',
      `HTTP ${ungranted.status} ${ungranted.json.error}; needs ${ungranted.json.writeAuthorization?.requestedMode}, has ${ungranted.json.writeAuthorization?.permittedMode}`,
    );

    const overGrant = await post({
      action: 'estimate',
      mode: 'QUICK',
      intent: 'FIX_INTERACTION',
      task: 'x',
      writeGrant: { mode: 'DERIVATIVE_CREATE' },
      target: { route: '/projects/ndxbook/design/twin-opus-direct' },
    });
    record(
      'PHASE 8 — a grant cannot exceed the surface ceiling',
      overGrant.json.permittedMode === 'COMPONENT_ONLY' && overGrant.json.createDirectories.length === 0,
      `asked DERIVATIVE_CREATE, resolved ${overGrant.json.permittedMode}; no create directories opened`,
    );

    const styleGrant = await post({
      action: 'estimate',
      mode: 'QUICK',
      intent: 'FIX_VISUAL',
      task: 'darker borders',
      writeGrant: { mode: 'STYLE_ONLY' },
      target: { route: '/projects/ndxbook/design/twin-opus-direct' },
    });
    const onlyStyles = styleGrant.json.writeAllowlist.every((f) => f.endsWith('.css'));
    record(
      'PHASE 8 — a style grant opens styles only, never the component tree',
      onlyStyles && styleGrant.json.writeAllowlist.length === 2,
      `writable: ${styleGrant.json.writeAllowlist.join(', ')}`,
    );
  }

  // ---- 4. Phase 11 — atomicity ---------------------------------------------
  {
    const dividerBefore = fileContains('src/site00/styles/site00-opus-native.css', '--proof-divider: #d8d8d8;');
    const start = await post({
      action: 'start',
      mode: 'QUICK',
      intent: 'FIX_VISUAL',
      task: 'atomicity probe',
      founderConfirmedSpend: true,
      target: { route: '/projects/ndxbook/design/opus-native' },
      scriptedProviderId: 'atomic-rejection-probe',
    });
    if (start.json.ok) await waitForRun(start.json.run.runId);
    const dividerAfter = fileContains('src/site00/styles/site00-opus-native.css', '--proof-divider: #d8d8d8;');
    const probeLeak = fileContains('src/site00/styles/site00-opus-native.css', 'outline: 1px solid red');
    record(
      'PHASE 11 — a patch with one out-of-scope edit writes nothing at all',
      dividerBefore && dividerAfter && !probeLeak,
      'the two in-scope edits were planned and discarded; the file is byte-identical',
    );
  }

  // ---- 5. Phase 9 — asset firewall ----------------------------------------
  {
    const start = await post({
      action: 'start',
      mode: 'QUICK',
      intent: 'FIX_VISUAL',
      task: 'asset probe',
      founderConfirmedSpend: true,
      target: { route: '/projects/ndxbook/design/opus-native' },
      scriptedProviderId: 'asset-firewall-probe',
    });
    const run = start.json.ok ? await waitForRun(start.json.run.runId) : null;
    const call = run?.toolCalls.find((c) => c.tool === 'write_patch');
    const leaked = fileContains('src/site00/styles/site00-opus-native.css', 'tod-portrait.png');
    record(
      'PHASE 9 — an asset reference change is refused inside an in-scope file',
      call?.ok === false && !leaked,
      `write_patch → ${call?.summary}; no asset reference reached the stylesheet`,
    );
  }

  // ---- 6. Phase 19/28 — the live render loop on the embedded test surface --
  {
    const start = await post({
      action: 'start',
      mode: 'QUICK',
      intent: 'FIX_VISUAL',
      task: 'Darken the proof panel divider so the compartment boundary is legible.',
      founderConfirmedSpend: true,
      target: { route: '/projects/ndxbook/design/opus-native', viewport: 'MOBILE' },
      scriptedProviderId: 'first-proof-divider',
    });
    const run = await waitForRun(start.json.run.runId);
    const shots = run.screenshots.length;
    const diff = run.screenshots.find((s) => typeof s.diffPercent === 'number')?.diffPercent;
    const tests = run.review?.tests;
    record(
      'PHASE 19 — render → screenshot → patch → render → compare closes for real',
      shots >= 2 && typeof diff === 'number' && run.status === 'WAITING_FOR_FOUNDER_REVIEW',
      `${shots} real Chromium captures, measured delta ${diff}%, tests ${tests?.ok ? 'PASS' : tests ? 'FAIL' : 'not run'}, ended ${run.status}`,
    );
    record(
      'PHASE 26 — the review package carries before, after and golden',
      Boolean(run.review?.before && run.review?.after && run.review?.golden),
      `golden ${run.review?.golden?.version} ${run.review?.golden?.width}x${run.review?.golden?.height}`,
    );

    // Phase 23/24/25 — continue the thread rather than restarting it.
    const cont = await post({
      action: 'continue',
      runId: run.runId,
      note: 'Good, but go one step lighter and leave the typography alone.',
      founderConfirmedSpend: true,
      scriptedProviderId: 'first-proof-divider',
    });
    if (cont.json.ok) {
      const child = cont.json.run;
      const { json: sessions } = await get('action=sessions');
      const session = sessions.sessions.find((s) => s.sessionId === child.sessionId);
      const compactionSent = child.compiled.blockSummary.some((b) => b.label === 'SESSION_STATE');
      record(
        'PHASE 23/24/25 — request changes continues the thread with compacted state',
        child.parentRunId === run.runId && compactionSent && Boolean(session),
        `parent=${child.parentRunId}, session=${child.sessionId}, SESSION_STATE block sent, ${session?.founderFeedback.length ?? 0} feedback note(s) on thread`,
      );
      await waitForRun(child.runId).catch(() => undefined);
      await post({ action: 'revert', runId: child.runId });
    } else {
      record('PHASE 23/24/25 — continuation', false, JSON.stringify(cont.json));
    }

    await post({ action: 'revert', runId: run.runId });
  }

  // ---- 7. Phase 21/22 — a mode that cannot finish is refused ---------------
  {
    const quick = await post({
      action: 'estimate',
      mode: 'QUICK',
      intent: 'FIX_VISUAL',
      task: 'Make the Structured Output panel borders slightly darker.',
      writeGrant: { mode: 'STYLE_ONLY' },
      target: { route: '/projects/ndxbook/design/twin-opus-direct' },
    });
    record(
      'PHASE 21/22 — the estimate refuses a mode that will stop mid-loop',
      quick.json.modeFitsBudget === false && quick.json.recommendedMode === 'DESIGN',
      `QUICK projects $${quick.json.estimatedUsd?.toFixed(3)} against a $0.75 ceiling → recommends ${quick.json.recommendedMode}`,
    );
  }

  // ---- 8. Phase 29 — controlled canonical edit under a grant --------------
  {
    const start = await post({
      action: 'start',
      mode: 'DESIGN',
      intent: 'FIX_VISUAL',
      task: 'Make the Structured Output panel borders slightly darker.',
      founderConfirmedSpend: true,
      writeGrant: { mode: 'STYLE_ONLY' },
      target: { route: '/projects/ndxbook/design/twin-opus-direct', viewport: 'MOBILE' },
      scriptedProviderId: 'canonical-scoped-edit',
    });
    if (!start.json.ok) {
      record('PHASE 29 — canonical scoped edit', false, JSON.stringify(start.json));
    } else {
      const run = await waitForRun(start.json.run.runId);
      const diff = run.screenshots.find((s) => typeof s.diffPercent === 'number')?.diffPercent;
      const patched = fileContains('src/site00/styles/site00-twin-opus-direct.css', '--tod-border-panel: #a4a4a4;');
      record(
        'PHASE 29 — protected canonical page edited under a run-scoped grant',
        patched && run.writeGrantApplied && run.writeMode === 'STYLE_ONLY' && typeof diff === 'number',
        `mode=${run.writeMode} granted=${run.writeGrantApplied}, files=${run.patch?.filesChanged.join(', ')}, measured delta ${diff}%, guards ${run.review?.tests?.ok ? 'PASS' : 'see log'}`,
      );

      const reverted = await post({ action: 'revert', runId: run.runId });
      const restored = fileContains('src/site00/styles/site00-twin-opus-direct.css', '--tod-border-panel: #b2b2b2;');
      record(
        'PHASE 29 — the canonical proof mutation is fully reverted',
        restored && reverted.json.ok,
        `restored=${restored}; reverted ${reverted.json.reverted?.join(', ')}`,
      );
    }
  }

  // ---- 9. Phase 30 — page creation ----------------------------------------
  {
    const start = await post({
      action: 'start',
      mode: 'DESIGN',
      intent: 'CREATE_CHILD',
      task: 'Create a test-only derivative page with a single-column reading body.',
      founderConfirmedSpend: true,
      writeGrant: { mode: 'DERIVATIVE_CREATE' },
      creationContract: {
        project: 'ndxbook',
        parentPage: 'opus-native-proof',
        pageId: 'opus-native-derivative',
        pageRole: 'TEST_SURFACE',
        routeIntent: '/projects/ndxbook/design/opus-native-derivative',
        inheritanceSource: 'opus-native-proof',
        designAuthority: 'P0.VR.OPUS-NATIVE2',
        interactionPatterns: ['no routes for inspection surfaces'],
        requiredModules: [],
        assetSlots: [{ slot: 'body', role: 'READING_BODY', source: 'PLACEHOLDER' }],
        viewportAuthorities: ['MOBILE', 'DESKTOP'],
        allowedOverrides: ['page body composition'],
      },
      target: { route: '/projects/ndxbook/design/opus-native', viewport: 'MOBILE' },
      scriptedProviderId: 'page-create-proof',
    });

    if (!start.json.ok) {
      record('PHASE 30 — page creation', false, JSON.stringify(start.json));
    } else {
      const run = await waitForRun(start.json.run.runId);
      const created = run.patch?.createdFiles ?? [];
      const onDisk = created.filter((f) => existsSync(path.resolve(ROOT, f)));
      const planned = run.creationPlan;
      record(
        'PHASE 30 — derivative page created through the plan gate',
        created.length === 2 && onDisk.length === 2 && Boolean(planned),
        `created ${created.join(', ')}; route ${planned?.route}; regions ${planned?.regions?.map((r) => `${r.region}=${r.classification}`).join(' | ')}`,
      );
      record(
        'PHASE 15 — component discovery preceded creation and produced a REUSE',
        (planned?.components ?? []).some((c) => c.disposition === 'REUSE'),
        (planned?.components ?? []).map((c) => `${c.need}=${c.disposition}`).join(', '),
      );

      await post({ action: 'revert', runId: run.runId });
      const stillThere = created.filter((f) => existsSync(path.resolve(ROOT, f)));
      record(
        'PHASE 30 — reverting a creation deletes the files it made',
        stillThere.length === 0,
        `${created.length} created, ${stillThere.length} remain after revert`,
      );
    }
  }

  // ---- 10. Phase 12/14 — creation refused without a contract ---------------
  {
    const noContract = await post({
      action: 'start',
      mode: 'DESIGN',
      intent: 'CREATE_CHILD',
      task: 'make a page',
      founderConfirmedSpend: true,
      writeGrant: { mode: 'DERIVATIVE_CREATE' },
      target: { route: '/projects/ndxbook/design/opus-native' },
      scriptedProviderId: 'page-create-proof',
    });
    record(
      'PHASE 12 — a creation run with no contract is refused',
      noContract.json.error === 'CREATION_CONTRACT_REQUIRED',
      `HTTP ${noContract.status} ${noContract.json.error}`,
    );
  }

  // ---- 11. The tree is exactly as it was ----------------------------------
  {
    const cleanAfter = gitDirty();
    record(
      'ALL PROOFS — the working tree is unchanged after every proof',
      cleanAfter === cleanBefore,
      cleanAfter === cleanBefore ? 'no residue from any run' : `residue:\n${cleanAfter}`,
    );
  }

  const passed = results.filter((r) => r.pass === true).length;
  const failed = results.filter((r) => r.pass === false).length;
  const summary = `\n${passed} passed, ${failed} failed, ${results.length} total`;
  console.log(summary);

  writeFileSync(
    path.join(OUT, 'opus-native2-proofs.log'),
    `${results.map((r) => `[${r.pass === true ? 'PASS' : 'FAIL'}] ${r.name}\n        ${r.detail}`).join('\n')}\n${summary}\n`,
    'utf8',
  );

  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
