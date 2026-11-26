"use client";

import { useEffect } from "react";

const DISABLED_ATTRIBUTE = "data-home-link-disabled";
const ORIGINAL_TABINDEX_ATTRIBUTE = "data-home-original-tabindex";
const NO_TABINDEX = "__none__";

function shouldDisable(anchor: HTMLAnchorElement) {
  const href = anchor.getAttribute("href");
  if (!href || href.startsWith("#") || /^(?:mailto|sms|tel):/i.test(href)) return false;

  let url: URL;
  try {
    url = new URL(href, window.location.href);
  } catch {
    return false;
  }

  if (url.origin !== window.location.origin) return false;
  if (url.pathname === "/consultation" || url.pathname.startsWith("/treatments/") || url.pathname === "/doctor/lee-ho") return false;
  if (url.pathname === "/column" || url.pathname.startsWith("/column/")) return false;
  if (url.pathname === window.location.pathname && url.hash) return false;
  return true;
}

function restoreLink(anchor: HTMLAnchorElement) {
  if (!anchor.hasAttribute(DISABLED_ATTRIBUTE)) return;
  const originalTabIndex = anchor.getAttribute(ORIGINAL_TABINDEX_ATTRIBUTE);
  anchor.removeAttribute(DISABLED_ATTRIBUTE);
  anchor.removeAttribute(ORIGINAL_TABINDEX_ATTRIBUTE);
  anchor.removeAttribute("aria-disabled");
  if (originalTabIndex && originalTabIndex !== NO_TABINDEX) anchor.setAttribute("tabindex", originalTabIndex);
  else anchor.removeAttribute("tabindex");
}

export function HomeInternalLinkGate() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-home-navigation-scope]");
    if (!root) return;

    const syncLinks = () => {
      root.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((anchor) => {
        if (!shouldDisable(anchor)) {
          restoreLink(anchor);
          return;
        }
        if (!anchor.hasAttribute(DISABLED_ATTRIBUTE)) {
          anchor.setAttribute(ORIGINAL_TABINDEX_ATTRIBUTE, anchor.getAttribute("tabindex") ?? NO_TABINDEX);
        }
        anchor.setAttribute(DISABLED_ATTRIBUTE, "");
        anchor.setAttribute("aria-disabled", "true");
        anchor.setAttribute("tabindex", "-1");
      });
    };

    const blockNavigation = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const anchor = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!anchor || !root.contains(anchor) || !shouldDisable(anchor)) return;
      event.preventDefault();
      event.stopPropagation();
    };

    syncLinks();
    const observer = new MutationObserver(syncLinks);
    observer.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ["href"] });
    root.addEventListener("click", blockNavigation, true);

    return () => {
      observer.disconnect();
      root.removeEventListener("click", blockNavigation, true);
      root.querySelectorAll<HTMLAnchorElement>(`a[${DISABLED_ATTRIBUTE}]`).forEach(restoreLink);
    };
  }, []);

  return null;
}
