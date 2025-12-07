-- Run this in the Supabase SQL editor

-- Enable extension for uuid generation (if not already enabled)
create extension if not exists "pgcrypto";

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date timestamp with time zone,
  priority text check (priority in ('low','medium','high')) default 'medium',
  status text check (status in ('todo','in-progress','done')) default 'todo',
  inserted_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- trigger to update updated_at
create function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language 'plpgsql';

create trigger update_tasks_updated_at
before update on public.tasks
for each row
execute procedure update_updated_at_column();

-- Row Level Security
alter table public.tasks enable row level security;

create policy "Users can manage their tasks"
  on public.tasks
  for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
