-- Canonical Asset Vault environment slot aliases (mirror primary ASSTS mobile slots on lock)

insert into public.site00_asset_slots (slot_key, description, asset_type, environment)
values
  (
    'site00.assetVault.environments.library',
    'Canonical alias — ASSTS Library / Vault Entrance',
    'environment',
    'REVIEW_ENVIRONMENT/ASSTS'
  ),
  (
    'site00.assetVault.environments.batchReview',
    'Canonical alias — ASSTS Batch Review / Production Gallery',
    'environment',
    'REVIEW_ENVIRONMENT/ASSTS'
  ),
  (
    'site00.assetVault.environments.inspection',
    'Canonical alias — ASSTS Inspection Chamber',
    'environment',
    'REVIEW_ENVIRONMENT/ASSTS'
  )
on conflict (slot_key) do nothing;
