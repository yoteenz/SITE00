-- G-12: index bearer tokens by hash for lookup hardening (plaintext column retained for migration).
alter table public.site00_df_artifacts
  add column if not exists public_token_hash text;

create index if not exists site00_df_artifacts_token_hash_idx
  on public.site00_df_artifacts (public_token_hash);

update public.site00_df_artifacts
set public_token_hash = encode(digest(public_token, 'sha256'), 'hex')
where public_token_hash is null and public_token is not null;
