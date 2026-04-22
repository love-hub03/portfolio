import * as THREE from "three";
import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import {
  BallCollider,
  Physics,
  RigidBody,
  CylinderCollider,
  RapierRigidBody,
} from "@react-three/rapier";

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

const textures = imageUrls.map((url) => textureLoader.load(url));

const sphereGeometry = new THREE.SphereGeometry(1, 24, 24);

// KEEPING 30 SPHERES
const spheres = [...Array(30)].map(() => ({
  scale: [0.7, 1, 0.8, 1, 1][Math.floor(Math.random() * 5)],
}));

function isWebGLAvailable() {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

type SphereProps = {
  vec?: THREE.Vector3;
  scale: number;
  r?: typeof THREE.MathUtils.randFloatSpread;
  material: THREE.MeshPhysicalMaterial;
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
          -50 * delta * scale,
          -150 * delta * scale,
          -50 * delta * scale
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
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setWebglSupported(isWebGLAvailable());

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

  const materials = useMemo(() => {
    return textures.map(
      (texture) =>
        new THREE.MeshPhysicalMaterial({
          map: texture,
          emissive: "#ffffff",
          emissiveMap: texture,
          emissiveIntensity: 0.25,
          metalness: 0.4,
          roughness: 0.95,
          clearcoat: 0.08,
        })
    );
  }, []);

  if (!webglSupported) {
    return (
      <div className="techstack">
        <h2> My Techstack</h2>
      </div>
    );
  }

  return (
    <div className="techstack">
      <h2> My Techstack</h2>

      <Canvas
        dpr={[1, 1.5]}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: "default",
          preserveDrawingBuffer: false,
        }}
        camera={{ position: [0, 0, 20], fov: 32.5, near: 1, far: 100 }}
        onCreated={(state) => {
          state.gl.toneMappingExposure = 1.2;
        }}
        className="tech-canvas"
      >
        <ambientLight intensity={1.2} />
        <spotLight
          position={[20, 20, 25]}
          penumbra={1}
          angle={0.2}
          color="white"
          castShadow={false}
        />
        <directionalLight position={[0, 5, -4]} intensity={1.8} />

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

        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default TechStack;