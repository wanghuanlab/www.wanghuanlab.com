"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Portal } from "../data/portals";
import { getLocalizedCategoryLabels } from "../data/portals";
import { useTranslation } from "../lib/i18n";
import { PortalIcon } from "./icons";

type SearchOverlayProps = {
  open: boolean;
  onClose: () => void;
  portals: Portal[];
  recentIds: string[];
};

const MAX_RESULTS = 12;

/** Cmd+K / Ctrl+K 快速搜索浮层，纯本地过滤，无依赖。 */
export function SearchOverlay({ open, onClose, portals, recentIds }: SearchOverlayProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const categoryLabels = useMemo(() => getLocalizedCategoryLabels(t), [t]);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return portals;
    return portals.filter((portal) => {
      const haystack = [portal.title, portal.description, portal.domain, portal.eyebrow, ...portal.categories.map((c) => categoryLabels[c])]
        .join(" ")
        .toLowerCase();
      return term.split(/\s+/).every((part) => haystack.includes(part));
    }).slice(0, MAX_RESULTS);
  }, [query, portals, categoryLabels]);

  useEffect(() => {
    if (!open) return;
    window.setTimeout(() => inputRef.current?.focus(), 30);
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((index) => Math.min(index + 1, results.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((index) => Math.max(index - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const target = results[activeIndex];
        if (target) window.open(target.href, "_blank", "noopener,noreferrer");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, results, activeIndex]);

  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>("[data-active='true']");
    active?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  if (!open) return null;

  const showRecents = !query.trim() && !recentIds.length;

  return (
    <div className="search-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="search-panel" role="dialog" aria-modal="true" aria-label={t.search.dialogTitle}>
        <div className="search-input-row">
          <span className="search-glyph" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder={t.search.placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            aria-label={t.search.dialogTitle}
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>
        <div className="search-results" ref={listRef}>
          {showRecents && <p className="search-hint">{t.search.hintEmpty}</p>}
          {!showRecents && results.length === 0 && <p className="search-hint">{t.search.hintNoResult}</p>}
          {results.map((portal, index) => (
            <a
              key={portal.id}
              className="search-result"
              href={portal.href}
              target="_blank"
              rel="noreferrer"
              data-active={index === activeIndex}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <span className="search-result-icon">
                <PortalIcon name={portal.icon} />
              </span>
              <span className="search-result-copy">
                <strong>{portal.title}</strong>
                <small>{portal.domain}</small>
              </span>
              <span className="search-result-category">{categoryLabels[portal.categories[0]]}</span>
              <span className="search-result-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <footer className="search-foot">
          <span>{t.search.kbdSelect}</span>
          <span>{t.search.kbdOpen}</span>
          <span>{t.search.kbdClose}</span>
        </footer>
      </div>
    </div>
  );
}
