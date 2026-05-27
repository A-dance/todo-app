import { expect, test } from "@playwright/test";

const email = process.env.E2E_TEST_EMAIL ?? "demo@todo-app.local";
const password = process.env.E2E_TEST_PASSWORD ?? "demo123456";

test.describe("TODO アプリ E2E", () => {
  test("ログインして TODO の追加・編集・完了・削除ができる", async ({ page }) => {
    test.setTimeout(60_000);

    const todoTitle = `E2Eテスト ${Date.now()}`;
    const editedTitle = `${todoTitle}（編集済み）`;

    await page.goto("/login");
    await page.locator("#email").fill(email);
    await page.locator("#password").fill(password);
    await page.getByRole("button", { name: "ログイン" }).click();

    await expect(page).toHaveURL(/\/todos/);
    await expect(page.getByRole("heading", { name: "TODO", exact: true })).toBeVisible();

    const todoInput = page.getByLabel("新しい TODO");
    await todoInput.fill(todoTitle);

    const insertResponse = page.waitForResponse(
      (response) =>
        response.url().includes("/rest/v1/todos") && response.request().method() === "POST"
    );
    await page.getByRole("button", { name: "追加" }).click();
    const response = await insertResponse;

    expect(response.status()).toBeGreaterThanOrEqual(200);
    expect(response.status()).toBeLessThan(300);

    await expect(page.locator("li").filter({ hasText: todoTitle })).toBeVisible({
      timeout: 10_000,
    });

    const todoItem = page.locator("li").filter({ hasText: todoTitle });
    await todoItem.getByRole("button", { name: "編集" }).click();

    const editInput = page.getByRole("textbox", { name: "TODO を編集" });
    await expect(editInput).toBeVisible();
    await editInput.fill(editedTitle);
    await page.getByRole("button", { name: "保存" }).click();
    await expect(todoItem.getByText(editedTitle)).toBeVisible();

    const title = todoItem.getByText(editedTitle);
    await expect(todoItem.getByRole("checkbox")).toBeEnabled();
    await todoItem.getByRole("checkbox").check();
    await expect(title).toHaveClass(/line-through/);

    await todoItem.getByRole("checkbox").uncheck();
    await expect(title).not.toHaveClass(/line-through/);

    await todoItem.getByRole("button", { name: "削除" }).click();
    await expect(page.getByText(editedTitle)).not.toBeVisible();
  });

  test("未ログイン時は TODO ページに入れない", async ({ page }) => {
    await page.goto("/todos");
    await expect(page).toHaveURL(/\/login$/);
  });
});
