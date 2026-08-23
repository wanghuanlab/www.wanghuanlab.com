"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Portal } from "../data/portals";

const hasWindow = () => typeof window !== "undefined";

/* ------------------------------------------------------------------ */
/* Lite 模式：手动开关（localStorage）+ 自动检测（低配设备/减少动效）   */
/* ------------------------------------------------------------------ */

const LITE_KEY = "wl:lite:v1";
export type LiteMode = "auto" | "on" | "off";

const detectWeakDevice = () => {
  if (!hasWindow()) return false;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = typeof nav.deviceMemory === "number" ? nav.deviceMemory : 8;
  const cores = navigator.hardwareConcurrency ?? 8;
  return memory <= 4 || cores <= 4;
};

export function useLiteMode() {
  // 初始值必须与服务端渲染一致（水合安全）；真实偏好挂载后再从 localStorage 同步。
  const [mode, setModeState] = useState<LiteMode>("off");
  const [reducedMotion, setReducedMotion] = useState(false);
  const [weakDevice, setWeakDevice] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      const saved = window.localStorage.getItem(LITE_KEY);
      setModeState(saved === "on" || saved === "off" || saved === "auto" ? saved : "off");
      setReducedMotion(media.matches);
      setWeakDevice(detectWeakDevice());
    };
    const onMediaChange = () => setReducedMotion(media.matches);
    const id = window.setTimeout(sync, 0);
    media.addEventListener("change", onMediaChange);
    return () => {
      window.clearTimeout(id);
      media.removeEventListener("change", onMediaChange);
    };
  }, []);

  const lite = mode === "on" || (mode === "auto" && (reducedMotion || weakDevice));

  const setMode = useCallback((next: LiteMode) => {
    setModeState(next);
    if (hasWindow()) window.localStorage.setItem(LITE_KEY, next);
  }, []);

  return { lite, mode, setMode };
}

/* ------------------------------------------------------------------ */
/* 在线状态探测：https 子域可用 fetch no-cors 探测，http 子域跳过       */
/* 结果缓存 60s（sessionStorage），顶栏可手动刷新                       */
/* ------------------------------------------------------------------ */

const STATUS_KEY = "wl:status:v1";
export type ProbeState = "online" | "offline";

type StatusCache = Record<string, { state: ProbeState; at: number }>;

const readStatusCache = (): StatusCache => {
  if (!hasWindow()) return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(STATUS_KEY) ?? "{}") as StatusCache;
  } catch {
    return {};
  }
};

const writeStatusCache = (cache: StatusCache) => {
  if (!hasWindow()) return;
  try {
    window.sessionStorage.setItem(STATUS_KEY, JSON.stringify(cache));
  } catch {
    /* storage 不可用时静默降级 */
  }
};

/** 是否可以从当前页面协议探测该入口（http 页面可探测 http 子域，https 页面只能探测 https 子域）。 */
const canProbe = (portal: Portal) => (hasWindow() ? portal.https || window.location.protocol === "http:" : portal.https);

const PROBE_TIMEOUT_MS = 5000;
const PROBE_TTL_MS = 60_000;

export function usePortalStatus(portals: Portal[]) {
  // 初始状态与服务端渲染一致（水合安全）；缓存与探测结果挂载后异步同步。
  const [states, setStates] = useState<Record<string, ProbeState>>({});
  const [probing, setProbing] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const probe = useCallback(
    (force = false) => {
      if (!hasWindow()) return;
      const targets = portals.filter(canProbe);
      if (!targets.length) return;

      const cache = readStatusCache();
      const due = targets.filter(
        (portal) => force || !cache[portal.id] || Date.now() - cache[portal.id].at >= PROBE_TTL_MS,
      );
      if (!due.length) return;

      setProbing(true);
      due.forEach((portal, index) => {
        window.setTimeout(async () => {
          let state: ProbeState = "offline";
          try {
            const controller = new AbortController();
            const timer = window.setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
            await fetch(portal.href, { mode: "no-cors", cache: "no-store", signal: controller.signal });
            window.clearTimeout(timer);
            state = "online";
          } catch {
            state = "offline";
          }
          if (!mountedRef.current) return;
          setStates((prev) => ({ ...prev, [portal.id]: state }));
          const next = readStatusCache();
          next[portal.id] = { state, at: Date.now() };
          writeStatusCache(next);
          if (index === due.length - 1) setProbing(false);
        }, index * 250);
      });
    },
    [portals],
  );

  useEffect(() => {
    const id = window.setTimeout(() => {
      // 先用会话缓存填充展示（避免缓存有效时重复探测却无展示），再按需探测。
      const cache = readStatusCache();
      const fresh: Record<string, ProbeState> = {};
      for (const portal of portals) {
        const entry = cache[portal.id];
        if (entry && Date.now() - entry.at < PROBE_TTL_MS && canProbe(portal)) fresh[portal.id] = entry.state;
      }
      if (Object.keys(fresh).length > 0) setStates((prev) => ({ ...prev, ...fresh }));
      probe(false);
    }, 0);
    return () => window.clearTimeout(id);
  }, [probe, portals]);

  const onlineCount = Object.values(states).filter((state) => state === "online").length;
  const probedCount = Object.values(states).length;
  const httpCount = portals.filter((portal) => !canProbe(portal)).length;

  return { states, probing, onlineCount, probedCount, httpCount, refresh: () => probe(true) };
}

/* ------------------------------------------------------------------ */
/* 常用 / 置顶：点击计数 + 手动置顶，存 localStorage                    */
/* ------------------------------------------------------------------ */

const CLICKS_KEY = "wl:clicks:v1";
const PINS_KEY = "wl:pins:v1";

type ClickEntry = { count: number; lastAt: number };
type ClicksMap = Record<string, ClickEntry>;

const readJSON = <T,>(key: string, fallback: T): T => {
  if (!hasWindow()) return fallback;
  try {
    return { ...fallback, ...JSON.parse(window.localStorage.getItem(key) ?? "{}") } as T;
  } catch {
    return fallback;
  }
};

const readPins = (): string[] => {
  if (!hasWindow()) return [];
  try {
    const raw = window.localStorage.getItem(PINS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
  } catch {
    return [];
  }
};

export const RECENT_LIMIT = 8;

export function useRecentPortals() {
  // 初始值保持与服务端渲染一致（水合安全）；localStorage 数据挂载后异步同步。
  const [clicks, setClicks] = useState<ClicksMap>({});
  const [pins, setPins] = useState<string[]>([]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setClicks(readJSON(CLICKS_KEY, {}));
      setPins(readPins());
    }, 0);
    return () => window.clearTimeout(id);
  }, []);

  const recordClick = useCallback((id: string) => {
    setClicks((prev) => {
      const entry = prev[id] ?? { count: 0, lastAt: 0 };
      const next: ClicksMap = { ...prev, [id]: { count: entry.count + 1, lastAt: Date.now() } };
      if (hasWindow()) window.localStorage.setItem(CLICKS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const togglePin = useCallback((id: string) => {
    setPins((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (hasWindow()) window.localStorage.setItem(PINS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const recentIds = Object.entries(clicks)
    .sort((a, b) => b[1].lastAt - a[1].lastAt)
    .slice(0, RECENT_LIMIT)
    .map(([id]) => id);

  return { clicks, pins, recentIds, recordClick, togglePin };
}
