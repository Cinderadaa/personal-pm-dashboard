-- ==============================================================================
-- Personal Project Management Dashboard — Supabase Database Schema
-- ==============================================================================

-- 1. Create Projects Table
create table if not exists public.projects (
  id text primary key,
  name text not null,
  description text default '',
  category text not null check (category in ('internship', 'work', 'study', 'personal', 'life')),
  status text not null default 'active' check (status in ('active', 'on_hold', 'completed')),
  deadline text not null,
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  start_date text,
  icon text,
  color text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Create Tasks Table
create table if not exists public.tasks (
  id text primary key,
  project_id text not null references public.projects(id) on delete cascade,
  title text not null,
  description text default '',
  status text not null default 'todo' check (status in ('todo', 'in_progress', 'completed')),
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  due_date text not null,
  due_time text,
  progress integer not null default 0 check (progress between 0 and 100),
  subtasks jsonb default '[]'::jsonb,
  tags jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Keep existing installations compatible with the current application.
alter table public.projects add column if not exists start_date text;
alter table public.projects add column if not exists color text;
alter table public.tasks add column if not exists progress integer not null default 0;

-- 3. Create Indexes for High Performance
create index if not exists idx_tasks_project_id on public.tasks(project_id);
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_due_date on public.tasks(due_date);
create index if not exists idx_projects_category on public.projects(category);

-- 4. Enable Row Level Security (RLS)
alter table public.projects enable row level security;
alter table public.tasks enable row level security;

-- 5. Open Policies for Full Access (Local personal usage & Anon API key)
create policy "Allow all access to projects" on public.projects
  for all using (true) with check (true);

create policy "Allow all access to tasks" on public.tasks
  for all using (true) with check (true);

-- 6. Enable Realtime Replication
alter publication supabase_realtime add table public.projects;
alter publication supabase_realtime add table public.tasks;
