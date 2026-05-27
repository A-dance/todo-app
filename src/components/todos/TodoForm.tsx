"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { createTodoAction } from "@/actions/todos";

type TodoFormProps = {
  onSuccess?: (message: string) => void;
};

export default function TodoForm({ onSuccess }: TodoFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createTodoAction, null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
      router.refresh();

      if (state.message) {
        onSuccess?.(state.message);
      }
    }
  }, [state, router, onSuccess]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2 sm:flex-row">
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
