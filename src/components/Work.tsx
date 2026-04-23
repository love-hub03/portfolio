import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/Work.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky Stacked Project Cards.
 *
 * Reference-accurate design:
 *  - Compact card (~980×420, not hero-sized).
 *  - Top row: "01" + category on the left, "LIVE PROJECT" pill on the right.
 *  - Body: mosaic image layout — one large image left, two smaller
 *    images stacked on the right.
 *  - Stack scroll: all cards share the same sticky stage; each new
 *    card rises from below and lands on top of the previous one, with
 *    the card beneath shrinking slightly + dimming for depth.
 *
 * Each reveal consumes one viewport height of scroll, so the pinned
 * duration = (projects.length - 1) * 100vh. `prefers-reduced-motion`
 * skips the whole scrub and shows card 0 statically.
 */

type Project = {
  title: string;
  category: string;
  description?: string;
  /** [mainImageLarge, topSmall, bottomSmall] */
  images: [string, string, string];
  demo?: string;
  github?: string;
};

// Placeholder project deck — swap `images`, `title`, copy, and links
// with real projects. Using /images/image.png so nothing is missing
// out of the box.
const projects: Project[] = [
  {
    title: "Aurora Commerce",
    category: "Blynx Studio",
    description:
      "A premium storefront with real-time cart sync, Stripe checkout, and a custom CMS for catalog management.",
    images: ["/images/image.png", "/images/image.png", "/images/image.png"],
    demo: "#",
    github: "#",
  },
  {
    title: "Nebula Dashboard",
    category: "Lumen Analytics",
    description:
      "Multi-tenant SaaS analytics with live charts, role-based auth, and an exportable reporting engine.",
    images: ["/images/image.png", "/images/image.png", "/images/image.png"],
    demo: "#",
    github: "#",
  },
  {
    title: "Solace Portfolio",
    category: "Studio Solace",
    description:
      "An award-leaning motion portfolio featuring scroll-linked parallax, custom cursor, and a WebGL hero.",
    images: ["/images/image.png", "/images/image.png", "/images/image.png"],
    demo: "#",
    github: "#",
  },
  {
    title: "Lumen Chat",
    category: "Lumen Labs",
    description:
      "End-to-end encrypted group chat with presence, typing indicators, and offline-first sync.",
    images: ["/images/image.png", "/images/image.png", "/images/image.png"],
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
        const position = i - 1;

        // Incoming card slides up from below.
        tl.fromTo(
          cards[i],
          { yPercent: 100 },
          { yPercent: 0, ease: "none", duration: 1 },
          position
        );
        // Card beneath shrinks + dims for depth.
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
          {projects.map((p, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <article
                className="work-card"
                key={p.title}
                style={{ zIndex: i + 1 }}
                data-cursor="disable"
              >
                {/* Top row: number + meta on the left, LIVE PROJECT
                    pill on the right. */}
                <header className="work-card-top">
                  <div className="work-card-top-left">
                    <span className="work-card-num">{num}</span>
                    <div className="work-card-meta">
                      <span className="work-card-meta-kicker">CLIENT</span>
                      <span className="work-card-meta-name">{p.category}</span>
                    </div>
                  </div>

                  <div className="work-card-top-right">
                    {p.demo && (
                      <a
                        className="work-card-pill work-card-pill-primary"
                        href={p.demo}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Live Project
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    {p.github && (
                      <a
                        className="work-card-pill work-card-pill-ghost"
                        href={p.github}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`${p.title} GitHub repository`}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          width="15"
                          height="15"
                          aria-hidden="true"
                        >
                          <path
                            fill="currentColor"
                            d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.57.1.78-.25.78-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.53-1.34-1.28-1.7-1.28-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.2 1.77 1.2 1.03 1.76 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.3-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.49.12-3.1 0 0 .97-.32 3.18 1.18a11 11 0 0 1 5.78 0c2.2-1.5 3.18-1.18 3.18-1.18.64 1.61.24 2.8.12 3.1.75.81 1.2 1.84 1.2 3.1 0 4.43-2.7 5.4-5.27 5.69.41.36.78 1.07.78 2.17v3.22c0 .31.2.67.79.55A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </header>

                {/* Mosaic: 1 large image on the left, 2 smaller images
                    stacked on the right. */}
                <div className="work-card-mosaic">
                  <div className="work-card-main-media">
                    <img src={p.images[0]} alt={`${p.title} preview 1`} loading="lazy" />
                  </div>
                  <div className="work-card-side">
                    <div className="work-card-side-media">
                      <img src={p.images[1]} alt={`${p.title} preview 2`} loading="lazy" />
                    </div>
                    <div className="work-card-side-media">
                      <img src={p.images[2]} alt={`${p.title} preview 3`} loading="lazy" />
                    </div>
                  </div>
                </div>

                {/* Glossy top sheen for the premium display-glass feel. */}
                <div className="work-card-sheen" aria-hidden="true" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Work;
