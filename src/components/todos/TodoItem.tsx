"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  userId: string;
  index: number;
  onUpdated: () => void;
  onDeleted: () => void;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TodoItem({ todo, userId, index, onUpdated, onDeleted }: TodoItemProps) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [completed, setCompleted] = useState(todo.completed);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCompleted(todo.completed);
  }, [todo.completed]);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setTitle(todo.title);
    }
  }, [todo.title, isEditing]);

  async function handleToggleCompleted() {
    if (loading || isEditing) {
      return;
    }

    const nextCompleted = !completed;
    const previousCompleted = completed;
    setCompleted(nextCompleted);
    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("todos")
      .update({ completed: nextCompleted })
      .eq("id", todo.id)
      .eq("user_id", userId);

    setLoading(false);

    if (updateError) {
      setCompleted(previousCompleted);
      setError(updateError.message);
      return;
    }

    onUpdated();
  }

  function startEditing() {
    if (loading) {
      return;
    }
    setError(null);
    setTitle(todo.title);
    setIsEditing(true);
  }

  function cancelEditing() {
    setTitle(todo.title);
    setError(null);
    setIsEditing(false);
  }

  async function handleSaveEdit() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("タイトルを入力してください");
      return;
    }

    if (trimmedTitle === todo.title) {
      cancelEditing();
      return;
    }

    setLoading(true);
    setError(null);

    const { error: updateError } = await supabase
      .from("todos")
      .update({ title: trimmedTitle })
      .eq("id", todo.id)
      .eq("user_id", userId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setIsEditing(false);
    onUpdated();
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleSaveEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  async function handleDelete() {
    if (loading || isEditing) {
      return;
    }

    setLoading(true);
    setError(null);

    const { error: deleteError } = await supabase
      .from("todos")
      .delete()
      .eq("id", todo.id)
      .eq("user_id", userId);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    onDeleted();
  }

  return (
    <li className="space-y-1">
      <p className="px-1 text-xs text-slate-400">登録: {formatDate(todo.created_at)}</p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-6 shrink-0 text-center text-xs font-medium text-slate-400">
            {index + 1}
          </span>

          <label className="mt-0.5 flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={completed}
              onChange={() => void handleToggleCompleted()}
              disabled={loading || isEditing}
              aria-label={completed ? "未完了に戻す" : "完了にする"}
              className="h-5 w-5 cursor-pointer rounded border-slate-300 text-green-600 focus:ring-2 focus:ring-green-200 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  onKeyDown={handleEditKeyDown}
                  disabled={loading}
                  className="w-full rounded-lg border border-blue-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                  aria-label="TODO を編集"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => void handleSaveEdit()}
                    disabled={loading}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={loading}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <p
                className={`text-base ${
                  completed ? "text-slate-400 line-through" : "text-slate-900"
                }`}
              >
                {title}
              </p>
            )}

            {error && (
              <p className="mt-2 text-sm text-red-600" role="alert">
                {error}
              </p>
            )}
          </div>

          {!isEditing && (
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={startEditing}
                disabled={loading}
                className="rounded-lg px-2 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                編集
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={loading}
                className="rounded-lg px-2 py-1 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                削除
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}
