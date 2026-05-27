"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { createTodoAction } from "@/actions/todos";

export default function TodoForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTodoAction, null);

  useEffect(() => {
    if (state?.success) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        name="title"
        placeholder="新しい TODO を入力"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        aria-label="新しい TODO"
        required
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "追加中..." : "追加"}
      </button>
      {state?.error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {state.error}
        </p>
      )}
    </form>
  );
}
