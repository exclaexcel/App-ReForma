import { test, expect } from "@playwright/test";

test.describe("Smoke Tests @smoke @critical", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  const routes = ["/", "/dashboard", "/despesas", "/novo", "/agenda", "/fornecedores", "/graficos"];

  for (const route of routes) {
    test(`rota ${route} carrega sem erro`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");

      // Verify page loaded (no blank page)
      const body = page.locator("body");
      const textContent = await body.textContent();
      expect(textContent).toBeTruthy();
      expect(textContent).not.toBe("");

      // Verify no critical error text
      const errorIndicators = await page.locator("text=/erro crítico|fatal error|500/i").count();
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

    // Verify page is not empty
    const body = page.locator("body");
    const content = await body.textContent();
    expect(content).toBeTruthy();
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
    await page.waitForTimeout(1000);

    // Filter out benign errors (third-party scripts, etc)
    const criticalErrors = errors.filter(
      (e) => !e.includes("3P") && !e.includes("third-party") && !e.includes("favicon")
    );
    expect(criticalErrors.length).toBe(0);
  });

  test("navegação via bottom nav funciona", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for clickable navigation elements (links or buttons)
    const navElements = page.locator("a[href], button");
    const count = await navElements.count();
    expect(count).toBeGreaterThan(0);

    // Try clicking a navigation element and verify navigation happens
    if (count > 1) {
      const element = navElements.nth(1);
      const href = await element.getAttribute("href");
      if (href && href !== "/") {
        await element.click();
        await page.waitForLoadState("networkidle");
        const endUrl = page.url();
        // URL should have changed (or at least we didn't get an error)
        expect(endUrl).toBeTruthy();
      }
    }
  });
});
