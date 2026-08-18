-- ASSTS canonical environment master slot (user-supplied world source)

insert into public.site00_asset_slots (slot_key, description, asset_type, environment)
values (
  'site00.assetVault.environments.canonicalMaster',
  'ASSTS canonical environment master — locked user-supplied world source',
  'environment',
  'assts'
)
on conflict (slot_key) do update set
  description = excluded.description,
  updated_at = now();
