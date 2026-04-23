import TechStack from "./TechStack";

/**
 * Thin passthrough kept for import-compatibility with MainContainer.
 *
 * Historically this component wrapped a 3D Three.js TechStack in an
 * error boundary + Suspense fallback, because Chrome's GPU process
 * could crash during WebGL context creation and take the whole React
 * tree down with it.
 *
 * The new <TechStack /> is a Bidirectional Parallax Gallery — pure
 * React + CSS + GSAP ScrollTrigger. No WebGL, no canvas, no lazy
 * import chunk, so none of that safety scaffolding is needed any
 * more. We keep this file so MainContainer's `import TechStackSafe`
 * continues to work without a rename.
 */
export default function TechStackSafe() {
  return <TechStack />;
}
