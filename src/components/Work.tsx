import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/Work.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky Stacked Cards reveal.
 *
 * Implementation:
 *  - The outer <section> gets pinned while the user scrolls through it.
 *  - Inside the pinned area (.work-sticky) all project cards are
 *    absolutely centred at the same spot. Card 0 is visible at rest;
 *    cards 1..N-1 start translated down by 100% of their own height so
 *    they sit just below the viewport.
 *  - A GSAP timeline, scrubbed 1:1 with scroll, slides each subsequent
 *    card up to y:0 while simultaneously shrinking + dimming the card
 *    directly beneath it. That small scale/opacity change sells the
 *    "layered" depth — cards feel like they're stacking on top of each
 *    other, not replacing each other.
 *  - Each reveal consumes exactly one viewport height of scroll, so
 *    the pinned duration = (projects.length - 1) * 100vh.
 *  - `prefers-reduced-motion` skips the scrubbing setup and leaves the
 *    cards stacked statically (card 0 visible on top).
 */

type Project = {
  title: string;
  category: string;
  description: string;
  image: string;
  tags: string[];
  demo?: string;
  github?: string;
};

// Placeholder project deck — swap image / links / copy with real
// projects. Uses /images/image.png so nothing is missing out of the box.
const projects: Project[] = [
  {
    title: "Aurora Commerce",
    category: "Full-Stack E-Commerce",
    description:
      "A premium storefront with real-time cart sync, Stripe checkout, and a custom CMS for catalog management. Built for sub-150ms TTI on mobile.",
    image: "/images/image.png",
    tags: ["Next.js", "TypeScript", "Stripe", "MongoDB"],
    demo: "#",
    github: "#",
  },
  {
    title: "Nebula Dashboard",
    category: "SaaS Analytics",
    description:
      "Multi-tenant analytics panel with live charts, role-based auth, and an exportable reporting engine. Handles 30M+ events a week in production.",
    image: "/images/image.png",
    tags: ["React", "GSAP", "Node", "PostgreSQL"],
    demo: "#",
    github: "#",
  },
  {
    title: "Solace Portfolio",
    category: "Creative Developer Site",
    description:
      "An award-leaning motion portfolio featuring scroll-linked parallax, a custom cursor, and a WebGL hero — tuned for Lighthouse 95+ across the board.",
    image: "/images/image.png",
    tags: ["React", "Three.js", "GSAP", "Vite"],
    demo: "#",
    github: "#",
  },
  {
    title: "Lumen Chat",
    category: "Realtime Messaging",
    description:
      "End-to-end encrypted group chat with presence, typing indicators, and offline-first sync. Distilled from a 12-week client engagement.",
    image: "/images/image.png",
    tags: ["React Native", "WebSockets", "Firebase"],
    demo: "#",
    github: "#",
  },
];

const Work = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stickyRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
      if (cards.length < 2) return;

      // Initial stack — first card on top of the pile, others parked
      // just below the viewport. yPercent translates by the card's own
      // height, which is exactly the runway we want for the slide-up.
      cards.forEach((card, i) => {
        gsap.set(card, {
          yPercent: i === 0 ? 0 : 100,
          scale: 1,
          opacity: 1,
        });
      });

      // One "slot" of scroll distance per card transition.
      const slots = cards.length - 1;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${slots * window.innerHeight}`,
          pin: sticky,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 1; i < cards.length; i++) {
        const position = i - 1; // timeline slot this transition occupies

        // Incoming card slides up from below — the headline motion.
        tl.fromTo(
          cards[i],
          { yPercent: 100 },
          { yPercent: 0, ease: "none", duration: 1 },
          position
        );

        // Card beneath gently shrinks + dims to suggest depth.
        tl.to(
          cards[i - 1],
          { scale: 0.94, opacity: 0.6, ease: "none", duration: 1 },
          position
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="work-section" id="work" ref={sectionRef}>
      <div className="work-intro section-container">
        <span className="work-eyebrow">selected projects</span>
        <h2 className="work-heading">
          My <span>Work</span>
        </h2>
        <p className="work-sub">
          A small curated set — scroll to flip through the stack.
        </p>
      </div>

      <div className="work-sticky" ref={stickyRef}>
        <div className="work-stage">
          {projects.map((p, i) => (
            <article
              className="work-card"
              key={p.title}
              style={{ zIndex: i + 1 }}
              data-cursor="disable"
            >
              <div className="work-card-media">
                <img src={p.image} alt={p.title} loading="lazy" />
                <div className="work-card-media-shade" aria-hidden="true" />
              </div>

              <div className="work-card-body">
                <div className="work-card-meta">
                  <span className="work-card-index">
                    0{i + 1} / 0{projects.length}
                  </span>
                  <span className="work-card-category">{p.category}</span>
                </div>

                <h3 className="work-card-title">{p.title}</h3>
                <p className="work-card-desc">{p.description}</p>

                <div className="work-card-tags">
                  {p.tags.map((t) => (
                    <span className="work-card-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="work-card-actions">
                  {p.demo && (
                    <a
                      className="work-card-btn work-card-btn-primary"
                      href={p.demo}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Demo
                      <span aria-hidden="true">→</span>
                    </a>
                  )}
                  {p.github && (
                    <a
                      className="work-card-btn work-card-btn-ghost"
                      href={p.github}
                      target="_blank"
                      rel="noreferrer"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>

              <div className="work-card-sheen" aria-hidden="true" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;
