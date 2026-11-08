import { mkdir } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:3000";
const outputDir = "docs/compare";

async function openBrowser() {
  try {
    return await chromium.launch({
      executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      headless: true,
    });
  } catch {
    return chromium.launch({ headless: true });
  }
}

async function settle(page) {
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => document.fonts.ready);
}

async function captureWithApi() {
  const browser = await openBrowser();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    locale: "ko-KR",
    colorScheme: "light",
  });
  const page = await context.newPage();
  try {
    await page.goto(`${baseUrl}/`);
    await settle(page);
    await page.screenshot({ path: `${outputDir}/home.png`, fullPage: true });

    await page.goto(`${baseUrl}/column`);
    await settle(page);
    await page.screenshot({ path: `${outputDir}/column-main.png`, fullPage: true });

    await page.goto(`${baseUrl}/column/xerf-vs-thermage`);
    await settle(page);
    await page.screenshot({ path: `${outputDir}/column-detail.png`, fullPage: true });

    await page.goto(`${baseUrl}/column`);
    await settle(page);
    await page.getByRole("navigation", { name: "칼럼 카테고리" }).getByRole("link", { name: "리프팅" }).hover();
    await page.locator('[data-megamenu-open="true"]').waitFor();
    await page.screenshot({ path: `${outputDir}/megamenu.png`, fullPage: true });
  } finally {
    await browser.close();
  }
}

function captureWithCodexCli() {
  const wrapper = join(homedir(), ".codex/skills/playwright/scripts/playwright_cli.sh");
  const cli = (...args) => execFileSync("bash", [wrapper, ...args], { cwd: process.cwd(), stdio: "inherit" });
  try {
    cli("goto", `${baseUrl}/`);
  } catch {
    cli("open", `${baseUrl}/`);
  }
  cli("resize", "1440", "900");
  cli("screenshot", "--full-page", "--filename", `${outputDir}/home.png`);
  cli("goto", `${baseUrl}/column`);
  cli("screenshot", "--full-page", "--filename", `${outputDir}/column-main.png`);
  cli("goto", `${baseUrl}/column/xerf-vs-thermage`);
  cli("screenshot", "--full-page", "--filename", `${outputDir}/column-detail.png`);
  cli("goto", `${baseUrl}/column`);
  cli("snapshot");
  cli("hover", "nav[aria-label='칼럼 카테고리'] a:first-child");
  cli("screenshot", "--full-page", "--filename", `${outputDir}/megamenu.png`);
}

await mkdir(outputDir, { recursive: true });
try {
  await captureWithApi();
} catch (error) {
  console.warn(`Playwright API browser launch failed; using the installed Codex Playwright CLI session. ${error.message}`);
  captureWithCodexCli();
}

console.log(`Captured 4 screenshots in ${outputDir}`);
