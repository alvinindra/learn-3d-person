"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import {
  ContactShadows,
  ScrollControls,
  Grid,
} from "@react-three/drei";
import { JumpingPerson } from "./JumpingPerson";

interface JumpingSceneProps {
  personColor?: string | null;
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

export function JumpingScene({ personColor }: JumpingSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 45 }}
      shadows
      className="touch-none"
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent", width: "100%", height: "100%" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Visual guide ground */}
      <Grid
        infiniteGrid
        fadeDistance={30}
        sectionSize={1.5}
        sectionColor="#e5e7eb"
        cellColor="#f3f4f6"
        position={[0, -1.5, 0]}
      />

      <ScrollControls pages={4} damping={0.25} enabled>
        <Suspense fallback={<LoadingFallback />}>
          <JumpingPerson color={personColor} />
        </Suspense>
      </ScrollControls>

      <ContactShadows
        position={[0, -1.49, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
      />
    </Canvas>
  );
}
