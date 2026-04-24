import { PropsWithChildren, useEffect, useState } from "react";
import "./styles/Landing.css";

/* ------------------------------------------------------------------
   Looping typing effect for the hero name — deterministic rewrite.

   Design notes — why this version is stable:

   1. The animation is driven by a CHAIN of scheduled callbacks, NOT
      by state-dependency rerun of an effect. The single useEffect
      runs once (deps: [reduced]), resets state, kicks off the chain,
      and cleans up on unmount. State changes inside callbacks never
      cause the effect to re-run and restart the loop mid-frame.

   2. No setState ever advances the state machine synchronously in
      the effect body. Every next step lives inside setTimeout.

   3. Cleanup sets `cancelled = true` AND clears the latest timer,
      so React StrictMode's double-invocation (mount → unmount →
      mount) tears down the first chain cleanly before the second
      starts. Each mount starts from a known zero state.

   4. Lines render as two block-level spans inside a flex column.
      No <br /> — layout is stable and independent of whitespace.

   Sequence:
     1. Type "LOVEPREET" on line 1, letter by letter
     2. Then type "SAINI" on line 2, letter by letter
     3. Hold the full two-line name
     4. Delete line 2 (SAINI) letter by letter
     5. Delete line 1 (LOVEPREET) letter by letter
     6. Short hold, repeat forever

   Timings:
     type  ≈ 100ms/char
     delete ≈ 60ms/char
     pause after full word ≈ 1200ms
     pause before retyping ≈ 400ms
   ------------------------------------------------------------------ */
const TYPING_LINE_1 = "LOVEPREET";
const TYPING_LINE_2 = "SAINI";
const TYPE_MS = 100;
const DELETE_MS = 60;
const PAUSE_FULL_MS = 1200;
const PAUSE_EMPTY_MS = 400;

const TypingName = () => {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [activeLine, setActiveLine] = useState<1 | 2>(1);
  const [reduced, setReduced] = useState(false);

  // Reduced-motion probe — run once on mount.
  useEffect(() => {
    setReduced(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (reduced) {
      setLine1(TYPING_LINE_1);
      setLine2(TYPING_LINE_2);
      setActiveLine(2);
      return;
    }

    // Guard + timer handle — cleanup sets the flag and clears the
    // latest scheduled timeout, so the chain terminates immediately
    // on unmount / StrictMode teardown.
    let cancelled = false;
    let timer: number | undefined;

    const schedule = (fn: () => void, delay: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        fn();
      }, delay);
    };

    // Reset to a known zero state on every mount so the animation
    // always starts from the same frame — no partial-name flashes.
    setLine1("");
    setLine2("");
    setActiveLine(1);

    // Step definitions. Each step owns: (a) writing its own state
    // and (b) scheduling exactly one successor via setTimeout. No
    // synchronous state-machine transitions.
    const step = {
      typeLine1(i: number) {
        setActiveLine(1);
        setLine1(TYPING_LINE_1.slice(0, i));
        if (i < TYPING_LINE_1.length) {
          schedule(() => step.typeLine1(i + 1), TYPE_MS);
        } else {
          schedule(() => step.typeLine2(1), TYPE_MS);
        }
      },
      typeLine2(i: number) {
        setActiveLine(2);
        setLine2(TYPING_LINE_2.slice(0, i));
        if (i < TYPING_LINE_2.length) {
          schedule(() => step.typeLine2(i + 1), TYPE_MS);
        } else {
          schedule(
            () => step.deleteLine2(TYPING_LINE_2.length - 1),
            PAUSE_FULL_MS
          );
        }
      },
      deleteLine2(i: number) {
        setActiveLine(2);
        setLine2(TYPING_LINE_2.slice(0, i));
        if (i > 0) {
          schedule(() => step.deleteLine2(i - 1), DELETE_MS);
        } else {
          schedule(
            () => step.deleteLine1(TYPING_LINE_1.length - 1),
            DELETE_MS
          );
        }
      },
      deleteLine1(i: number) {
        setActiveLine(1);
        setLine1(TYPING_LINE_1.slice(0, i));
        if (i > 0) {
          schedule(() => step.deleteLine1(i - 1), DELETE_MS);
        } else {
          schedule(() => step.typeLine1(1), PAUSE_EMPTY_MS);
        }
      },
    };

    // Kick off after PAUSE_EMPTY_MS so the cleared state can commit
    // and the caret shows blinking on an empty line 1 for a beat
    // before the first character types in. Guarantees every visitor
    // sees the same opening frame.
    schedule(() => step.typeLine1(1), PAUSE_EMPTY_MS);

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [reduced]);

  const showCaret = !reduced;
  const caretOnLine1 = activeLine === 1;

  return (
    <span className="typing-stack">
      <span className="typing-line">
        {line1 || "\u00A0"}
        {showCaret && caretOnLine1 && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </span>
      <span className="typing-line">
        {line2 || "\u00A0"}
        {showCaret && !caretOnLine1 && (
          <span className="typing-caret" aria-hidden="true" />
        )}
      </span>
    </span>
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
