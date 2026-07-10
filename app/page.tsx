"use client";

import { useEffect, useRef, useState } from "react";

const portals = [
  {
    id: "01",
    eyebrow: "IDENTITY / PROFILE",
    title: "个人介绍",
    description: "关于我、我的经历与持续进行中的探索。",
    domain: "personal.wanghuanlab.com",
    href: "https://personal.wanghuanlab.com",
    className: "portal--one",
  },
  {
    id: "02",
    eyebrow: "ENERGY / PROTOTYPE",
    title: "长江电力新一代\n生产经营管理系统",
    description: "面向大型能源企业的新一代数字化管理体验。",
    domain: "prototype.wanghuanlab.com",
    href: "https://prototype.wanghuanlab.com/",
    className: "portal--two",
  },
  {
    id: "03",
    eyebrow: "AGENT / OFFICE",
    title: "迪爱斯 OA 智能体",
    description: "让智能体进入日常协同与办公工作流。",
    domain: "oa.wanghuanlab.com",
    href: "https://oa.wanghuanlab.com/",
    className: "portal--three",
  },
  {
    id: "04",
    eyebrow: "AGENT / GROWTH",
    title: "人才培养计划智能体",
    description: "连接成长目标、培养路径与人才发展。",
    domain: "tdp.wanghuanlab.com",
    href: "https://tdp.wanghuanlab.com/",
    className: "portal--four",
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
  const [soundOn, setSoundOn] = useState(false);
  const audioRef = useRef<{ context: AudioContext; nodes: AudioNode[] } | null>(null);

  const toggleSound = () => {
    if (audioRef.current) {
      audioRef.current.context.close();
      audioRef.current = null;
      setSoundOn(false);
      return;
    }

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContextClass();
    const master = audioContext.createGain();
    master.gain.setValueAtTime(0.0001, audioContext.currentTime);
    master.gain.exponentialRampToValueAtTime(0.045, audioContext.currentTime + 1.8);
    master.connect(audioContext.destination);

    const frequencies = [55, 82.41, 110];
    const nodes: AudioNode[] = [master];
    frequencies.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      oscillator.type = index === 0 ? "sine" : "triangle";
      oscillator.frequency.value = frequency;
      oscillator.detune.value = index * 4 - 3;
      gain.gain.value = index === 0 ? 0.34 : 0.12;
      filter.type = "lowpass";
      filter.frequency.value = 280 + index * 100;
      oscillator.connect(filter).connect(gain).connect(master);
      oscillator.start();
      nodes.push(oscillator, gain, filter);
    });
    audioRef.current = { context: audioContext, nodes };
    setSoundOn(true);
  };

  useEffect(() => () => {
    audioRef.current?.context.close();
  }, []);

  return (
    <main className="laboratory">
      <ParticleField />
      <div className="ambient ambient--one" aria-hidden="true" />
      <div className="ambient ambient--two" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="欢的实验室首页">
          <span className="brand-mark"><i /></span>
          <span><b>欢的实验室</b><small>WANGHUAN LAB</small></span>
        </a>
        <div className="topbar-meta">
          <span className="status"><i /> 4 SYSTEMS ONLINE</span>
          <button className={`sound ${soundOn ? "is-on" : ""}`} type="button" onClick={toggleSound} aria-pressed={soundOn} aria-label={soundOn ? "关闭环境音乐" : "播放环境音乐"}>
            <span className="equalizer" aria-hidden="true"><i /><i /><i /><i /></span>
            {soundOn ? "AMBIENCE ON" : "PLAY AMBIENCE"}
          </button>
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
        <span>SHANGHAI · CN</span>
        <span className="scroll-note">MOVE CURSOR TO SHIFT THE FIELD</span>
      </footer>
    </main>
  );
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
