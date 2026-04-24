import { useEffect, useState } from "react";
import "./styles/Loading.css";
import { useLoading } from "../context/LoadingProvider";

/**
 * Greetings from different languages — cycled while the loader is
 * running. Add/remove entries freely; the cycler handles any length.
 */
const GREETINGS = [
  "Hello",
  "Namaste",
  "Sat Sri Akal",
  "Hola",
  "Bonjour",
  "Ciao",
  "Konnichiwa",
  "Annyeong",
  "Salaam",
  "Guten Tag",
];
/** How long each greeting is shown before it fades to the next one. */
const GREETING_INTERVAL_MS = 420;

const Loading = ({ percent }: { percent: number }) => {
  const { setIsLoading } = useLoading();
  const [loaded, setLoaded] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [greetingIdx, setGreetingIdx] = useState(0);

  if (percent >= 100) {
    setTimeout(() => {
      setLoaded(true);
      setTimeout(() => {
        setIsLoaded(true);
      }, 1000);
    }, 600);
  }

  useEffect(() => {
    import("./utils/initialFX").then((module) => {
      if (isLoaded) {
        setClicked(true);
        setTimeout(() => {
          if (module.initialFX) {
            module.initialFX();
          }
          setIsLoading(false);
        }, 900);
      }
    });
  }, [isLoaded]);

  // Cycle greetings while the loader is still visible. Stops the
  // moment we start the exit transition (`clicked`) so the last
  // greeting lingers during the reveal animation instead of flipping.
  useEffect(() => {
    if (clicked) return;
    const id = window.setInterval(() => {
      setGreetingIdx((i) => (i + 1) % GREETINGS.length);
    }, GREETING_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [clicked]);

  function handleMouseMove(e: React.MouseEvent<HTMLElement>) {
    const { currentTarget: target } = e;
    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    target.style.setProperty("--mouse-x", `${x}px`);
    target.style.setProperty("--mouse-y", `${y}px`);
  }

  return (
    <>
      <div className="loading-header">
        <a href="/#" className="loader-title" data-cursor="disable">
          Lovepreet Saini
        </a>
        <div className={`loaderGame ${clicked && "loader-out"}`}>
          <div className="loaderGame-container">
            <div className="loaderGame-in">
              {[...Array(27)].map((_, index) => (
                <div className="loaderGame-line" key={index}></div>
              ))}
            </div>
            <div className="loaderGame-ball"></div>
          </div>
        </div>
      </div>
      <div className="loading-screen">
        {/* Greeting carousel — one large greeting at a time, centred.
            The `key` forces a fresh mount each cycle so the fade-in
            keyframe replays. aria-live keeps it announced without
            stealing focus. */}
        <div className="loading-greetings" aria-live="polite">
          <span
            key={greetingIdx}
            className={`loading-greeting ${
              clicked ? "loading-greeting-out" : ""
            }`}
          >
            {GREETINGS[greetingIdx]}
          </span>
        </div>

        {/* Percentage pill — unchanged internal mechanism. It still
            drives the click/expand transition into the main page via
            the `loading-clicked` class. Only the position changed:
            it now sits BELOW the greeting via the column flex layout
            on .loading-screen. */}
        <div
          className={`loading-wrap ${clicked && "loading-clicked"}`}
          onMouseMove={(e) => handleMouseMove(e)}
        >
          <div className="loading-hover"></div>
          <div className={`loading-button ${loaded && "loading-complete"}`}>
            <div className="loading-container">
              <div className="loading-content">
                <div className="loading-content-in">
                  Loading <span>{percent}%</span>
                </div>
              </div>
              <div className="loading-box"></div>
            </div>
            <div className="loading-content2">
              <span>Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Loading;

export const setProgress = (setLoading: (value: number) => void) => {
  let percent: number = 0;

  let interval = setInterval(() => {
    if (percent <= 50) {
      let rand = Math.round(Math.random() * 5);
      percent = percent + rand;
      setLoading(percent);
    } else {
      clearInterval(interval);
      interval = setInterval(() => {
        percent = percent + Math.round(Math.random());
        setLoading(percent);
        if (percent > 91) {
          clearInterval(interval);
        }
      }, 2000);
    }
  }, 100);

  function clear() {
    clearInterval(interval);
    setLoading(100);
  }

  function loaded() {
    return new Promise<number>((resolve) => {
      clearInterval(interval);
      interval = setInterval(() => {
        if (percent < 100) {
          percent++;
          setLoading(percent);
        } else {
          resolve(percent);
          clearInterval(interval);
        }
      }, 2);
    });
  }
  return { loaded, percent, clear };
};
