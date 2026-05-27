import { describe, expect, it } from "vitest";
import { formatTodoDate } from "@/lib/format-date";

describe("formatTodoDate", () => {
  it("ISO 文字列を日本語の日時形式に変換する", () => {
    const formatted = formatTodoDate("2026-05-27T09:30:00.000Z");
    expect(formatted).toMatch(/\d/);
    expect(formatted).toMatch(/:/);
  });
});
