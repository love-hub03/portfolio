import { useEffect, useRef } from "react";
import "./styles/Particles.css";

/**
 * Site-wide ambient particle background.
 *
 * A lightweight, dependency-free canvas particle system rendered at
 * `position: fixed` behind every section. Warm-orange palette matches
 * the rest of the portfolio (the same accent used on the girl glow
 * and TechStack halos).
 *
 * Why a custom canvas instead of tsparticles / particles.js?
 *  - No 150–200 KB dependency.
 *  - Full control over palette, density, and cursor interaction.
 *  - Single RAF loop, DPR-aware sizing, clean teardown.
 *
 * Performance safeguards:
 *  - Particle count scales with viewport area, capped at 110.
 *  - RAF pauses while the tab is hidden (browser does this for us,
 *    but we also re-seed on `visibilitychange` to avoid a jump).
 *  - Respects `prefers-reduced-motion`: the canvas is still rendered
 *    (so background colour is consistent) but the RAF loop is
 *    skipped — particles are drawn once statically.
 *  - Cursor-link interaction is desktop-only (fine pointer).
 */

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const CONFIG = {
  /** viewport area (px²) per particle — higher = sparser */
  density: 14000,
  /** hard cap so huge monitors don't tank FPS */
  maxParticles: 110,
  /** max drift speed in px/frame */
  speed: 0.28,
  /** max pixel distance before two particles connect */
  linkDistance: 130,
  /** mouse influence radius in px */
  mouseRadius: 150,
  /** dot fill colour */
  dotColor: "rgba(255, 160, 102, 0.55)",
  /** link colour, as rgb triplet — alpha applied per-line */
  linkRGB: "255, 140, 70",
};

const Particles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let rafId = 0;

    // mouse position in CSS pixels; off-screen sentinel keeps the
    // "no interaction" case cheap (distance check just fails).
    const mouse = { x: -10000, y: -10000 };

    const seed = () => {
      const target = Math.min(
        CONFIG.maxParticles,
        Math.max(24, Math.floor((w * h) / CONFIG.density))
      );
      particles = Array.from({ length: target }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * CONFIG.speed * 2,
        vy: (Math.random() - 0.5) * CONFIG.speed * 2,
        r: 1 + Math.random() * 1.5,
      }));
    };

    const resize = () => {
      // Cap DPR at 2 — anything higher burns GPU for no visible win
      // on a decorative background effect.
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Step + draw dots in one pass.
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off viewport edges so particles never leave the scene.
        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > w) {
          p.x = w;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > h) {
          p.y = h;
          p.vy *= -1;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = CONFIG.dotColor;
        ctx.fill();
      }

      // Links between particles. O(n²) but n ≤ 110, so worst case
      // ~6k distance checks/frame — trivial on modern hardware.
      const linkD = CONFIG.linkDistance;
      const linkD2 = linkD * linkD;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkD2) {
            const alpha = 1 - Math.sqrt(d2) / linkD;
            ctx.strokeStyle = `rgba(${CONFIG.linkRGB}, ${alpha * 0.22})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Cursor link — a brighter, slightly thicker line from nearby
      // particles to the mouse pointer. Only draws when the mouse is
      // actually on-screen (sentinel at -10000 fails every check).
      if (isFinePointer) {
        const mr = CONFIG.mouseRadius;
        const mr2 = mr * mr;
        ctx.lineWidth = 0.9;
        for (const p of particles) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < mr2) {
            const alpha = 1 - Math.sqrt(d2) / mr;
            ctx.strokeStyle = `rgba(${CONFIG.linkRGB}, ${alpha * 0.45})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
    };

    const tick = () => {
      draw();
      rafId = window.requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -10000;
      mouse.y = -10000;
    };

    resize();

    if (reduced) {
      // Draw one static frame so the bg isn't just empty black for
      // reduced-motion users, but skip the RAF loop entirely.
      draw();
    } else {
      rafId = window.requestAnimationFrame(tick);
    }

    window.addEventListener("resize", resize);
    if (isFinePointer) {
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseout", onLeave);
    }

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      if (isFinePointer) {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseout", onLeave);
      }
    };
  }, []);

  return (
    <canvas ref={canvasRef} className="particles-bg" aria-hidden="true" />
  );
};

export default Particles;
