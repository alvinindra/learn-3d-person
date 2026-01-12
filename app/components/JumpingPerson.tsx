/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations, useScroll } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface JumpingPersonProps {
  color?: string | null;
}

export function JumpingPerson({ color }: JumpingPersonProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/person.glb");
  const scroll = useScroll();

  // Clone the scene so we don't affect other pages (GLTF cache is shared)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Clone animations
  const clonedAnimations = useMemo(() => {
    return animations.map((clip) => clip.clone());
  }, [animations]);

  const { actions, names } = useAnimations(clonedAnimations, group);

  const skeletons = useMemo(() => {
    const found: THREE.Skeleton[] = [];
    clonedScene.traverse((obj) => {
      if (obj instanceof THREE.SkinnedMesh && obj.skeleton) found.push(obj.skeleton);
    });
    return found;
  }, [clonedScene]);

  const bones = useMemo(() => {
    const allBones = skeletons.flatMap((s) => s.bones);
    const byName = (patterns: Array<string | RegExp>) =>
      allBones.find((b) =>
        patterns.some((p) =>
          typeof p === "string"
            ? b.name.toLowerCase().includes(p)
            : p.test(b.name.toLowerCase())
        )
      );

    return {
      pelvis: byName([/bassin/, /pelvis/, /hips/]),
      spine: byName([/spine/, /colonne/, /torse/]),
      leftThigh: byName([/cuisse.*_l/, /upleg.*l/, /thigh.*l/]) ?? byName(["cuisse_l", "upleg_l"]),
      rightThigh: byName([/cuisse.*_r/, /upleg.*r/, /thigh.*r/]) ?? byName(["cuisse_r", "upleg_r"]),
      leftShin: byName([/jambe.*_l/, /leg.*l/, /calf.*l/]) ?? byName(["jambe_l", "calf_l"]),
      rightShin: byName([/jambe.*_r/, /leg.*r/, /calf.*r/]) ?? byName(["jambe_r", "calf_r"]),
      leftFoot: byName([/pied.*_l/, /foot.*l/, /ankle.*l/]) ?? byName(["pied_l", "foot_l"]),
      rightFoot: byName([/pied.*_r/, /foot.*r/, /ankle.*r/]) ?? byName(["pied_r", "foot_r"]),
      leftUpperArm: byName([/bras.*_l/, /bras_l/, /upperarm.*l/, /arm.*l/]),
      rightUpperArm: byName([/bras.*_r/, /bras_r/, /upperarm.*r/, /arm.*r/]),
    };
  }, [skeletons]);

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

  // Set up animation
  useEffect(() => {
    // We prefer the 'idle' pose as a base or no animation at all 
    // to avoid legs 'walking' while we try to pose them for jumping.
    if (names.length > 0) {
      const idleName = names.find((name) => name.toLowerCase().includes("idle"));
      if (idleName) {
        const action = actions[idleName];
        if (action) {
          action.reset().fadeIn(0.5).play();
          action.timeScale = 0.5;
        }
      } else {
        // If no idle, stop all to allow manual posing
        names.forEach(n => actions[n]?.stop());
      }
    }

    return () => {
      names.forEach((name) => actions[name]?.fadeOut(0.5));
    };
  }, [actions, names]);

  useFrame((state) => {
    if (!group.current) return;

    // Get scroll offset (0 to 1)
    const offset = scroll.offset;

    // We want multiple jumps across the scroll
    const jumpCount = 4;
    const progress = (offset * jumpCount) % 1;

    let jumpY = 0;
    let scaleY = 1;
    let scaleXZ = 1;

    // Bone rotations
    let legRot = 0;
    let kneeRot = 0;
    let footRot = 0;
    let armRot = 0;

    // Phase timings
    const crouchEnd = 0.2;
    const airEnd = 0.8;

    if (progress < crouchEnd) {
      // 1. Crouch phase: preparation for jump
      const t = progress / crouchEnd;
      const amount = Math.sin(t * (Math.PI / 2)); // Ease out to bottom

      jumpY = -0.5 * amount; // Lower hips
      scaleY = 1 - 0.1 * amount;
      scaleXZ = 1 + 0.05 * amount;

      // Pose legs for crouch
      legRot = -1.0 * amount; // Thighs forward
      kneeRot = 1.8 * amount; // Knees bend
      footRot = -0.8 * amount; // Feet stay flat
      armRot = 0.5 * amount;  // Arms swing back
    } else if (progress < airEnd) {
      // 2. Air phase: the actual jump
      const t = (progress - crouchEnd) / (airEnd - crouchEnd);
      jumpY = Math.sin(t * Math.PI) * 4.5 - 0.5 * Math.pow(1 - t, 4);

      // Extension phase (beginning of jump)
      const extension = Math.max(0, 1 - Math.abs(t - 0.1) * 5);
      legRot = 0.2 * (1 - extension) - 0.5 * extension;
      kneeRot = -0.2 * (1 - extension);
      footRot = 0.5 * extension;

      // Tuck legs in mid-air
      const tuck = Math.sin(t * Math.PI);
      legRot = -0.3 * tuck;
      kneeRot = 0.6 * tuck;
      armRot = -1.0 * tuck;

      scaleY = 1 + Math.sin(t * Math.PI) * 0.1;
    } else {
      // 3. Landing phase: impact absorption
      const t = (progress - airEnd) / (1 - airEnd);
      const amount = Math.sin(t * Math.PI);

      jumpY = -0.6 * amount;
      scaleY = 1 - 0.2 * amount;
      scaleXZ = 1 + 0.1 * amount;

      legRot = -1.2 * amount;
      kneeRot = 2.0 * amount;
      footRot = -0.8 * amount;
      armRot = 0.8 * amount;
    }

    // Apply vertical position
    group.current.position.y = -1.5 + jumpY;

    // Apply Squash & Stretch to the container
    group.current.scale.set(0.6 * scaleXZ, 0.6 * scaleY, 0.6 * scaleXZ);

    // Apply Bone rotations
    const applyRot = (bone: THREE.Bone | undefined, x: number) => {
      if (bone) bone.rotation.x = x;
    };

    applyRot(bones.leftThigh, legRot);
    applyRot(bones.rightThigh, legRot);
    applyRot(bones.leftShin, kneeRot);
    applyRot(bones.rightShin, kneeRot);
    applyRot(bones.leftFoot, footRot);
    applyRot(bones.rightFoot, footRot);
    applyRot(bones.leftUpperArm, armRot);
    applyRot(bones.rightUpperArm, armRot);

    // Face the screen (forward)
    group.current.rotation.y = 0;
    group.current.position.z = 0;
    group.current.position.x = 0;
  });

  return (
    <group ref={group} dispose={null} position={[0, -1.5, 0]}>
      <primitive
        object={clonedScene}
      />
    </group>
  );
}
