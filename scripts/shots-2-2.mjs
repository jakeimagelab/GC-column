import { execFileSync } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const baseUrl = process.env.SHOTS_BASE_URL || "http://127.0.0.1:3000";
const output = "docs/compare/2-2";
for (const width of [390, 1024, 1440]) await mkdir(`${output}/${width}`, { recursive: true });

const wrapper = join(homedir(), ".codex/skills/playwright/scripts/playwright_cli.sh");
const cli = (...args) => execFileSync("bash", [wrapper, ...args], { cwd: process.cwd(), encoding: "utf8", env: process.env, maxBuffer: 20 * 1024 * 1024 });

try { cli("open", `${baseUrl}/`); } catch { cli("goto", `${baseUrl}/`); }

const code = `async (page) => {
  const baseUrl = ${JSON.stringify(baseUrl)};
  const output = ${JSON.stringify(output)};
  const settle = async () => {
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => document.fonts.ready);
  };
  let originalGallery;
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(baseUrl + '/');
    await settle();
    await page.screenshot({ path: output + '/390/mobile-bottom-bar.png' });

    await page.setViewportSize({ width: 1024, height: 900 });
    await page.goto(baseUrl + '/column');
    await settle();
    await page.evaluate(() => window.scrollTo(0, 820));
    await page.waitForTimeout(250);
    await page.screenshot({ path: output + '/1024/sticky-header.png' });

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(baseUrl + '/');
    await settle();
    await page.getByRole('button', { name: '리프팅', exact: true }).hover();
    await page.waitForTimeout(250);
    await page.screenshot({ path: output + '/1440/home-megamenu.png' });

    const contentResponse = await page.request.get(baseUrl + '/api/dev-edit');
    if (contentResponse.ok()) {
      const content = await contentResponse.json();
      originalGallery = content['home.gallery.laser'];
      const demoSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="#b5a595"/><path d="M0 650L1200 250V800H0Z" fill="#6e6052"/><circle cx="850" cy="250" r="120" fill="#f3f0eb"/></svg>');
      await page.request.patch(baseUrl + '/api/dev-edit', { data: { id: 'home.gallery.laser', entry: { ...originalGallery, src: demoSvg } } });
      await page.goto(baseUrl + '/');
      await settle();
      await page.getByRole('button', { name: '레이저실 크게 보기' }).click();
      await page.waitForTimeout(200);
      await page.screenshot({ path: output + '/1440/gallery-modal.png' });
    }

    await page.goto(baseUrl + '/column/xerf-vs-thermage');
    await settle();
    await page.getByRole('heading', { name: '이 글에 대해 원장님께 질문하기' }).scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    await page.screenshot({ path: output + '/1440/column-qna.png' });
  } finally {
    if (originalGallery) await page.request.patch(baseUrl + '/api/dev-edit', { data: { id: 'home.gallery.laser', entry: originalGallery } });
  }
}`;

try {
  cli("run-code", code);
  console.log(`Captured #2-2 interaction screenshots in ${output}`);
} finally {
  try { cli("close"); } catch {}
}
