import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ConsultationGuideData } from "@/content/consultation-types";

const dataPath = path.join(process.cwd(), "content", "consultation-guide.json");

export async function readConsultationGuide(): Promise<ConsultationGuideData> {
  return JSON.parse(await readFile(dataPath, "utf8")) as ConsultationGuideData;
}
