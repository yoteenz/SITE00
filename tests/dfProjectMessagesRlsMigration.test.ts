import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const MIGRATION = resolve(
  import.meta.dirname,
  '../supabase/migrations/20261015120000_site00_df_project_messages_rls.sql',
);

describe('site00_df_project_messages RLS migration', () => {
  const sql = readFileSync(MIGRATION, 'utf8');

  it('enables RLS without permissive policies', () => {
    expect(sql.toLowerCase()).toContain('enable row level security');
    expect(sql.toLowerCase()).not.toContain('create policy');
    expect(sql.toLowerCase()).not.toContain('using (true)');
    expect(sql.toLowerCase()).not.toContain('with check (true)');
  });

  it('revokes row privileges from anon and authenticated', () => {
    expect(sql.toLowerCase()).toContain('revoke select, insert, update, delete');
    expect(sql.toLowerCase()).toContain('from anon, authenticated');
  });

  it('does not drop or truncate data', () => {
    expect(sql.toLowerCase()).not.toContain('drop table');
    expect(sql.toLowerCase()).not.toContain('truncate');
    expect(sql.toLowerCase()).not.toContain('delete from');
  });
});
