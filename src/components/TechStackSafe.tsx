import { Component, lazy, ReactNode, Suspense } from "react";

const TechStack = lazy(() => import("./TechStack"));

/**
 * Error boundary wrapping TechStack. WebGL context creation throws
 * synchronously inside Three.js when the browser can't (or won't)
 * allocate a context — Chrome with hardware acceleration off, GPU
 * sandbox crashes, old devices, headless crawlers, etc. Without this
 * boundary, that throw bubbles up and unmounts the entire React tree,
 * giving the visitor a blank page.
 *
 * By containing the failure here, the rest of the portfolio continues
 * to render normally — the visitor just sees an empty "My Techstack"
 * heading instead of the 3D scene.
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
    // Keep the signal in the console but don't let it crash the app.
    // eslint-disable-next-line no-console
    console.warn("TechStack disabled: WebGL unavailable.", err);
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="techstack">
          <h2> My Techstack</h2>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TechStackSafe() {
  return (
    <TechStackBoundary>
      <Suspense fallback={<div>Loading....</div>}>
        <TechStack />
      </Suspense>
    </TechStackBoundary>
  );
}
