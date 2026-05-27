-- Supabase SQL Editor で実行してください
-- テスト用の TODO とテストユーザーを削除します

-- 1. テストメールの TODO を削除
delete from public.todos
where user_id in (
  select id from auth.users
  where email like 'test%@example.com'
);

-- 2. テストユーザーを削除
delete from auth.users
where email like 'test%@example.com';

-- ※ すべての TODO を消したい場合（全ユーザー分）:
-- delete from public.todos;
