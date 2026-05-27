create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos (user_id);

alter table public.todos enable row level security;

create policy "Users can view own todos"
  on public.todos
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own todos"
  on public.todos
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own todos"
  on public.todos
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own todos"
  on public.todos
  for delete
  using (auth.uid() = user_id);

create or replace function public.set_todo_user_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists on_todo_insert_set_user on public.todos;

create trigger on_todo_insert_set_user
before insert on public.todos
for each row
execute function public.set_todo_user_id();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists todos_set_updated_at on public.todos;

create trigger todos_set_updated_at
before update on public.todos
for each row
execute function public.set_updated_at();
