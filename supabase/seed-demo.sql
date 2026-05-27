-- デモ用 TODO データ
-- 事前準備: Supabase Authentication → Users → Add user
--   Email: demo@todo-app.local
--   Password: demo123456
--   Auto Confirm User: ON

insert into public.todos (user_id, title, completed)
select
  u.id,
  todo.title,
  todo.completed
from auth.users u
cross join (
  values
    ('買い物に行く', false),
    ('レポートを書く', false),
    ('部屋の掃除', true),
    ('CI/CD の設定を確認する', true)
) as todo(title, completed)
where u.email = 'demo@todo-app.local'
  and not exists (
    select 1
    from public.todos t
    where t.user_id = u.id
  );
