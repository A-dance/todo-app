import { describe, expect, it } from "vitest";
import {
  countTodosByStatus,
  filterTodosByTitle,
  trimTodoTitle,
  validateTodoTitle,
} from "@/lib/todo-utils";

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

describe("filterTodosByTitle", () => {
  const todos = [
    { title: "買い物に行く" },
    { title: "レポートを書く" },
    { title: "部屋の掃除" },
  ];

  it("空の検索語は全件を返す", () => {
    expect(filterTodosByTitle(todos, "  ")).toEqual(todos);
  });

  it("タイトルの部分一致で絞り込む", () => {
    expect(filterTodosByTitle(todos, "レポート")).toEqual([{ title: "レポートを書く" }]);
  });

  it("大文字小文字を区別しない", () => {
    expect(filterTodosByTitle(todos, "e2e")).toEqual([]);
    expect(filterTodosByTitle([{ title: "E2Eテスト" }], "e2e")).toEqual([{ title: "E2Eテスト" }]);
  });
});
