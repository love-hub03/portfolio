import { Component, lazy, ReactNode, Suspense } from "react";
import TechStackFallback from "./TechStackFallback";

const TechStack = lazy(() => import("./TechStack"));

/**
 * Error boundary wrapping the real 3D TechStack.
 *
 * Chrome in particular can throw synchronously during WebGL context
 * creation (GPU process crash, blocklist, hardware acceleration off,
 * driver bug, headless environment, etc.). Three.js surfaces that as
 * a thrown Error from inside the React render tree — without this
 * boundary it unmounts the entire portfolio and the visitor sees a
 * blank page.
 *
 * Instead of bailing out with an empty heading, we fall back to a
 * pure-CSS premium <TechStackFallback /> section that keeps the page
 * looking intentional and recruiter-safe.
 */
class TechStackBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(err: unknown) {
    // Keep the signal in the console so we can still diagnose, but
    // don't let it crash the app.
    // eslint-disable-next-line no-console
    console.warn(
      "TechStack 3D disabled, using CSS fallback (likely WebGL unavailable):",
      err
    );
  }

  render() {
    if (this.state.failed) {
      return <TechStackFallback />;
    }
    return this.props.children;
  }
}

export default function TechStackSafe() {
  return (
    <TechStackBoundary>
      {/* While the heavy three/rapier chunk streams in, show the
          premium fallback too — it matches the final layout so there
          is no jarring swap on slow connections. */}
      <Suspense fallback={<TechStackFallback />}>
        <TechStack />
      </Suspense>
    </TechStackBoundary>
  );
}
