import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useLoading } from "../context/LoadingProvider";
import { setProgress } from "./Loading";

gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

// ---- Intro ----
const INTRO_DELAY = 0.4;
const INTRO_FADE_DURATION = 0.9;

// ---- Cursor-tracking (rotation only) ----
const MAX_ROT_Y = 18;
const MAX_ROT_X = 10;
const MAX_ROT_Z = 8;
const FOLLOW_DURATION = 0.6;

const GirlCharacter = () => {
  const imageRef = useRef<HTMLImageElement>(null);
  const { setLoading } = useLoading();
  const introDoneRef = useRef(false);

  // --- Loader progress ---
  useEffect(() => {
    const progress = setProgress((value) => setLoading(value));
    const img = imageRef.current;
    const finish = () => progress.loaded();

    if (img) {
      if (img.complete && img.naturalWidth > 0) {
        finish();
      } else {
        img.addEventListener("load", finish);
        img.addEventListener("error", finish);
      }
    }

    return () => {
      progress.clear();
      if (img) {
        img.removeEventListener("load", finish);
        img.removeEventListener("error", finish);
      }
    };
  }, [setLoading]);

  // --- Scroll animation: Landing -> About ---
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    let ctx: gsap.Context | null = null;
    let rafId = 0;

    const setup = () => {
      const stage = document.querySelector(".hero-about-stage") as HTMLElement | null;
      const landing = document.querySelector(".landing-section") as HTMLElement | null;
      const about = document.querySelector(".about-section") as HTMLElement | null;

      // Wait for ScrollSmoother (created by Navbar) so ScrollTriggers bind to
      // the smooth scroller rather than window. Binding to window gives choppy
      // scrub because ScrollSmoother's scroll position isn't being read.
      if (!stage || !landing || !about || !ScrollSmoother.get()) {
        rafId = requestAnimationFrame(setup);
        return;
      }

      const aboutHeight = about.offsetHeight;

      ctx = gsap.context(() => {
        gsap.set(img, {
          xPercent: -50,
          x: -80,
          y: -aboutHeight,
          scale: 1,
          opacity: 0,
        });

        gsap.to(img, {
          opacity: 1,
          duration: INTRO_FADE_DURATION,
          ease: "power2.out",
          delay: INTRO_DELAY,
          onComplete: () => {
            introDoneRef.current = true;
          },
        });

        const aboutRect = about.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();

        const targetCenterX = aboutRect.left - stageRect.left + 140;
        const currentCenterX = stage.offsetWidth / 2;

        let endX = targetCenterX - currentCenterX;

        if (window.innerWidth >= 1025) {
          const minLeftMove = -window.innerWidth * 0.38;
          if (endX > minLeftMove) endX = minLeftMove;
        }

        gsap.to(img, {
          x: endX,
          y: 0,
          ease: "none",
          force3D: true, // keep the transform on the GPU compositor
          scrollTrigger: {
            trigger: landing,
            start: "top top",
            end: () => `+=${aboutHeight}`,
            // scrub:true (tight tracking). ScrollSmoother already smooths the
            // scroll position (smooth: 1.7 in Navbar); a numeric scrub stacks
            // a second lag on top and makes scroll feel laggy/choppy. Let
            // ScrollSmoother own the smoothing.
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      });
    };

    setup();

    // Debounced resize handler. The old version ran a full teardown +
    // rebuild on every resize event — that fires dozens of times per second
    // while the window is being dragged, which causes visible jank. With
    // invalidateOnRefresh:true on the tween, ScrollTrigger.refresh() is
    // enough for most resizes (function-valued props re-evaluate).
    let resizeTimer: number | undefined;
    const onResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        ScrollTrigger.refresh();
      }, 120);
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
      cancelAnimationFrame(rafId);
      ctx?.revert();
    };
  }, []);

  // --- Cursor-tracking: rotation only ---
  useEffect(() => {
    const img = imageRef.current;
    if (!img) return;

    const quickRX = gsap.quickTo(img, "rotateX", {
      duration: FOLLOW_DURATION,
      ease: "power3.out",
    });

    const quickRY = gsap.quickTo(img, "rotateY", {
      duration: FOLLOW_DURATION,
      ease: "power3.out",
    });

    const quickRZ = gsap.quickTo(img, "rotation", {
      duration: FOLLOW_DURATION,
      ease: "power3.out",
    });

    const handleMouseMove = (e: MouseEvent) => {
      if (!introDoneRef.current) return;

      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;

      quickRY(nx * MAX_ROT_Y);
      quickRX(-ny * MAX_ROT_X);
      quickRZ(nx * MAX_ROT_Z);
    };

    const handleMouseLeave = () => {
      gsap.to(img, {
        rotateX: 0,
        rotateY: 0,
        rotation: 0,
        duration: 1,
        ease: "power3.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <img
      ref={imageRef}
      className="girl-character"
      src="/girl.png"
      alt="Character"
      draggable={false}
    />
  );
};

export default GirlCharacter;