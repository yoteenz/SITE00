-- Sprint B1 — extend creative entry status for territory judgment gate

alter table public.site00_creative_entries
  drop constraint if exists site00_creative_entries_status_check;

alter table public.site00_creative_entries
  add constraint site00_creative_entries_status_check
  check (status in (
    'DRAFT',
    'IN_PRODUCTION',
    'QA_BLOCKED',
    'READY_FOR_JUDGMENT',
    'AWAITING_TERRITORY_JUDGMENT',
    'COMPLETE',
    'ARCHIVED'
  ));
