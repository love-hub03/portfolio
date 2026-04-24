import { PropsWithChildren, useEffect, useState } from "react";
import "./styles/Landing.css";

/* ------------------------------------------------------------------
   Looping typing effect for the hero name — two independent lines.

   Sequence:
     1. Type "LOVEPREET" on line 1, letter by letter
     2. Then type "SAINI" on line 2, letter by letter
     3. Hold the full two-line name briefly
     4. Delete line 2 (SAINI) letter by letter
     5. Delete line 1 (LOVEPREET) letter by letter
     6. Short hold, repeat forever

   Crucially, line 2 does NOT start showing characters until line 1 is
   fully complete — the two lines are controlled by two independent
   state values, not by splitting one combined string in real time.

   Timings (per brief):
     type     ≈ 100ms/char
     delete  ≈  60ms/char
     pause after full word ≈ 1200ms
     pause before retyping ≈  400ms

   Respects prefers-reduced-motion: renders the full name statically
   with no cursor, no loop.
   ------------------------------------------------------------------ */
const TYPING_LINE_1 = "LOVEPREET";
const TYPING_LINE_2 = "SAINI";
const TYPE_MS = 100;
const DELETE_MS = 60;
const PAUSE_FULL_MS = 1200;
const PAUSE_EMPTY_MS = 400;

type TypingPhase =
  | "typing1"
  | "typing2"
  | "pauseFull"
  | "deleting2"
  | "deleting1"
  | "pauseEmpty";

const TypingName = () => {
  const [reduced, setReduced] = useState(false);
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [phase, setPhase] = useState<TypingPhase>("typing1");

  // Reduced-motion probe — run once on mount.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
  }, []);

  // Typing state machine. One setTimeout per tick, cleared on every
  // rerun so there's never a stray timer during phase transitions
  // or unmount.
  useEffect(() => {
    if (reduced) return;

    let timer: number | undefined;

    if (phase === "typing1") {
      if (line1.length < TYPING_LINE_1.length) {
        timer = window.setTimeout(
          () => setLine1(TYPING_LINE_1.slice(0, line1.length + 1)),
          TYPE_MS
        );
      } else {
        // Line 1 complete — hand off to line 2.
        setPhase("typing2");
      }
    } else if (phase === "typing2") {
      if (line2.length < TYPING_LINE_2.length) {
        timer = window.setTimeout(
          () => setLine2(TYPING_LINE_2.slice(0, line2.length + 1)),
          TYPE_MS
        );
      } else {
        setPhase("pauseFull");
      }
    } else if (phase === "pauseFull") {
      timer = window.setTimeout(() => setPhase("deleting2"), PAUSE_FULL_MS);
    } else if (phase === "deleting2") {
      if (line2.length > 0) {
        timer = window.setTimeout(
          () => setLine2(TYPING_LINE_2.slice(0, line2.length - 1)),
          DELETE_MS
        );
      } else {
        setPhase("deleting1");
      }
    } else if (phase === "deleting1") {
      if (line1.length > 0) {
        timer = window.setTimeout(
          () => setLine1(TYPING_LINE_1.slice(0, line1.length - 1)),
          DELETE_MS
        );
      } else {
        setPhase("pauseEmpty");
      }
    } else if (phase === "pauseEmpty") {
      timer = window.setTimeout(() => setPhase("typing1"), PAUSE_EMPTY_MS);
    }

    return () => {
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [phase, line1, line2, reduced]);

  // The caret lives on whichever line is currently active.
  //   typing1  / deleting1 → line 1
  //   typing2  / deleting2 → line 2
  //   pauseFull            → line 2 (last-typed)
  //   pauseEmpty           → line 1 (about to type)
  const caretOnLine1 =
    phase === "typing1" || phase === "deleting1" || phase === "pauseEmpty";

  const displayedLine1 = reduced ? TYPING_LINE_1 : line1;
  const displayedLine2 = reduced ? TYPING_LINE_2 : line2;
  const showCaret = !reduced;

  return (
    <>
      <span className="typing-line">
        {displayedLine1 || "\u00A0"}
        {showCaret && caretOnLine1 && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </span>
      <br />
      <span className="typing-line">
        {displayedLine2 || "\u00A0"}
        {showCaret && !caretOnLine1 && (
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
