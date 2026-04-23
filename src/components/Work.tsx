import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles/Work.css";

gsap.registerPlugin(ScrollTrigger);

type Project = {
  id: string;
  title: string;
  description: string;
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  technologies: string[];
};

const projects: Project[] = [
  {
    id: "01",
    title: "Aurora Commerce",
    description:
      "A premium storefront with real-time cart sync, Stripe checkout, and a custom CMS for catalog management.",
    image: "/images/project1.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["Next.js", "TypeScript", "Stripe", "MongoDB", "Tailwind"],
  },
  {
    id: "02",
    title: "Nebula Dashboard",
    description:
      "Multi-tenant SaaS analytics panel with live charts, role-based auth, and exportable reporting.",
    image: "/images/project2.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["React", "Node.js", "PostgreSQL", "D3", "WebSockets"],
  },
  {
    id: "03",
    title: "Weather Web App",
    description:
      "A clean responsive weather application using live weather APIs with modern UI and quick city search.",
    image: "/images/project3.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["HTML", "CSS", "JavaScript", "Weather API"],
  },
  {
    id: "04",
    title: "Lumen Chat",
    description:
      "Realtime encrypted chat with typing indicators, presence, and offline-first sync.",
    image: "/images/project4.png",
    liveUrl: "#",
    githubUrl: "#",
    technologies: ["React Native", "Firebase", "WebSockets", "SQLite"],
  },
];

const Work = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const pinWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const pinWrap = pinWrapRef.current;
    if (!section || !pinWrap) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".work-card");
      if (cards.length < 2) return;

      // Initial states
      cards.forEach((card, i) => {
        gsap.set(card, {
          yPercent: i === 0 ? 0 : 100,
          opacity: i === 0 ? 1 : 0,
          scale: 1,
          zIndex: cards.length - i,
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => `+=${(cards.length - 1) * window.innerHeight}`,
          pin: pinWrap, // pin heading + stage together
          pinSpacing: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      for (let i = 1; i < cards.length; i++) {
        const prev = cards[i - 1];
        const curr = cards[i];
        const pos = i - 1;

        tl.to(
          prev,
          {
            yPercent: -8,
            opacity: 0,
            scale: 0.97,
            ease: "none",
            duration: 1,
          },
          pos
        );

        tl.fromTo(
          curr,
          {
            yPercent: 100,
            opacity: 0,
            scale: 1,
          },
          {
            yPercent: 0,
            opacity: 1,
            scale: 1,
            ease: "none",
            duration: 1,
          },
          pos
        );
      }

      ScrollTrigger.refresh();
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section className="work-section" id="work" ref={sectionRef}>
      <div className="work-pin-wrap" ref={pinWrapRef}>
        <div className="work-intro">
          <span className="work-eyebrow">Selected Work</span>
          <h2 className="work-heading">
            My <span>Projects</span>
          </h2>
        </div>

        <div className="work-stage">
          {projects.map((p, i) => (
            <article className="work-card" key={p.id} style={{ zIndex: projects.length - i }}>
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
                      Live Project <span>↗</span>
                    </a>
                  )}

                  {p.githubUrl && (
                    <a
                      className="work-card-pill work-card-pill-ghost"
                      href={p.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`${p.title} GitHub`}
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

              <div className="work-card-body">
                <div className="work-card-image">
                  <img src={p.image} alt={p.title} loading="lazy" />
                </div>

                <div className="work-card-content">
                  <h3 className="work-card-title">{p.title}</h3>
                  <p className="work-card-desc">{p.description}</p>

                  <div className="work-card-tech">
                    <span className="work-card-tech-label">Technology Used</span>
                    <div className="work-card-tech-pills">
                      {p.technologies.map((tech) => (
                        <span className="work-card-tech-pill" key={tech}>
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="work-card-sheen" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Work;