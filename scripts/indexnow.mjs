const SITE_URL = "https://blog.gloryclinic.co.kr";
const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const urls = args.filter((arg) => !arg.startsWith("--")).map((value) => value.startsWith("http") ? value : `${SITE_URL}${value.startsWith("/") ? value : `/${value}`}`);
const key = process.env.INDEXNOW_KEY?.trim();

if (!urls.length) {
  console.error("변경 URL을 하나 이상 입력하세요. 예: npm run indexnow -- --dry-run /column/xerf-vs-thermage");
  process.exitCode = 1;
} else {
  const payload = { host: new URL(SITE_URL).host, key: key || "<INDEXNOW_KEY>", keyLocation: `${SITE_URL}/${key || "<INDEXNOW_KEY>"}.txt`, urlList: urls };
  if (dryRun) console.log(JSON.stringify(payload, null, 2));
  else if (!key) {
    console.error("INDEXNOW_KEY 환경 변수가 필요합니다.");
    process.exitCode = 1;
  } else {
    const response = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" }, body: JSON.stringify(payload) });
    if (!response.ok) {
      console.error(`IndexNow 전송 실패: ${response.status} ${await response.text()}`);
      process.exitCode = 1;
    } else console.log(`IndexNow 전송 완료: ${urls.length}개 URL`);
  }
}
