import { redirect } from "next/navigation";
import LogoutButton from "@/components/auth/LogoutButton";
import TodoList from "@/components/todos/TodoList";
import { createClient } from "@/lib/supabase/server";

export default async function TodosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: todos, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-2xl px-4 py-10">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">TODO</h1>
          <p className="mt-1 text-sm text-slate-600">{user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <TodoList userId={user.id} initialTodos={todos ?? []} />
    </main>
  );
}
