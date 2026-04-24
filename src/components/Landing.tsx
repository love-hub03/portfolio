import { PropsWithChildren, useEffect, useState } from "react";
import "./styles/Landing.css";

/* ------------------------------------------------------------------
   Looping typing effect for the hero name.

   Types the full string "LOVEPREET SAINI" character-by-character,
   holds briefly, deletes, holds, and repeats forever. Rendering always
   keeps TWO lines present (LOVEPREET / SAINI) so the hero layout
   height never jumps — empty lines fall back to a non-breaking space.

   Timings (per brief):
     type     ≈ 100ms/char
     delete  ≈  60ms/char
     pause after full word ≈ 1200ms
     pause before retyping ≈  400ms

   Respects prefers-reduced-motion: renders the full name statically
   with no cursor, no loop.
   ------------------------------------------------------------------ */
const TYPING_FULL = "LOVEPREET SAINI";
const TYPE_MS = 100;
const DELETE_MS = 60;
const PAUSE_FULL_MS = 1200;
const PAUSE_EMPTY_MS = 400;

type TypingPhase = "typing" | "pauseFull" | "deleting" | "pauseEmpty";

const TypingName = () => {
  const [reduced, setReduced] = useState(false);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<TypingPhase>("typing");

  // Reduced-motion probe — run once on mount.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  // Typing state machine. One setTimeout per phase tick; cleared on
  // every rerun so there's never a stray timer during unmount or
  // phase transitions.
  useEffect(() => {
    if (reduced) return;

    let timer: number;
    if (phase === "typing") {
      if (text.length < TYPING_FULL.length) {
        timer = window.setTimeout(
          () => setText(TYPING_FULL.slice(0, text.length + 1)),
          TYPE_MS
        );
      } else {
        setPhase("pauseFull");
        return;
      }
    } else if (phase === "pauseFull") {
      timer = window.setTimeout(() => setPhase("deleting"), PAUSE_FULL_MS);
    } else if (phase === "deleting") {
      if (text.length > 0) {
        timer = window.setTimeout(
          () => setText(TYPING_FULL.slice(0, text.length - 1)),
          DELETE_MS
        );
      } else {
        setPhase("pauseEmpty");
        return;
      }
    } else if (phase === "pauseEmpty") {
      timer = window.setTimeout(() => setPhase("typing"), PAUSE_EMPTY_MS);
    }

    return () => window.clearTimeout(timer);
  }, [text, phase, reduced]);

  // Split the current string on the single space so we always render
  // the two-line "LOVEPREET / SAINI" layout.
  const displayed = reduced ? TYPING_FULL : text;
  const spaceIdx = TYPING_FULL.indexOf(" ");
  const line1 = displayed.slice(0, Math.min(displayed.length, spaceIdx));
  const onSecondLine = displayed.length > spaceIdx;
  const line2 = onSecondLine ? displayed.slice(spaceIdx + 1) : "";

  const showCaret = !reduced;

  return (
    <>
      <span className="typing-line">
        {line1 || "\u00A0"}
        {showCaret && !onSecondLine && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </span>
      <br />
      <span className="typing-line">
        {line2 || "\u00A0"}
        {showCaret && onSecondLine && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </span>
    </>
  );
};

const Landing = ({ children }: PropsWithChildren) => {
  return (
    <>
      <div className="landing-section" id="landingDiv">
        <div className="landing-container">
          <div className="landing-intro">
            <h2>Hello! I'm</h2>
            <h1 aria-label="Lovepreet Saini">
              <TypingName />
            </h1>
          </div>
          <div className="landing-info">
            <h3>A Creative</h3>

            <h2 className="landing-info-h2">
              <span className="landing-h2-info">Web</span>
              <span className="landing-h2-info-2">Developer</span>
            </h2>
          </div>
        </div>
        {children}
      </div>
    </>
  );
};

export default Landing;
