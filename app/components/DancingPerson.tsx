/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface DancingPersonProps {
  color?: string | null;
}

const MODEL_SCALE = 0.45; // Larger size
const GROUND_Y = -1.5; // Lower ground position

export function DancingPerson({ color }: DancingPersonProps) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/person.glb");

  // Clone the scene so we don't affect other pages (GLTF cache is shared)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Keep the character fully visible:
  // - smaller scale to avoid top cropping
  // - auto-place feet on the ground plane (matches ContactShadows at y=-1.5)
  const baseY = useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    return GROUND_Y - box.min.y * MODEL_SCALE;
  }, [clonedScene]);

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

    // Debug: Log all available bone names
    console.log("Available bones:", allBones.map((b) => b.name));

    // Partial match - finds first bone containing the pattern
    const byName = (patterns: Array<string | RegExp>) =>
      allBones.find((b) =>
        patterns.some((p) =>
          typeof p === "string"
            ? b.name.toLowerCase().includes(p)
            : p.test(b.name.toLowerCase())
        )
      );

    // Exact match - finds bone with exact name (case insensitive)
    const byExactName = (names: string[]) =>
      allBones.find((b) =>
        names.some((n) => b.name.toLowerCase() === n.toLowerCase())
      );

    // Match by ending - for bones like "mixamorig:LeftFoot" 
    const byEndName = (endings: string[]) =>
      allBones.find((b) =>
        endings.some((e) => b.name.toLowerCase().endsWith(e.toLowerCase()))
      );

    const foundBones = {
      pelvis: byName([/bassin/, /pelvis/, /hips/]) ?? byEndName(["hips", "pelvis"]),
      spine: byName([/spine/, /colonne/, /torse/, /torso/]) ?? byEndName(["spine", "spine1", "spine2"]),
      head: byName([/tete/]) ?? byEndName(["head"]),
      // Upper legs / Thighs - must contain "up" or "thigh" to avoid matching lower leg
      leftThigh: byEndName(["leftupleg", "left_upleg", "thigh_l", "leftthigh"])
        ?? byName([/upleg.*l/, /thigh.*l/, /upperleg.*l/]),
      rightThigh: byEndName(["rightupleg", "right_upleg", "thigh_r", "rightthigh"])
        ?? byName([/upleg.*r/, /thigh.*r/, /upperleg.*r/]),
      // Lower legs / Shins / Calves - must contain "leg" without "up" or "thigh"
      leftShin: byEndName(["leftleg", "left_leg", "calf_l", "leftcalf", "leftshin"])
        ?? byName([/^(?!.*up).*leg.*l/, /calf.*l/, /shin.*l/]),
      rightShin: byEndName(["rightleg", "right_leg", "calf_r", "rightcalf", "rightshin"])
        ?? byName([/^(?!.*up).*leg.*r/, /calf.*r/, /shin.*r/]),
      // Arms
      leftUpperArm: byEndName(["leftarm", "left_arm", "upperarm_l", "leftupperarm"])
        ?? byName([/upperarm.*l/, /arm.*l/]),
      rightUpperArm: byEndName(["rightarm", "right_arm", "upperarm_r", "rightupperarm"])
        ?? byName([/upperarm.*r/, /arm.*r/]),
      leftForeArm: byEndName(["leftforearm", "left_forearm", "forearm_l"])
        ?? byName([/forearm.*l/, /lowerarm.*l/]),
      rightForeArm: byEndName(["rightforearm", "right_forearm", "forearm_r"])
        ?? byName([/forearm.*r/, /lowerarm.*r/]),
      // Hands / Wrists
      leftHand: byEndName(["lefthand", "left_hand", "hand_l", "wrist_l", "leftwrist"])
        ?? byName([/hand.*l/, /wrist.*l/]),
      rightHand: byEndName(["righthand", "right_hand", "hand_r", "wrist_r", "rightwrist"])
        ?? byName([/hand.*r/, /wrist.*r/]),
      // Feet / Ankles - use exact ending match to avoid matching leg bones
      leftFoot: byEndName(["leftfoot", "left_foot", "foot_l", "pied_l"])
        ?? byExactName(["LeftFoot", "Left_Foot", "Foot_L"]),
      rightFoot: byEndName(["rightfoot", "right_foot", "foot_r", "pied_r"])
        ?? byExactName(["RightFoot", "Right_Foot", "Foot_R"]),
      // Toes (optional, for extra animation)
      leftToe: byEndName(["lefttoebase", "left_toe", "toe_l", "lefttoe"])
        ?? byName([/toe.*l/]),
      rightToe: byEndName(["righttoebase", "right_toe", "toe_r", "righttoe"])
        ?? byName([/toe.*r/]),
    };

    // Debug: Log found bones
    console.log("Found bones:", Object.entries(foundBones).map(([key, bone]) => `${key}: ${bone?.name ?? 'NOT FOUND'}`));

    return foundBones;
  }, [skeletons]);

  // Apply color change to all meshes
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      // Skinned meshes can be incorrectly culled when bones move vertices.
      // Disabling frustum culling avoids feet/legs disappearing.
      if (child instanceof THREE.SkinnedMesh) child.frustumCulled = false;
      child.castShadow = true;
      child.receiveShadow = true;

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

  // Use the 'wait' animation as a background idle if it exists
  useEffect(() => {
    if (names.length > 0) {
      const waitName = names.find((name) => name.toLowerCase().includes("wait")) || names[0];
      const action = actions[waitName];
      if (action) {
        action.reset().fadeIn(0.5).play();
        action.timeScale = 0.5;
      }
    }
    return () => {
      names.forEach((name) => actions[name]?.fadeOut(0.5));
    };
  }, [actions, names]);

  useFrame((state) => {
    if (!group.current) return;

    const t = state.clock.elapsedTime;
    const tempo = 2.5; // Faster dance speed for modern dance

    // Determine which phase of the dance cycle we're in (0-3)
    const phase = Math.floor((t * tempo) % 4);
    const phaseProgress = (t * tempo) % 1; // 0-1 progress within phase

    // Small bounce - feet stay grounded, just slight knee bend effect
    const bounce = Math.abs(Math.sin(t * tempo * 2)) * 0.02;
    group.current.position.y = baseY + bounce;

    // Subtle side-to-side weight shift
    group.current.position.x = Math.sin(t * tempo * 0.5) * 0.03;

    // Hip movements - more dynamic swaying and rotation
    if (bones.pelvis) {
      bones.pelvis.rotation.y = Math.sin(t * tempo) * 0.4;
      bones.pelvis.rotation.z = Math.cos(t * tempo * 2) * 0.15;
      bones.pelvis.rotation.x = Math.sin(t * tempo * 2) * 0.1; // Forward/back tilt
    }

    // Torso - isolations like modern dance
    if (bones.spine) {
      bones.spine.rotation.y = Math.sin(t * tempo + 0.5) * 0.3;
      bones.spine.rotation.x = Math.cos(t * tempo * 1.5) * 0.1;
      bones.spine.rotation.z = Math.sin(t * tempo * 0.75) * 0.1;
    }

    // Head - more expressive movement
    if (bones.head) {
      bones.head.rotation.x = Math.sin(t * tempo * 2) * 0.15;
      bones.head.rotation.y = Math.sin(t * tempo) * 0.2;
      bones.head.rotation.z = Math.cos(t * tempo * 1.5) * 0.1;
    }

    // Arms - modern dance style with flowing movements
    if (bones.leftUpperArm) {
      const armPhase = Math.sin(t * tempo);
      bones.leftUpperArm.rotation.x = -0.3 + armPhase * 0.7;
      bones.leftUpperArm.rotation.z = -0.8 - Math.cos(t * tempo * 1.5) * 0.6;
      bones.leftUpperArm.rotation.y = Math.sin(t * tempo * 0.5) * 0.3;
    }
    if (bones.rightUpperArm) {
      const armPhase = Math.cos(t * tempo);
      bones.rightUpperArm.rotation.x = -0.3 - armPhase * 0.7;
      bones.rightUpperArm.rotation.z = 0.8 + Math.cos(t * tempo * 1.5) * 0.6;
      bones.rightUpperArm.rotation.y = -Math.sin(t * tempo * 0.5) * 0.3;
    }

    // Forearms - fluid waving motion
    if (bones.leftForeArm) {
      bones.leftForeArm.rotation.x = -0.2 + Math.sin(t * tempo * 2.5) * 0.5;
      bones.leftForeArm.rotation.z = -0.3 + Math.cos(t * tempo * 2) * 0.3;
    }
    if (bones.rightForeArm) {
      bones.rightForeArm.rotation.x = -0.2 + Math.cos(t * tempo * 2.5) * 0.5;
      bones.rightForeArm.rotation.z = 0.3 - Math.cos(t * tempo * 2) * 0.3;
    }

    // Hands / Wrists - bending and rotating like dancing
    if (bones.leftHand) {
      bones.leftHand.rotation.x = Math.sin(t * tempo * 3) * 0.4; // Flex/bend
      bones.leftHand.rotation.z = Math.cos(t * tempo * 2) * 0.3; // Side wave
      bones.leftHand.rotation.y = Math.sin(t * tempo * 1.5) * 0.2; // Rotate
    }
    if (bones.rightHand) {
      bones.rightHand.rotation.x = Math.cos(t * tempo * 3) * 0.4; // Flex/bend
      bones.rightHand.rotation.z = -Math.cos(t * tempo * 2) * 0.3; // Side wave
      bones.rightHand.rotation.y = -Math.sin(t * tempo * 1.5) * 0.2; // Rotate
    }

    // Dynamic leg movements - alternating kicks and steps
    const legCycle = Math.sin(t * tempo);
    const legCycleAlt = Math.cos(t * tempo);

    // Left leg - lifts and steps
    if (bones.leftThigh) {
      bones.leftThigh.rotation.x = legCycle > 0 ? -legCycle * 0.4 : 0; // Lift forward
      bones.leftThigh.rotation.z = -0.05 + Math.sin(t * tempo * 0.5) * 0.1;
    }
    if (bones.leftShin) {
      // Bend knee when leg is lifted
      bones.leftShin.rotation.x = legCycle > 0 ? legCycle * 0.5 : 0;
    }

    // Right leg - alternating with left
    if (bones.rightThigh) {
      bones.rightThigh.rotation.x = legCycleAlt > 0 ? -legCycleAlt * 0.4 : 0; // Lift forward
      bones.rightThigh.rotation.z = 0.05 - Math.sin(t * tempo * 0.5) * 0.1;
    }
    if (bones.rightShin) {
      // Bend knee when leg is lifted
      bones.rightShin.rotation.x = legCycleAlt > 0 ? legCycleAlt * 0.5 : 0;
    }

    // Feet - dramatic pointing, flexing, pivoting, and rolling
    if (bones.leftFoot) {
      const footPhase = Math.sin(t * tempo);
      bones.leftFoot.rotation.x = 0.3 + footPhase * 0.4; // Strong point/flex
      bones.leftFoot.rotation.y = Math.sin(t * tempo * 1.5) * 0.25; // Wider pivot
      bones.leftFoot.rotation.z = Math.cos(t * tempo * 2) * 0.2; // Dynamic roll
    }
    if (bones.rightFoot) {
      const footPhase = Math.cos(t * tempo);
      bones.rightFoot.rotation.x = 0.3 + footPhase * 0.4; // Strong point/flex
      bones.rightFoot.rotation.y = -Math.sin(t * tempo * 1.5) * 0.25; // Wider pivot
      bones.rightFoot.rotation.z = -Math.cos(t * tempo * 2) * 0.2; // Dynamic roll
    }

    // Toes - quick curling and tapping
    if (bones.leftToe) {
      bones.leftToe.rotation.x = 0.2 + Math.sin(t * tempo * 4) * 0.4;
      bones.leftToe.rotation.z = Math.cos(t * tempo * 3) * 0.15;
    }
    if (bones.rightToe) {
      bones.rightToe.rotation.x = 0.2 + Math.cos(t * tempo * 4) * 0.4;
      bones.rightToe.rotation.z = -Math.cos(t * tempo * 3) * 0.15;
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, baseY, 0]}>
      <primitive object={clonedScene} scale={MODEL_SCALE} rotation={[0, Math.PI / 4, 0]} />
    </group>
  );
}

useGLTF.preload("/person.glb");
