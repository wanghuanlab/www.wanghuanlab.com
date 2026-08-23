"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Portal } from "../data/portals";
import { CATEGORY_LABELS } from "../data/portals";
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
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return portals;
    return portals.filter((portal) => {
      const haystack = [portal.title, portal.description, portal.domain, portal.eyebrow, ...portal.categories.map((c) => CATEGORY_LABELS[c])]
        .join(" ")
        .toLowerCase();
      return term.split(/\s+/).every((part) => haystack.includes(part));
    }).slice(0, MAX_RESULTS);
  }, [query, portals]);

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
      <div className="search-panel" role="dialog" aria-modal="true" aria-label="搜索入口">
        <div className="search-input-row">
          <span className="search-glyph" aria-hidden="true">⌕</span>
          <input
            ref={inputRef}
            className="search-input"
            type="text"
            placeholder="搜索标题、描述、域名或分类…"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            aria-label="搜索实验室入口"
          />
          <kbd className="search-kbd">ESC</kbd>
        </div>
        <div className="search-results" ref={listRef}>
          {showRecents && <p className="search-hint">输入关键词开始搜索全部入口。</p>}
          {!showRecents && results.length === 0 && <p className="search-hint">没有匹配的入口。</p>}
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
              <span className="search-result-category">{CATEGORY_LABELS[portal.categories[0]]}</span>
              <span className="search-result-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </div>
        <footer className="search-foot">
          <span>↑↓ 选择</span>
          <span>↵ 打开</span>
          <span>esc 关闭</span>
        </footer>
      </div>
    </div>
  );
}
