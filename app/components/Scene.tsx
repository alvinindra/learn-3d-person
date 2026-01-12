"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import {
  OrbitControls,
  ContactShadows,
} from "@react-three/drei";
import { Person } from "./Person";

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[1, 2, 1]} />
      <meshStandardMaterial color="#ffffff" wireframe />
    </mesh>
  );
}

export function Scene() {
  return (
    <Canvas
      camera={{ position: [0, 1, 4], fov: 50 }}
      shadows
      className="touch-none"
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Clean minimalist lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.4}
      />

      {/* 3D Person Model */}
      <Suspense fallback={<LoadingFallback />}>
        <Person />
      </Suspense>

      {/* Ground shadow */}
      <ContactShadows
        position={[0, -1.7, 0]}
        opacity={0.3}
        scale={10}
        blur={2.5}
        far={4}
        color="#000000"
      />

      {/* Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  );
}

