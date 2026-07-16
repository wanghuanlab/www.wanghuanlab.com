"use client";

import { useCallback, useEffect, useRef } from "react";
import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { gsap } from "gsap";
import "./MagicBento.css";

const DEFAULT_GLOW = "57, 243, 255";

const motionDisabled = () => window.matchMedia("(hover: none), (prefers-reduced-motion: reduce)").matches;

const updateGlow = (card: HTMLElement, mouseX: number, mouseY: number, intensity: number, radius: number) => {
  const rectangle = card.getBoundingClientRect();
  card.style.setProperty("--magic-glow-x", `${((mouseX - rectangle.left) / rectangle.width) * 100}%`);
  card.style.setProperty("--magic-glow-y", `${((mouseY - rectangle.top) / rectangle.height) * 100}%`);
  card.style.setProperty("--magic-glow-intensity", intensity.toString());
  card.style.setProperty("--magic-glow-radius", `${radius}px`);
};

type MagicBentoGridProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  glowColor?: string;
  spotlightRadius?: number;
};

export function MagicBentoGrid({ children, className = "", glowColor = DEFAULT_GLOW, spotlightRadius = 280, ...props }: MagicBentoGridProps) {
  const gridRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid || motionDisabled()) return;

    const spotlight = document.createElement("div");
    spotlight.className = "magic-global-spotlight";
    spotlight.style.setProperty("--magic-rgb", glowColor);
    document.body.appendChild(spotlight);

    const onPointerMove = (event: PointerEvent) => {
      const rectangle = grid.getBoundingClientRect();
      const inside = event.clientX >= rectangle.left && event.clientX <= rectangle.right && event.clientY >= rectangle.top && event.clientY <= rectangle.bottom;
      const cards = grid.querySelectorAll<HTMLElement>(".magic-bento-card");

      if (!inside) {
        gsap.to(spotlight, { opacity: 0, duration: 0.3, ease: "power2.out", overwrite: true });
        cards.forEach((card) => card.style.setProperty("--magic-glow-intensity", "0"));
        return;
      }

      let closestDistance = Infinity;
      cards.forEach((card) => {
        const cardRectangle = card.getBoundingClientRect();
        const centerX = cardRectangle.left + cardRectangle.width / 2;
        const centerY = cardRectangle.top + cardRectangle.height / 2;
        const distance = Math.max(0, Math.hypot(event.clientX - centerX, event.clientY - centerY) - Math.max(cardRectangle.width, cardRectangle.height) / 2);
        closestDistance = Math.min(closestDistance, distance);
        const proximity = spotlightRadius * 0.48;
        const fadeDistance = spotlightRadius * 0.82;
        const intensity = distance <= proximity ? 1 : distance <= fadeDistance ? (fadeDistance - distance) / (fadeDistance - proximity) : 0;
        updateGlow(card, event.clientX, event.clientY, intensity, spotlightRadius);
      });

      const targetOpacity = closestDistance <= spotlightRadius * 0.48 ? 0.55 : Math.max(0, 1 - closestDistance / spotlightRadius) * 0.45;
      gsap.to(spotlight, { left: event.clientX, top: event.clientY, opacity: targetOpacity, duration: 0.12, ease: "power2.out", overwrite: true });
    };

    const hideSpotlight = () => gsap.to(spotlight, { opacity: 0, duration: 0.25, overwrite: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", hideSpotlight);
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", hideSpotlight);
      gsap.killTweensOf(spotlight);
      spotlight.remove();
    };
  }, [glowColor, spotlightRadius]);

  return <nav ref={gridRef} className={`${className} magic-bento-grid`} {...props}>{children}</nav>;
}

type MagicBentoCardProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  glowColor?: string;
  particleCount?: number;
};

export function MagicBentoCard({ children, className = "", glowColor = DEFAULT_GLOW, particleCount = 7, ...props }: MagicBentoCardProps) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const particlesRef = useRef<HTMLElement[]>([]);
  const timersRef = useRef<number[]>([]);
  const hoveredRef = useRef(false);

  const clearParticles = useCallback(() => {
    timersRef.current.forEach(window.clearTimeout);
    timersRef.current = [];
    particlesRef.current.forEach((particle) => {
      gsap.killTweensOf(particle);
      gsap.to(particle, { scale: 0, opacity: 0, duration: 0.2, onComplete: () => particle.remove() });
    });
    particlesRef.current = [];
  }, []);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || motionDisabled()) return;

    const createParticles = () => {
      const rectangle = card.getBoundingClientRect();
      Array.from({ length: particleCount }).forEach((_, index) => {
        const timer = window.setTimeout(() => {
          if (!hoveredRef.current) return;
          const particle = document.createElement("i");
          particle.className = "magic-bento-particle";
          particle.style.setProperty("--magic-rgb", glowColor);
          particle.style.left = `${10 + Math.random() * Math.max(1, rectangle.width - 20)}px`;
          particle.style.top = `${10 + Math.random() * Math.max(1, rectangle.height - 20)}px`;
          card.appendChild(particle);
          particlesRef.current.push(particle);
          gsap.fromTo(particle, { scale: 0, opacity: 0 }, { scale: 1, opacity: 0.8, duration: 0.25, ease: "back.out(1.8)" });
          gsap.to(particle, { x: (Math.random() - 0.5) * 60, y: (Math.random() - 0.5) * 48, opacity: 0.25, duration: 1.4 + Math.random(), repeat: -1, yoyo: true, ease: "sine.inOut" });
        }, index * 55);
        timersRef.current.push(timer);
      });
    };

    const onEnter = () => {
      hoveredRef.current = true;
      createParticles();
    };
    const onMove = (event: MouseEvent) => {
      const rectangle = card.getBoundingClientRect();
      const x = event.clientX - rectangle.left;
      const y = event.clientY - rectangle.top;
      const normalizedX = (x - rectangle.width / 2) / (rectangle.width / 2);
      const normalizedY = (y - rectangle.height / 2) / (rectangle.height / 2);
      gsap.to(card, { rotateX: normalizedY * -3.5, rotateY: normalizedX * 3.5, x: normalizedX * 3, y: normalizedY * 3 - 4, transformPerspective: 1100, duration: 0.16, ease: "power2.out", overwrite: true });
    };
    const onLeave = () => {
      hoveredRef.current = false;
      clearParticles();
      gsap.to(card, { rotateX: 0, rotateY: 0, x: 0, y: 0, duration: 0.28, ease: "power2.out", overwrite: true });
    };
    const onClick = (event: MouseEvent) => {
      const rectangle = card.getBoundingClientRect();
      const x = event.clientX - rectangle.left;
      const y = event.clientY - rectangle.top;
      const radius = Math.max(Math.hypot(x, y), Math.hypot(x - rectangle.width, y), Math.hypot(x, y - rectangle.height), Math.hypot(x - rectangle.width, y - rectangle.height));
      const ripple = document.createElement("span");
      ripple.className = "magic-bento-ripple";
      ripple.style.setProperty("--magic-rgb", glowColor);
      ripple.style.width = `${radius * 2}px`;
      ripple.style.height = `${radius * 2}px`;
      ripple.style.left = `${x - radius}px`;
      ripple.style.top = `${y - radius}px`;
      card.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 0.75 }, { scale: 1, opacity: 0, duration: 0.7, ease: "power2.out", onComplete: () => ripple.remove() });
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    card.addEventListener("click", onClick);
    return () => {
      hoveredRef.current = false;
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
      card.removeEventListener("click", onClick);
      clearParticles();
      gsap.killTweensOf(card);
    };
  }, [clearParticles, glowColor, particleCount]);

  return (
    <a ref={cardRef} className={`${className} magic-bento-card`} style={{ "--magic-rgb": glowColor } as React.CSSProperties} {...props}>
      <span className="magic-border-glow" aria-hidden="true" />
      {children}
    </a>
  );
}
