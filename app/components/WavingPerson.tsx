/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface WavingPersonProps {
  color?: string | null;
}

export function WavingPerson({ color }: WavingPersonProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/person.glb");

  // Clone the scene so we don't affect other pages (GLTF cache is shared)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Clone animations for the cloned scene
  const clonedAnimations = useMemo(() => {
    return animations.map((clip) => clip.clone());
  }, [animations]);

  const { actions, names } = useAnimations(clonedAnimations, group);

  // Apply color change to all meshes
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mat = (child.material ?? null) as
        | THREE.MeshStandardMaterial
        | THREE.MeshStandardMaterial[]
        | null;
      const applyToMaterial = (material: THREE.MeshStandardMaterial) => {
        if (color) material.color.set(color);
        else material.color.set("white");
      };
      if (Array.isArray(mat)) mat.forEach(applyToMaterial);
      else if (mat) applyToMaterial(mat);
    });
  }, [color, clonedScene]);

  // Play the "coucou" waving animation
  useEffect(() => {
    if (names.length > 0) {
      // Look for the "coucou" animation (waving)
      const wavingAnimationName =
        names.find((name) => name.toLowerCase().includes("coucou")) ||
        names.find((name) => name.toLowerCase().includes("wave")) ||
        names[0];

      // Debug: log available animations
      if (process.env.NODE_ENV !== "production") {
        console.debug("[WavingPerson animations]", names);
        console.debug("[WavingPerson selected]", wavingAnimationName);
      }

      const action = actions[wavingAnimationName];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = 1.0;
      }
    }

    return () => {
      names.forEach((name) => {
        const action = actions[name];
        if (action) action.fadeOut(0.5);
      });
    };
  }, [actions, names]);

  // Subtle idle motion
  useFrame((state) => {
    if (group.current) {
      // Gentle breathing/swaying motion
      const sway = Math.sin(state.clock.elapsedTime * 0.8) * 0.02;
      group.current.rotation.y = Math.PI / 6 + sway;
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -1, 0]}>
      <primitive
        object={clonedScene}
        scale={0.4}
        rotation={[0, -20, 0]}
      />
    </group>
  );
}

// Preload the model
useGLTF.preload("/person.glb");
