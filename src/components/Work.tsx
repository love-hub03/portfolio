import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/Work.css";

gsap.registerPlugin(ScrollTrigger);

/**
 * Sticky Stacked Project Cards.
 *
 * Reference-accurate design:
 *  - Compact card.
 *  - Top: "01" + CLIENT meta left, Live Project pill + GitHub right.
 *  - Left: large main preview image.
 *  - Right: TWO stacked *mini project cards* (not plain thumbnails).
 *    Each mini card has its own number / category pill / title /
 *    description / tech line / small preview image.
 *
 * Stack scroll: each card rises from yPercent:100 to 0 while the
 * one beneath shrinks + dims for depth.
 */

type MiniCard = {
  num: string;
  category: string;
  title: string;
  description: string;
  tech: string;
  image: string;
};

type Project = {
  title: string;
  category: string;
  description?: string;
  mainImage: string;
  /** Exactly two — they fill the top-right and bottom-right slots. */
  minis: [MiniCard, MiniCard];
  demo?: string;
  github?: string;
};

// Placeholder project deck. Swap images, titles, descriptions, tech
// lines, and links with your real projects. /images/image.png is used
// everywhere so nothing is missing out of the box.
const projects: Project[] = [
  {
    title: "Aurora Commerce",
    category: "Blynx Studio",
    description:
      "A premium storefront with real-time cart sync, Stripe checkout, and a custom CMS.",
    mainImage: "/images/image.png",
    demo: "#",
    github: "#",
    minis: [
      {
        num: "01",
        category: "Web",
        title: "Catalog UI",
        description: "Dense product grid with instant filter + search sync.",
        tech: "React · TypeScript · MongoDB",
        image: "/images/image.png",
      },
      {
        num: "02",
        category: "CMS",
        title: "Admin Panel",
        description: "Inventory, pricing, and order management for ops.",
        tech: "Next.js · Stripe · tRPC",
        image: "/images/image.png",
      },
    ],
  },
  {
    title: "Nebula Dashboard",
    category: "Lumen Analytics",
    description:
      "Multi-tenant SaaS analytics with live charts and an export engine.",
    mainImage: "/images/image.png",
    demo: "#",
    github: "#",
    minis: [
      {
        num: "03",
        category: "SaaS",
        title: "Live Charts",
        description: "Real-time tenant metrics with sub-second refresh.",
        tech: "React · D3 · WebSockets",
        image: "/images/image.png",
      },
      {
        num: "04",
        category: "Reports",
        title: "Export Engine",
        description: "Scheduled PDF exports per tenant with templating.",
        tech: "Node · PostgreSQL · Puppeteer",
        image: "/images/image.png",
      },
    ],
  },
  {
    title: "Solace Portfolio",
    category: "Studio Solace",
    description:
      "Award-leaning motion portfolio with scroll parallax and a WebGL hero.",
    mainImage: "/images/image.png",
    demo: "#",
    github: "#",
    minis: [
      {
        num: "05",
        category: "Motion",
        title: "Scroll Stack",
        description: "Stacked card reveal tied 1:1 to page scroll.",
        tech: "GSAP · ScrollTrigger",
        image: "/images/image.png",
      },
      {
        num: "06",
        category: "Hero",
        title: "Particle Field",
        description: "Custom canvas particle background, DPR-aware.",
        tech: "Canvas 2D · RAF · Vanilla TS",
        image: "/images/image.png",
      },
    ],
  },
  {
    title: "Lumen Chat",
    category: "Lumen Labs",
    description:
      "Encrypted group chat with presence, typing, and offline-first sync.",
    mainImage: "/images/image.png",
    demo: "#",
    github: "#",
    minis: [
      {
        num: "07",
        category: "Mobile",
        title: "Realtime Presence",
        description: "Typing + online indicators in under 100ms.",
        tech: "React Native · Sockets · Firebase",
        image: "/images/image.png",
      },
      {
        num: "08",
        category: "Offline",
        title: "Sync Engine",
        description: "Offline-first delta merge on reconnect.",
        tech: "SQLite · CRDTs · TypeScript",
        image: "/images/image.png",
      },
    ],
  },
];

const MiniProjectCard = ({ m }: { m: MiniCard }) => (
  <article className="work-mini">
    <header className="work-mini-top">
      <span className="work-mini-num">{m.num}</span>
      <span className="work-mini-cat">{m.category}</span>
    </header>

    <div className="work-mini-body">
      <h4 className="work-mini-title">{m.title}</h4>
      <p className="work-mini-desc">{m.description}</p>

      <div className="work-mini-tech">
        <span className="work-mini-tech-label">Technologies used</span>
        <span className="work-mini-tech-stack">{m.tech}</span>
      </div>
    </div>

    <div className="work-mini-preview">
      <img src={m.image} alt={m.title} loading="lazy" />
    </div>
  </article>
);

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
          {projects.map((p, i) => {
            const num = String(i + 1).padStart(2, "0");
            return (
              <article
                className="work-card"
                key={p.title}
                style={{ zIndex: i + 1 }}
                data-cursor="disable"
              >
                {/* Top row */}
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

                {/* Body: large left image + two stacked mini project
                    cards on the right (NOT plain thumbnails). */}
                <div className="work-card-mosaic">
                  <div className="work-card-main-media">
                    <img src={p.mainImage} alt={p.title} loading="lazy" />
                  </div>
                  <div className="work-card-side">
                    <MiniProjectCard m={p.minis[0]} />
                    <MiniProjectCard m={p.minis[1]} />
                  </div>
                </div>

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
