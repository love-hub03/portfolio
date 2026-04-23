import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/TechStack.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Bidirectional Parallax Tech Gallery.
 *
 * Three horizontal rows of large rounded-rectangle tech cards. As the
 * visitor scrolls the page vertically, each row drifts horizontally —
 * Row 1 left, Row 2 right, Row 3 left again — producing a calm, premium
 * "gallery wall" parallax instead of a chaotic marquee.
 *
 * Implementation notes:
 *  - Pure React + CSS + GSAP ScrollTrigger. No Three.js, no canvas.
 *  - Each row is a fixed-width track wider than the viewport so there's
 *    real travel distance to animate over. The outer .ts-row-viewport
 *    is `overflow: hidden` so card edges dissolve cleanly off-screen.
 *  - Horizontal travel is computed per-row from its actual scroll
 *    overflow so the motion amount adapts to the viewport width.
 *  - `scrub: 1` ties motion to scroll position with a tiny lag so it
 *    feels like premium parallax rather than snapping 1:1.
 *  - `prefers-reduced-motion` disables scroll-linked motion entirely
 *    and leaves the rows in their resting centred position.
 *
 * Assets: reuses the existing /images/*.webp and /images/*.png tech
 * logos. Keep the layout wider than the viewport by duplicating the
 * card set inside each row — this also guarantees the visible strip is
 * always filled regardless of how much the row has drifted.
 */

type Card = {
  src: string;
  label: string;
  /** Warm gradient tint behind the logo — picks the right brand hue. */
  tint: string;
};

// Three rows of five cards each. Tints are subtle warm-leaning accents
// so the gallery stays on brand with the rest of the portfolio.
// Only PNG assets — no webp. The portfolio ships 7 PNG tech logos in
// /public/images; cards are distributed across the three rows so each
// row stays visually varied without importing anything else.
const row1: Card[] = [
  { src: "/images/reacts.png", label: "React", tint: "rgba(97, 218, 251, 0.18)" },
  { src: "/images/typescripts.png", label: "TypeScript", tint: "rgba(49, 120, 198, 0.20)" },
  { src: "/images/js.png", label: "JavaScript", tint: "rgba(247, 223, 30, 0.18)" },
  { src: "/images/nextjss.png", label: "Next.js", tint: "rgba(255, 255, 255, 0.10)" },
  { src: "/images/mongoss.png", label: "MongoDB", tint: "rgba(67, 153, 52, 0.18)" },
];

const row2: Card[] = [
  { src: "/images/express.png", label: "Express", tint: "rgba(255, 255, 255, 0.08)" },
  { src: "/images/firebases.png", label: "Firebase", tint: "rgba(255, 160, 60, 0.20)" },
  { src: "/images/reacts.png", label: "React", tint: "rgba(97, 218, 251, 0.18)" },
  { src: "/images/typescripts.png", label: "TypeScript", tint: "rgba(49, 120, 198, 0.20)" },
  { src: "/images/nextjss.png", label: "Next.js", tint: "rgba(255, 255, 255, 0.10)" },
];

const row3: Card[] = [
  { src: "/images/js.png", label: "JavaScript", tint: "rgba(247, 223, 30, 0.18)" },
  { src: "/images/mongoss.png", label: "MongoDB", tint: "rgba(67, 153, 52, 0.18)" },
  { src: "/images/firebases.png", label: "Firestore", tint: "rgba(255, 160, 60, 0.20)" },
  { src: "/images/express.png", label: "Express", tint: "rgba(255, 160, 102, 0.18)" },
  { src: "/images/reacts.png", label: "React", tint: "rgba(97, 218, 251, 0.18)" },
];

type RowProps = {
  cards: Card[];
  direction: 1 | -1;
  /** Relative speed multiplier so rows 1 & 3 aren't perfectly symmetric. */
  intensity?: number;
};

const Row = ({ cards, direction, intensity = 1 }: RowProps) => {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) return;

    // Compute how far we can drift the track inside its viewport before
    // running out of cards. This is the natural "parallax runway".
    const compute = () => {
      const overflow = Math.max(
        track.scrollWidth - viewport.clientWidth,
        0
      );
      // Use ~60% of the available overflow so cards never slam into the
      // edge; feels closer to a cinematic pan than a hard marquee.
      return overflow * 0.6 * intensity;
    };

    let travel = compute();

    // Start position: shift the track so the "home" frame centres the
    // cards regardless of direction. Going left means start further
    // right, going right means start further left.
    gsap.set(track, { x: direction === -1 ? travel / 2 : -travel / 2 });

    const trigger = ScrollTrigger.create({
      trigger: viewport,
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      onUpdate: (self) => {
        const progress = self.progress; // 0 → 1 over the whole visible pass
        // Map 0..1 to -0.5..+0.5 so the centre of the section shows the
        // resting frame, not the beginning of the drift.
        const offset = (progress - 0.5) * travel * direction;
        gsap.to(track, {
          x: -offset + (direction === -1 ? travel / 2 : -travel / 2),
          duration: 0.4,
          ease: "power2.out",
          overwrite: "auto",
        });
      },
    });

    const onResize = () => {
      travel = compute();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    return () => {
      trigger.kill();
      window.removeEventListener("resize", onResize);
    };
  }, [direction, intensity]);

  // Duplicate the card set so the track is guaranteed wider than the
  // viewport (needed for the parallax runway) and visibly full at both
  // ends of the drift.
  const doubled = [...cards, ...cards];

  return (
    <div className="ts-row-viewport" ref={viewportRef}>
      <div className="ts-row-track" ref={trackRef}>
        {doubled.map((card, i) => (
          <article
            className="ts-card"
            key={`${card.label}-${i}`}
            style={{ ["--tint" as string]: card.tint }}
            data-cursor="disable"
          >
            <div className="ts-card-glow" aria-hidden="true" />
            <div className="ts-card-media">
              <img src={card.src} alt={card.label} loading="lazy" />
            </div>
            <div className="ts-card-label">
              <span>{card.label}</span>
            </div>
            <div className="ts-card-sheen" aria-hidden="true" />
          </article>
        ))}
      </div>
    </div>
  );
};

const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Soft fade/rise on the heading so the gallery doesn't just pop in.
    const section = sectionRef.current;
    if (!section) return;

    const heading = section.querySelector(".ts-heading");
    if (!heading) return;

    const tween = gsap.from(heading, {
      y: 40,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: section,
        start: "top 80%",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <section className="techstack" ref={sectionRef}>
      <div className="ts-header">
        <span className="ts-eyebrow">what I use to build</span>
        <h2 className="ts-heading">My Tech Stack</h2>
      </div>

      <div className="ts-gallery" aria-label="Technology stack gallery">
        <Row cards={row1} direction={-1} intensity={1.0} />
        <Row cards={row2} direction={1} intensity={1.15} />
        <Row cards={row3} direction={-1} intensity={0.9} />
      </div>

      {/* Soft edge vignettes so the cards dissolve off the left & right
          edges instead of hitting a hard clip. */}
      <div className="ts-edge ts-edge-l" aria-hidden="true" />
      <div className="ts-edge ts-edge-r" aria-hidden="true" />
    </section>
  );
};

export default TechStack;
