import { en } from "./en";
import { ja } from "./ja";
import { ko } from "./ko";
import type { LanguageKey, LanguageMeta, TranslationSchema } from "./types";
import { zh } from "./zh";

export type { LanguageKey, LanguageMeta, TranslationSchema };

export const LANGUAGES: LanguageMeta[] = [
  { id: "zh", label: "简体中文", shortLabel: "ZH" },
  { id: "en", label: "English", shortLabel: "EN" },
  { id: "ja", label: "日本語", shortLabel: "JA" },
  { id: "ko", label: "한국어", shortLabel: "KO" },
];

export const translations: Record<LanguageKey, TranslationSchema> = {
  zh,
  en,
  ja,
  ko,
};
