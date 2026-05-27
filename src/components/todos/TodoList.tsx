"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/types/todo";
import TodoForm from "@/components/todos/TodoForm";
import TodoItem from "@/components/todos/TodoItem";

type TodoListProps = {
  userId: string;
  initialTodos: Todo[];
};

type Filter = "all" | "active" | "completed";

export default function TodoList({ userId, initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTodos = useCallback(async () => {
    const supabase = createClient();
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    setLoading(false);

    if (fetchError) {
      setError(fetchError.message);
      return;
    }

    setTodos(data ?? []);
  }, [userId]);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.length - completedCount;

  const filteredTodos = useMemo(() => {
    if (filter === "active") {
      return todos.filter((todo) => !todo.completed);
    }
    if (filter === "completed") {
      return todos.filter((todo) => todo.completed);
    }
    return todos;
  }, [filter, todos]);

  const emptyMessage =
    filter === "active"
      ? "未完了の TODO はありません。"
      : filter === "completed"
        ? "完了した TODO はありません。"
        : "TODO がありません。上のフォームから追加してください。";

  return (
    <div className="space-y-6">
      <TodoForm userId={userId} onCreated={() => void fetchTodos()} />

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">TODO 一覧</h2>
          {todos.length > 0 && (
            <p className="text-sm text-slate-500">
              全 {todos.length} 件 / 未完了 {activeCount} 件 / 完了 {completedCount} 件
            </p>
          )}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            すべて
          </button>
          <button
            type="button"
            onClick={() => setFilter("active")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === "active"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            未完了
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              filter === "completed"
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            完了
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {loading && todos.length === 0 ? (
          <p className="text-sm text-slate-500">読み込み中...</p>
        ) : filteredTodos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            {emptyMessage}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo, index) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                userId={userId}
                index={index}
                onUpdated={() => void fetchTodos()}
                onDeleted={() => void fetchTodos()}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
