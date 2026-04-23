import { useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import Cursor from "./Cursor";
import GirlCharacter from "./GirlCharacter";
import Landing from "./Landing";
import Navbar from "./Navbar";
import Particles from "./Particles";
import SocialIcons from "./SocialIcons";
import TechStackSafe from "./TechStackSafe";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";
import { useLoading } from "../context/LoadingProvider";
import { setProgress } from "./Loading";

const MainContainer = () => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );
  const { setLoading } = useLoading();

  useEffect(() => {
    const resizeHandler = () => {
      setSplitText();
      setIsDesktopView(window.innerWidth > 1024);
    };

    resizeHandler();
    window.addEventListener("resize", resizeHandler);

    return () => {
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  // Loader progress — lives here (not inside GirlCharacter) so it runs on
  // BOTH desktop and mobile. GirlCharacter is desktop-only, so if this
  // logic stayed there, mobile visitors would be stuck at 0% forever.
  // We preload /girl.png via the Image() constructor to match the original
  // "wait for the hero asset" behaviour, then kick the bar to 100%.
  useEffect(() => {
    const progress = setProgress((value) => setLoading(value));
    const finish = () => progress.loaded();

    const img = new Image();
    img.src = "/girl.png";
    if (img.complete && img.naturalWidth > 0) {
      finish();
    } else {
      img.addEventListener("load", finish);
      img.addEventListener("error", finish);
    }

    // Safety net: if the asset somehow never resolves within 6s (flaky
    // network, cache miss on mobile data), force-complete so visitors
    // aren't staring at "Loading 0%" indefinitely.
    const safety = window.setTimeout(finish, 6000);

    return () => {
      window.clearTimeout(safety);
      img.removeEventListener("load", finish);
      img.removeEventListener("error", finish);
      progress.clear();
    };
  }, [setLoading]);

  return (
    <div className="container-main">
      {/* Ambient particle background — position: fixed, sits behind
          all content. Must be rendered first so later position:fixed
          siblings (cursor, navbar, smooth-wrapper) win DOM order. */}
      <Particles />
      <Cursor />
      <Navbar />
      <SocialIcons />

      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <div className="hero-about-stage">
              <Landing />
              <About />
              <GirlCharacter />
            </div>

            {isDesktopView && <TechStackSafe />}

            <WhatIDo />
            <Career />
            <Work />

            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;