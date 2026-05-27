"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signupAction } from "@/actions/auth";

export default function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, null);

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">サインアップ</h1>
      <p className="mt-2 text-sm text-slate-600">新しいアカウントを作成</p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
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
            name="password"
            type="password"
            required
            autoComplete="new-password"
            minLength={6}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            placeholder="6文字以上"
          />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
            {state.error}
          </p>
        )}

        {state?.message && (
          <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700" role="status">
            {state.message}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "登録中..." : "アカウント作成"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
          ログイン
        </Link>
      </p>
    </div>
  );
}
