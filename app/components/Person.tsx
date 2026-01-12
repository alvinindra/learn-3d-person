"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

export function Person() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/person.glb");
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Log available animations for debugging
    console.log("Available animations:", names);

    if (names.length > 0) {
      const walkAnimationName = names.find(
        (name) => name.toLowerCase().includes("walk")
      ) || names[0];

      const action = actions[walkAnimationName];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity);
        // eslint-disable-next-line react-hooks/immutability
        action.timeScale = 0.8; // Slower for walking effect
      }
    }

    return () => {
      names.forEach((name) => {
        const action = actions[name];
        if (action) action.fadeOut(0.5);
      });
    };
  }, [actions, names]);

  // Subtle walking motion
  useFrame((state) => {
    if (group.current) {
      // Gentle bob for walking feel
      group.current.position.y = Math.sin(state.clock.elapsedTime * 4) * 0.01 - 1.2;
    }
  });

  return (
    <group ref={group} dispose={null}>
      <primitive
        object={scene}
        scale={0.6}
        position={[0, -0.5, 0]}
        rotation={[0, 45, 0]}
      />
    </group>
  );
}

// Preload the model
useGLTF.preload("/person.glb");
