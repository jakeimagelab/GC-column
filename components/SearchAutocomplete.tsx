"use client";

import type { ReactNode } from "react";
import styles from "./SearchAutocomplete.module.css";

export type SearchSuggestion = {
  id: string;
  type: "column" | "faq";
  label: string;
  href: string;
};

export function getSuggestions(items: SearchSuggestion[], query: string) {
  const normalized = query.trim().toLocaleLowerCase("ko-KR");
  if (!normalized) return [];
  const words = normalized.split(/\s+/).filter((word) => word.length > 0);
  return items.filter((item) => {
    const label = item.label.toLocaleLowerCase("ko-KR");
    return label.includes(normalized) || words.some((word) => label.includes(word));
  }).slice(0, 6);
}
function highlighted(label: string, query: string): ReactNode {
  const terms = query.trim().split(/\s+/).filter(Boolean).toSorted((a, b) => b.length - a.length);
  if (!terms.length) return label;
  const escaped = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  return label.split(regex).map((part, index) => terms.some((term) => term.toLocaleLowerCase("ko-KR") === part.toLocaleLowerCase("ko-KR")) ? <strong key={`${part}-${index}`}>{part}</strong> : part);
}

export function SearchAutocomplete({ id, items, query, activeIndex, onActive, onSelect }: {
  id: string;
  items: SearchSuggestion[];
  query: string;
  activeIndex: number;
  onActive: (index: number) => void;
  onSelect: (item: SearchSuggestion) => void;
}) {
  if (!items.length) return null;
  return (
    <div className={styles.dropdown} id={id} role="listbox" data-edit-control>
      {items.map((item, index) => <button
        type="button"
        id={`${id}-${index}`}
        role="option"
        aria-selected={activeIndex === index}
        className={activeIndex === index ? styles.active : ""}
        onMouseEnter={() => onActive(index)}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onSelect(item)}
        key={item.id}
      ><small>{item.type === "column" ? "칼럼" : "FAQ"}</small><span>{highlighted(item.label, query)}</span></button>)}
    </div>
  );
}
