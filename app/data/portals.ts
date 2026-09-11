/**
 * 实验室导航入口数据源。
 * 新增 / 修改入口只需改这里，组件与样式无需变动。
 * https 为 false 的子域名暂未配置 HTTPS 证书（见 docs/server-optimization.md）。
 */

import type { TranslationSchema } from "../locales";

export type PortalCategory = "common" | "infrastructure" | "agents" | "tools" | "projects";
export type PortalStatus = "stable" | "beta" | "experimental";
export type PortalIcon = "server" | "clipboard" | "layers" | "queue" | "bot" | "eye" | "database" | "transfer" | "energy" | "chart" | "code" | "graph";

export type Portal = {
  /** 序号，也用作稳定 key（01–99）。 */
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  domain: string;
  href: string;
  /** 是否为 https 入口；false 表示当前仅 http 可达（无法从 https 页面实时探测）。 */
  https: boolean;
  categories: PortalCategory[];
  /** 成熟度标签：稳定 / Beta / 实验。 */
  status: PortalStatus;
  icon: PortalIcon;
};

export const PORTALS: Portal[] = [
  {
    id: "01",
    eyebrow: "INFRA / SERVER",
    title: "服务器管理平台",
    description: "服务器、应用与基础设施的统一管理入口。",
    domain: "1panel.wanghuanlab.com",
    href: "http://1panel.wanghuanlab.com",
    https: false,
    categories: ["common", "infrastructure"],
    status: "stable",
    icon: "server",
  },
  {
    id: "02",
    eyebrow: "AGENT / ZENTAO",
    title: "禅道填报智能体",
    description: "连接禅道工作流的智能填报与协作助手。",
    domain: "zentao.wanghuanlab.com",
    href: "http://zentao.wanghuanlab.com",
    https: false,
    categories: ["common", "agents"],
    status: "beta",
    icon: "clipboard",
  },
  {
    id: "03",
    eyebrow: "KNOWLEDGE / RAG",
    title: "RAG",
    description: "检索增强生成与私有知识库实验平台。",
    domain: "rag.wanghuanlab.com",
    href: "http://rag.wanghuanlab.com",
    https: false,
    categories: ["infrastructure"],
    status: "experimental",
    icon: "layers",
  },
  {
    id: "04",
    eyebrow: "MIDDLEWARE / MQ",
    title: "RocketMQ",
    description: "消息队列与分布式事件链路管理入口。",
    domain: "rocketmq.wanghuanlab.com",
    href: "http://rocketmq.wanghuanlab.com",
    https: false,
    categories: ["infrastructure"],
    status: "stable",
    icon: "queue",
  },
  {
    id: "05",
    eyebrow: "AGENT / OPENCLAW",
    title: "龙虾智能体",
    description: "OpenClaw 智能体的工作与交互空间。",
    domain: "openclaw.wanghuanlab.com",
    href: "http://openclaw.wanghuanlab.com",
    https: false,
    categories: ["agents"],
    status: "beta",
    icon: "bot",
  },
  {
    id: "06",
    eyebrow: "VISION / USP",
    title: "AI 视觉规范统一驾驭",
    description: "统一生成、校准与驾驭 AI 视觉规范。",
    domain: "usp.wanghuanlab.com",
    href: "http://usp.wanghuanlab.com",
    https: false,
    categories: ["agents"],
    status: "experimental",
    icon: "eye",
  },
  {
    id: "07",
    eyebrow: "DATABASE / MONGODB",
    title: "MongoDB",
    description: "MongoDB 数据库管理与运维入口。",
    domain: "mongo.wanghuanlab.com",
    href: "http://mongo.wanghuanlab.com/",
    https: false,
    categories: ["infrastructure"],
    status: "stable",
    icon: "database",
  },
  {
    id: "08",
    eyebrow: "UTILITY / TRANSFER",
    title: "文件中转服务",
    description: "轻量、安全的临时文件上传、分享与中转入口。",
    domain: "oss.wanghuanlab.com",
    href: "https://oss.wanghuanlab.com/",
    https: true,
    categories: ["common", "tools"],
    status: "stable",
    icon: "transfer",
  },
  {
    id: "09",
    eyebrow: "ENERGY / PROTOTYPE",
    title: "长江电力 新一代生产经营管理系统",
    description: "面向大型能源企业的新一代数字化生产经营管理体验。",
    domain: "prototype.wanghuanlab.com",
    href: "https://prototype.wanghuanlab.com",
    https: true,
    categories: ["common", "projects"],
    status: "beta",
    icon: "energy",
  },
  {
    id: "10",
    eyebrow: "INVEST / LAB",
    title: "Invest Lab",
    description: "投资研究、资产观察与机会洞察的个人实验空间。",
    domain: "invest.wanghuanlab.com",
    href: "https://invest.wanghuanlab.com/",
    https: true,
    categories: ["projects"],
    status: "experimental",
    icon: "chart",
  },
  {
    id: "11",
    eyebrow: "AI / VIBE CODING",
    title: "VibeCoding 实战培训",
    description: "从 AI 辅助编码到智能开发工作流的实战学习空间。",
    domain: "vibecoding.wanghuanlab.com",
    href: "https://vibecoding.wanghuanlab.com/",
    https: true,
    categories: ["tools"],
    status: "stable",
    icon: "code",
  },
  {
    id: "12",
    eyebrow: "VISUAL / RENDER",
    title: "可视化与云渲染专题",
    description: "面向三维数字孪生、GIS、超高分辨率大屏的工程技术专题：云渲染架构、GPU 算力与分布式渲染。",
    domain: "visualization.wanghuanlab.com",
    href: "http://visualization.wanghuanlab.com",
    https: false,
    categories: ["common", "projects"],
    status: "stable",
    icon: "eye",
  },
  {
    id: "13",
    eyebrow: "ENERGY / HSE",
    title: "长江电力安全智能管控系统",
    description: "面向能源生产场景的安全风险智能管控与协同平台。",
    domain: "hse.wanghuanlab.com",
    href: "https://hse.wanghuanlab.com/",
    https: true,
    categories: ["common", "projects"],
    status: "stable",
    icon: "energy",
  },
  {
    id: "14",
    eyebrow: "UTILITY / SCP",
    title: "SeaTunnel 控制面板",
    description: "替代 seaTunnel-web 的 SeaTunnel 控制面板。",
    domain: "scp.wanghuanlab.com",
    href: "https://scp.wanghuanlab.com/",
    https: true,
    categories: ["common", "tools"],
    status: "stable",
    icon: "layers",
  },
  {
    id: "15",
    eyebrow: "AI / GRAPH",
    title: "AIGraph",
    description: "人工智能全栈知识图谱与实战研习社，通过图谱连接 AI 知识点与学习速查。",
    domain: "aigraph.wanghuanlab.com",
    href: "https://aigraph.wanghuanlab.com/",
    https: true,
    categories: ["common", "tools", "projects"],
    status: "stable",
    icon: "graph",
  },
];

export type PortalTabId = "all" | PortalCategory | "recent";

export const PORTAL_TABS: { id: PortalTabId; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "common", label: "常用入口" },
  { id: "infrastructure", label: "基础设施" },
  { id: "agents", label: "智能体" },
  { id: "tools", label: "工具服务" },
  { id: "projects", label: "项目作品" },
  { id: "recent", label: "最近" },
];

export const STATUS_LABELS: Record<PortalStatus, string> = {
  stable: "稳定",
  beta: "BETA",
  experimental: "实验",
};

export const CATEGORY_LABELS: Record<PortalCategory, string> = {
  common: "常用入口",
  infrastructure: "基础设施",
  agents: "智能体",
  tools: "工具服务",
  projects: "项目作品",
};

export function getLocalizedPortals(t: TranslationSchema): Portal[] {
  return PORTALS.map((portal) => {
    const item = t.portals[portal.id];
    if (!item) return portal;
    return {
      ...portal,
      eyebrow: item.eyebrow,
      title: item.title,
      description: item.description,
    };
  });
}

export function getLocalizedTabs(t: TranslationSchema): { id: PortalTabId; label: string }[] {
  return [
    { id: "all", label: t.tabs.all },
    { id: "common", label: t.tabs.common },
    { id: "infrastructure", label: t.tabs.infrastructure },
    { id: "agents", label: t.tabs.agents },
    { id: "tools", label: t.tabs.tools },
    { id: "projects", label: t.tabs.projects },
    { id: "recent", label: t.tabs.recent },
  ];
}

export function getLocalizedStatusLabels(t: TranslationSchema): Record<PortalStatus, string> {
  return {
    stable: t.status.stable,
    beta: t.status.beta,
    experimental: t.status.experimental,
  };
}

export function getLocalizedCategoryLabels(t: TranslationSchema): Record<PortalCategory, string> {
  return {
    common: t.tabs.common,
    infrastructure: t.tabs.infrastructure,
    agents: t.tabs.agents,
    tools: t.tabs.tools,
    projects: t.tabs.projects,
  };
}
