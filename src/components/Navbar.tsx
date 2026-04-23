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
 * Minimal floating navigation chrome.
 *
 * Desktop layout (see Navbar.css):
 *   top-left       .navbar-title   → brand logo
 *   far-right mid  .header > ul    → slim vertical glass pill,
 *                                    40px wide × ~320px tall, with
 *                                    ABOUT / WORK / CONTACT rotated
 *                                    90° inside
 *   far-right low  .navbar-connect → vertical-oriented email, a
 *                                    separate floating element
 *
 * The `<ul>` IS the pill — there is no extra wrapper element. Keeping
 * the original `.header ul a` selector path means:
 *   - initialFX.ts still fades `.header` in on load
 *   - the GSAP click handler below still finds every link
 *
 * HoverLinks is intentionally omitted: its two-layer slide effect is
 * designed for horizontal text and renders incorrectly when each
 * label is rotated via `writing-mode: vertical-rl`.
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
        {/* Top-left: brand logo. */}
        <a
          href="./images/image.png"
          className="navbar-title"
          data-cursor="disable"
        >
          Logo
        </a>

        {/* The `<ul>` itself is the slim vertical pill (see CSS).
            No wrapper — keeps the stacking simple and keeps the
            selector `.header ul a` intact for the GSAP handler. */}
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

        {/* Far-right low: vertical email, a SEPARATE floating
            element from the pill. */}
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
