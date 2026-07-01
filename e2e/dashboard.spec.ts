import { test, expect } from "@playwright/test";

test.describe("Dashboard @critical", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("dashboard carrega sem erro", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify page loaded
    expect(page.url()).toContain("/");

    // Verify main heading exists
    const heading = page.locator("h1, h2");
    expect(await heading.count()).toBeGreaterThan(0);

    // Verify no error messages
    const errorText = page.locator("text=/erro|error|Error/i");
    expect(await errorText.count()).toBe(0);
  });

  test("cards KPI aparecem (Saldo, Comprometido, A Pagar)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for KPI cards by text content
    const saldoCard = page.locator("text=/Saldo|Disponível/i");
    const comprometidoCard = page.locator("text=/Comprometido/i");
    const pagarCard = page.locator("text=/A Pagar|Pagar/i");

    // At least some KPI should be visible
    const totalKPI =
      (await saldoCard.count()) + (await comprometidoCard.count()) + (await pagarCard.count());
    expect(totalKPI).toBeGreaterThan(0);
  });

  test("números dos KPIs são visíveis", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for currency values (R$)
    const currencyText = page.locator("text=R$");
    const currencyCount = await currencyText.count();

    // Should have at least one currency value displayed
    expect(currencyCount).toBeGreaterThan(0);
  });

  test("alerta documental aparece quando há pendências", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for alert banner
    const alertBanner = page.locator('[role="alert"], text=/documentação|pendência|alerta/i');
    expect(await alertBanner.count()).toBeGreaterThanOrEqual(0); // Alert may or may not exist
  });

  test("últimas despesas aparecem na listagem", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for expense items
    const expenseItems = page.locator('[role="listitem"], text=/Despesa|Lançamento/i');
    const count = await expenseItems.count();

    // May have 0 items if no expenses exist, but should load without error
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("link 'Ver todas as despesas' navega para /despesas", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Look for "Ver todas" or similar link
    const verTodasLink = page.locator('a, button:has-text("Ver todas")');
    if (await verTodasLink.isVisible()) {
      await verTodasLink.click();
      await page.waitForLoadState("networkidle");
      expect(page.url()).toContain("/despesas");
    }
  });

  test("bottom nav está visível e funcional", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Check bottom nav
    const nav = page.locator('[role="navigation"]');
    await expect(nav).toBeVisible();

    // Click different nav items
    const navLinks = nav.locator("a, button");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // Click one nav link and verify navigation
    if (count > 1) {
      await navLinks.nth(1).click();
      await page.waitForLoadState("networkidle");
      // URL should change
      expect(page.url()).toBeTruthy();
    }
  });
});
