import { test, expect } from "@playwright/test";

test.describe("Ticket Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "e2e@test.com");
    await page.fill("input[name='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("/");
  });

  test("should display ticket list page", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Tickets" })).toBeVisible();
    await expect(page.getByRole("navigation").getByRole("link", { name: "+ New Ticket" })).toBeVisible();
  });

  test("should create a new ticket", async ({ page }) => {
    await page.getByRole("navigation").getByRole("link", { name: "+ New Ticket" }).click();
    await expect(page.getByRole("heading", { name: "New Ticket" })).toBeVisible();
    await page.fill("input[name='title']", "E2E Test Ticket");
    await page.fill("textarea[name='description']", "This is a test ticket created by Playwright");
    await page.selectOption("select[name='priority']", "HIGH");
    await page.click("button[type='submit']");
    await expect(page.getByRole("heading", { name: "E2E Test Ticket" })).toBeVisible();
  });

  test("should view ticket details", async ({ page }) => {
    await page.click("text=E2E Test Ticket");
    await expect(page.getByRole("heading", { name: "E2E Test Ticket" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Update Ticket" })).toBeVisible();
    await expect(page.getByRole("heading", { name: /^Comments/ })).toBeVisible();
  });

  test("should add a comment to a ticket", async ({ page }) => {
    await page.click("text=E2E Test Ticket");
    await page.fill("textarea[name='content']", "This is a test comment");
    await page.click("text=Post Comment");
    await expect(page.locator("text=This is a test comment")).toBeVisible();
  });
});
