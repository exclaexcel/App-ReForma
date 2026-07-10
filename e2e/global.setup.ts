import { chromium } from "@playwright/test";

async function globalSetup(config: { use?: { baseURL?: string } }) {
  const baseURL = config.use?.baseURL || "http://localhost:3000";
  const email = process.env.E2E_EMAIL || "test@example.com";
  const password = process.env.E2E_PASSWORD || "password";

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🔐 Setup: Starting login...");
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState("networkidle");

    // Fill login form
    console.log("🔐 Setup: Filling credentials...");
    const emailInput = page.locator("input#email");
    const passwordInput = page.locator("input#password");
    const submitBtn = page.locator('button:has-text("Entrar")');

    console.log(`  Email input visible: ${await emailInput.isVisible()}`);
    console.log(`  Password input visible: ${await passwordInput.isVisible()}`);
    console.log(`  Submit button visible: ${await submitBtn.isVisible()}`);

    // Clear and fill inputs
    await emailInput.clear();
    await emailInput.fill(email);
    await page.waitForTimeout(300);

    await passwordInput.clear();
    await passwordInput.fill(password);
    await page.waitForTimeout(300);

    // Verify values
    const emailValue = await emailInput.inputValue();
    const passwordValue = await passwordInput.inputValue();
    console.log(`  Email filled: ${emailValue === email ? "✓" : "✗"}`);
    console.log(`  Password filled: ${passwordValue === password ? "✓" : "✗"}`);

    // Submit form - try multiple methods
    console.log("🔐 Setup: Attempting form submission...");

    // Method 1: Try click
    const isEnabled = await submitBtn.isEnabled();
    console.log(`  Button enabled: ${isEnabled}`);
    if (isEnabled) {
      try {
        await submitBtn.click({ timeout: 5000 });
        console.log("  ✓ Click succeeded");
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : String(e);
        console.log(`  ✗ Click failed: ${errorMsg}`);
      }
    }

    // Method 2: Try keyboard Enter
    await emailInput.press("Tab");
    await passwordInput.press("Tab");
    await page.press("button:has-text('Entrar')", "Enter");
    console.log("  ✓ Pressed Enter on submit");

    // Wait for response
    await page.waitForTimeout(5000);

    // Check if redirected
    const finalUrl = page.url();
    if (finalUrl.includes("/login") || finalUrl.includes("/signup")) {
      console.log(`❌ Setup: Still on login after submission. URL: ${finalUrl}`);
      // Check for error message
      const errorMsg = await page
        .locator("text=/erro|error|inválido/i")
        .textContent()
        .catch(() => null);
      if (errorMsg) {
        console.log(`  Error: ${errorMsg}`);
        throw new Error(`Login failed: ${errorMsg}. Credenciais podem estar incorretas.`);
      }
      // If no error, try loading page again (maybe cookies set)
      console.log("  No error message, retrying page load...");
      await page.goto(baseURL);
      await page.waitForLoadState("networkidle");
    }

    console.log(`🔐 Setup: Current URL: ${page.url()}`);

    // Save authenticated state
    await context.storageState({ path: "e2e/.auth/user.json" });

    console.log("✅ Setup: storageState saved to e2e/.auth/user.json");
  } catch (error) {
    console.error("❌ Setup: Login failed", error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;
