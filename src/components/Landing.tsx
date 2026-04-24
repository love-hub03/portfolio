import { PropsWithChildren, useEffect, useRef, useState } from "react";
import "./styles/Landing.css";

const TYPING_LINE_1 = "LOVEPREET";
const TYPING_LINE_2 = "SAINI";

const TYPE_MS = 110;
const DELETE_MS = 70;
const PAUSE_FULL_MS = 1200;
const PAUSE_EMPTY_MS = 450;

const TypingName = () => {
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [activeLine, setActiveLine] = useState<1 | 2>(1);
  const [isMounted, setIsMounted] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMounted(true);

    let cancelled = false;

    const clearTimer = () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const schedule = (fn: () => void, delay: number) => {
      clearTimer();
      timerRef.current = window.setTimeout(() => {
        if (!cancelled) fn();
      }, delay);
    };

    const resetState = () => {
      setLine1("");
      setLine2("");
      setActiveLine(1);
    };

    const typeLine1 = (index: number) => {
      if (cancelled) return;

      setActiveLine(1);
      setLine1(TYPING_LINE_1.slice(0, index));

      if (index < TYPING_LINE_1.length) {
        schedule(() => typeLine1(index + 1), TYPE_MS);
      } else {
        schedule(() => typeLine2(1), TYPE_MS);
      }
    };

    const typeLine2 = (index: number) => {
      if (cancelled) return;

      setActiveLine(2);
      setLine2(TYPING_LINE_2.slice(0, index));

      if (index < TYPING_LINE_2.length) {
        schedule(() => typeLine2(index + 1), TYPE_MS);
      } else {
        schedule(() => deleteLine2(TYPING_LINE_2.length - 1), PAUSE_FULL_MS);
      }
    };

    const deleteLine2 = (index: number) => {
      if (cancelled) return;

      setActiveLine(2);
      setLine2(TYPING_LINE_2.slice(0, index));

      if (index > 0) {
        schedule(() => deleteLine2(index - 1), DELETE_MS);
      } else {
        schedule(() => deleteLine1(TYPING_LINE_1.length - 1), DELETE_MS);
      }
    };

    const deleteLine1 = (index: number) => {
      if (cancelled) return;

      setActiveLine(1);
      setLine1(TYPING_LINE_1.slice(0, index));

      if (index > 0) {
        schedule(() => deleteLine1(index - 1), DELETE_MS);
      } else {
        schedule(() => {
          resetState();
          schedule(() => typeLine1(1), PAUSE_EMPTY_MS);
        }, PAUSE_EMPTY_MS);
      }
    };

    // IMPORTANT:
    // Start from completely empty every mount so every reload looks SAME.
    resetState();

    // Small initial delay so browser paints empty frame first
    schedule(() => typeLine1(1), 300);

    return () => {
      cancelled = true;
      clearTimer();
    };
  }, []);

  // Prevent hydration / first-paint weirdness
  if (!isMounted) {
    return (
      <span className="typing-stack">
        <span className="typing-line-row">
          <span className="typing-line-text">&nbsp;</span>
        </span>
        <span className="typing-line-row">
          <span className="typing-line-text">&nbsp;</span>
        </span>
      </span>
    );
  }

  return (
    <span className="typing-stack">
      <span className="typing-line-row">
        <span className="typing-line-text">{line1 || "\u00A0"}</span>
        {activeLine === 1 && <span className="typing-caret" aria-hidden="true" />}
      </span>

      <span className="typing-line-row">
        <span className="typing-line-text">{line2 || "\u00A0"}</span>
        {activeLine === 2 && <span className="typing-caret" aria-hidden="true" />}
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