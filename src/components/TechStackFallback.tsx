import { useEffect, useMemo, useRef } from "react";
import "./styles/TechStackFallback.css";

/**
 * Premium non-WebGL fallback for the TechStack section.
 *
 * Rendered when:
 *  1. The real 3D scene throws during WebGL context creation
 *     (Chrome blocklist / GPU process crash / headless / etc.)
 *  2. The lazy chunk is still streaming in (Suspense fallback).
 *
 * Design goal: "premium floating glass tech orbs in a luxury portfolio."
 * Not a random icon cloud — a hand-composed constellation of 10 glassy
 * orbs arranged symmetrically around a central hero orb, with warm
 * accent glow and slow, differentiated float animations.
 */

/* ------------------------------------------------------------------
   Orb composition.
   This is intentionally NOT randomised. Each orb has a specific role
   (hero / primary / accent) and a deliberate position so the layout
   reads as a designed hero visual, not a sticker scatter.
   ------------------------------------------------------------------ */

type Tier = "hero" | "primary" | "accent";

type Orb = {
  src: string;
  /** horizontal placement inside the stage, as % */
  x: number;
  /** vertical placement inside the stage, as % */
  y: number;
  /** depth / size tier */
  tier: Tier;
  /** float cycle in seconds — unique per orb so they drift out of sync */
  dur: number;
  /** negative delay so they're already mid-drift on first paint */
  delay: number;
  /** parallax weight — larger orbs (closer) move more */
  parallax: number;
  /** hide on very small screens so the composition stays balanced */
  hideOnMobile?: boolean;
};

/**
 * Symmetrical constellation:
 *   - 1 hero orb (React) dead-center
 *   - 4 primary orbs at inner diamond corners (TS / Next / Node / Mongo)
 *   - 5 accent orbs at outer cardinal points + bottom arc
 *
 * The arrangement mirrors left↔right so the composition feels balanced
 * on any viewport width that shows all ten.
 */
const orbs: Orb[] = [
  // hero — the anchor of the whole composition
  {
    src: "/images/reacts.png",
    x: 50,
    y: 48,
    tier: "hero",
    dur: 11,
    delay: -2,
    parallax: 28,
  },
  // inner diamond
  {
    src: "/images/typescripts.png",
    x: 26,
    y: 30,
    tier: "primary",
    dur: 10,
    delay: -1.2,
    parallax: 20,
  },
  {
    src: "/images/nextjss.png",
    x: 74,
    y: 30,
    tier: "primary",
    dur: 10.5,
    delay: -3.0,
    parallax: 20,
  },
  
  {
    src: "/images/mongoss.png",
    x: 74,
    y: 66,
    tier: "primary",
    dur: 9.5,
    delay: -2.6,
    parallax: 20,
  },
  // outer accent ring
  {
    src: "/images/js.png",
    x: 50,
    y: 14,
    tier: "accent",
    dur: 13,
    delay: -0.8,
    parallax: 12,
    hideOnMobile: true,
  },
  // {
  //   src: "/images/mysql.webp",
  //   x: 8,
  //   y: 48,
  //   tier: "accent",
  //   dur: 12.5,
  //   delay: -3.4,
  //   parallax: 10,
  //   hideOnMobile: true,
  // },
  {
    src: "/images/express.png",
    x: 92,
    y: 48,
    tier: "accent",
    dur: 11.5,
    delay: -1.6,
    parallax: 10,
    hideOnMobile: true,
  },
  // {
  //   src: "/images/nextBL.webp",
  //   x: 34,
  //   y: 84,
  //   tier: "accent",
  //   dur: 10.2,
  //   delay: -2.2,
  //   parallax: 14,
  // },
  {
    src: "/images/react2.webp",
    x: 66,
    y: 84,
    tier: "accent",
    dur: 11.8,
    delay: -0.4,
    parallax: 14,
  },
];

const TechStackFallback = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  // Memoise the orb array reference so re-renders don't reshuffle —
  // inline `orbs` would be fine, but this future-proofs if we ever
  // switch to per-session variation.
  const items = useMemo(() => orbs, []);

  /**
   * Lightweight mouse parallax — writes CSS vars instead of React
   * state so it never triggers a re-render. Fine pointers only; touch
   * devices skip the whole effect.
   */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let rafId = 0;
    let mx = 0;
    let my = 0;

    const apply = () => {
      rafId = 0;
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      my = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      mx = 0;
      my = 0;
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
      {/* ambient accent glows behind the composition */}
      <div className="tsf-ambient tsf-ambient-a" aria-hidden="true" />
      <div className="tsf-ambient tsf-ambient-b" aria-hidden="true" />

      <h2> My Techstack</h2>

      <div className="tsf-stage" aria-hidden="true">
        {items.map((orb, i) => (
          <div
            key={i}
            className={[
              "tsf-orb",
              `tsf-orb--${orb.tier}`,
              orb.hideOnMobile ? "tsf-orb--hide-mobile" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                left: `${orb.x}%`,
                top: `${orb.y}%`,
                ["--dur" as string]: `${orb.dur}s`,
                ["--delay" as string]: `${orb.delay}s`,
                ["--parallax" as string]: `${orb.parallax}`,
              } as React.CSSProperties
            }
          >
            <div className="tsf-orb-halo" />
            <div className="tsf-orb-glass">
              <img
                src={orb.src}
                alt=""
                loading="lazy"
                decoding="async"
                draggable={false}
              />
              <span className="tsf-orb-spec" />
              <span className="tsf-orb-rim" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackFallback;
