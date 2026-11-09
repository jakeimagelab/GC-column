export type ClinicHoursData = Record<string, string>;
export type ClinicStatus = "open" | "lunch" | "closed" | "holiday";

const dayKeys = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function minutes(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}
function seoulNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const weekdays: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { day: weekdays[part("weekday")] ?? 0, minute: Number(part("hour")) * 60 + Number(part("minute")) };
}

export function getClinicStatus(hours: ClinicHoursData, date = new Date()): ClinicStatus | null {
  if (!Object.values(hours).some((value) => value.trim())) return null;
  const now = seoulNow(date);
  const value = hours[dayKeys[now.day]]?.trim() ?? "";
  if (!value || /휴진|closed/i.test(value)) return "holiday";
  const ranges = [...value.matchAll(/(\d{1,2}:\d{2})\s*[-–~]\s*(\d{1,2}:\d{2})/g)].map((match) => [minutes(match[1]), minutes(match[2])] as const);
  if (!ranges.length) return "closed";
  const [opening, lunch] = ranges;
  if (lunch && now.minute >= lunch[0] && now.minute < lunch[1]) return "lunch";
  return now.minute >= opening[0] && now.minute < opening[1] ? "open" : "closed";
}
