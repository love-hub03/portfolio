import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

/**
 * Lightweight 3D TechStack scene.
 *
 * Intentionally minimal for maximum Chrome/GPU stability:
 *  - no EffectComposer / postprocessing / N8AO
 *  - no HDR or Environment() probe
 *  - no shadows, no clearcoat highlights from env
 *  - low-poly spheres (16x16)
 *  - DPR capped at 1.25, antialias off
 *
 * We DO NOT pre-check WebGL availability here. The real 3D scene just
 * tries to render; if the browser throws while creating the WebGL
 * context or the GPU process crashes, the <TechStackBoundary> in
 * TechStackSafe.tsx catches it and swaps in <TechStackFallback />.
 */

const textureLoader = new THREE.TextureLoader();

const imageUrls = [
  "/images/express.webp",
  "/images/javascript.webp",
  "/images/mongo.webp",
  "/images/mysql.webp",
  "/images/next.webp",
  "/images/next1.webp",
  "/images/next2.webp",
  "/images/nextBL.webp",
  "/images/node.webp",
  "/images/node2.webp",
  "/images/react.webp",
  "/images/react2.webp",
  "/images/typescript.webp",
  "/images/placeholder.webp",
];

// Texture pool — loaded once at module scope so every ball reuses the
// same GPU upload instead of re-decoding the PNGs on every mount.
const textures = imageUrls.map((url) => {
  const t = textureLoader.load(url);
  t.anisotropy = 2; // cheap sharpness win, no perf cost
  return t;
});

// Lighter sphere geometry (was 20x20). 16x16 is visually indistinguishable
// at this camera distance and cuts vertex count by ~36%.
const sphereGeometry = new THREE.SphereGeometry(1, 16, 16);

// KEEPING 30 SPHERES — stable seed so hot-reload doesn't reshuffle scale.
const spheres = [...Array(30)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshStandardMaterial;
  isActive: boolean;
};

function SphereGeo({
  vec = new THREE.Vector3(),
  scale,
  r = THREE.MathUtils.randFloatSpread,
  material,
  isActive,
}: SphereProps) {
  const api = useRef<RapierRigidBody | null>(null);

  useFrame((_state, delta) => {
    if (!isActive || !api.current) return;

    delta = Math.min(0.1, delta);

    const position = api.current.translation();
    const impulse = vec
      .set(position.x, position.y, position.z)
      .normalize()
      .multiply(
        new THREE.Vector3(
          -45 * delta * scale,
          -130 * delta * scale,
          -45 * delta * scale
        )
      );

    api.current.applyImpulse(impulse, true);
  });

  return (
    <RigidBody
      linearDamping={0.75}
      angularDamping={0.15}
      friction={0.2}
      position={[r(20), r(20) - 25, r(20) - 10]}
      ref={api}
      colliders={false}
    >
      <BallCollider args={[scale]} />
      <CylinderCollider
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 1.2 * scale]}
        args={[0.15 * scale, 0.275 * scale]}
      />
      <mesh
        castShadow={false}
        receiveShadow={false}
        scale={scale}
        geometry={sphereGeometry}
        material={material}
        rotation={[0.3, 1, 1]}
      />
    </RigidBody>
  );
}

type PointerProps = {
  vec?: THREE.Vector3;
  isActive: boolean;
};

function Pointer({ vec = new THREE.Vector3(), isActive }: PointerProps) {
  const ref = useRef<RapierRigidBody>(null);

  useFrame(({ pointer, viewport }) => {
    if (!isActive || !ref.current) return;

    const targetVec = vec.lerp(
      new THREE.Vector3(
        (pointer.x * viewport.width) / 2,
        (pointer.y * viewport.height) / 2,
        0
      ),
      0.2
    );

    ref.current.setNextKinematicTranslation(targetVec);
  });

  return (
    <RigidBody
      position={[100, 100, 100]}
      type="kinematicPosition"
      colliders={false}
      ref={ref}
    >
      <BallCollider args={[2]} />
    </RigidBody>
  );
}

const TechStack = () => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const section = document.querySelector(".techstack");
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      setIsActive(inView);
    };

    handleScroll();

    const clickIntervals: number[] = [];
    const links = document.querySelectorAll(".header a");
    const clickHandlers: Array<() => void> = [];

    links.forEach((elem) => {
      const handler = () => {
        const interval = window.setInterval(() => {
          handleScroll();
        }, 10);

        clickIntervals.push(interval);

        window.setTimeout(() => {
          window.clearInterval(interval);
        }, 1000);
      };

      clickHandlers.push(handler);
      elem.addEventListener("click", handler);
    });

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);

      links.forEach((elem, index) => {
        elem.removeEventListener("click", clickHandlers[index]);
      });

      clickIntervals.forEach((id) => window.clearInterval(id));
    };
  }, []);

  // Stable materials — one per texture, created once. Previously some
  // versions of this file used MeshPhysicalMaterial with clearcoat, which
  // requires the PhysicallyCorrectLights pipeline and is noticeably heavier
  // on weaker GPUs. MeshStandardMaterial renders nearly identical at this
  // distance and is much kinder on the Chrome GPU process.
  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshStandardMaterial({
          map: texture,
          emissive: new THREE.Color("#ffffff"),
          emissiveMap: texture,
          emissiveIntensity: 0.2,
          metalness: 0.25,
          roughness: 0.85,
        })
    );
  }, []);

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        dpr={[1, 1.25]}
        gl={{
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
          preserveDrawingBuffer: false,
          // failIfMajorPerformanceCaveat:false lets the page still try to
          // render on software WebGL. If it genuinely can't, the error
          // boundary kicks in and the fallback component renders.
          failIfMajorPerformanceCaveat: false,
        }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.05;
        }}
        className="tech-canvas"
      >
        {/* lighter lighting, no environment map */}
        <ambientLight intensity={1.6} />
        <directionalLight position={[3, 5, 8]} intensity={1.5} />
        <pointLight position={[-6, -2, 6]} intensity={1.2} />

        <Physics gravity={[0, 0, 0]}>
          <Pointer isActive={isActive} />
          {spheres.map((props, i) => (
            <SphereGeo
              key={i}
              {...props}
              material={materials[i % materials.length]}
              isActive={isActive}
            />
          ))}
        </Physics>
      </Canvas>
    </div>
  );
};

export default TechStack;
