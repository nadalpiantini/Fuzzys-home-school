-- 06_curriculum_paths.sql
-- Dynamic curriculum system with alternative paths and cross-subject recommendations

-- Enable UUID extension if not already enabled
create extension if not exists "uuid-ossp";

-- Curriculum nodes: represents chapters and their metadata in a tree structure
create table if not exists public.curriculum_nodes (
  id uuid primary key default uuid_generate_v4(),
  curriculum_id text not null,
  chapter_id text not null,
  title text not null,
  difficulty text default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
  subject text,
  age_range text,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(curriculum_id, chapter_id)
);

-- Index for faster lookups
create index if not exists idx_curriculum_nodes_curriculum_id on public.curriculum_nodes(curriculum_id);
create index if not exists idx_curriculum_nodes_chapter_id on public.curriculum_nodes(chapter_id);

-- Curriculum links: defines relationships and unlock conditions between nodes
create table if not exists public.curriculum_links (
  id uuid primary key default uuid_generate_v4(),
  from_node uuid not null references public.curriculum_nodes(id) on delete cascade,
  to_node uuid not null references public.curriculum_nodes(id) on delete cascade,
  condition text default 'always', -- always | score>=70 | score>=90 | avg<60 | completed
  type text default 'linear' check (type in ('linear', 'alternative', 'reinforcement')),
  created_at timestamptz default now(),
  unique(from_node, to_node)
);

-- Index for faster link lookups
create index if not exists idx_curriculum_links_from_node on public.curriculum_links(from_node);
create index if not exists idx_curriculum_links_to_node on public.curriculum_links(to_node);

-- Student unlocked paths: tracks which chapters students have unlocked
create table if not exists public.student_unlocked_paths (
  id uuid primary key default uuid_generate_v4(),
  student_id uuid not null,
  curriculum_id text not null,
  chapter_id text not null,
  unlocked_at timestamptz default now(),
  unlocked_via text, -- which chapter triggered this unlock
  unique(student_id, curriculum_id, chapter_id)
);

-- Index for student progress queries
create index if not exists idx_student_unlocked_paths_student on public.student_unlocked_paths(student_id);
create index if not exists idx_student_unlocked_paths_curriculum on public.student_unlocked_paths(curriculum_id);

-- Function to automatically update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at on curriculum_nodes
create trigger update_curriculum_nodes_updated_at
  before update on public.curriculum_nodes
  for each row
  execute function public.update_updated_at_column();

-- Grant permissions (adjust as needed for your RLS policies)
grant usage on schema public to anon, authenticated;
grant select on public.curriculum_nodes to anon, authenticated;
grant select on public.curriculum_links to anon, authenticated;
grant all on public.student_unlocked_paths to authenticated;

-- Enable RLS
alter table public.curriculum_nodes enable row level security;
alter table public.curriculum_links enable row level security;
alter table public.student_unlocked_paths enable row level security;

-- RLS policies for curriculum_nodes (public read)
create policy "Anyone can view curriculum nodes"
  on public.curriculum_nodes for select
  using (true);

-- RLS policies for curriculum_links (public read)
create policy "Anyone can view curriculum links"
  on public.curriculum_links for select
  using (true);

-- RLS policies for student_unlocked_paths (students can only see their own)
create policy "Students can view their own unlocked paths"
  on public.student_unlocked_paths for select
  using (auth.uid() = student_id);

create policy "Students can insert their own unlocked paths"
  on public.student_unlocked_paths for insert
  with check (auth.uid() = student_id);
