import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:3000";
const outputDir = "docs/compare/widths";
const reportPath = "docs/compare/report-1-1.md";
const widths = [390, 1024, 1280, 1366, 1440, 1728, 1920];
const pages = [
  { name: "home", path: "/" },
  { name: "column-main", path: "/column" },
  { name: "column-detail", path: "/column/xerf-vs-thermage" },
];

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

function overflowExpression() {
  return `(() => {
    const root = document.documentElement;
    const overflow = root.scrollWidth > window.innerWidth;
    const offenders = Array.from(document.querySelectorAll('body *'))
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          element: element.tagName.toLowerCase() + (element.className && typeof element.className === 'string' ? '.' + element.className.trim().split(/\\s+/).join('.') : ''),
          left: Math.round(rect.left * 10) / 10,
          right: Math.round(rect.right * 10) / 10,
        };
      })
      .filter((item) => item.left < -0.5 || item.right > window.innerWidth + 0.5)
      .slice(0, 8);
    return { viewportWidth: window.innerWidth, scrollWidth: root.scrollWidth, overflow, offenders };
  })()`;
}

async function captureWithApi() {
  const browser = await openBrowser();
  const context = await browser.newContext({
    viewport: { width: widths[0], height: 900 },
    deviceScaleFactor: 1,
    locale: "ko-KR",
    colorScheme: "light",
  });
  const page = await context.newPage();
  const results = [];

  try {
    for (const width of widths) {
      await page.setViewportSize({ width, height: 900 });
      for (const target of pages) {
        await page.goto(`${baseUrl}${target.path}`);
        await settle(page);
        const measurement = await page.evaluate(overflowExpression());
        await page.screenshot({ path: `${outputDir}/${width}/${target.name}.png`, fullPage: true });
        results.push({ width, page: target.name, ...measurement });
      }
    }
  } finally {
    await browser.close();
  }

  return results;
}

function parseCliResult(output) {
  const match = output.match(/### Result\s*\n([\s\S]*?)\n###/);
  if (!match) throw new Error(`Could not parse Playwright CLI result:\n${output}`);
  return JSON.parse(match[1]);
}

function captureWithCodexCli() {
  const wrapper = join(homedir(), ".codex/skills/playwright/scripts/playwright_cli.sh");
  const cli = (...args) => execFileSync("bash", [wrapper, "--session", "glory-widths", ...args], {
    cwd: process.cwd(),
    encoding: "utf8",
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  });
  const results = [];

  try {
    try {
      cli("open", `${baseUrl}/`);
    } catch {
      cli("goto", `${baseUrl}/`);
    }

    const batchCode = `
      const widths = ${JSON.stringify(widths)};
      const targets = ${JSON.stringify(pages)};
      const results = [];
      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        for (const target of targets) {
          await page.goto(${JSON.stringify(baseUrl)} + target.path);
          await page.waitForLoadState('networkidle');
          await page.evaluate(() => document.fonts.ready);
          const measurement = await page.evaluate(${JSON.stringify(overflowExpression())});
          await page.screenshot({ path: ${JSON.stringify(outputDir)} + '/' + width + '/' + target.name + '.png', fullPage: true });
          results.push({ width, page: target.name, ...measurement });
        }
      }
      await page.evaluate((value) => { window.__gloryShotResults = value; }, results);
    `;
    cli("run-code", batchCode);
    results.push(...parseCliResult(cli("eval", "window.__gloryShotResults")));
  } finally {
    try {
      cli("close");
    } catch {
      // The capture results remain valid if the isolated CLI session already closed.
    }
  }

  return results;
}

function createReport(results) {
  const allPass = results.every((result) => !result.overflow);
  const rows = results.map((result) => {
    const status = result.overflow ? "FAIL" : "PASS";
    const details = result.offenders.length
      ? result.offenders.map((item) => `${item.element} (${item.left}~${item.right})`).join("<br>")
      : "-";
    return `| ${result.width} | ${result.page} | ${result.viewportWidth} | ${result.scrollWidth} | ${status} | ${details} |`;
  });

  return `# 작업 요청 #1-1 검증 보고서

## 결과

- 전체 가로 스크롤 검사: **${allPass ? "PASS" : "FAIL"}**
- 캡처: \`docs/compare/widths/{폭}/{home|column-main|column-detail}.png\`
- 판정식: \`document.documentElement.scrollWidth > window.innerWidth\`

## 폭별 자동 검사

| 폭 | 화면 | innerWidth | scrollWidth | 결과 | 화면 밖 요소 |
|---:|---|---:|---:|:---:|---|
${rows.join("\n")}

## B·C 수정 전/후

- B1 서명 폰트: 폰트 변수 클래스를 \`html\`에 적용하고 “이 호”에 Nanum Pen Script의 \`next/font\` 클래스를 직접 연결해 한글 글리프가 실제 서명체로 렌더링되게 했습니다.
- B2 칼럼 헤더: 칼럼 메인의 “칼럼 검색 / 홈페이지 →”를 “홈페이지 → / EN · 中 · 日”로 교체하고, 상세 헤더는 기존 문구를 유지했습니다.
- B3 시술 카드: 8번째 “[필러명]”을 원본 \`renderVals()\`의 “스페셜필러”로 교체했습니다.
- B4 최신 칼럼: 제목·카테고리·“핵심 답변 한 줄 미리보기” 문구를 Main.dc.html의 6개 카드 데이터와 일치시켰습니다.
- C1 상세 푸터: 의료법 고지 아래에 칼럼 메인과 같은 디자인·문구의 푸터를 추가했습니다.
- C2 히어로 자리표시: 중앙에서 제목과 겹치던 브랜딩 영상 문구를 오른쪽 아래 작은 글씨로 이동했습니다.
- C3 갤러리 제목: 경계에 걸치던 제목을 왼쪽으로 이동해 전체가 토프 배경 안에 놓이도록 했습니다.
`;
}

for (const width of widths) {
  await mkdir(`${outputDir}/${width}`, { recursive: true });
}

let results;
try {
  results = await captureWithApi();
} catch (error) {
  console.warn(`Playwright API browser launch failed; using the installed Codex Playwright CLI session. ${error.message}`);
  results = captureWithCodexCli();
}

await writeFile(reportPath, createReport(results), "utf8");
console.log(`Captured ${results.length} screenshots in ${outputDir}`);
console.log(`Wrote overflow report to ${reportPath}`);
