import { test, expect } from "@playwright/test";

test.describe("Smoke Tests @smoke @critical", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  const routes = [
    "/",
    "/dashboard",
    "/despesas",
    "/novo",
    "/agenda",
    "/fornecedores",
    "/comodos",
    "/graficos",
  ];

  for (const route of routes) {
    test(`rota ${route} carrega sem erro`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Verify no 404 or 500
      expect(page.status()).toBeLessThan(400);

      // Verify page has content (not blank)
      const body = page.locator("body");
      const textContent = await body.textContent();
      expect(textContent).toBeTruthy();
      expect(textContent).not.toBe("");

      // Verify no critical error text
      const errorIndicators = await page.locator("text=/erro|error|Error/i").count();
      expect(errorIndicators).toBe(0);

      // Verify at least one heading exists
      const headings = await page.locator("h1, h2, h3").count();
      expect(headings).toBeGreaterThan(0);
    });
  }

  test("página inicial (/) carrega elementos principais", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify common dashboard elements
    const heading = page.locator("h1, h2");
    expect(await heading.count()).toBeGreaterThan(0);

    // Verify bottom nav exists
    const nav = page.locator('[role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test("sem tela branca ou erro crítico de renderização", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Filter out benign errors (third-party scripts, etc)
    const criticalErrors = errors.filter((e) => !e.includes("3P") && !e.includes("third-party"));
    expect(criticalErrors).toEqual([]);
  });

  test("navegação via bottom nav funciona", async ({ page }) => {
    await page.goto("/");

    // Click on different nav tabs
    const nav = page.locator('[role="navigation"]');
    const navLinks = nav.locator("a, button");

    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // Click first non-home nav item
    if (count > 1) {
      await navLinks.nth(1).click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).not.toBe("/");
    }
  });
});
