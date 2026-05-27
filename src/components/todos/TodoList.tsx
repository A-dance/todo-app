"use client";

import { useEffect, useMemo, useState } from "react";
import { countTodosByStatus } from "@/lib/todo-utils";
import type { Todo } from "@/types/todo";
import TodoForm from "@/components/todos/TodoForm";
import TodoItem from "@/components/todos/TodoItem";

type TodoListProps = {
  initialTodos: Todo[];
};

type Filter = "all" | "active" | "completed";

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  const { total, activeCount, completedCount } = countTodosByStatus(todos);

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
      <TodoForm />

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">TODO 一覧</h2>
          {todos.length > 0 && (
            <p className="text-sm text-slate-500">
              全 {total} 件 / 未完了 {activeCount} 件 / 完了 {completedCount} 件
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

        {filteredTodos.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
            {emptyMessage}
          </p>
        ) : (
          <ul className="space-y-3">
            {filteredTodos.map((todo, index) => (
              <TodoItem key={todo.id} todo={todo} index={index} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
