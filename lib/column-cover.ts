import type { Column } from "@/content/types";

export function getColumnCover(column: Pick<Column, "heroImage" | "listImage">) {
  return column.heroImage || column.listImage || "/uploads/glory-column-editorial-campaign-01.png";
}
