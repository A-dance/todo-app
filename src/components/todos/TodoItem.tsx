"use client";

import { useRouter } from "next/navigation";
import { KeyboardEvent, useEffect, useRef, useState, useTransition } from "react";
import {
  deleteTodoAction,
  toggleTodoCompletedAction,
  updateTodoTitleAction,
} from "@/actions/todos";
import { formatTodoDate } from "@/lib/format-date";
import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  index: number;
  onSuccess?: (message: string) => void;
};

export default function TodoItem({ todo, index, onSuccess }: TodoItemProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(todo.title);
  const [completed, setCompleted] = useState(todo.completed);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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

  function refreshOnSuccess(result: { error?: string; success?: boolean; message?: string }) {
    if (result.error) {
      setError(result.error);
      return;
    }

    setError(null);

    if (result.message) {
      onSuccess?.(result.message);
    }

    router.refresh();
  }

  function handleToggleCompleted() {
    if (pending || isEditing) {
      return;
    }

    const nextCompleted = !completed;
    const previousCompleted = completed;
    setCompleted(nextCompleted);
    setError(null);

    startTransition(async () => {
      const result = await toggleTodoCompletedAction(todo.id, nextCompleted);

      if (result.error) {
        setCompleted(previousCompleted);
        setError(result.error);
        return;
      }

      if (result.message) {
        onSuccess?.(result.message);
      }

      router.refresh();
    });
  }

  function startEditing() {
    if (pending) {
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

  function handleSaveEdit() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("タイトルを入力してください");
      return;
    }

    if (trimmedTitle === todo.title) {
      cancelEditing();
      return;
    }

    setError(null);

    startTransition(async () => {
      const result = await updateTodoTitleAction(todo.id, trimmedTitle);
      refreshOnSuccess(result);

      if (!result.error) {
        setIsEditing(false);
      }
    });
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSaveEdit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditing();
    }
  }

  function handleDelete() {
    if (pending || isEditing) {
      return;
    }

    setError(null);

    startTransition(async () => {
      refreshOnSuccess(await deleteTodoAction(todo.id));
    });
  }

  return (
    <li className="space-y-1">
      <p className="px-1 text-xs text-slate-400">登録: {formatTodoDate(todo.created_at)}</p>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 w-6 shrink-0 text-center text-xs font-medium text-slate-400">
            {index + 1}
          </span>

          <label className="mt-0.5 flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={completed}
              onChange={handleToggleCompleted}
              disabled={pending || isEditing}
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
                  disabled={pending}
                  className="w-full rounded-lg border border-blue-300 px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200"
                  aria-label="TODO を編集"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={pending}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pending ? "保存中..." : "保存"}
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={pending}
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
                disabled={pending}
                className="rounded-lg px-2 py-1 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                編集
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
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
