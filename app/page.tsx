"use client";

import { Suspense, lazy, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { LanguageSelector } from "./components/LanguageSelector";
import { MagicBentoCard, MagicBentoGrid } from "./components/MagicBento";
import { Modal } from "./components/Modal";
import { SearchOverlay } from "./components/SearchOverlay";
import { PortalIcon } from "./components/icons";
import {
  PORTALS,
  getLocalizedPortals,
  getLocalizedStatusLabels,
  getLocalizedTabs,
} from "./data/portals";
import type { Portal, PortalCategory, PortalTabId } from "./data/portals";
import { useTranslation } from "./lib/i18n";
import { RECENT_LIMIT, useLiteMode, usePortalStatus, useRecentPortals } from "./lib/hooks";

const LIGHTFALL_COLORS = ["#39F3FF", "#6B62FF", "#B85CFF"];

const Lightfall = lazy(() => import("./components/Lightfall"));

/* ------------------------------------------------------------------ */
/* 粒子背景：lite 模式与减少动效下降低密度                              */
/* ------------------------------------------------------------------ */

function ParticleField({ density = 120 }: { density?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    let frame = 0;
    let width = 0;
    let height = 0;
    let pointerX = 0;
    let pointerY = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const count = Math.max(12, Math.min(reduced ? 45 : density, 160));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      z: Math.random(),
      speed: 0.00008 + Math.random() * 0.00018,
    }));

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    const move = (event: PointerEvent) => {
      pointerX = event.clientX / width - 0.5;
      pointerY = event.clientY / height - 0.5;
    };
    const draw = () => {
      context.clearRect(0, 0, width, height);
      particles.forEach((particle) => {
        if (!reduced) {
          particle.y -= particle.speed;
          if (particle.y < -0.02) particle.y = 1.02;
        }
        const depth = 0.3 + particle.z * 0.9;
        const x = particle.x * width + pointerX * 18 * depth;
        const y = particle.y * height + pointerY * 14 * depth;
        const radius = 0.35 + particle.z * 1.25;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fillStyle = particle.z > 0.72 ? `rgba(65,240,255,${0.3 + particle.z * 0.45})` : `rgba(190,184,255,${0.15 + particle.z * 0.35})`;
        context.fill();
      });
      if (!reduced) frame = requestAnimationFrame(draw);
    };
    resize();
    draw();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", move);
    };
  }, [density]);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Lightfall 延迟加载：首屏后 600ms 再拉取 OGL 分块；lite 下不加载      */
/* ------------------------------------------------------------------ */

function DeferredLightfall({ lite }: { lite: boolean }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (lite) return;
    const id = window.setTimeout(() => setReady(true), 600);
    return () => window.clearTimeout(id);
  }, [lite]);

  if (lite || !ready) return null;
  return (
    <Suspense fallback={null}>
      <Lightfall
        colors={LIGHTFALL_COLORS}
        backgroundColor="#070A1E"
        speed={0.58}
        streakCount={4}
        streakWidth={0.8}
        streakLength={1.4}
        glow={0.72}
        density={0.68}
        twinkle={0.72}
        zoom={2.7}
        backgroundGlow={0.26}
        opacity={0.4}
        mouseInteraction
        mouseStrength={0.75}
        mouseRadius={0.78}
        mouseDampening={0.18}
        mixBlendMode="screen"
        dpr={1.25}
      />
    </Suspense>
  );
}

/* ------------------------------------------------------------------ */
/* 首页                                                                 */
/* ------------------------------------------------------------------ */

export default function Home() {
  const { t } = useTranslation();
  const [musicOpen, setMusicOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<PortalTabId>("all");
  const [showScrollHint, setShowScrollHint] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [updatesOpen, setUpdatesOpen] = useState(false);
  const hoverAudioRef = useRef<AudioContext | null>(null);
  const prevRectsRef = useRef<Map<string, DOMRect>>(new Map());

  const localizedPortals = useMemo(() => getLocalizedPortals(t), [t]);
  const portalTabs = useMemo(() => getLocalizedTabs(t), [t]);
  const statusLabels = useMemo(() => getLocalizedStatusLabels(t), [t]);

  const { lite, setMode } = useLiteMode();
  const { states, probing, onlineCount, probedCount, httpCount, refresh } = usePortalStatus(PORTALS);
  const { pins, recentIds, recordClick, togglePin } = useRecentPortals();

  const pinnedSet = useMemo(() => new Set(pins), [pins]);

  /* 可见入口：全部 = 置顶前置 + 其余保持数据原始顺序；最近 = 最近点击 */
  const visiblePortals = useMemo(() => {
    if (activeCategory === "recent") {
      return recentIds
        .map((id) => localizedPortals.find((portal) => portal.id === id))
        .filter((portal): portal is Portal => Boolean(portal));
    }
    const base =
      activeCategory === "all"
        ? localizedPortals
        : localizedPortals.filter((portal) => portal.categories.includes(activeCategory as PortalCategory));
    if (activeCategory !== "all") return base;
    const pinned = base
      .filter((portal) => pinnedSet.has(portal.id))
      .sort((a, b) => pins.indexOf(a.id) - pins.indexOf(b.id));
    const others = base.filter((portal) => !pinnedSet.has(portal.id));
    return [...pinned, ...others];
  }, [activeCategory, pins, pinnedSet, recentIds, localizedPortals]);

  /* 全局开关：Cmd+K / Ctrl+K 搜索 */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  /* 悬停合成音效（lite 下静音） */
  const getHoverAudio = () => {
    hoverAudioRef.current ??= new AudioContext();
    return hoverAudioRef.current;
  };

  const playPortalHover = (portalNumber: number) => {
    if (lite) return;
    const audio = getHoverAudio();
    const emit = () => {
      if (audio.state !== "running") return;
      const now = audio.currentTime;
      const baseFrequency = 460 + portalNumber * 24;
      const master = audio.createGain();
      const primary = audio.createOscillator();
      const shimmer = audio.createOscillator();

      primary.type = "sine";
      primary.frequency.setValueAtTime(baseFrequency, now);
      primary.frequency.exponentialRampToValueAtTime(baseFrequency * 1.42, now + 0.075);
      shimmer.type = "triangle";
      shimmer.frequency.setValueAtTime(baseFrequency * 2.02, now);
      shimmer.frequency.exponentialRampToValueAtTime(baseFrequency * 1.72, now + 0.065);

      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.028, now + 0.008);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.095);
      primary.connect(master);
      shimmer.connect(master);
      master.connect(audio.destination);
      primary.start(now);
      shimmer.start(now);
      primary.stop(now + 0.1);
      shimmer.stop(now + 0.1);
    };

    if (audio.state === "suspended") {
      void audio.resume().then(emit).catch(() => undefined);
    } else {
      emit();
    }
  };

  useEffect(() => {
    const unlockAudio = () => {
      const audio = getHoverAudio();
      if (audio.state === "suspended") void audio.resume().catch(() => undefined);
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      void hoverAudioRef.current?.close();
      hoverAudioRef.current = null;
    };
  }, []);

  /* 滚动提示 */
  useEffect(() => {
    const updateScrollHint = () => {
      const grid = document.getElementById("portal-navigation");
      if (!grid) return;
      const remaining = grid.scrollHeight - grid.clientHeight - grid.scrollTop;
      setShowScrollHint(grid.scrollHeight > grid.clientHeight + 4 && remaining > 4);
    };

    const frame = window.requestAnimationFrame(updateScrollHint);
    window.addEventListener("resize", updateScrollHint);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateScrollHint);
    };
  }, [activeCategory]);

  /* 分类切换的 FLIP 动画：记录旧位置 → 渲染后平滑归位 */
  const flipDisabled = () => lite || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const selectCategory = (tab: PortalTabId) => {
    if (tab === activeCategory) return;
    const grid = document.getElementById("portal-navigation");
    if (grid && !flipDisabled()) {
      const rects = new Map<string, DOMRect>();
      grid.querySelectorAll<HTMLElement>("[data-portal-id]").forEach((element) => {
        const id = element.dataset.portalId;
        if (id) rects.set(id, element.getBoundingClientRect());
      });
      prevRectsRef.current = rects;
    } else {
      prevRectsRef.current.clear();
    }
    if (grid) grid.scrollTop = 0;
    setActiveCategory(tab);
  };

  useLayoutEffect(() => {
    if (!prevRectsRef.current.size) return;
    const grid = document.getElementById("portal-navigation");
    if (!grid) {
      prevRectsRef.current.clear();
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        grid.querySelectorAll<HTMLElement>("[data-portal-id]").forEach((element) => {
          const id = element.dataset.portalId;
          const previous = id ? prevRectsRef.current.get(id) : undefined;
          if (!previous) return;
          const next = element.getBoundingClientRect();
          const dx = previous.left - next.left;
          const dy = previous.top - next.top;
          if (Math.abs(dx) > 1 || Math.abs(dy) > 1) {
            element.animate(
              [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0, 0)" }],
              { duration: 340, easing: "cubic-bezier(.2,.8,.2,1)" },
            );
          }
        });
        prevRectsRef.current.clear();
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [activeCategory]);

  const tabCount = (tabId: PortalTabId) =>
    tabId === "all" ? PORTALS.length : tabId === "recent" ? Math.min(recentIds.length, RECENT_LIMIT) : PORTALS.filter((portal) => portal.categories.includes(tabId as PortalCategory)).length;

  const statusText = probing
    ? t.topbar.probing
    : probedCount === 0
      ? t.topbar.checking
      : `${onlineCount}/${probedCount} ${t.topbar.online}`;

  return (
    <main className="laboratory">
      <ParticleField density={lite ? 24 : 120} />
      <div className="lightfall-layer" aria-hidden="true">
        <DeferredLightfall lite={lite} />
      </div>
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label={t.brand.title}>
            <span className="brand-mark"><i /></span>
            <span><b>{t.brand.title}</b><small>{t.brand.sub}</small></span>
          </a>
          <div className="topbar-meta">
            <button
              className={`topbar-btn lite-toggle ${lite ? "is-active" : ""}`}
              type="button"
              onClick={() => setMode(lite ? "off" : "on")}
              aria-pressed={lite}
              title={lite ? t.topbar.liteTitleOn : t.topbar.liteTitleOff}
            >
              <i className={`lite-dot ${lite ? "is-on" : ""}`} aria-hidden="true" />
              {lite ? t.topbar.liteOn : t.topbar.liteOff}
            </button>
            <button
              className="topbar-btn status"
              type="button"
              onClick={() => refresh()}
              title={t.topbar.refreshTitle}
            >
              <i className={`status-dot ${probing ? "is-probing" : ""}`} aria-hidden="true" />
              {statusText}
              {httpCount > 0 ? <span className="status-http"> · {httpCount} {t.topbar.httpCount}</span> : null}
            </button>
            <button
              className="topbar-btn search-toggle"
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
              title={t.topbar.searchTitle}
            >
              ⌘K
            </button>
            <button
              className="topbar-btn"
              type="button"
              onClick={() => setAboutOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={aboutOpen}
            >
              {t.topbar.about}
            </button>
            <button
              className="topbar-btn"
              type="button"
              onClick={() => setUpdatesOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={updatesOpen}
            >
              {t.topbar.updates}
            </button>
            <LanguageSelector />
            <div className={`music-shell ${musicOpen ? "is-open" : ""}`}>
              <button className="music-capsule" type="button" onClick={() => setMusicOpen((open) => !open)} aria-expanded={musicOpen} aria-controls="netease-player">
                <span className="music-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                <span><small>{t.topbar.nowPlaying}</small><b>PLAY · K-391</b></span>
                <span className="music-toggle" aria-hidden="true">{musicOpen ? "×" : "+"}</span>
              </button>
              <div className="music-panel" id="netease-player" aria-hidden={!musicOpen}>
                <iframe
                  title="网易云音乐：K-391、Alan Walker、Tungevaag、Mangoo《Play》"
                  src="https://music.163.com/outchain/player?type=2&id=1387559099&auto=1&height=66"
                  width="330"
                  height="86"
                  allow="autoplay; encrypted-media"
                  loading="eager"
                  tabIndex={musicOpen ? 0 : -1}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="intro">
          <p className="kicker"><span>{t.hero.kickerExplore}</span> / {t.hero.kickerSub}</p>
          <h1>{t.hero.titleLine1}<br /><em>{t.hero.titleLine2}</em></h1>
          <p className="lead">{t.hero.subtitle}</p>
        </div>

        <div className="orbital-system" aria-hidden="true">
          <div className="orbit orbit--a"><i /><i /></div>
          <div className="orbit orbit--b"><i /></div>
          <div className="orbit orbit--c" />
          <div className="core-halo" />
          <div className="core">
            <span>WH</span>
            <small>{t.hero.coreBadge}</small>
          </div>
          <span className="coordinate coordinate--one">31.2304° N</span>
          <span className="coordinate coordinate--two">121.4737° E</span>
        </div>

        <div className="navigation-stack">
          <div className="portal-tabs" aria-label="实验室导航分类">
            {portalTabs.map((tab) => (
              <button
                key={tab.id}
                id={`portal-tab-${tab.id}`}
                className={`portal-tab ${activeCategory === tab.id ? "is-active" : ""}`}
                type="button"
                aria-pressed={activeCategory === tab.id}
                aria-controls="portal-navigation"
                onClick={() => selectCategory(tab.id)}
              >
                {tab.label}
                <span>{tabCount(tab.id).toString().padStart(2, "0")}</span>
              </button>
            ))}
            {showScrollHint && <span className="portal-scroll-hint" aria-live="polite">{t.tabs.scrollHint}</span>}
          </div>
          <MagicBentoGrid
            id="portal-navigation"
            className="portal-grid"
            aria-label="实验室项目导航"
            aria-labelledby={`portal-tab-${activeCategory}`}
            glowColor="57, 243, 255"
            spotlightRadius={300}
            motionDisabled={lite}
            onScroll={(event) => {
              const grid = event.currentTarget;
              const remaining = grid.scrollHeight - grid.clientHeight - grid.scrollTop;
              setShowScrollHint(grid.scrollHeight > grid.clientHeight + 4 && remaining > 4);
            }}
          >
            {visiblePortals.map((portal) => (
              <div
                key={portal.id}
                className="portal-cell"
                data-portal-id={portal.id}
              >
                <MagicBentoCard
                  className="portal"
                  href={portal.href}
                  target="_blank"
                  rel="noreferrer"
                  glowColor={Number(portal.id) % 2 === 0 ? "107, 98, 255" : "57, 243, 255"}
                  particleCount={6}
                  motionDisabled={lite}
                  onPointerEnter={(event) => event.pointerType === "mouse" && playPortalHover(Number(portal.id))}
                  onClick={() => recordClick(portal.id)}
                >
                  <span className="portal-index">{portal.id}</span>
                  <span className="portal-copy">
                    <span className="portal-eyebrow-row">
                      <PortalIcon name={portal.icon} className="portal-icon" />
                      <span className="portal-eyebrow">{portal.eyebrow}</span>
                    </span>
                    <strong>{portal.title}</strong>
                    <span className="portal-description">{portal.description}</span>
                    <span className="portal-domain">
                      <i className={portal.https ? `is-${states[portal.id] ?? "unknown"}` : "is-http"} aria-hidden="true" />
                      {portal.domain}
                    </span>
                  </span>
                  <span className={`portal-status is-${portal.status}`}>{statusLabels[portal.status]}</span>
                  <span className="portal-arrow" aria-hidden="true">↗</span>
                </MagicBentoCard>
                <button
                  className={`portal-pin ${pinnedSet.has(portal.id) ? "is-pinned" : ""}`}
                  type="button"
                  aria-pressed={pinnedSet.has(portal.id)}
                  aria-label={`${pinnedSet.has(portal.id) ? t.portalCard.unpin : t.portalCard.pin}：${portal.title}`}
                  onClick={() => togglePin(portal.id)}
                >
                  ★
                </button>
              </div>
            ))}
          </MagicBentoGrid>
        </div>
      </section>

      <footer>
        <span>{t.footer.copyright}</span>
        <a className="icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">{t.footer.icp}</a>
        <span className="location">{t.footer.location}</span>
      </footer>

      <SearchOverlay key={searchOpen ? "open" : "closed"} open={searchOpen} onClose={() => setSearchOpen(false)} portals={localizedPortals} recentIds={recentIds} />

      <Modal open={aboutOpen} onClose={() => setAboutOpen(false)} title={t.about.title} eyebrow={t.about.eyebrow}>
        <p>{t.about.p1}</p>
        <p>{t.about.p2}</p>
        <div className="about-facts">
          <div><b>{PORTALS.length}</b><small>{t.about.factOnline}</small></div>
          <div><b>{PORTALS.filter((portal) => portal.status === "stable").length}</b><small>{t.about.factStable}</small></div>
          <div><b>∞</b><small>{t.about.factGrowing}</small></div>
        </div>
        <p className="about-contact">{t.about.contact}</p>
      </Modal>

      <Modal open={updatesOpen} onClose={() => setUpdatesOpen(false)} title={t.updates.title} eyebrow={t.updates.eyebrow}>
        <ol className="changelog">
          {t.updates.changelog.map((entry) => (
            <li key={entry.tag}>
              <span className="changelog-meta">
                <time>{entry.date}</time>
                <b>{entry.tag}</b>
              </span>
              <strong>{entry.title}</strong>
              <ul>
                {entry.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </Modal>
    </main>
  );
}
