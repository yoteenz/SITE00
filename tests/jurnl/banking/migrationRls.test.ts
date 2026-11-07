/**
 * Database + RLS security tests on a disposable Postgres (PGlite) with every JURNL migration applied.
 * Synthetic data only. No hosted database is touched.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import type { PGlite } from '@electric-sql/pglite';
import { asUser, createUser, freshDb, jurnlMigrationFiles } from './harness';

let db: PGlite;
let alice: string;
let bob: string;

async function seedItem(owner: string, providerItemId: string) {
  const r = await db.query<{ item_id: string }>(
    `insert into public.jurnl_bank_items (user_id, provider, provider_env, provider_item_id, institution_name) values ($1,'PLAID','sandbox',$2,'SYNTHETIC BANK') returning item_id`,
    [owner, providerItemId],
  );
  const itemId = r.rows[0].item_id;
  await db.query(`insert into public.jurnl_bank_item_secrets (item_id, user_id, key_version, iv, ciphertext, auth_tag) values ($1,$2,1,'iv','ct','tag')`, [itemId, owner]);
  await db.query(`insert into public.jurnl_bank_accounts (user_id, item_id, provider_account_id, name, type, current_balance) values ($1,$2,'acc-1','CHECKING','depository',100)`, [owner, itemId]);
  await db.query(`insert into public.jurnl_bank_transactions (user_id, item_id, provider_account_id, provider_transaction_id, pending, amount, date) values ($1,$2,'acc-1','tx-1',false,12.5,'2026-11-01')`, [owner, itemId]);
  return itemId;
}

beforeEach(async () => {
  db = await freshDb();
  alice = await createUser(db, 'alice@example.test');
  bob = await createUser(db, 'bob@example.test');
});

describe('migrations', () => {
  it('apply in order on a fresh database (persistence, grants, connected banking)', () => {
    expect(jurnlMigrationFiles()).toEqual([
      '20261006103000_jurnl_production_persistence.sql',
      '20261104183000_jurnl_internal_grants.sql',
      '20261107120000_jurnl_connected_banking.sql',
    ]);
  });

  it('every JURNL table has RLS enabled', async () => {
    const r = await db.query<{ relname: string; relrowsecurity: boolean }>(`select relname, relrowsecurity from pg_class where relname like 'jurnl_%' and relkind = 'r' order by relname`);
    expect(r.rows.length).toBeGreaterThanOrEqual(12);
    for (const row of r.rows) expect(row.relrowsecurity, row.relname).toBe(true);
  });
});

describe('RLS isolation (requirement I: no cross-user leakage)', () => {
  it('a user reads only their own items, accounts and transactions', async () => {
    await seedItem(alice, 'item-alice');
    await seedItem(bob, 'item-bob');
    const seen = (await asUser(db, alice, async (q) => {
      const items = await q('select provider_item_id from public.jurnl_bank_items');
      const accounts = await q('select user_id from public.jurnl_bank_accounts');
      const txns = await q('select user_id from public.jurnl_bank_transactions');
      return { items: items.rows, accounts: accounts.rows, txns: txns.rows };
    })) as { items: { provider_item_id: string }[]; accounts: { user_id: string }[]; txns: { user_id: string }[] };
    expect(seen.items.map((i) => i.provider_item_id)).toEqual(['item-alice']);
    expect(seen.accounts.every((a) => a.user_id === alice)).toBe(true);
    expect(seen.txns.every((t) => t.user_id === alice)).toBe(true);
  });

  it('no end user can read encrypted provider tokens or webhook receipts — not even their own', async () => {
    await seedItem(alice, 'item-alice');
    await expect(asUser(db, alice, (q) => q('select * from public.jurnl_bank_item_secrets'))).rejects.toThrow(/permission denied/);
    await expect(asUser(db, alice, (q) => q('select * from public.jurnl_bank_webhook_events'))).rejects.toThrow(/permission denied/);
  });

  it('a browser cannot write banking rows (no forged CONNECTED status, no invented provider transactions)', async () => {
    const itemId = await seedItem(alice, 'item-alice');
    await expect(asUser(db, alice, (q) => q(`update public.jurnl_bank_items set status='ACTIVE' where item_id=$1`, [itemId]))).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, alice, (q) => q(`insert into public.jurnl_bank_transactions (user_id,item_id,provider_account_id,provider_transaction_id,pending,amount,date) values ($1,$2,'acc-1','forged',false,1,'2026-11-01')`, [alice, itemId])),
    ).rejects.toThrow(/permission denied/);
    await expect(asUser(db, alice, (q) => q('select * from public.jurnl_bank_apply_sync($1::uuid,null,$2,$3::jsonb,$4::jsonb,$5::jsonb,$6::jsonb,null)', [itemId, 'c1', '[]', '[]', '[]', '[]']))).rejects.toThrow(/permission denied/);
    await expect(asUser(db, alice, (q) => q('select * from public.jurnl_bank_disconnect($1::uuid,true,true)', [itemId]))).rejects.toThrow(/permission denied/);
  });

  it('snapshots: owner only', async () => {
    await asUser(db, alice, (q) => q(`select * from public.jurnl_put_snapshot($1::jsonb, 5, 'PRODUCTION', 0)`, [JSON.stringify({ userId: alice, transactions: [] })]));
    const bobSees = (await asUser(db, bob, (q) => q('select user_id from public.jurnl_user_snapshots'))) as { rows: unknown[] };
    expect(bobSees.rows).toHaveLength(0);
    const aliceSees = (await asUser(db, alice, (q) => q('select user_id from public.jurnl_user_snapshots'))) as { rows: { user_id: string }[] };
    expect(aliceSees.rows.map((r) => r.user_id)).toEqual([alice]);
  });
});

describe('snapshot compare-and-swap (never overwrite newer server data)', () => {
  const put = (uid: string, snap: object, rev: number, mode = 'PRODUCTION') =>
    asUser(db, uid, (q) => q(`select * from public.jurnl_put_snapshot($1::jsonb, 5, $2, $3)`, [JSON.stringify(snap), mode, rev])) as Promise<{ rows: { revision: number }[] }>;

  it('first write needs revision 0; later writes need the current revision', async () => {
    expect((await put(alice, { v: 1 }, 0)).rows[0].revision).toBe(1);
    expect(Number((await put(alice, { v: 2 }, 1)).rows[0].revision)).toBe(2);
    await expect(put(alice, { v: 'stale device' }, 1)).rejects.toMatchObject({ code: 'JR409' });
    await expect(put(alice, { v: 'blind' }, 0)).rejects.toMatchObject({ code: 'JR409' });
    const row = await db.query<{ snapshot: { v: number }; revision: number }>('select snapshot, revision from public.jurnl_user_snapshots where user_id=$1', [alice]);
    expect(row.rows[0].snapshot.v).toBe(2);
    expect(Number(row.rows[0].revision)).toBe(2);
  });

  it('a sandbox snapshot can never replace a production one (data mode mismatch)', async () => {
    await put(alice, { v: 1 }, 0, 'PRODUCTION');
    await expect(put(alice, { v: 'sandbox' }, 1, 'PROVIDER_SANDBOX')).rejects.toMatchObject({ code: 'JR422' });
    await expect(put(alice, { v: 'preview' }, 1, 'DESIGN_PREVIEW')).rejects.toMatchObject({ code: '22023' });
  });

  it('every accepted write is audited (revision, size, hash; never the content)', async () => {
    await put(alice, { v: 1 }, 0);
    await put(alice, { v: 2 }, 1);
    const audit = await db.query<{ revision: number; sha256: string; byte_size: number }>('select revision, sha256, byte_size from public.jurnl_snapshot_audit where user_id=$1 order by revision', [alice]);
    expect(audit.rows.map((r) => Number(r.revision))).toEqual([1, 2]);
    expect(audit.rows[0].sha256).toMatch(/^[0-9a-f]{64}$/);
  });

  it('no direct table write can bypass the compare-and-swap', async () => {
    await put(alice, { v: 1 }, 0);
    await expect(asUser(db, alice, (q) => q(`update public.jurnl_user_snapshots set snapshot='{"v":"blind"}'::jsonb where user_id=$1`, [alice]))).rejects.toThrow(/permission denied/);
    await expect(asUser(db, bob, (q) => q(`insert into public.jurnl_user_snapshots (user_id, snapshot) values ($1, '{}'::jsonb)`, [bob]))).rejects.toThrow(/permission denied/);
    await expect(asUser(db, alice, (q) => q(`insert into public.jurnl_snapshot_audit (user_id, revision, schema_version, data_mode, byte_size, sha256, source) values ($1,9,5,'PRODUCTION',1,'x','FORGED')`, [alice]))).rejects.toThrow(/permission denied/);
  });

  it('anonymous callers cannot write', async () => {
    await expect(db.transaction(async (tx) => {
      await tx.query('set local role anon');
      await tx.query(`select * from public.jurnl_put_snapshot('{}'::jsonb, 5, 'PRODUCTION', 0)`);
    })).rejects.toThrow(/permission denied/);
  });
});

describe('atomic sync apply (cursor moves only with its rows)', () => {
  const asService = <T>(fn: (q: (sql: string, p?: unknown[]) => Promise<{ rows: T[] }>) => Promise<unknown>) =>
    db.transaction(async (tx) => {
      await tx.query('set local role service_role');
      return fn((sql, p) => tx.query(sql, p) as Promise<{ rows: T[] }>);
    });
  const apply = (itemId: string, before: string | null, after: string, added: object[], removed: object[] = []) =>
    asService((q) => q('select * from public.jurnl_bank_apply_sync($1::uuid,$2,$3,$4::jsonb,$5::jsonb,$6::jsonb,$7::jsonb,null)', [itemId, before, after, '[]', JSON.stringify(added), '[]', JSON.stringify(removed)]));
  const row = (id: string, amount: number, date = '2026-11-02') => ({ provider_account_id: 'acc-1', provider_transaction_id: id, pending: false, amount, date });

  it('applies rows and advances the cursor together; replay is refused (no duplicates)', async () => {
    const itemId = await seedItem(alice, 'item-alice');
    await apply(itemId, null, 'c1', [row('tx-2', 5)]);
    await expect(apply(itemId, null, 'c1', [row('tx-2', 5)])).rejects.toMatchObject({ code: 'JR409' });
    const n = await db.query<{ n: number }>(`select count(*)::int n from public.jurnl_bank_transactions where provider_transaction_id='tx-2'`);
    expect(n.rows[0].n).toBe(1);
    const item = await db.query<{ sync_cursor: string }>('select sync_cursor from public.jurnl_bank_items where item_id=$1', [itemId]);
    expect(item.rows[0].sync_cursor).toBe('c1');
  });

  it('a batch that fails to persist leaves the cursor and every row unchanged', async () => {
    const itemId = await seedItem(alice, 'item-alice');
    await expect(apply(itemId, null, 'c-bad', [row('tx-ok', 1), row('tx-bad', 2, 'not-a-date')])).rejects.toThrow();
    const item = await db.query<{ sync_cursor: string | null }>('select sync_cursor from public.jurnl_bank_items where item_id=$1', [itemId]);
    expect(item.rows[0].sync_cursor).toBeNull();
    const n = await db.query<{ n: number }>(`select count(*)::int n from public.jurnl_bank_transactions where provider_transaction_id in ('tx-ok','tx-bad')`);
    expect(n.rows[0].n).toBe(0);
  });

  it('a provider removal is kept as history (REMOVED), never deleted', async () => {
    const itemId = await seedItem(alice, 'item-alice');
    await apply(itemId, null, 'c1', [], [{ provider_transaction_id: 'tx-1' }]);
    const r = await db.query<{ provider_state: string; removed_at: string | null }>(`select provider_state, removed_at from public.jurnl_bank_transactions where provider_transaction_id='tx-1'`);
    expect(r.rows[0].provider_state).toBe('REMOVED');
    expect(r.rows[0].removed_at).not.toBeNull();
  });

  it('disconnect removes the encrypted token; imported history stays unless deletion is asked for', async () => {
    const itemId = await seedItem(alice, 'item-alice');
    await asService((q) => q('select * from public.jurnl_bank_disconnect($1::uuid, true, false)', [itemId]));
    expect((await db.query('select 1 from public.jurnl_bank_item_secrets where item_id=$1', [itemId])).rows).toHaveLength(0);
    expect((await db.query('select 1 from public.jurnl_bank_transactions where item_id=$1', [itemId])).rows).toHaveLength(1);
    const item = await db.query<{ status: string; sync_cursor: string | null }>('select status, sync_cursor from public.jurnl_bank_items where item_id=$1', [itemId]);
    expect(item.rows[0]).toMatchObject({ status: 'DISCONNECTED', sync_cursor: null });
    await expect(apply(itemId, null, 'c9', [row('tx-late', 1)])).rejects.toMatchObject({ code: 'JR410' });
  });

  it('deleting the auth user cascades every JURNL banking row (account deletion)', async () => {
    await seedItem(alice, 'item-alice');
    await db.query('delete from auth.users where id=$1', [alice]);
    for (const t of ['jurnl_bank_items', 'jurnl_bank_item_secrets', 'jurnl_bank_accounts', 'jurnl_bank_transactions']) {
      expect((await db.query(`select 1 from public.${t} where user_id=$1`, [alice])).rows, t).toHaveLength(0);
    }
  });

  it('a webhook body is recorded once (duplicate deliveries are detected by hash)', async () => {
    const ins = () => db.query(`insert into public.jurnl_bank_webhook_events (provider, provider_env, body_sha256, verified) values ('PLAID','sandbox','abc',true) on conflict do nothing returning webhook_event_id`);
    expect((await ins()).rows).toHaveLength(1);
    expect((await ins()).rows).toHaveLength(0);
  });
});
