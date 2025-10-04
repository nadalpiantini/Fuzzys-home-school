-- Migration: Family Links (vínculos padre-estudiante)
-- Enables parent-student relationships for family dashboards

-- Create family_links table
create table if not exists public.family_links (
  id uuid primary key default uuid_generate_v4(),
  parent_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  relation text default 'parent',
  created_at timestamptz default now(),

  -- Ensure unique parent-student pairs
  unique (parent_id, student_id)
);

-- Enable RLS
alter table public.family_links enable row level security;

-- RLS Policies
create policy "Parent can read their links"
  on public.family_links
  for select
  using (auth.uid() = parent_id);

create policy "Parent can create links"
  on public.family_links
  for insert
  with check (auth.uid() = parent_id);

create policy "Parent can update their links"
  on public.family_links
  for update
  using (auth.uid() = parent_id);

create policy "Parent can delete their links"
  on public.family_links
  for delete
  using (auth.uid() = parent_id);

-- Create indexes for performance
create index idx_family_links_parent_id on public.family_links(parent_id);
create index idx_family_links_student_id on public.family_links(student_id);

-- Grant permissions
grant all on public.family_links to authenticated;
grant all on public.family_links to service_role;

-- Add comments
comment on table public.family_links is 'Links between parents and students for family dashboards';
comment on column public.family_links.relation is 'Type of relationship: parent, guardian, tutor, etc.';