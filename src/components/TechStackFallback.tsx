import { useEffect, useMemo, useRef } from "react";
import "./styles/TechStackFallback.css";

/**
 * Premium non-WebGL fallback for the TechStack section.
 * Now includes:
 * - premium glass orbs
 * - subtle section parallax
 * - smooth cursor proximity repulsion (balls move away when cursor comes close)
 */

type Tier = "hero" | "primary" | "accent";

type Orb = {
  src: string;
  x: number;
  y: number;
  tier: Tier;
  dur: number;
  delay: number;
  parallax: number;
  hideOnMobile?: boolean;
};

const orbs: Orb[] = [
  // hero orb
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

  // outer accents
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
  const orbRefs = useRef<(HTMLDivElement | null)[]>([]);

  const items = useMemo(() => orbs, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let rafId = 0;

    let mouseClientX = 0;
    let mouseClientY = 0;
    let localX = 0;
    let localY = 0;

    const apply = () => {
      rafId = 0;

      // Section parallax
      el.style.setProperty("--mx", localX.toFixed(3));
      el.style.setProperty("--my", localY.toFixed(3));

      // Orb repulsion
      orbRefs.current.forEach((orb) => {
        if (!orb) return;

        const rect = orb.getBoundingClientRect();
        const orbX = rect.left + rect.width / 2;
        const orbY = rect.top + rect.height / 2;

        const dx = orbX - mouseClientX;
        const dy = orbY - mouseClientY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const radius = 190; // influence zone

        if (distance < radius && distance > 0.001) {
          const strength = 1 - distance / radius;

          let maxPush = 16; // accent default
          if (orb.classList.contains("tsf-orb--hero")) maxPush = 28;
          else if (orb.classList.contains("tsf-orb--primary")) maxPush = 22;

          const push = strength * maxPush;

          const pushX = (dx / distance) * push;
          const pushY = (dy / distance) * push;

          orb.style.setProperty("--push-x", `${pushX.toFixed(2)}px`);
          orb.style.setProperty("--push-y", `${pushY.toFixed(2)}px`);

          // Optional: slightly increase glow on hit
          orb.style.setProperty("--hit", strength.toFixed(3));
        } else {
          orb.style.setProperty("--push-x", "0px");
          orb.style.setProperty("--push-y", "0px");
          orb.style.setProperty("--hit", "0");
        }
      });
    };

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();

      localX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      localY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      mouseClientX = e.clientX;
      mouseClientY = e.clientY;

      if (!rafId) rafId = window.requestAnimationFrame(apply);
    };

    const onLeave = () => {
      el.style.setProperty("--mx", "0");
      el.style.setProperty("--my", "0");

      orbRefs.current.forEach((orb) => {
        if (!orb) return;
        orb.style.setProperty("--push-x", "0px");
        orb.style.setProperty("--push-y", "0px");
        orb.style.setProperty("--hit", "0");
      });

      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
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
      <div className="tsf-ambient tsf-ambient-a" aria-hidden="true" />
      <div className="tsf-ambient tsf-ambient-b" aria-hidden="true" />

      <h2> My Techstack</h2>

      <div className="tsf-stage" aria-hidden="true">
        {items.map((orb, i) => (
          <div
            key={i}
            ref={(el) => {
              orbRefs.current[i] = el;
            }}
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
                ["--push-x" as string]: "0px",
                ["--push-y" as string]: "0px",
                ["--hit" as string]: "0",
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