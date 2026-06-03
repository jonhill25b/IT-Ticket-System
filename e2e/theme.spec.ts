import { test, expect } from "@playwright/test";

test.describe("Theme Toggle", () => {
  test("should default to dark mode", async ({ page }) => {
    await page.goto("/login");
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("dark");
  });

  test("should toggle to light mode", async ({ page }) => {
    await page.goto("/login");
    await page.click(".theme-toggle");
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("light");
  });

  test("should persist theme across page navigation", async ({ page }) => {
    await page.goto("/login");
    await page.click(".theme-toggle");
    await page.goto("/login");
    const theme = await page.evaluate(() =>
      document.documentElement.getAttribute("data-theme")
    );
    expect(theme).toBe("light");
  });

  test("should show sun icon in dark mode and moon icon in light mode", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator(".theme-toggle")).toContainText("☀️");
    await page.click(".theme-toggle");
    await expect(page.locator(".theme-toggle")).toContainText("🌙");
  });
});
