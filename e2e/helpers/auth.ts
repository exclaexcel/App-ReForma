import { Page } from "@playwright/test";

export async function login(page: Page): Promise<void> {
  const email = process.env.E2E_EMAIL || "test@example.com";
  const password = process.env.E2E_PASSWORD || "password";

  await page.goto("/login");
  await page.fill("input#email", email);
  await page.fill("input#password", password);
  await page.click('button:has-text("Entrar")');

  // Wait for redirect to home
  await page.waitForURL("/", { timeout: 10000 });
}

export async function logout(page: Page): Promise<void> {
  // Click logout button (usually in a menu)
  const logoutButton = page.locator('button:has-text("Sair")');
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    await page.waitForURL("/login", { timeout: 10000 });
  }
}
