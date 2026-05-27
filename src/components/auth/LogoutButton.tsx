"use client";

import { useTransition } from "react";
import { logoutAction } from "@/actions/auth";

export default function LogoutButton() {
  const [pending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      await logoutAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "ログアウト中..." : "ログアウト"}
    </button>
  );
}
