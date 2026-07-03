-- ============================================================
-- 4JobTracker — Supabase (Postgres) Schema
-- Run this in Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- Note: user accounts are handled entirely by Supabase Auth
-- (the built-in auth.users table). We only store app data here,
-- linked to auth.users(id). Full name is stored in the user's
-- auth metadata (raw_user_meta_data), not a separate table.

-- ---------------------------------------------------------
-- Jobs / Applications
-- ---------------------------------------------------------
create table if not exists public.jobs (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references auth.users(id) on delete cascade,
  company_name  text not null,
  job_title     text not null,
  job_location  text,
  job_url       text,
  salary_min    numeric(12,2),
  salary_max    numeric(12,2),
  status        text not null default 'Applied'
                  check (status in ('Applied','Interviewing','Offer','Rejected','Withdrawn')),
  applied_date  date not null default current_date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_jobs_user_id on public.jobs(user_id);

-- ---------------------------------------------------------
-- Reminders
-- ---------------------------------------------------------
create table if not exists public.reminders (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references auth.users(id) on delete cascade,
  job_id      bigint references public.jobs(id) on delete cascade,
  title       text not null,
  remind_at   timestamptz not null,
  is_done     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists idx_reminders_user_id on public.reminders(user_id);

-- ---------------------------------------------------------
-- Notes
-- ---------------------------------------------------------
create table if not exists public.notes (
  id          bigint generated always as identity primary key,
  job_id      bigint not null references public.jobs(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  content     text not null,
  created_at  timestamptz not null default now()
);

create index if not exists idx_notes_job_id on public.notes(job_id);

-- ---------------------------------------------------------
-- Keep jobs.updated_at fresh on every update
-- ---------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_jobs_updated_at on public.jobs;
create trigger trg_jobs_updated_at
  before update on public.jobs
  for each row execute function public.set_updated_at();

-- ============================================================
-- Row Level Security — every user can only see/change their own rows
-- ============================================================
alter table public.jobs enable row level security;
alter table public.reminders enable row level security;
alter table public.notes enable row level security;

create policy "Users can view their own jobs"
  on public.jobs for select using (auth.uid() = user_id);
create policy "Users can insert their own jobs"
  on public.jobs for insert with check (auth.uid() = user_id);
create policy "Users can update their own jobs"
  on public.jobs for update using (auth.uid() = user_id);
create policy "Users can delete their own jobs"
  on public.jobs for delete using (auth.uid() = user_id);

create policy "Users can view their own reminders"
  on public.reminders for select using (auth.uid() = user_id);
create policy "Users can insert their own reminders"
  on public.reminders for insert with check (auth.uid() = user_id);
create policy "Users can update their own reminders"
  on public.reminders for update using (auth.uid() = user_id);
create policy "Users can delete their own reminders"
  on public.reminders for delete using (auth.uid() = user_id);

create policy "Users can view their own notes"
  on public.notes for select using (auth.uid() = user_id);
create policy "Users can insert their own notes"
  on public.notes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own notes"
  on public.notes for delete using (auth.uid() = user_id);
