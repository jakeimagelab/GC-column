export const MOTION_EASE = "cubic-bezier(.22,.61,.36,1)";

const HIGHLIGHT_PATTERN = /==([^=\n]+)==/g;

export function stripMotionMarkup(value: string) {
  return value.replace(HIGHLIGHT_PATTERN, "$1");
}

export function extractFirstNumber(value: string, fallback = 0) {
  const match = stripMotionMarkup(value).match(/\d+/);
  return match ? Number(match[0]) : fallback;
}

export function splitHighlights(value: string) {
  const parts: Array<{ value: string; highlighted: boolean }> = [];
  let cursor = 0;
  let match: RegExpExecArray | null;
  const pattern = new RegExp(HIGHLIGHT_PATTERN.source, "g");

  while ((match = pattern.exec(value))) {
    if (match.index > cursor) parts.push({ value: value.slice(cursor, match.index), highlighted: false });
    parts.push({ value: match[1], highlighted: true });
    cursor = match.index + match[0].length;
  }
  if (cursor < value.length) parts.push({ value: value.slice(cursor), highlighted: false });
  return parts.length ? parts : [{ value, highlighted: false }];
}
