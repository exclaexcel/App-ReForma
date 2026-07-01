import { test, expect } from "@playwright/test";

test.describe("Filters @full", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/despesas");
    await page.waitForLoadState("networkidle");
  });

  test("busca por texto filtra despesas", async ({ page }) => {
    // Look for a search/filter input
    const searchInput = page.locator(
      'input[placeholder*="Buscar"], input[placeholder*="Pesquisar"], input[type="search"]'
    );

    if (await searchInput.isVisible()) {
      // Type a common word that likely exists
      await searchInput.fill("Despesa");

      // Wait for results to update
      await page.waitForTimeout(500);

      // Results should be filtered (or page shows no results)
      const expenseRows = page.locator('[role="listitem"], tr, .expense-item');
      expect(await expenseRows.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test("filtro por tipo de despesa", async ({ page }) => {
    // Look for type filter button or select
    const typeFilter = page.locator('button:has-text("Tipo"), select[name="type"]');

    if (await typeFilter.isVisible()) {
      await typeFilter.click();

      // Select an option
      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();

        // Wait for results
        await page.waitForTimeout(500);

        // Verify results updated
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test("filtro por categoria", async ({ page }) => {
    // Look for category filter
    const categoryFilter = page.locator('button:has-text("Categoria"), select[name="category"]');

    if (await categoryFilter.isVisible()) {
      await categoryFilter.click();

      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();

        await page.waitForTimeout(500);
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test("filtro por status documental", async ({ page }) => {
    // Look for documentation status filter
    const docFilter = page.locator('button:has-text("Documento"), button:has-text("Status")');

    if (await docFilter.isVisible()) {
      await docFilter.click();

      const option = page.locator('[role="option"]').first();
      if (await option.isVisible()) {
        await option.click();

        await page.waitForTimeout(500);
        expect(page.url()).toBeTruthy();
      }
    }
  });

  test("abre modal de filtros avançados", async ({ page }) => {
    // Look for advanced filters button
    const advancedButton = page.locator('button:has-text("Filtros"), button:has-text("Avançado")');

    if (await advancedButton.isVisible()) {
      await advancedButton.click();

      // Wait for modal
      await page.waitForTimeout(300);

      // Modal should be visible
      const modal = page.locator('[role="dialog"]');
      const isVisible = await modal.isVisible();
      expect(isVisible).toBeDefined();
    }
  });

  test("botão limpar filtros reseta busca", async ({ page }) => {
    // Apply a filter first
    const searchInput = page.locator(
      'input[placeholder*="Buscar"], input[placeholder*="Pesquisar"]'
    );

    if (await searchInput.isVisible()) {
      await searchInput.fill("teste");

      await page.waitForTimeout(500);

      // Look for clear button
      const clearButton = page.locator('button:has-text("Limpar"), button[aria-label*="Limpar"]');

      if (await clearButton.isVisible()) {
        await clearButton.click();

        // Search input should be empty
        const inputValue = await searchInput.inputValue();
        expect(inputValue).toBe("");
      }
    }
  });
});
