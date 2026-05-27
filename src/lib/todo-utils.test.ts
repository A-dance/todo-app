import { describe, expect, it } from "vitest";
import { countTodosByStatus, trimTodoTitle, validateTodoTitle } from "@/lib/todo-utils";

describe("trimTodoTitle", () => {
  it("前後の空白を除去する", () => {
    expect(trimTodoTitle("  hello  ")).toBe("hello");
  });
});

describe("validateTodoTitle", () => {
  it("空文字はエラーを返す", () => {
    expect(validateTodoTitle("   ")).toEqual({
      ok: false,
      error: "タイトルを入力してください",
    });
  });

  it("有効なタイトルは trim した値を返す", () => {
    expect(validateTodoTitle("  buy milk  ")).toEqual({
      ok: true,
      value: "buy milk",
    });
  });
});

describe("countTodosByStatus", () => {
  it("件数を集計する", () => {
    expect(
      countTodosByStatus([
        { completed: false },
        { completed: true },
        { completed: true },
      ])
    ).toEqual({
      total: 3,
      completedCount: 2,
      activeCount: 1,
    });
  });
});
