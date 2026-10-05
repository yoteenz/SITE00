-- Extend site00_intake_events.event_type to allow BRAND_LORE_FIELD_CONFIRMED — the audit trail
-- for founder "CONFIRM CANON" actions (XI/XII). Reuses the EXISTING intake audit event table
-- rather than creating a new Brand Lore versions/audit table (see VI in the sprint spec) — purely
-- additive, no data loss.
alter table public.site00_intake_events
  drop constraint if exists site00_intake_events_event_type_check;

alter table public.site00_intake_events
  add constraint site00_intake_events_event_type_check check (
    event_type in (
      'INTAKE_CREATED', 'INTAKE_EMAIL_ASSOCIATED', 'INTAKE_SAVED', 'INTAKE_ACCESS_ISSUED',
      'INTAKE_RESUMED', 'INTAKE_SUBMITTED', 'INTAKE_CLAIMED', 'INTAKE_MARKED_IN_REVIEW',
      'INTAKE_CONVERTED', 'INTAKE_ARCHIVED', 'BRAND_LORE_FIELD_CONFIRMED'
    )
  );
