import { describe, expect, it } from "vitest";
import { mapLoginError, mapSignupError } from "@/lib/auth-errors";

describe("mapLoginError", () => {
  it("Invalid login credentials を日本語メッセージに変換する", () => {
    expect(mapLoginError("Invalid login credentials")).toContain("メールアドレスまたはパスワード");
  });

  it("未確認メールのエラーを説明する", () => {
    expect(mapLoginError("Email not confirmed")).toContain("メールが未確認");
  });

  it("未知のメッセージはそのまま返す", () => {
    expect(mapLoginError("Something else")).toBe("Something else");
  });
});

describe("mapSignupError", () => {
  it("rate limit を案内メッセージに変換する", () => {
    expect(mapSignupError("Email rate limit exceeded")).toContain("アカウントは作成済み");
  });
});
