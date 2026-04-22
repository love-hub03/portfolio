import { SplitText } from "gsap/SplitText";
import gsap from "gsap";
import { smoother } from "../Navbar";

/**
 * Returns `true` only if at least one element matches the selector.
 * GSAP and SplitText both emit "target not found" console warnings
 * when asked to act on nothing — pre-filtering silences them without
 * changing runtime behaviour when an element IS present.
 */
function exists(selector: string): boolean {
  return !!document.querySelector(selector);
}

type SplitConfig = {
  type: string;
  linesClass?: string;
  charsClass?: string;
  wordsClass?: string;
};

/**
 * SplitText throws "target not found" if any selector in the array
 * doesn't resolve. Filter selectors to the ones that actually exist
 * BEFORE instantiating.
 */
function safeSplit(
  selectors: string[],
  config: SplitConfig
): SplitText | null {
  const present = selectors.filter(exists);
  if (present.length === 0) return null;
  const split = new SplitText(present, config);
  return split.chars.length > 0 ? split : null;
}

export function initialFX() {
  document.body.style.overflowY = "auto";
  if (smoother) smoother.paused(false);

  const main = document.getElementsByTagName("main")[0];
  if (main) main.classList.add("main-active");

  gsap.to("body", {
    backgroundColor: "#0b080c",
    duration: 0.5,
    delay: 1,
  });

  // --- Intro copy (top-left greeting + name, tagline "A Creative") ---
  const introText = safeSplit(
    [".landing-info h3", ".landing-intro h2", ".landing-intro h1"],
    { type: "chars,lines", linesClass: "split-line" }
  );
  if (introText) {
    gsap.fromTo(
      introText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.025,
        delay: 0.3,
      }
    );
  }

  // --- Hero "Web" word ---
  const h2SplitProps: SplitConfig = {
    type: "chars,lines",
    linesClass: "split-h2",
  };
  const webText = safeSplit([".landing-h2-info"], h2SplitProps);
  if (webText) {
    gsap.fromTo(
      webText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.025,
        delay: 0.3,
      }
    );
  }

  // --- Hero "Developer" word ---
  const devText = safeSplit([".landing-h2-info-2"], h2SplitProps);
  if (devText) {
    gsap.fromTo(
      devText.chars,
      { opacity: 0, y: 80, filter: "blur(5px)" },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.025,
        delay: 0.45,
      }
    );
  }

  // --- The h2 wrapper itself ---
  if (exists(".landing-info-h2")) {
    gsap.fromTo(
      ".landing-info-h2",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: "power1.inOut",
        delay: 0.8,
      }
    );
  }

  // --- Header / side icons / top fade ---
  const chrome = [".header", ".icons-section", ".nav-fade"].filter(exists);
  if (chrome.length > 0) {
    gsap.fromTo(
      chrome,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 1.2,
        ease: "power1.inOut",
        delay: 0.1,
      }
    );
  }

  // NOTE: The previous file referenced `.landing-h2-info-1`, `.landing-h2-1`,
  // and `.landing-h2-2` in a LoopText() cycling animation. Those classes
  // do not exist in the current JSX (only `.landing-h2-info` and
  // `.landing-h2-info-2` are rendered), so SplitText was throwing
  // "target not found" on every mount. The loop has been removed rather
  // than animating nothing. If you want to re-introduce a cycling
  // "Web Developer" → "Other Title" effect later, add the alt-phrase
  // elements to Landing.tsx first, then re-register the timeline here.
}
