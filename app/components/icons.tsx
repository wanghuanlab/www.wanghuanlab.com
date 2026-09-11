import type { PortalIcon } from "../data/portals";

/**
 * 分类小图标（线性风格，24 viewBox，继承 currentColor）。
 * 命名与 app/data/portals.ts 的 icon 字段一一对应。
 */

const PATHS: Record<PortalIcon, React.ReactNode> = {
  server: (
    <>
      <rect x="3" y="4" width="18" height="7" rx="1.5" />
      <rect x="3" y="13" width="18" height="7" rx="1.5" />
      <path d="M7 7.5h.01M7 16.5h.01" />
      <path d="M10.5 7.5H17M10.5 16.5H17" />
    </>
  ),
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4.5V3.8A1.8 1.8 0 0 1 10.8 2h2.4A1.8 1.8 0 0 1 15 3.8v.7" />
      <path d="M8.5 12l2.4 2.4L15.5 9" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3l9 5-9 5-9-5 9-5z" />
      <path d="M3 12.5l9 5 9-5" />
      <path d="M3 17l9 5 9-5" />
    </>
  ),
  queue: (
    <>
      <path d="M4 6h16M4 12h16M4 18h10" />
      <circle cx="17.5" cy="18" r="2.2" />
    </>
  ),
  bot: (
    <>
      <rect x="4.5" y="7.5" width="15" height="11" rx="3" />
      <path d="M12 7.5V4.8M9.6 4.8h4.8" />
      <circle cx="9.5" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="12.6" r="0.9" fill="currentColor" stroke="none" />
      <path d="M10.2 16h3.6" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  database: (
    <>
      <ellipse cx="12" cy="5.5" rx="7.5" ry="3" />
      <path d="M4.5 5.5v13c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3v-13" />
      <path d="M4.5 12c0 1.66 3.36 3 7.5 3s7.5-1.34 7.5-3" />
    </>
  ),
  transfer: (
    <>
      <path d="M4 7h13M14 4l3 3-3 3" />
      <path d="M20 17H7M10 14l-3 3 3 3" />
    </>
  ),
  energy: (
    <>
      <path d="M13 2L4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
    </>
  ),
  chart: (
    <>
      <path d="M3.5 3.5v17h17" />
      <path d="M7.5 15l3.5-4 3 2.5 5-6.5" />
    </>
  ),
  code: (
    <>
      <path d="M8 6.5L2.5 12 8 17.5M16 6.5L21.5 12 16 17.5M13.5 4l-3 16" />
    </>
  ),
  graph: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
    </>
  ),
};

export function PortalIcon({ name, className = "" }: { name: PortalIcon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {PATHS[name]}
    </svg>
  );
}
