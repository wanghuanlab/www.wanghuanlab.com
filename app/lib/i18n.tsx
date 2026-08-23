"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { LANGUAGES, translations } from "../locales";
import type { LanguageKey, LanguageMeta, TranslationSchema } from "../locales";

const LANG_KEY = "wl:lang:v1";

type I18nContextType = {
  lang: LanguageKey;
  setLang: (lang: LanguageKey) => void;
  t: TranslationSchema;
  languages: LanguageMeta[];
};

const I18nContext = createContext<I18nContextType | null>(null);

const detectBrowserLanguage = (): LanguageKey => {
  if (typeof window === "undefined" || !navigator.language) return "zh";
  const navLang = navigator.language.toLowerCase();
  if (navLang.startsWith("zh")) return "zh";
  if (navLang.startsWith("ja")) return "ja";
  if (navLang.startsWith("ko")) return "ko";
  if (navLang.startsWith("en")) return "en";
  return "en";
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LanguageKey>("zh");

  useEffect(() => {
    const sync = () => {
      try {
        const saved = window.localStorage.getItem(LANG_KEY) as LanguageKey | null;
        if (saved && (saved === "zh" || saved === "en" || saved === "ja" || saved === "ko")) {
          setLangState(saved);
          document.documentElement.lang = saved;
        } else {
          const detected = detectBrowserLanguage();
          setLangState(detected);
          document.documentElement.lang = detected;
        }
      } catch {
        /* 静默降级 */
      }
    };
    const id = window.setTimeout(sync, 0);
    return () => window.clearTimeout(id);
  }, []);

  const setLang = useCallback((nextLang: LanguageKey) => {
    setLangState(nextLang);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(LANG_KEY, nextLang);
        document.documentElement.lang = nextLang;
      } catch {
        /* 静默降级 */
      }
    }
  }, []);

  const t = translations[lang] ?? translations.zh;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, languages: LANGUAGES }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useTranslation must be used within an I18nProvider");
  }
  return context;
}
