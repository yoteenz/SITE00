/**
 * Gate A production E2E — disposable client, no Anthony PII.
 * Uses shared Supabase (same as api.site00.com) + production API host.
 */
import { createArtifactForLead } from '../../api/_lib/digitalFoundation/service.js';
import {
  loadArtifactGraphByToken,
  persistArtifactGraph,
  reloadArtifactFromSupabaseForTest,
  syncAllArtifactsIntoMemory,
} from '../../api/_lib/digitalFoundation/persistence/supabaseStore.js';
import { getSupabaseAdmin } from '../../api/_lib/supabase.js';
import { getArtifactPayload } from '../../api/_lib/digitalFoundation/service.js';

const API = process.env.SITE00_PRODUCTION_API ?? 'https://api.site00.com';
const DISPOSABLE = {
  business_name: 'Gate A Disposable QA LLC',
  contact_name: 'QA Client',
  contact_email: `gate-a-disposable+${Date.now()}@example.invalid`,
};

async function apiGet(path) {
  const res = await fetch(`${API}${path}`, { headers: { Accept: 'application/json' } });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

async function apiPost(path, body) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

const report = { steps: [] };
function step(name, pass, detail) {
  report.steps.push({ name, pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'} ${name}: ${detail}`);
}

process.env.SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE = '1';

const health = await apiGet('/api/health');
step('health', health.status === 200 && health.json.ok, `status=${health.status} sha=${health.json.gitCommit}`);

const artifact = createArtifactForLead(DISPOSABLE);
const token = artifact.public_token;
await persistArtifactGraph(artifact.artifact_id);
step('local persist', true, `artifact_id=${artifact.artifact_id}`);

const reloaded = await reloadArtifactFromSupabaseForTest(token);
step('supabase reload', reloaded?.artifact_id === artifact.artifact_id, reloaded ? 'row ok' : 'missing row');

const payload1 = await apiGet(`/api/site00/digital-foundation-artifact?action=payload&token=${encodeURIComponent(token)}`);
step(
  'production payload',
  payload1.status === 200 && payload1.json?.artifact?.artifact_id,
  `status=${payload1.status} err=${payload1.json?.error ?? 'none'}`,
);

const save = await apiPost(`/api/site00/digital-foundation-artifact?token=${encodeURIComponent(token)}`, {
  action: 'update-intake',
  intake: { business_name: DISPOSABLE.business_name, current_email: DISPOSABLE.contact_email },
});
step('production save', save.status === 200, `status=${save.status}`);

const submit = await apiPost(`/api/site00/digital-foundation-artifact?token=${encodeURIComponent(token)}`, {
  action: 'update-intake',
  intake: { business_name: 'Updated Gate A QA', current_email: DISPOSABLE.contact_email },
  markComplete: true,
});
step('production submit', submit.status === 200, `status=${submit.status}`);

await new Promise((r) => setTimeout(r, 4000));

const { data: dbRow } = await getSupabaseAdmin()
  .from('site00_df_artifacts')
  .select('intake_state, state')
  .eq('artifact_id', artifact.artifact_id)
  .single();
step(
  'intake complete persisted',
  dbRow?.intake_state === 'COMPLETE',
  `intake_state=${dbRow?.intake_state}`,
);

await loadArtifactGraphByToken(token);
await syncAllArtifactsIntoMemory();
const founderView = getArtifactPayload(artifact.artifact_id);
step(
  'founder retrieval',
  founderView?.artifact?.intake_state === 'COMPLETE',
  `intake_state=${founderView?.artifact?.intake_state}`,
);

const payload2 = await apiGet(`/api/site00/digital-foundation-artifact?action=payload&token=${encodeURIComponent(token)}`);
step(
  'production payload after submit',
  payload2.status === 200 && payload2.json?.artifact?.intake_state === 'COMPLETE',
  `status=${payload2.status} intake_state=${payload2.json?.artifact?.intake_state}`,
);

report.pass = report.steps.every((s) => s.pass);
report.token_redacted = `${token.slice(0, 6)}…`;
report.artifact_id = artifact.artifact_id;
console.log(JSON.stringify(report, null, 2));
process.exit(report.pass ? 0 : 1);
