import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/Work.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky Stacked Project Cards.
 *
 * One premium showcase card per project, stacked in a pinned stage.
 * Each card is a simple split layout:
 *   - Top-left: project number (01)
 *   - Top-right: "Live Project" pill + round GitHub icon
 *   - Left (~62%): one large rounded project image
 *   - Right (~38%): title, description, "Technology used" + tech pills
 *
 * Scroll behaviour unchanged — each new card slides up from below and
 * lands on top of the previous one (which shrinks + dims for depth).
 * Total pinned scroll = (projects.length - 1) * 100vh. Reduced motion
 * skips the scrub and leaves card 0 static.
 */

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
};

// Placeholder project deck — swap `image`, copy, links, and tech
// arrays with your real projects. /images/image.png is used as the
// fallback so nothing is missing out of the box.
const projects: Project[] = [
  {
    id: "01",
    title: "Aurora Commerce",
    description:
      "A premium storefront with real-time cart sync, Stripe checkout, and a custom CMS for catalog management. Tuned for sub-150ms TTI on mobile and Lighthouse 95+ across the board.",
    image: "/images/image.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["Next.js", "TypeScript", "Stripe", "MongoDB", "Tailwind"],
  },
  {
    id: "02",
    title: "Nebula Dashboard",
    description:
      "Multi-tenant SaaS analytics panel with live charts, role-based auth, and an exportable reporting engine. Handles 30M+ events a week in production without breaking a sweat.",
    image: "/images/image.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["React", "Node.js", "PostgreSQL", "D3", "WebSockets"],
  },
  {
    id: "03",
    title: "Solace Portfolio",
    description:
      "An award-leaning motion portfolio featuring scroll-linked parallax, a custom cursor, and a particle hero. Built end-to-end with a focus on polished motion and editorial typography.",
    image: "/images/image.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["React", "GSAP", "Vite", "TypeScript"],
  },
  {
    id: "04",
    title: "Lumen Chat",
    description:
      "End-to-end encrypted group chat with presence, typing indicators, and offline-first sync. Distilled from a 12-week client engagement into a cross-platform React Native app.",
    image: "/images/image.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["React Native", "Firebase", "WebSockets", "SQLite"],
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

      // Card 0 visible at rest; others parked just below the stage.
      cards.forEach((card, i) => {
        gsap.set(card, {
          yPercent: i === 0 ? 0 : 100,
          scale: 1,
          opacity: 1,
        });
      });

      const slots = cards.length - 1;

      const tl = gsap.timeline({
        scrollTrigger: {
          // Trigger on the sticky element itself so the pin begins
          // the moment the card reaches the top of the viewport
          // (after the intro naturally scrolls past). Using section
          // as the trigger would start the pin when the section top
          // hits top:top, leaving the card pinned at an offset equal
          // to the intro height — which reads as dead space.
          trigger: sticky,
          start: "top top",
          end: () => `+=${slots * window.innerHeight}`,
          pin: sticky,
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 1; i < cards.length; i++) {
        const position = i - 1;
        tl.fromTo(
          cards[i],
          { yPercent: 100 },
          { yPercent: 0, ease: "none", duration: 1 },
          position
        );
        tl.to(
          cards[i - 1],
          { scale: 0.94, opacity: 0.55, ease: "none", duration: 1 },
          position
        );
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="work-section" id="work" ref={sectionRef}>
      <div className="work-intro">
        <span className="work-eyebrow">selected work</span>
        <h2 className="work-heading">
          My <span>Projects</span>
        </h2>
      </div>

      <div className="work-sticky" ref={stickyRef}>
        <div className="work-stage">
          {projects.map((p, i) => (
            <article
              className="work-card"
              key={p.id}
              style={{ zIndex: i + 1 }}
              data-cursor="disable"
            >
              {/* Top bar: number left, action pills right */}
              <header className="work-card-top">
                <span className="work-card-num">{p.id}</span>
                <div className="work-card-actions">
                  {p.liveUrl && (
                    <a
                      className="work-card-pill work-card-pill-primary"
                      href={p.liveUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Live Project
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                  {p.githubUrl && (
                    <a
                      className="work-card-pill work-card-pill-ghost"
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${p.title} GitHub repository`}
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.3-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.49.12-3.1 0 0 .97-.32 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.5 3.18-1.18 3.18-1.18.64 1.61.24 2.8.12 3.1.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.07.78 2.17v3.22c0 .31.2.67.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
                        />
                      </svg>
                    </a>
                  )}
                </div>
              </header>

              {/* Split body: image left, content right */}
              <div className="work-card-body">
                <div className="work-card-image">
                  <img src={p.image} alt={p.title} loading="lazy" />
                </div>

                <div className="work-card-content">
                  <h3 className="work-card-title">{p.title}</h3>
                  <p className="work-card-desc">{p.description}</p>

                  <div className="work-card-tech">
                    <span className="work-card-tech-label">Technology used</span>
                    <div className="work-card-tech-pills">
                      {p.technologies.map((t) => (
                        <span className="work-card-tech-pill" key={t}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
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
