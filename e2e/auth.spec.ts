import { test, expect } from "@playwright/test";

// Auth tests run without storageState (clean context for each test)
test.use({ storageState: undefined });

test.describe("Authentication @critical", () => {
  test("login com credenciais válidas redireciona para home", async ({ page }) => {
    const email = process.env.E2E_EMAIL || "test@example.com";
    const password = process.env.E2E_PASSWORD || "password";

    await page.goto("/login");

    // Verify login page loaded
    await expect(page.locator("input#email")).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();

    // Fill form
    await page.fill("input#email", email);
    await page.fill("input#password", password);

    // Submit
    const submitButton = page.locator('button:has-text("Entrar")');
    await submitButton.click();

    // Wait for redirect to home/dashboard
    await page.waitForURL("**/", { timeout: 30000 });

    // Verify we're on home page
    expect(page.url()).not.toContain("/login");
    expect(page.url()).not.toContain("/signup");
  });

  test("login com senha errada mostra erro", async ({ page }) => {
    const email = process.env.E2E_EMAIL || "test@example.com";

    await page.goto("/login");

    // Fill form with wrong password
    await page.fill("input#email", email);
    await page.fill("input#password", "senha-errada-123");

    // Submit
    const submitButton = page.locator('button:has-text("Entrar")');
    await submitButton.click();

    // Wait for error message
    await page.waitForTimeout(2000);

    // Verify we're still on login page
    expect(page.url()).toContain("/login");

    // Verify error message appears
    const errorText = page.locator("text=E-mail ou senha inválidos");
    await expect(errorText).toBeVisible();
  });

  test("usuário autenticado visitando /login é redirecionado para home", async ({ page }) => {
    const email = process.env.E2E_EMAIL || "test@example.com";
    const password = process.env.E2E_PASSWORD || "password";

    // First, login normally
    await page.goto("/login");
    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.click('button:has-text("Entrar")');
    await page.waitForURL("**/", { timeout: 30000 });

    // Now try to visit /login while logged in
    await page.goto("/login");

    // Should be redirected away from login
    await page.waitForTimeout(1000);
    expect(page.url()).not.toContain("/login");
  });

  test("logout retorna para /login", async ({ page }) => {
    const email = process.env.E2E_EMAIL || "test@example.com";
    const password = process.env.E2E_PASSWORD || "password";

    // Login first
    await page.goto("/login");
    await page.fill("input#email", email);
    await page.fill("input#password", password);
    await page.click('button:has-text("Entrar")');
    await page.waitForURL("**/", { timeout: 30000 });

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Sair")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForURL("**/login", { timeout: 10000 });
      expect(page.url()).toContain("/login");
    }
  });
});
