import { chromium, FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.use;
  const email = process.env.E2E_EMAIL || "test@example.com";
  const password = process.env.E2E_PASSWORD || "password";

  const browser = await chromium.launch();
  const context = await browser.createContext();
  const page = await context.newPage();

  try {
    await page.goto(`${baseURL}/login`);

    // Fill login form
    await page.fill("input#email", email);
    await page.fill("input#password", password);

    // Submit form
    await page.click('button:has-text("Entrar")');

    // Wait for redirect to dashboard/home
    await page.waitForURL("**/", { timeout: 30000 });

    // Save authenticated state
    await context.storageState({ path: "e2e/.auth/user.json" });

    console.log("✅ Setup: Login successful, storageState saved");
  } catch (error) {
    console.error("❌ Setup: Login failed", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
