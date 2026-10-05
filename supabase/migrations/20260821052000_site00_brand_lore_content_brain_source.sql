-- NDX BOOK readiness bypass removal (XXIV-XXVIII): reconciled Content Brain intelligence is
-- persisted as a real BrandLoreProfile row with source_intake_type = 'CONTENT_BRAIN' — distinct
-- from IDENTITY/BUILDER founder intakes so lineage stays honest (see
-- api/_lib/site00BrandLore/ndxbookReconciliation.ts). Never overwrites a real IDENTITY/BUILDER
-- profile for the same org (enforced in application code, not the database).

alter table public.site00_brand_lore_profiles
  drop constraint if exists site00_brand_lore_profiles_source_intake_type_check;

alter table public.site00_brand_lore_profiles
  add constraint site00_brand_lore_profiles_source_intake_type_check check (
    source_intake_type in ('IDENTITY', 'BUILDER', 'CONTENT_BRAIN')
  );
