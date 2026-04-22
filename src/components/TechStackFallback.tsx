import { useEffect, useMemo, useRef } from "react";
import "./styles/TechStackFallback.css";

/**
 * Non-WebGL fallback for the TechStack section.
 *
 * Rendered when:
 *  1. The real 3D scene throws during WebGL context creation
 *     (Chrome blocklist / GPU process crash / headless / etc.)
 *  2. The lazy chunk is still streaming in (Suspense fallback).
 *
 * Pure DOM + CSS — guaranteed to render on any browser that can
 * show the rest of the portfolio.
 */

const techImages = [
  "/images/react.webp",
  "/images/typescript.webp",
  "/images/javascript.webp",
  "/images/node.webp",
  "/images/next.webp",
  "/images/mongo.webp",
  "/images/mysql.webp",
  "/images/express.webp",
  "/images/react2.webp",
  "/images/next1.webp",
  "/images/node2.webp",
  "/images/next2.webp",
  "/images/nextBL.webp",
  "/images/placeholder.webp",
];

type BallLayout = {
  /** percentage across the section (0–100) */
  left: number;
  /** percentage down the section (0–100) */
  top: number;
  /** CSS px size */
  size: number;
  /** float animation duration in seconds */
  duration: number;
  /** float animation delay in seconds (can be negative) */
  delay: number;
  /** parallax weight — how strongly this ball follows the mouse */
  parallax: number;
};

type Ball = BallLayout & { src: string };

/**
 * Hand-tuned layout. We don't randomise at render time because that
 * causes every hot-reload / re-render to reshuffle positions, which
 * looks broken. Positions are spread across the section so nothing
 * overlaps at any reasonable viewport.
 */
const layout: BallLayout[] = [
  { left: 10, top: 28, size: 96, duration: 7.5, delay: 0, parallax: 18 },
  { left: 22, top: 62, size: 74, duration: 8.2, delay: -1.1, parallax: 12 },
  { left: 34, top: 34, size: 110, duration: 9.0, delay: -2.4, parallax: 22 },
  { left: 46, top: 70, size: 82, duration: 7.8, delay: -0.6, parallax: 14 },
  { left: 58, top: 30, size: 92, duration: 8.6, delay: -3.2, parallax: 20 },
  { left: 70, top: 64, size: 100, duration: 9.4, delay: -1.8, parallax: 16 },
  { left: 82, top: 36, size: 78, duration: 7.2, delay: -2.7, parallax: 10 },
  { left: 90, top: 70, size: 66, duration: 8.9, delay: -0.3, parallax: 8 },
  { left: 16, top: 80, size: 68, duration: 7.6, delay: -1.5, parallax: 9 },
  { left: 52, top: 48, size: 118, duration: 9.8, delay: -4.0, parallax: 26 },
  { left: 40, top: 82, size: 72, duration: 8.1, delay: -2.2, parallax: 11 },
  { left: 76, top: 82, size: 86, duration: 7.9, delay: -3.6, parallax: 15 },
  { left: 4, top: 50, size: 62, duration: 8.4, delay: -1.0, parallax: 7 },
  { left: 64, top: 48, size: 70, duration: 7.7, delay: -2.9, parallax: 13 },
];

const TechStackFallback = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Assign images round-robin so every ball has a real logo.
  const balls = useMemo<Ball[]>(
    () =>
      layout.map((pos, i) => ({
        ...pos,
        src: techImages[i % techImages.length],
      })),
    []
  );

  // Subtle mouse parallax — opt-in only, and only on fine pointers
  // (skip touch). We write to CSS variables instead of re-rendering
  // React state, so this stays cheap.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let rafId = 0;
    let pendingX = 0;
    let pendingY = 0;

    const apply = () => {
      rafId = 0;
      el.style.setProperty("--mx", pendingX.toFixed(3));
      el.style.setProperty("--my", pendingY.toFixed(3));
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      // Normalise to roughly [-1, 1] across the section.
      pendingX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pendingY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      pendingX = 0;
      pendingY = 0;
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      className="techstack techstack-fallback"
      ref={sectionRef}
      aria-label="Tech stack"
    >
      <h2> My Techstack</h2>

      <div className="tsf-stage">
        {balls.map((ball, i) => (
          <div
            key={i}
            className="tsf-ball"
            style={
              {
                left: `${ball.left}%`,
                top: `${ball.top}%`,
                width: `${ball.size}px`,
                height: `${ball.size}px`,
                ["--dur" as string]: `${ball.duration}s`,
                ["--delay" as string]: `${ball.delay}s`,
                ["--parallax" as string]: `${ball.parallax}`,
              } as React.CSSProperties
            }
          >
            <div className="tsf-ball-inner">
              <img
                src={ball.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <span className="tsf-ball-gloss" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackFallback;
