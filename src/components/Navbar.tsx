import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HoverLinks from "./HoverLinks";
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
 * Layout (see Navbar.css):
 *   top-left    → brand logo
 *   mid-right   → floating vertical glass pill with ABOUT / WORK / CONTACT
 *   bottom-right → vertical-oriented email
 *
 * We deliberately keep the DOM structure identical to the original
 * horizontal navbar so:
 *   - initialFX.ts continues to fade `.header` in on load
 *   - the GSAP click handler below still finds `.header ul a`
 *   - HoverLinks continues to work untouched
 *
 * The whole restyle lives in CSS — this file only wires the click
 * handler and renders the chrome elements.
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
        {/* Top-left: brand. `navbar-title` is kept as the hook for the
            existing cursor-disable + logo styling. */}
        <a
          href="./images/image.png"
          className="navbar-title"
          data-cursor="disable"
        >
          Logo
        </a>

        {/* Mid-right: floating vertical glass pill.
            Selector path `.header ul a` is preserved so the GSAP
            smoother click handler above keeps working. */}
        <nav className="navbar-pill" aria-label="Primary">
          <ul>
            <li>
              <a data-href="#about" href="#about">
                <HoverLinks text="ABOUT" />
              </a>
            </li>
            <li>
              <a data-href="#work" href="#work">
                <HoverLinks text="WORK" />
              </a>
            </li>
            <li>
              <a data-href="#contact" href="#contact">
                <HoverLinks text="CONTACT" />
              </a>
            </li>
          </ul>
        </nav>

        {/* Bottom-right: vertical email. Class name preserved so the
            existing cursor-disable attribute keeps applying. `href`
            upgraded from "" to a real mailto so clicking actually
            opens the user's email client. */}
        <a
          href="mailto:sainilove2208@gmail.com"
          className="navbar-connect"
          data-cursor="disable"
        >
          sainilove2208@gmail.com
        </a>
      </div>

      {/* Decorative / atmospheric elements — untouched. */}
      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
