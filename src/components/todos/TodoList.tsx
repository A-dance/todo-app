"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { countTodosByStatus, filterTodosByTitle } from "@/lib/todo-utils";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [flashMessage, setFlashMessage] = useState<string | null>(null);

  useEffect(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  useEffect(() => {
    if (!flashMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFlashMessage(null);
    }, 3000);

    return () => window.clearTimeout(timer);
  }, [flashMessage]);

  const showFlashMessage = useCallback((message: string) => {
    setFlashMessage(message);
  }, []);

  const { total, activeCount, completedCount } = countTodosByStatus(todos);

  const filteredTodos = useMemo(() => {
    let result = todos;

    if (filter === "active") {
      result = result.filter((todo) => !todo.completed);
    } else if (filter === "completed") {
      result = result.filter((todo) => todo.completed);
    }

    return filterTodosByTitle(result, searchQuery);
  }, [filter, searchQuery, todos]);

  const emptyMessage =
    searchQuery.trim().length > 0
      ? `「${searchQuery.trim()}」に一致する TODO はありません。`
      : filter === "active"
        ? "未完了の TODO はありません。"
        : filter === "completed"
          ? "完了した TODO はありません。"
          : "TODO がありません。上のフォームから追加してください。";

  return (
    <div className="space-y-6">
      <TodoForm onSuccess={showFlashMessage} />

      <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">TODO 一覧</h2>
          {todos.length > 0 && (
            <p className="text-sm text-slate-500">
              全 {total} 件 / 未完了 {activeCount} 件 / 完了 {completedCount} 件
            </p>
          )}
        </div>

        {flashMessage && (
          <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {flashMessage}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="todo-search" className="mb-1 block text-sm font-medium text-slate-700">
            タイトル検索
          </label>
          <input
            id="todo-search"
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="キーワードで絞り込み"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
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
              <TodoItem
                key={todo.id}
                todo={todo}
                index={index}
                onSuccess={showFlashMessage}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
