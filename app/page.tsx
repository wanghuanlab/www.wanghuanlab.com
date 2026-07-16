"use client";

import { useEffect, useRef, useState } from "react";

const portals = [
  {
    id: "01",
    eyebrow: "INFRA / SERVER",
    title: "服务器管理平台",
    description: "服务器、应用与基础设施的统一管理入口。",
    domain: "1panel.wanghuanlab.com",
    href: "http://1panel.wanghuanlab.com",
    className: "portal--one",
  },
  {
    id: "02",
    eyebrow: "AGENT / ZENTAO",
    title: "禅道填报智能体",
    description: "连接禅道工作流的智能填报与协作助手。",
    domain: "zentao.wanghuanlab.com",
    href: "http://zentao.wanghuanlab.com",
    className: "portal--two",
  },
  {
    id: "03",
    eyebrow: "KNOWLEDGE / RAG",
    title: "RAG",
    description: "检索增强生成与私有知识库实验平台。",
    domain: "rag.wanghuanlab.com",
    href: "http://rag.wanghuanlab.com",
    className: "portal--three",
  },
  {
    id: "04",
    eyebrow: "MIDDLEWARE / MQ",
    title: "RocketMQ",
    description: "消息队列与分布式事件链路管理入口。",
    domain: "rocketmq.wanghuanlab.com",
    href: "http://rocketmq.wanghuanlab.com",
    className: "portal--four",
  },
  {
    id: "05",
    eyebrow: "AGENT / OPENCLAW",
    title: "龙虾智能体",
    description: "OpenClaw 智能体的工作与交互空间。",
    domain: "openclaw.wanghuanlab.com",
    href: "http://openclaw.wanghuanlab.com",
    className: "portal--five",
  },
  {
    id: "06",
    eyebrow: "VISION / USP",
    title: "AI 视觉规范统一驾驭",
    description: "统一生成、校准与驾驭 AI 视觉规范。",
    domain: "usp.wanghuanlab.com",
    href: "http://usp.wanghuanlab.com",
    className: "portal--six",
  },
  {
    id: "07",
    eyebrow: "DATABASE / MONGODB",
    title: "MongoDB",
    description: "MongoDB 数据库管理与运维入口。",
    domain: "mongo.wanghuanlab.com",
    href: "http://mongo.wanghuanlab.com/",
    className: "portal--seven",
  },
  {
    id: "08",
    eyebrow: "ENERGY / PROTOTYPE",
    title: "长江电力 新一代生产经营管理系统",
    description: "面向大型能源企业的新一代数字化生产经营管理体验。",
    domain: "prototype.wanghuanlab.com",
    href: "https://prototype.wanghuanlab.com",
    className: "portal--eight portal--featured",
  },
];

function ParticleField() {
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
    const particles = Array.from({ length: reduced ? 45 : 120 }, () => ({
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
  }, []);

  return <canvas ref={canvasRef} className="particle-field" aria-hidden="true" />;
}

export default function Home() {
  const [musicOpen, setMusicOpen] = useState(false);

  return (
    <main className="laboratory">
      <ParticleField />
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <header className="topbar">
        <div className="topbar-inner">
          <a className="brand" href="#top" aria-label="欢的实验室首页">
            <span className="brand-mark"><i /></span>
            <span><b>欢的实验室</b><small>WANGHUAN LAB</small></span>
          </a>
          <div className="topbar-meta">
            <span className="status"><i /> 8 SYSTEMS ONLINE</span>
            <div className={`music-shell ${musicOpen ? "is-open" : ""}`}>
              <button className="music-capsule" type="button" onClick={() => setMusicOpen((open) => !open)} aria-expanded={musicOpen} aria-controls="netease-player">
                <span className="music-bars" aria-hidden="true"><i /><i /><i /><i /></span>
                <span><small>NOW PLAYING</small><b>PLAY · K-391</b></span>
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
          <p className="kicker"><span>EXPLORE</span> / DIGITAL FRONTIER</p>
          <h1>一些想法，<br /><em>正在这里发生。</em></h1>
          <p className="lead">欢迎来到欢的实验室。这里收集我构建的数字产品、智能体与仍在生长中的实验。</p>
        </div>

        <div className="orbital-system" aria-hidden="true">
          <div className="orbit orbit--a"><i /><i /></div>
          <div className="orbit orbit--b"><i /></div>
          <div className="orbit orbit--c" />
          <div className="core-halo" />
          <div className="core">
            <span>WH</span>
            <small>LAB CORE</small>
          </div>
          <span className="coordinate coordinate--one">31.2304° N</span>
          <span className="coordinate coordinate--two">121.4737° E</span>
        </div>

        <nav className="portal-grid" aria-label="实验室项目导航">
          {portals.map((portal) => (
            <a key={portal.id} className={`portal ${portal.className}`} href={portal.href} target="_blank" rel="noreferrer">
              <span className="portal-index">{portal.id}</span>
              <span className="portal-copy">
                <span className="portal-eyebrow">{portal.eyebrow}</span>
                <strong>{portal.title.split("\n").map((line, index) => <span key={line}>{line}{index === 0 && portal.title.includes("\n") ? <br /> : null}</span>)}</strong>
                <span className="portal-description">{portal.description}</span>
                <span className="portal-domain"><i />{portal.domain}</span>
              </span>
              <span className="portal-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      </section>

      <footer>
        <span>© 2026 WANGHUAN LAB</span>
        <a className="icp" href="https://beian.miit.gov.cn/" target="_blank" rel="noreferrer">苏ICP备2026043670号</a>
        <span className="location">SUZHOU · CN</span>
      </footer>
    </main>
  );
}
