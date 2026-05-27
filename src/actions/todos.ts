"use server";

import { revalidatePath } from "next/cache";
import { logger } from "@/lib/logger";
import { validateTodoTitle } from "@/lib/todo-utils";
import { createClient } from "@/lib/supabase/server";

export type TodoActionResult = { error?: string; success?: boolean; message?: string };

/** RLS に加え、アプリ側でも user_id を明示して二重に所有者を検証する。 */
async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

export async function createTodoAction(
  _prev: TodoActionResult | null,
  formData: FormData
): Promise<TodoActionResult> {
  const validation = validateTodoTitle(String(formData.get("title") ?? ""));

  if (!validation.ok) {
    return { error: validation.error };
  }

  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return { error: "ログインが必要です。" };
    }

    const { error } = await supabase.from("todos").insert({
      user_id: userId,
      title: validation.value,
      completed: false,
    });

    if (error) {
      logger.error("createTodoAction", error, { userId });
      return { error: error.message };
    }

    revalidatePath("/todos");
    return { success: true, message: "登録しました。" };
  } catch (error) {
    logger.error("createTodoAction", error);
    return { error: "TODO の追加中にエラーが発生しました。" };
  }
}

export async function updateTodoTitleAction(
  todoId: string,
  title: string
): Promise<TodoActionResult> {
  const validation = validateTodoTitle(title);

  if (!validation.ok) {
    return { error: validation.error };
  }

  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return { error: "ログインが必要です。" };
    }

    const { error } = await supabase
      .from("todos")
      .update({ title: validation.value })
      .eq("id", todoId)
      .eq("user_id", userId);

    if (error) {
      logger.error("updateTodoTitleAction", error, { todoId, userId });
      return { error: error.message };
    }

    revalidatePath("/todos");
    return { success: true, message: "更新しました。" };
  } catch (error) {
    logger.error("updateTodoTitleAction", error, { todoId });
    return { error: "TODO の更新中にエラーが発生しました。" };
  }
}

export async function toggleTodoCompletedAction(
  todoId: string,
  completed: boolean
): Promise<TodoActionResult> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return { error: "ログインが必要です。" };
    }

    const { error } = await supabase
      .from("todos")
      .update({ completed })
      .eq("id", todoId)
      .eq("user_id", userId);

    if (error) {
      logger.error("toggleTodoCompletedAction", error, { todoId, userId, completed });
      return { error: error.message };
    }

    revalidatePath("/todos");
    return {
      success: true,
      message: completed ? "完了にしました。" : "未完了に戻しました。",
    };
  } catch (error) {
    logger.error("toggleTodoCompletedAction", error, { todoId, completed });
    return { error: "完了状態の更新中にエラーが発生しました。" };
  }
}

export async function deleteTodoAction(todoId: string): Promise<TodoActionResult> {
  try {
    const supabase = await createClient();
    const userId = await getAuthenticatedUserId();

    if (!userId) {
      return { error: "ログインが必要です。" };
    }

    const { error } = await supabase.from("todos").delete().eq("id", todoId).eq("user_id", userId);

    if (error) {
      logger.error("deleteTodoAction", error, { todoId, userId });
      return { error: error.message };
    }

    revalidatePath("/todos");
    return { success: true, message: "削除しました。" };
  } catch (error) {
    logger.error("deleteTodoAction", error, { todoId });
    return { error: "TODO の削除中にエラーが発生しました。" };
  }
}
