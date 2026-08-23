/**
 * 实验室导航入口数据源。
 * 新增 / 修改入口只需改这里，组件与样式无需变动。
 * https 为 false 的子域名暂未配置 HTTPS 证书（见 docs/server-optimization.md）。
 */

export type PortalCategory = "common" | "infrastructure" | "agents" | "tools" | "projects";
export type PortalStatus = "stable" | "beta" | "experimental";
export type PortalIcon = "server" | "clipboard" | "layers" | "queue" | "bot" | "eye" | "database" | "transfer" | "energy" | "chart" | "code";

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
