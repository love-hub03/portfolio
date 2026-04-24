import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gsap } from "gsap";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import "./styles/Navbar.css";

gsap.registerPlugin(ScrollSmoother, ScrollTrigger);

// Definite assignment assertion: assigned inside useEffect on mount, before
// any consumer (initialFX) reads it.
export let smoother!: ScrollSmoother;

/**
 * Top horizontal navigation chrome.
 *
 * Desktop layout (see Navbar.css):
 *   top-left    .navbar-title   → brand logo
 *   top-centre  .header > ul    → horizontal glass pill with
 *                                 ABOUT / WORK / CONTACT
 *   top-right   .navbar-connect → email
 *
 * The DOM shape (`.header ul a`) is deliberately preserved so:
 *   - initialFX.ts still fades `.header` in on load
 *   - the GSAP click handler below still finds every link
 */
const Navbar = () => {
  useEffect(() => {
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.7,
      speed: 1.7,
      effects: true,
      autoResize: true,
      ignoreMobileResize: true,
    });

    smoother.scrollTop(0);
    smoother.paused(true);

    const links = document.querySelectorAll(".header ul a");

    links.forEach((link) => {
      const anchor = link as HTMLAnchorElement;

      anchor.addEventListener("click", (e) => {
        if (window.innerWidth > 1024) {
          e.preventDefault();

          const currentLink = e.currentTarget as HTMLAnchorElement;
          const section = currentLink.getAttribute("data-href");

          if (section) {
            smoother?.scrollTo(section, true, "top top");
          }
        }
      });
    });

    window.addEventListener("resize", () => {
      ScrollSmoother.refresh(true);
    });
  }, []);

  return (
    <>
      <div className="header">
        {/* Top-left: brand wordmark. */}
        <a
          href="#"
          className="navbar-title"
          data-cursor="disable"
          aria-label="Home"
        >
          Lovepreet Saini
        </a>

        {/* Top-centre: horizontal glass pill. The `<ul>` IS the
            pill — no wrapper. `.header ul a` selector preserved
            for the GSAP click handler above. */}
        <ul>
          <li>
            <a data-href="#about" href="#about" data-cursor="disable">
              ABOUT
            </a>
          </li>
          <li>
            <a data-href="#work" href="#work" data-cursor="disable">
              WORK
            </a>
          </li>
          <li>
            <a data-href="#contact" href="#contact" data-cursor="disable">
              CONTACT
            </a>
          </li>
        </ul>

        {/* Top-right: email. `mailto:` so clicking actually opens
            the user's email client. */}
        <a
          href="mailto:sainilove2208@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          sainilove2208@gmail.com
        </a>
      </div>

      {/* Decorative / atmospheric — untouched. */}
      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
