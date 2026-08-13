import { chromium, type FullConfig } from "@playwright/test";

async function globalSetup(config: FullConfig) {
  const fromProject = config.projects[0]?.use?.baseURL;
  const baseURL =
    process.env.PLAYWRIGHT_BASE_URL ||
    (typeof fromProject === "string" ? fromProject : undefined) ||
    "http://localhost:3000";
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "E2E_EMAIL e E2E_PASSWORD são obrigatórios (defina nos secrets do GitHub Actions ou no .env local)."
    );
  }

  console.log(`🔐 Setup: baseURL=${baseURL}`);

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log("🔐 Setup: Starting login...");
    await page.goto(`${baseURL}/login`);
    await page.waitForLoadState("domcontentloaded");

    await page.locator("input#email").fill(email);
    await page.locator("input#password").fill(password);
    await page.locator('button:has-text("Entrar")').click();

    try {
      await page.waitForURL((url) => !url.pathname.includes("/login"), {
        timeout: 20000,
      });
    } catch {
      const errorMsg = await page
        .locator("text=/erro|inválid|incorret|senha/i")
        .first()
        .textContent()
        .catch(() => null);
      throw new Error(
        `Login failed (still on login). ${errorMsg ? `UI: ${errorMsg}` : "Sem mensagem de erro na tela."}`
      );
    }

    console.log(`🔐 Setup: Current URL: ${page.url()}`);
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
