export type LanguageKey = "zh" | "en" | "ja" | "ko";

export type LanguageMeta = {
  id: LanguageKey;
  label: string;
  shortLabel: string;
};

export type PortalTranslation = {
  eyebrow: string;
  title: string;
  description: string;
};

export type ChangelogEntryTranslation = {
  date: string;
  tag: string;
  title: string;
  items: string[];
};

export type TranslationSchema = {
  brand: {
    title: string;
    sub: string;
  };
  topbar: {
    liteOn: string;
    liteOff: string;
    liteTitleOn: string;
    liteTitleOff: string;
    probing: string;
    checking: string;
    online: string;
    httpCount: string;
    refreshTitle: string;
    searchTitle: string;
    about: string;
    updates: string;
    nowPlaying: string;
  };
  hero: {
    kickerExplore: string;
    kickerSub: string;
    titleLine1: string;
    titleLine2: string;
    subtitle: string;
    coreBadge: string;
  };
  tabs: {
    all: string;
    common: string;
    infrastructure: string;
    agents: string;
    tools: string;
    projects: string;
    recent: string;
    scrollHint: string;
  };
  portalCard: {
    pin: string;
    unpin: string;
  };
  status: {
    stable: string;
    beta: string;
    experimental: string;
  };
  portals: Record<string, PortalTranslation>;
  search: {
    placeholder: string;
    hintEmpty: string;
    hintNoResult: string;
    kbdSelect: string;
    kbdOpen: string;
    kbdClose: string;
    dialogTitle: string;
  };
  about: {
    title: string;
    eyebrow: string;
    p1: string;
    p2: string;
    factOnline: string;
    factStable: string;
    factGrowing: string;
    contact: string;
  };
  updates: {
    title: string;
    eyebrow: string;
    changelog: ChangelogEntryTranslation[];
  };
  footer: {
    copyright: string;
    icp: string;
    location: string;
  };
};
