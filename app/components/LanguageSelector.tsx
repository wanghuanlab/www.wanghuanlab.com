"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../lib/i18n";
import type { LanguageKey } from "../locales";
import "./LanguageSelector.css";

export function LanguageSelector() {
  const { lang, setLang, languages } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentMeta = languages.find((item) => item.id === lang) ?? languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSelect = (nextLang: LanguageKey) => {
    setLang(nextLang);
    setOpen(false);
  };

  return (
    <div className="lang-selector-shell" ref={containerRef}>
      <button
        className={`topbar-btn lang-toggle ${open ? "is-active" : ""}`}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="listbox"
        title="Switch language / 切换语言"
      >
        <span className="lang-globe" aria-hidden="true">🌐</span>
        <span className="lang-code">{currentMeta.shortLabel}</span>
        <span className="lang-chevron" aria-hidden="true">▾</span>
      </button>

      {open && (
        <ul className="lang-dropdown" role="listbox" aria-label="Select Language">
          {languages.map((item) => (
            <li key={item.id} role="option" aria-selected={item.id === lang}>
              <button
                className={`lang-option ${item.id === lang ? "is-selected" : ""}`}
                type="button"
                onClick={() => handleSelect(item.id)}
              >
                <span className="lang-option-label">{item.label}</span>
                <span className="lang-option-code">{item.shortLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
