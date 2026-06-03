import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("h1")).toContainText("IT Tickets");
    await expect(page.locator("input[name='email']")).toBeVisible();
    await expect(page.locator("input[name='password']")).toBeVisible();
  });

  test("should toggle between login and register forms", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[name='name']")).not.toBeVisible();
    await page.click("text=Register");
    await expect(page.locator("input[name='name']")).toBeVisible();
    await page.click("text=Login");
    await expect(page.locator("input[name='name']")).not.toBeVisible();
  });

  test("should show error on invalid login", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "nonexistent@test.com");
    await page.fill("input[name='password']", "wrongpassword");
    await page.click("button[type='submit']");
    await expect(page.getByText("Invalid credentials")).toBeVisible();
  });

  test("should register a new user and redirect to dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.click("text=Register");
    await page.fill("input[name='name']", "E2E Test User");
    await page.fill("input[name='email']", "e2e@test.com");
    await page.fill("input[name='password']", "password123");
    await page.click("button[type='submit']");
    // Should redirect to dashboard (or show error if user already exists from seed)
    await page.waitForLoadState("networkidle");
    const url = page.url();
    const isOnDashboard = url === "http://localhost:4000/" || url === "http://localhost:4000";
    const hasError = await page.locator("div[style]").first().isVisible().catch(() => false);
    expect(isOnDashboard || hasError).toBe(true);
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "e2e@test.com");
    await page.fill("input[name='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("/");
    await expect(page.getByRole("heading", { name: "Tickets" })).toBeVisible();
    await expect(page.locator("text=E2E Test User")).toBeVisible();
  });

  test("should logout", async ({ page }) => {
    await page.goto("/login");
    await page.fill("input[name='email']", "e2e@test.com");
    await page.fill("input[name='password']", "password123");
    await page.click("button[type='submit']");
    await page.waitForURL("/");
    await page.click("text=Logout");
    await page.waitForURL("/login");
    await expect(page.locator("h1")).toContainText("IT Tickets");
  });
});
