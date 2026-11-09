import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const PORT = Number(process.env.SEO_CHECK_PORT || 3100);
const LOCAL = process.env.SEO_CHECK_BASE_URL || `http://127.0.0.1:${PORT}`;
const SITE = "https://blog.gloryclinic.co.kr";
const REPORT = "docs/compare/report-seo.md";
const PLACEHOLDER = /(^|\s)\[[^\]]+\](?!\()/;
const ALLOWED_VISIBLE_PLACEHOLDER = "[개인정보 수집 동의 문구 확인 필요]";
const AD_TERMS = ["최고", "최초", "유일", "100%", "완벽", "보장", "부작용 없", "통증 없", "무통", "1위", "특가"];

const failures = [];
const warnings = [];
const rows = [];

function decode(value = "") {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function attrs(tag) {
  return Object.fromEntries(Array.from(tag.matchAll(/([:\w-]+)=(?:"([^"]*)"|'([^']*)')/g), (match) => [match[1].toLowerCase(), decode(match[2] ?? match[3] ?? "")]));
}

function tags(html, name) {
  return Array.from(html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi")), (match) => match[0]);
}

function meta(html, key, value) {
  const tag = tags(html, "meta").find((item) => attrs(item)[key] === value);
  return tag ? attrs(tag).content ?? "" : "";
}

function link(html, rel) {
  const tag = tags(html, "link").find((item) => (attrs(item).rel ?? "").split(/\s+/).includes(rel));
  return tag ? attrs(tag).href ?? "" : "";
}

function stripHtml(html) {
  return decode(html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim());
}

function titleOf(html) {
  return decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
}

function jsonLdOf(html) {
  const scripts = Array.from(html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi))
    .filter((match) => attrs(`<script ${match[1]}>`).type === "application/ld+json")
    .map((match) => match[2]);
  return scripts;
}

function graphTypes(json) {
  return new Set((json?.["@graph"] ?? []).map((node) => node?.["@type"]).flat().filter(Boolean));
}

function localize(url) {
  const parsed = new URL(url, SITE);
  return `${LOCAL}${parsed.pathname}${parsed.search}`;
}

function fail(path, message) {
  failures.push(`${path}: ${message}`);
}

function warn(path, message) {
  warnings.push(`${path}: ${message}`);
}

async function fetchText(path, options = {}) {
  const response = await fetch(path.startsWith("http") ? path : `${LOCAL}${path}`, { redirect: options.redirect ?? "follow" });
  return { response, text: await response.text() };
}

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`${LOCAL}/robots.txt`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("운영 서버가 제한 시간 안에 시작되지 않았습니다.");
}

function checkRequiredNode(path, graph, type, fields) {
  const node = graph.find((item) => item?.["@type"] === type);
  if (!node) {
    fail(path, `JSON-LD ${type} 누락`);
    return;
  }
  for (const field of fields) if (node[field] === undefined || node[field] === "") fail(path, `JSON-LD ${type}.${field} 누락`);
}

async function checkPage(path, publicUrl) {
  const { response, text: html } = await fetchText(path);
  if (response.status !== 200) {
    fail(path, `HTTP ${response.status}`);
    rows.push({ path, status: response.status, title: "-", description: "-", result: "FAIL" });
    return { html, graph: undefined };
  }

  const before = failures.length;
  const title = titleOf(html);
  const description = meta(html, "name", "description");
  const canonical = link(html, "canonical");
  const visible = stripHtml(html);
  const headings = Array.from(html.matchAll(/<h([1-6])\b[^>]*>/gi), (match) => ({ level: Number(match[1]), index: match.index ?? 0 }));
  const h1Count = headings.filter((heading) => heading.level === 1).length;

  if (title.length < 15 || title.length > 60) fail(path, `title 길이 ${title.length}자 (기준 15~60)`);
  if (description.length < 50 || description.length > 160) fail(path, `description 길이 ${description.length}자 (기준 50~160)`);
  if (canonical !== publicUrl) fail(path, `canonical 불일치 (${canonical || "없음"})`);
  if (h1Count !== 1) fail(path, `h1 ${h1Count}개`);
  if (headings.some((heading, index) => index > 0 && heading.level > headings[index - 1].level + 1)) fail(path, "제목 단계가 건너뜀");
  if (headings.find((heading) => heading.level === 2)?.index < headings.find((heading) => heading.level === 1)?.index) fail(path, "h2가 h1보다 먼저 나옴");
  if (PLACEHOLDER.test(visible.replaceAll(ALLOWED_VISIBLE_PLACEHOLDER, ""))) fail(path, "화면에 자리표시 문구 노출");
  for (const imageTag of tags(html, "img")) if (!("alt" in attrs(imageTag))) fail(path, `alt 없는 이미지 (${imageTag.slice(0, 100)})`);

  const scripts = jsonLdOf(html);
  if (scripts.length !== 1) fail(path, `JSON-LD 스크립트 ${scripts.length}개 (기준 1)`);
  let data;
  if (scripts[0]) {
    try {
      data = JSON.parse(scripts[0]);
    } catch (error) {
      fail(path, `JSON-LD 파싱 실패 (${error.message})`);
    }
  }
  const graph = data?.["@graph"] ?? [];
  checkRequiredNode(path, graph, "MedicalClinic", ["@id", "name", "url", "telephone", "address"]);
  checkRequiredNode(path, graph, "WebSite", ["@id", "name", "url", "publisher", "potentialAction"]);
  checkRequiredNode(path, graph, "Physician", ["@id", "name", "jobTitle", "worksFor", "url"]);
  const types = graphTypes(data);
  if (path === "/" && !types.has("WebPage")) fail(path, "WebPage JSON-LD 누락");
  if (path === "/doctor/lee-ho" && !types.has("ProfilePage")) fail(path, "ProfilePage JSON-LD 누락");
  if ((path === "/column" || path === "/column/all" || path.startsWith("/column/category/")) && (!types.has("CollectionPage") || !types.has("ItemList"))) fail(path, "CollectionPage/ItemList JSON-LD 누락");
  if (/^\/column\/[^/]+$/.test(path) && path !== "/column/all") {
    for (const type of ["MedicalWebPage", "FAQPage", "BreadcrumbList"]) if (!types.has(type)) fail(path, `${type} JSON-LD 누락`);
    const faq = graph.find((node) => node?.["@type"] === "FAQPage");
    for (const item of faq?.mainEntity ?? []) {
      if (!visible.includes(item.name) || !visible.includes(item.acceptedAnswer?.text ?? "")) fail(path, `FAQ 화면/JSON-LD 불일치 (${item.name})`);
    }
  }
  if (meta(html, "name", "robots").includes("noindex")) fail(path, "공개 URL에 noindex 노출");

  for (const term of AD_TERMS) if (`${title} ${description} ${visible}`.includes(term)) warn(path, `의료광고 주의 표현 “${term}”`);

  rows.push({ path, status: response.status, title: title.length, description: description.length, result: failures.length === before ? "PASS" : "FAIL" });
  return { html, graph: data };
}

async function main() {
  const server = process.env.SEO_CHECK_BASE_URL ? null : spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "-H", "127.0.0.1", "-p", String(PORT)], {
    cwd: process.cwd(),
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let serverLog = "";
  server?.stdout.on("data", (chunk) => { serverLog += chunk; });
  server?.stderr.on("data", (chunk) => { serverLog += chunk; });

  try {
    await waitForServer();
    const sitemap = await fetchText("/sitemap.xml");
    if (sitemap.response.status !== 200) throw new Error(`sitemap.xml HTTP ${sitemap.response.status}`);
    const publicUrls = Array.from(sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g), (match) => decode(match[1]));
    const pageResults = new Map();
    for (const url of publicUrls) {
      const parsed = new URL(url);
      pageResults.set(parsed.pathname, await checkPage(parsed.pathname, url));
    }

    for (const path of ["/robots.txt", "/sitemap.xml", "/rss.xml", "/llms.txt", "/llms-full.txt"]) {
      const result = await fetchText(path);
      if (result.response.status !== 200) fail(path, `HTTP ${result.response.status}`);
      if (PLACEHOLDER.test(result.text)) fail(path, "자리표시 문구 노출");
    }

    const internal = new Set();
    for (const [source, result] of pageResults) {
      for (const tag of tags(result.html, "a")) {
        const href = attrs(tag).href;
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) continue;
        const url = new URL(href, SITE);
        if (url.origin === SITE && !url.pathname.startsWith("/_next/") && !url.pathname.startsWith("/api/")) internal.add(`${source}\t${url.pathname}${url.search}`);
      }
    }
    for (const item of internal) {
      const [source, target] = item.split("\t");
      const response = await fetch(localize(target), { redirect: "manual" });
      if (response.status >= 400) fail(source, `내부 링크 ${target} → HTTP ${response.status}`);
    }

    const missing = await fetchText("/seo-check-not-found");
    if (missing.response.status !== 404) fail("/404", `없는 페이지 HTTP ${missing.response.status}`);
    if (!meta(missing.text, "name", "robots").includes("noindex")) fail("/404", "noindex 누락");

    const draft = await fetchText("/column/ulthera-with-xerf");
    if (draft.response.status !== 404) fail("/draft", `비공개 칼럼 HTTP ${draft.response.status}`);
    const editorApi = await fetchText("/api/dev-edit");
    if (editorApi.response.status !== 404) fail("/api/dev-edit", `운영 편집 API HTTP ${editorApi.response.status}`);
    const questionsApi = await fetch(`${LOCAL}/api/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "운영 환경 질문 접수 비활성 확인 문장입니다.", consentPrivacy: true }),
    });
    if (questionsApi.status !== 503) fail("/api/questions", `운영 질문 API HTTP ${questionsApi.status} (기준 503)`);

    const detail = pageResults.get("/column/xerf-vs-thermage");
    if (!detail) fail("/column/xerf-vs-thermage", "공개 칼럼이 sitemap에 없음");

    const jsonLdAppendix = [...pageResults.entries(), ["/404", { graph: (() => {
      const script = jsonLdOf(missing.text)[0];
      if (!script) return undefined;
      try { return JSON.parse(script); } catch { return undefined; }
    })() }]].map(([path, result]) => `### \`${path}\`\n\n<details><summary>JSON-LD 전문 보기</summary>\n\n\`\`\`json\n${JSON.stringify(result.graph, null, 2)}\n\`\`\`\n\n</details>`).join("\n\n");

    await mkdir("docs/compare", { recursive: true });
    const report = `# SEO 자동 검사 보고서\n\n- 실행 시각: ${new Date().toISOString()}\n- 공개 URL: ${publicUrls.length}개\n- FAIL: ${failures.length}개\n- 경고: ${warnings.length}개\n\n## URL 결과\n\n| URL | HTTP | title 길이 | description 길이 | 결과 |\n|---|---:|---:|---:|:---:|\n${rows.map((row) => `| ${row.path} | ${row.status} | ${row.title} | ${row.description} | ${row.result} |`).join("\n")}\n\n## 실패\n\n${failures.length ? failures.map((item) => `- FAIL: ${item}`).join("\n") : "- FAIL 없음"}\n\n## 의료광고 주의 표현\n\n${warnings.length ? warnings.map((item) => `- WARN: ${item}`).join("\n") : "- 경고 없음"}\n\n## 페이지별 JSON-LD 전문\n\n${jsonLdAppendix}\n`;
    await writeFile(REPORT, report, "utf8");
    console.log(`SEO check: ${failures.length ? "FAIL" : "PASS"} (${publicUrls.length} URLs, ${failures.length} failures, ${warnings.length} warnings)`);
    console.log(`Report: ${REPORT}`);
    if (failures.length) {
      console.error(failures.map((item) => `FAIL ${item}`).join("\n"));
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.stack : error);
    if (serverLog) console.error(serverLog);
    process.exitCode = 1;
  } finally {
    server?.kill("SIGTERM");
  }
}

await main();
