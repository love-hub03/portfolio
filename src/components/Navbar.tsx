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
        <a href="./images/image.png" className="navbar-title" data-cursor="disable">
          Logo
        </a>
        <a
          href=""
          className="navbar-connect"
          data-cursor="disable"
        >
          sainilove2208@gmail.com
        </a>
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
      </div>

      <div className="landing-circle1"></div>
      <div className="landing-circle2"></div>
      <div className="nav-fade"></div>
    </>
  );
};

export default Navbar;
