"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      const message = signInError.message.toLowerCase();

      if (message.includes("invalid login credentials")) {
        setError(
          "メールアドレスまたはパスワードが違います。/signup から新しいメールアドレスで登録し直してください。"
        );
      } else if (message.includes("email not confirmed")) {
        setError(
          "メールが未確認です。Supabase の Users で Confirm するか、Confirm email を OFF にしてください。"
        );
      } else {
        setError(signInError.message);
      }

      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("ログインに失敗しました。もう一度お試しください。");
      setLoading(false);
      return;
    }

    window.location.href = "/todos";
  }

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">ログイン</h1>
      <p className="mt-2 text-sm text-slate-600">メールアドレスとパスワードでログイン</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="6文字以上"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "ログイン中..." : "ログイン"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700">
          サインアップ
        </Link>
      </p>
    </div>
  );
}
