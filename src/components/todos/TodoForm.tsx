"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type TodoFormProps = {
  userId: string;
  onCreated: () => void;
};

export default function TodoForm({ userId, onCreated }: TodoFormProps) {
  const supabase = createClient();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("タイトルを入力してください");
      return;
    }

    setError(null);
    setLoading(true);

    const { error: insertError } = await supabase.from("todos").insert({
      user_id: userId,
      title: trimmedTitle,
      completed: false,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setTitle("");
    setLoading(false);
    onCreated();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
      <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="新しい TODO を入力"
        className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        aria-label="新しい TODO"
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "追加中..." : "追加"}
      </button>
      {error && (
        <p className="text-sm text-red-600 sm:basis-full" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
