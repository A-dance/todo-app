-- すでに schema.sql を実行済みの場合、Supabase SQL Editor でこのファイルを実行してください。

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
