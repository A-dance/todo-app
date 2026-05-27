"use server";

/**
 * 認証 Server Actions。Supabase Auth でセッション Cookie を更新し、
 * 成功時は revalidatePath + redirect でクライアント状態を同期する。
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mapLoginError, mapSignupError } from "@/lib/auth-errors";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";

type AuthState = { error?: string; message?: string } | null;

export async function loginAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      logger.error("loginAction", error, { email });
      return { error: mapLoginError(error.message) };
    }

    if (!data.session) {
      return { error: "ログインに失敗しました。もう一度お試しください。" };
    }
  } catch (error) {
    logger.error("loginAction", error, { email });
    return { error: "ログイン処理中にエラーが発生しました。" };
  }

  revalidatePath("/", "layout");
  redirect("/todos");
}

export async function signupAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  if (password.length < 6) {
    return { error: "パスワードは6文字以上にしてください。" };
  }

  let hasSession = false;

  try {
    const supabase = await createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      logger.error("signupAction", signUpError, { email });

      if (signUpError.message.toLowerCase().includes("rate limit")) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (!signInError && signInData.session) {
          hasSession = true;
        } else {
          return { error: mapSignupError(signUpError.message) };
        }
      } else {
        return { error: signUpError.message };
      }
    } else if (data.session) {
      hasSession = true;
    } else {
      return {
        message: "確認メールを送信しました。メール内のリンクから認証を完了してください。",
      };
    }
  } catch (error) {
    logger.error("signupAction", error, { email });
    return { error: "サインアップ処理中にエラーが発生しました。" };
  }

  if (hasSession) {
    revalidatePath("/", "layout");
    redirect("/todos");
  }

  return { error: "サインアップを完了できませんでした。" };
}

export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      logger.error("logoutAction", error);
    }
  } catch (error) {
    logger.error("logoutAction", error);
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
