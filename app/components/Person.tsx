/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

interface PersonProps {
  color?: string | null;
}

export function Person({ color }: PersonProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/person.glb");
  const { actions, names } = useAnimations(animations, group);

  // Apply color change
  useEffect(() => {
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const material = mesh.material as THREE.MeshStandardMaterial;
        if (color) {
          material.color.set(color);
        } else {
          material.color.set("white");
        }
      }
    });
  }, [color, scene]);

  useEffect(() => {
    if (names.length > 0) {
      const walkAnimationName = names.find(
        (name) => name.toLowerCase().includes("walk")
      ) || names[0];

      const action = actions[walkAnimationName];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = 0.8;
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
      const bob = Math.sin(state.clock.elapsedTime * 4) * 0.01;
      group.current.position.y = -1.5 + bob;
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -1.5, 0]}>
      <primitive
        object={scene}
        scale={0.6}
        rotation={[0, Math.PI / 2, 0]}
      />
    </group>
  );
}

// Preload the model
useGLTF.preload("/person.glb");
