import { test, expect } from "@playwright/test";
import { testData, prefix } from "./helpers/test-data";

test.describe("Expenses CRUD @critical", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test.beforeEach(async ({ page }) => {
    await page.goto("/despesas");
    await page.waitForLoadState("networkidle");
  });

  test("cadastrar despesa simples (tipo: outro)", async ({ page }) => {
    const description = prefix("Despesa Simples");

    // Click "Novo Lançamento"
    await page.click('button[aria-label="Novo lançamento"]');

    // Fill amount
    await page.fill("input#amount", testData.expense.amountSmall);

    // Fill description
    await page.fill("input#description", description);

    // Set date
    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);

    // Select category (first available)
    await page.click('button:has-text("Selecionar")');
    await page.click('[role="option"]');

    // Select expense type = "outro"
    const typeSelect = page.locator('[role="combobox"]').nth(1);
    await typeSelect.click();
    await page.click('[role="option"]:has-text("Outro")');

    // Save
    await page.click('button:has-text("Salvar Lançamento")');

    // Wait for success and navigate back
    await page.waitForLoadState("networkidle");

    // Verify we're back on despesas page
    expect(page.url()).toContain("/despesas");

    // Verify expense appears in list
    const expenseRow = page.locator(`text=${description}`);
    await expect(expenseRow).toBeVisible();
  });

  test("cadastrar despesa tipo mão_obra sem campos NF", async ({ page }) => {
    const description = prefix("Mão de Obra");

    await page.click('button[aria-label="Novo lançamento"]');
    await page.fill("input#amount", testData.expense.amountSmall);
    await page.fill("input#description", description);

    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);

    // Select category
    await page.click('button:has-text("Selecionar")');
    await page.click('[role="option"]');

    // Select expense type = "Mão de Obra"
    const typeSelect = page.locator('[role="combobox"]').nth(1);
    await typeSelect.click();
    await page.click('[role="option"]:has-text("Mão de Obra")');

    // Verify invoice fields are NOT visible for mão_obra
    const invoiceNumberInput = page.locator('input[placeholder*="Número"]');
    await expect(invoiceNumberInput).not.toBeVisible();

    // Save
    await page.click('button:has-text("Salvar Lançamento")');
    await page.waitForLoadState("networkidle");

    // Verify appears in list
    const expenseRow = page.locator(`text=${description}`);
    await expect(expenseRow).toBeVisible();
  });

  test("cadastrar despesa tipo material com campos NF", async ({ page }) => {
    const description = prefix("Material Construção");

    await page.click('button[aria-label="Novo lançamento"]');
    await page.fill("input#amount", testData.expense.amount);
    await page.fill("input#description", description);

    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);

    // Select category
    await page.click('button:has-text("Selecionar")');
    await page.click('[role="option"]');

    // Select expense type = "Material"
    const typeSelect = page.locator('[role="combobox"]').nth(1);
    await typeSelect.click();
    await page.click('[role="option"]:has-text("Material")');

    // Verify invoice fields ARE visible for material
    const invoiceNumberInput = page.locator('input[placeholder*="Número"]');
    await expect(invoiceNumberInput).toBeVisible();

    // Save without filling NF (to test badge behavior)
    await page.click('button:has-text("Salvar Lançamento")');
    await page.waitForLoadState("networkidle");

    // Verify appears in list
    const expenseRow = page.locator(`text=${description}`);
    await expect(expenseRow).toBeVisible();
  });

  test("upload de comprovante de pagamento", async ({ page }) => {
    const description = prefix("Despesa com Comprovante");

    await page.goto("/novo");
    await page.waitForLoadState("networkidle");

    await page.fill("input#amount", testData.expense.amountSmall);
    await page.fill("input#description", description);

    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);

    // Select category
    await page.click('button:has-text("Selecionar")');
    await page.click('[role="option"]');

    // Select type
    const typeSelect = page.locator('[role="combobox"]').nth(1);
    await typeSelect.click();
    await page.click('[role="option"]');

    // Mark as paid
    await page.check("input#is_paid");

    // Wait for date picker to appear
    await page.waitForTimeout(300);
    const paidDateInput = page.locator("input#paid_at");
    await expect(paidDateInput).toBeVisible();
    await paidDateInput.fill(today);

    // Upload comprovante (receipt file)
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles("e2e/fixtures/comprovante-teste.pdf");

    // Save
    await page.click('button:has-text("Salvar Lançamento")');
    await page.waitForLoadState("networkidle");

    // Verify appears
    const expenseRow = page.locator(`text=${description}`);
    await expect(expenseRow).toBeVisible();
  });

  test("editar despesa", async ({ page }) => {
    // First, create an expense
    const description = prefix("Despesa para Editar");
    const newDescription = prefix("Despesa Editada");

    await page.click('button[aria-label="Novo lançamento"]');
    await page.fill("input#amount", testData.expense.amountSmall);
    await page.fill("input#description", description);

    const today = new Date().toISOString().split("T")[0];
    await page.fill("input#date", today);

    await page.click('button:has-text("Selecionar")');
    await page.click('[role="option"]');

    const typeSelect = page.locator('[role="combobox"]').nth(1);
    await typeSelect.click();
    await page.click('[role="option"]');

    await page.click('button:has-text("Salvar Lançamento")');
    await page.waitForLoadState("networkidle");

    // Now find and click the expense to edit
    const expenseRow = page.locator(`text=${description}`);
    await expenseRow.click();

    // Edit button or similar
    const editButton = page.locator('button[aria-label="Editar despesa"]');
    if (await editButton.isVisible()) {
      await editButton.click();
    } else {
      // If no specific edit button, try clicking on the expense row itself
      await page.waitForTimeout(500);
    }

    // Change description
    await page.fill("input#description", newDescription);

    // Save changes
    const saveButton = page.locator('button:has-text("Salvar")');
    await saveButton.click();
    await page.waitForLoadState("networkidle");

    // Verify new description appears
    const updatedRow = page.locator(`text=${newDescription}`);
    await expect(updatedRow).toBeVisible();
  });
});
