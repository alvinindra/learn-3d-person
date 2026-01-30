"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { OrbitControls } from "@react-three/drei";
import { MovablePerson } from "./MovablePerson";

interface BasicsSceneProps {
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

function GroundPlane() {
  return (
    <group>
      {/* Main ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]} receiveShadow>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>

      {/* Grid lines */}
      <gridHelper
        args={[1000, 1000, '#e0e0e0', '#e0e0e0']}
        position={[0, -1.49, 0]}
      />
    </group>
  );
}

export function BasicsScene({ personColor }: BasicsSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      shadows
      className="touch-none"
      gl={{ antialias: true, alpha: true }}
      style={{ background: "transparent" }}
    >
      {/* Ambient lighting - soft overall illumination */}
      <ambientLight intensity={0.5} />

      {/* Main directional light - creates shadows */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Fill light - reduces harsh shadows */}
      <directionalLight position={[-5, 5, -5]} intensity={0.3} />

      {/* Back light - adds definition */}
      <directionalLight position={[0, 5, -10]} intensity={0.2} />

      {/* Ground plane with grid */}
      <GroundPlane />

      {/* 3D Person Model with movement */}
      <Suspense fallback={<LoadingFallback />}>
        <MovablePerson color={personColor} />
      </Suspense>

      {/* Camera Controls */}
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={false}
        minDistance={3}
        maxDistance={15}
      />
    </Canvas>
  );
}
