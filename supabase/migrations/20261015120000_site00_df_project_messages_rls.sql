-- Enable RLS on project messages (table may exist without RLS from partial messaging rollout)

alter table if exists public.site00_df_project_messages enable row level security;
