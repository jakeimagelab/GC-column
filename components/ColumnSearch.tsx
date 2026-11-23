"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { getText, textEditProps, type SiteContent } from "@/content/site-content-types";
import { getSuggestions, SearchAutocomplete, type SearchSuggestion } from "./SearchAutocomplete";
import styles from "./ColumnSearch.module.css";

export type SearchColumn = {
  slug: string;
  category: string;
  title: string;
  answer: string;
  keywords: string[];
};

type SearchFaq = { q: string; keywords: string[]; slug: string; id: string };
type ColumnSearchProps = { columns: SearchColumn[]; content: SiteContent; faqIndex: SearchFaq[]; treatments: string[] };

export function ColumnSearch({ columns, content, faqIndex, treatments }: ColumnSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [resultsVisible, setResultsVisible] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const composing = useRef(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const popular = [0, 1, 2, 3, 4].map((index) => ({ id: `column.search.popular.${index}`, value: getText(content, `column.search.popular.${index}`) }));
  const suggestionIndex = useMemo<SearchSuggestion[]>(() => [
    ...columns.map((column) => ({ id: `column-${column.slug}`, type: "column" as const, label: column.title, href: `/column/${column.slug}` })),
    ...faqIndex.map((faq) => ({ id: `faq-${faq.slug}-${faq.id}`, type: "faq" as const, label: faq.q, href: `/column/${faq.slug}#${faq.id}` })),
  ], [columns, faqIndex]);
  const suggestions = useMemo(() => getSuggestions(suggestionIndex, query), [query, suggestionIndex]);
  const suggestionsOpen = inputFocused && suggestions.length > 0;

  const runSearch = (nextQuery: string) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    const trimmed = nextQuery.trim();
    if (trimmed) {
      setSearchQuery(trimmed);
      requestAnimationFrame(() => setResultsVisible(true));
      return;
    }
    setResultsVisible(false);
    hideTimer.current = setTimeout(() => setSearchQuery(""), 200);
  };

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("q")?.trim();
    if (initial) {
      setQuery(initial);
      runSearch(initial);
    }
  }, []);

  useEffect(() => {
    if (composing.current) return;
    const timer = setTimeout(() => runSearch(query), 100);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const results = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const hit = (keywords: string[], title: string) => q.length > 0 && (
      keywords.some((keyword) => keyword.toLowerCase().includes(q) || q.includes(keyword.toLowerCase())) ||
      title.toLowerCase().includes(q)
    );
    const matchedColumns = columns.filter((column) => hit(column.keywords, column.title));
    const faqs = faqIndex.filter((faq) => hit(faq.keywords, faq.q));
    const matchedTreatments = treatments.filter((treatment) =>
      treatment.toLowerCase().includes(q) ||
      (q.length > 1 && matchedColumns.some((column) => column.keywords.some((keyword) => treatment.includes(keyword)))),
    );
    const seen = new Set<string>();
    const related: string[] = [];
    matchedColumns.forEach((column) => column.keywords.forEach((keyword) => {
      if (!seen.has(keyword) && keyword.toLowerCase() !== q && related.length < 8) {
        seen.add(keyword);
        related.push(keyword);
      }
    }));
    return { q, matchedColumns, faqs, matchedTreatments, related };
  }, [columns, faqIndex, searchQuery, treatments]);

  const isEmpty = results.matchedColumns.length === 0 && results.faqs.length === 0;
  const chooseQuery = (value: string) => {
    setQuery(value);
    runSearch(value);
    inputRef.current?.focus();
  };
  const selectSuggestion = (suggestion: SearchSuggestion) => {
    setInputFocused(false);
    router.push(suggestion.href);
  };

  return (
    <div className={styles.search} id="search">
      <div className={styles.inputRow}>
        <label htmlFor="column-search" {...textEditProps("column.search.label")}>{getText(content, "column.search.label")}</label>
        <MagnifyingGlassIcon className={styles.searchIcon} aria-hidden="true" />
        <input
          ref={inputRef}
          id="column-search"
          type="search"
          value={query}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={suggestionsOpen}
          aria-controls="column-search-suggestions"
          aria-activedescendant={suggestionsOpen && activeSuggestion >= 0 ? `column-search-suggestions-${activeSuggestion}` : undefined}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          onChange={(event) => { setQuery(event.target.value); setActiveSuggestion(-1); }}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(event) => {
            composing.current = false;
            setQuery(event.currentTarget.value);
            runSearch(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && suggestionsOpen) { event.preventDefault(); setActiveSuggestion((value) => (value + 1) % suggestions.length); }
            else if (event.key === "ArrowUp" && suggestionsOpen) { event.preventDefault(); setActiveSuggestion((value) => value <= 0 ? suggestions.length - 1 : value - 1); }
            else if (event.key === "Escape") { setInputFocused(false); }
            else if (event.key === "Enter" && !composing.current) {
              if (suggestionsOpen && activeSuggestion >= 0) { event.preventDefault(); selectSuggestion(suggestions[activeSuggestion]); }
              else runSearch(query);
            }
          }}
          placeholder={getText(content, "column.search.placeholder")}
          data-edit-control
        />
        {query ? <button type="button" className={styles.clear} aria-label="검색어 지우기" onClick={() => chooseQuery("")} data-edit-control>{getText(content, "column.search.clear")}</button> : null}
        <button type="button" className={styles.submit} onClick={() => runSearch(query)} data-edit-control>{getText(content, "column.search.submit")}</button>
        {suggestionsOpen ? <SearchAutocomplete id="column-search-suggestions" items={suggestions} query={query} activeIndex={activeSuggestion} onActive={setActiveSuggestion} onSelect={selectSuggestion} /> : null}
      </div>

      {searchQuery ? (
        <div className={`${styles.resultRegion} ${resultsVisible ? styles.resultRegionVisible : ""}`} aria-live="polite">
          {!isEmpty ? (
            <div className={styles.results}>
              <div className={styles.related}>
                <b {...textEditProps("column.search.relatedKeywords")}>{getText(content, "column.search.relatedKeywords")}</b>
                <div>{results.related.map((keyword) => <button type="button" onClick={() => chooseQuery(keyword)} key={keyword} data-edit-control>{keyword}</button>)}</div>
                <small {...textEditProps("column.search.relatedGuide")}>{getText(content, "column.search.relatedGuide")}</small>
              </div>
              <div className={styles.resultContent}>
                <div className={styles.columnResults}>
                  <b><span {...textEditProps("column.search.relatedColumns")}>{getText(content, "column.search.relatedColumns")}</span> {results.matchedColumns.length}</b>
                  {results.matchedColumns.slice(0, 3).map((column) => (
                    <Link href={`/column/${column.slug}`} key={column.slug}>
                      <small>{column.category}</small><strong>{column.title}</strong><span>{column.answer}</span>
                    </Link>
                  ))}
                </div>
                <div className={styles.faqResults}>
                  <b><span {...textEditProps("column.search.relatedQuestions")}>{getText(content, "column.search.relatedQuestions")}</span> {results.faqs.length}</b>
                  {results.faqs.slice(0, 3).map((faq) => <Link href={`/column/${faq.slug}#${faq.id}`} key={`${faq.slug}-${faq.id}`}>Q. {faq.q}</Link>)}
                </div>
                <div className={styles.treatmentLine}><span {...textEditProps("column.search.treatmentLink")}>{getText(content, "column.search.treatmentLink")}</span> <b>{results.matchedTreatments.length ? results.matchedTreatments.join(" · ") : getText(content, "column.search.allTreatments")}</b></div>
              </div>
            </div>
          ) : (
            <div className={styles.empty}>
              <div><b><span {...textEditProps("column.search.emptyPrefix")}>{getText(content, "column.search.emptyPrefix")}</span> &apos;{searchQuery}&apos;<span {...textEditProps("column.search.emptySuffix")}>{getText(content, "column.search.emptySuffix")}</span></b><span {...textEditProps("column.search.emptyDescription")}>{getText(content, "column.search.emptyDescription")}</span></div>
              <button type="button" data-edit-control>{getText(content, "column.search.emptyAction")}</button>
            </div>
          )}
        </div>
      ) : null}

      <div className={styles.popular}>
        <span>{getText(content, "column.search.popularLabel")}</span>
        {popular.map((keyword) => <button type="button" onClick={() => chooseQuery(keyword.value)} key={keyword.id} data-edit-control>{keyword.value}</button>)}
      </div>
    </div>
  );
}
