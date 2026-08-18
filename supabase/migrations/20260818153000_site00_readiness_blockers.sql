-- SITE 00 Production OS — readiness blockers + recipe service dependencies

alter table public.site00_recipe_deliverables
  add column if not exists required_services jsonb not null default '[]'::jsonb;

alter table public.site00_recipe_deliverables
  add column if not exists required_assets jsonb not null default '[]'::jsonb;

alter table public.site00_recipe_deliverables
  add column if not exists required_approvals jsonb not null default '[]'::jsonb;

create table if not exists public.site00_production_blockers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.site00_projects(id) on delete cascade,
  deliverable_id uuid references public.site00_project_deliverables(id) on delete cascade,
  production_job_id uuid references public.site00_production_jobs(id) on delete cascade,
  blocker_type text not null,
  service_id uuid references public.site00_service_catalog(id) on delete set null,
  dependency_key text,
  reason text not null,
  owner text not null default 'CLIENT',
  severity text not null default 'HIGH',
  current_status text,
  required_phase text,
  action_type text,
  action_route text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists site00_production_blockers_open_idx
  on public.site00_production_blockers(project_id)
  where resolved_at is null;

create index if not exists site00_production_blockers_deliverable_idx
  on public.site00_production_blockers(deliverable_id)
  where resolved_at is null;

-- Recipe service dependencies (SITE / ECOMMERCE)
update public.site00_recipe_deliverables rd
set required_services = v.required_services::jsonb
from public.site00_production_recipes r
cross join (values
  ('homepage_visual_direction', '[]'),
  ('mobile_adaptation', '[]'),
  ('frontend_build', '[{"service":"github","phase":"BUILD","requirement":"required"}]'),
  ('backend_build', '[{"service":"supabase","phase":"BUILD","requirement":"required"}]'),
  ('preview_deployment', '[{"service":"github","phase":"BUILD","requirement":"required"},{"service":"vercel","phase":"BUILD","requirement":"required"}]'),
  ('payment_integration', '[{"service":"stripe","phase":"INTEGRATION","requirement":"required"}]'),
  ('production_domain', '[{"service":"godaddy","phase":"LAUNCH","requirement":"required"}]'),
  ('transactional_email', '[{"service":"resend","phase":"INTEGRATION","requirement":"required"}]')
) as v(deliverable_key, required_services)
where r.recipe_key = 'site_ecommerce'
  and rd.recipe_id = r.id
  and rd.deliverable_key = v.deliverable_key;

-- Add build / launch deliverables if missing
insert into public.site00_recipe_deliverables (
  recipe_id, deliverable_key, category, title, description, sort_order, default_variants, depends_on, required_services
)
select r.id, v.deliverable_key, v.category, v.title, v.description, v.sort_order, v.default_variants,
  v.depends_on::jsonb, v.required_services::jsonb
from public.site00_production_recipes r
cross join (values
  ('frontend_build', 'TECHNICAL', 'FRONTEND BUILD', 'FRONTEND IMPLEMENTATION', 105, 1, '["homepage_visual_direction"]', '[{"service":"github","phase":"BUILD","requirement":"required"}]'),
  ('backend_build', 'TECHNICAL', 'BACKEND BUILD', 'BACKEND IMPLEMENTATION', 110, 1, '["frontend_build"]', '[{"service":"supabase","phase":"BUILD","requirement":"required"}]'),
  ('preview_deployment', 'TECHNICAL', 'PREVIEW DEPLOYMENT', 'PREVIEW ENVIRONMENT DEPLOYMENT', 115, 1, '["frontend_build"]', '[{"service":"github","phase":"BUILD","requirement":"required"},{"service":"vercel","phase":"BUILD","requirement":"required"}]'),
  ('payment_integration', 'TECHNICAL', 'PAYMENT INTEGRATION', 'STRIPE PAYMENT INTEGRATION', 120, 1, '["backend_build"]', '[{"service":"stripe","phase":"INTEGRATION","requirement":"required"}]'),
  ('production_domain', 'LAUNCH', 'PRODUCTION DOMAIN', 'PRODUCTION DOMAIN CONNECTION', 125, 1, '["preview_deployment"]', '[{"service":"godaddy","phase":"LAUNCH","requirement":"required"}]'),
  ('transactional_email', 'TECHNICAL', 'TRANSACTIONAL EMAIL', 'TRANSACTIONAL EMAIL SETUP', 122, 1, '["backend_build"]', '[{"service":"resend","phase":"INTEGRATION","requirement":"required"}]')
) as v(deliverable_key, category, title, description, sort_order, default_variants, depends_on, required_services)
where r.recipe_key = 'site_ecommerce'
on conflict (recipe_id, deliverable_key) do update
set required_services = excluded.required_services,
    depends_on = excluded.depends_on;

alter table public.site00_production_blockers enable row level security;

do $$
declare t text;
begin
  foreach t in array array[
    'site00_production_blockers'
  ] loop
    execute format('drop policy if exists %I_service_role on public.%I', t, t);
    execute format(
      'create policy %I_service_role on public.%I for all to service_role using (true) with check (true)',
      t, t
    );
  end loop;
end $$;
