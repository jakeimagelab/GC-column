import { execFile } from "node:child_process";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import readline from "node:readline/promises";
import sharp from "sharp";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const inbox = path.join(root, "photos-inbox");
const placementsPath = path.join(inbox, "placements.json");
const contentPath = path.join(root, "content", "site-content.json");
const uploads = path.join(root, "public", "uploads");
const assumeYes = process.argv.includes("--yes") || process.env.IMAGES_APPLY_ALL_DUPLICATES === "1";
const relatedSlotGroups = [
  ["home.doctor.photo", "column.doctor.photo"],
];

const safeName = (value) => path.basename(value).normalize("NFC");
const safeStem = (value) => value.replace(/\.[^.]+$/, "").replace(/[^a-z0-9가-힣_-]+/gi, "-").replace(/^-+|-+$/g, "") || "photo";

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJsonAtomic(file, value) {
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(temporary, file);
}

async function availableDonePath(directory, fileName) {
  const extension = path.extname(fileName);
  const stem = extension ? fileName.slice(0, -extension.length) : fileName;
  for (let index = 1; ; index += 1) {
    const candidate = path.join(directory, index === 1 ? fileName : `${stem}-${index}${extension}`);
    try {
      await access(candidate);
    } catch (error) {
      if (error?.code === "ENOENT") return candidate;
      throw error;
    }
  }
}

function editableImage(content, id) {
  const direct = content[id];
  if (direct && !Array.isArray(direct) && (direct.type === "image" || direct.type === "bgImage")) return direct;

  const heroPrefix = "home.hero.slides.";
  if (id.startsWith(heroPrefix)) {
    const rest = id.slice(heroPrefix.length);
    const split = rest.lastIndexOf(".");
    const slideId = rest.slice(0, split);
    const field = rest.slice(split + 1);
    const slide = content["home.hero.slides"]?.find((item) => item.id === slideId);
    if (slide && field === "bgImage") return slide.bgImage;
  }

  const equipmentPrefix = "home.equipment.items.";
  if (id.startsWith(equipmentPrefix)) {
    const rest = id.slice(equipmentPrefix.length);
    const split = rest.lastIndexOf(".");
    const itemId = rest.slice(0, split);
    const field = rest.slice(split + 1);
    const item = content["home.equipment.items"]?.find((value) => value.id === itemId);
    if (item && field === "image") return item.image;
  }
  return null;
}

async function readCopyright(input) {
  try {
    const { stdout } = await execFileAsync("exiftool", ["-json", "-Copyright", "-Artist", "-Credit", "-Creator", input]);
    const [metadata] = JSON.parse(stdout);
    return {
      copyright: metadata?.Copyright || "",
      artist: metadata?.Artist || metadata?.Creator || "",
      credit: metadata?.Credit || "",
    };
  } catch {
    return { copyright: "", artist: "", credit: "" };
  }
}

async function restoreCopyright(output, metadata) {
  const args = ["-overwrite_original"];
  if (metadata.copyright) args.push(`-Copyright=${metadata.copyright}`);
  if (metadata.artist) args.push(`-Artist=${metadata.artist}`);
  if (metadata.credit) args.push(`-Credit=${metadata.credit}`);
  if (args.length === 1) return;
  args.push(output);
  try { await execFileAsync("exiftool", args); } catch { console.warn(`저작권 메타데이터 재기록 실패: ${path.basename(output)}`); }
}

async function confirmDuplicateGroups(pending) {
  const selected = new Set(pending.map((item) => item.id));
  const groups = new Map();
  pending.filter((item) => item.kind === "사진").forEach((item) => groups.set(item.fileName, [...(groups.get(item.fileName) ?? []), item]));
  const duplicates = [...groups.entries()].filter(([, items]) => items.length > 1);
  if (!duplicates.length || assumeYes) return selected;

  if (!process.stdin.isTTY) {
    console.log("중복 사진 배치는 비대화형 실행이므로 모두 함께 반영합니다. 개별 선택은 터미널에서 npm run images:apply를 실행하세요.");
    return selected;
  }
  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  for (const [fileName, items] of duplicates) {
    const answer = await prompt.question(`같은 사진 '${fileName}'이 ${items.length}곳(${items.map((item) => item.slotName).join(", ")})에 배치되어 있습니다. 모두 함께 반영할까요? [Y/n] `);
    if (/^n/i.test(answer.trim())) items.slice(1).forEach((item) => selected.delete(item.id));
  }
  prompt.close();
  return selected;
}

async function confirmRelatedSlots(pending, content) {
  const choices = new Map();
  const candidates = pending.filter((item) => item.kind === "사진").flatMap((placement) => {
    const group = relatedSlotGroups.find((slots) => slots.includes(placement.slotId));
    if (!group) return [];
    const related = group.filter((slotId) => (
      slotId !== placement.slotId &&
      editableImage(content, slotId) &&
      !pending.some((item) => item.slotId === slotId)
    ));
    return related.length ? [{ placement, related }] : [];
  });
  if (!candidates.length) return choices;

  if (assumeYes) {
    candidates.forEach(({ placement, related }) => choices.set(placement.id, related));
    return choices;
  }
  if (!process.stdin.isTTY) {
    console.log("연결된 사진 자리는 비대화형 실행에서 자동 반영하지 않습니다. 터미널에서 실행해 선택하거나 --yes를 사용하세요.");
    return choices;
  }

  const prompt = readline.createInterface({ input: process.stdin, output: process.stdout });
  for (const { placement, related } of candidates) {
    const answer = await prompt.question(`'${placement.slotName}' 사진을 연결된 자리(${related.join(", ")})에도 함께 반영할까요? [y/N] `);
    if (/^y/i.test(answer.trim())) choices.set(placement.id, related);
  }
  prompt.close();
  return choices;
}

async function main() {
  let placements;
  try { placements = await readJson(placementsPath); } catch {
    console.log("photos-inbox/placements.json이 없습니다. 반영할 임시 배치가 없습니다.");
    return;
  }
  const content = await readJson(contentPath);
  const pending = placements.filter((item) => item.status === "임시");
  if (!pending.length) {
    console.log("반영할 임시 배치가 없습니다.");
    return;
  }

  const selected = await confirmDuplicateGroups(pending);
  const relatedChoices = await confirmRelatedSlots(pending.filter((item) => selected.has(item.id)), content);
  await mkdir(uploads, { recursive: true });
  const processedFiles = new Map();
  const completedFileNames = new Set();
  let applied = 0;
  let missingAlt = 0;
  let failed = 0;
  let relatedApplied = 0;

  for (const placement of pending) {
    if (!selected.has(placement.id)) continue;
    try {
      const entry = editableImage(content, placement.slotId);
      if (!entry) throw new Error(`site-content.json에서 '${placement.slotId}' 자리를 찾을 수 없습니다.`);

      if (placement.kind === "사진") {
        let src = processedFiles.get(placement.fileName);
        if (!src) {
          const input = path.join(inbox, safeName(placement.fileName));
          const outputName = `${safeStem(placement.fileName)}-${Date.now()}-${placement.id.slice(0, 8)}.webp`;
          const output = path.join(uploads, outputName);
          const copyright = await readCopyright(input);
          await sharp(input)
            .rotate()
            .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
            .webp({ quality: 88, effort: 5 })
            .toFile(output);
          await restoreCopyright(output, copyright);
          src = `/uploads/${outputName}`;
          processedFiles.set(placement.fileName, src);
          completedFileNames.add(placement.fileName);
        }
        entry.src = src;
        entry.alt = placement.alt;
        if (!placement.alt.trim()) missingAlt += 1;
      }

      entry.zoom = placement.desktop.zoom;
      entry.focusX = placement.desktop.x;
      entry.focusY = placement.desktop.y;
      entry.desktop = placement.desktop;
      if (placement.mobile) entry.mobile = placement.mobile;
      else delete entry.mobile;
      for (const relatedId of relatedChoices.get(placement.id) ?? []) {
        const relatedEntry = editableImage(content, relatedId);
        if (!relatedEntry) continue;
        relatedEntry.src = entry.src;
        relatedEntry.alt = entry.alt;
        relatedApplied += 1;
      }
      placement.status = "반영됨";
      placement.appliedAt = new Date().toISOString();
      applied += 1;
    } catch (error) {
      failed += 1;
      placement.error = error instanceof Error ? error.message : String(error);
      console.error(`실패 · ${placement.slotId}: ${placement.error}`);
    }
  }

  await writeJsonAtomic(contentPath, content);
  await writeJsonAtomic(placementsPath, placements);

  const date = new Date().toISOString().slice(0, 10);
  const done = path.join(inbox, "_done", date);
  await mkdir(done, { recursive: true });
  for (const fileName of completedFileNames) {
    if (placements.some((item) => item.fileName === fileName && item.status === "임시" && item.kind === "사진")) continue;
    try {
      const safeFileName = safeName(fileName);
      await rename(path.join(inbox, safeFileName), await availableDonePath(done, safeFileName));
    } catch (error) {
      if (error?.code !== "ENOENT") console.warn(`원본 이동 실패 · ${fileName}`);
    }
  }

  console.log(`반영 ${applied}건, 설명 없는 사진 ${missingAlt}건, 실패 ${failed}건${relatedApplied ? `, 연결 자리 ${relatedApplied}건` : ""}`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
