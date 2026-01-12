"use client";

import { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface FlyingPersonProps {
  color?: string | null;
}

export function FlyingPerson({ color }: FlyingPersonProps) {
  const group = useRef<THREE.Group>(null);

  const { scene } = useGLTF("/person.glb");

  // Clone the scene so posing doesn't affect other pages (GLTF cache is shared)
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  const skeletons = useMemo(() => {
    const found: THREE.Skeleton[] = [];
    clonedScene.traverse((obj) => {
      if (obj instanceof THREE.SkinnedMesh && obj.skeleton) found.push(obj.skeleton);
    });
    return found;
  }, [clonedScene]);

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

  // Pose the actual skeleton bones into a Superman-like flying pose
  useEffect(() => {
    const allBones = skeletons.flatMap((s) => s.bones);

    const byName = (patterns: Array<string | RegExp>) =>
      allBones.find((b) =>
        patterns.some((p) =>
          typeof p === "string"
            ? b.name.toLowerCase().includes(p)
            : p.test(b.name.toLowerCase())
        )
      );

    // Many rigs use French names (bras/jambe), so we match those first.
    const leftUpperArm =
      byName([/bras.*_l/, /bras_l/, /upperarm.*l/, /arm.*l/]) ??
      byName(["bras_l", "arm_l"]);
    const rightUpperArm =
      byName([/bras.*_r/, /bras_r/, /upperarm.*r/, /arm.*r/]) ??
      byName(["bras_r", "arm_r"]);

    const leftForeArm =
      byName([/avant.*bras.*_l/, /forearm.*l/, /lowerarm.*l/]) ??
      byName(["avant_bras_l", "forearm_l"]);
    const rightForeArm =
      byName([/avant.*bras.*_r/, /forearm.*r/, /lowerarm.*r/]) ??
      byName(["avant_bras_r", "forearm_r"]);

    const leftThigh =
      byName([/cuisse.*_l/, /upleg.*l/, /thigh.*l/]) ??
      byName(["cuisse_l", "upleg_l"]);
    const rightThigh =
      byName([/cuisse.*_r/, /upleg.*r/, /thigh.*r/]) ??
      byName(["cuisse_r", "upleg_r"]);

    const leftShin =
      byName([/jambe.*_l/, /leg.*l/, /calf.*l/]) ??
      byName(["jambe_l", "calf_l"]);
    const rightShin =
      byName([/jambe.*_r/, /leg.*r/, /calf.*r/]) ??
      byName(["jambe_r", "calf_r"]);

    const leftFoot =
      byName([/pied.*_l/, /foot.*l/, /ankle.*l/]) ??
      byName(["pied_l", "foot_l"]);
    const rightFoot =
      byName([/pied.*_r/, /foot.*r/, /ankle.*r/]) ??
      byName(["pied_r", "foot_r"]);

    const pelvis = byName([/bassin/, /pelvis/, /hips/]);

    const spine = byName([/spine/, /colonne/, /torse/]);
    const head = byName([/tete/, /head/]);

    // Reset to bind pose first so we don't stack poses on hot reload.
    skeletons.forEach((s) => s.pose());

    // Debug: verify which bones were matched (helps when rigs use unusual names)
    if (process.env.NODE_ENV !== "production") {
      console.debug("[FlyingPerson pose bones]", {
        pelvis: pelvis?.name,
        spine: spine?.name,
        head: head?.name,
        leftUpperArm: leftUpperArm?.name,
        leftForeArm: leftForeArm?.name,
        rightUpperArm: rightUpperArm?.name,
        rightForeArm: rightForeArm?.name,
        leftThigh: leftThigh?.name,
        leftShin: leftShin?.name,
        leftFoot: leftFoot?.name,
        rightThigh: rightThigh?.name,
        rightShin: rightShin?.name,
        rightFoot: rightFoot?.name,
      });
    }

    const addRot = (bone: THREE.Bone | undefined, rot: Partial<{ x: number; y: number; z: number }>) => {
      if (!bone) return;
      if (typeof rot.x === "number") bone.rotation.x += rot.x;
      if (typeof rot.y === "number") bone.rotation.y += rot.y;
      if (typeof rot.z === "number") bone.rotation.z += rot.z;
    };

    // Torso: Keep relatively neutral, let group rotation handle orientation
    addRot(spine, { x: -0.1 }); // Slight arch

    // Head: Tilt UP to look at the sky (in flight direction)
    addRot(head, { x: -0.8 }); // Strong tilt back to look up/forward

    // Arms: Right arm straight UP (toward flight direction = the "top")
    // For a T-pose rig, we need to rotate on Z axis to raise the arm up
    addRot(rightUpperArm, { z: -2.5 }); // Raise arm up toward head
    addRot(rightForeArm, { x: 0.0 }); // Keep elbow straight

    // Left arm: Along the body / slightly back
    addRot(leftUpperArm, { x: 0.3, z: 0.3 }); // Down along body
    addRot(leftForeArm, { x: 0.0 }); // Straight

    // Legs: Streamlined back
    addRot(leftThigh, { x: 0.2, z: 0.1 });
    addRot(rightThigh, { x: 0.2, z: -0.1 });

    // Force knees straight
    if (leftShin) leftShin.rotation.set(0, 0, 0);
    if (rightShin) rightShin.rotation.set(0, 0, 0);

    // Keep feet neutral to avoid "bent leg" look or abnormal angles
    if (leftFoot) leftFoot.rotation.set(0.5, 0, 0);
    if (rightFoot) rightFoot.rotation.set(0.5, 0, 0);

    // Ensure matrices are up to date after posing
    allBones.forEach((b) => b.updateMatrixWorld(true));
  }, [skeletons]);

  // Flying animation - gentle floating motion
  useFrame((state) => {
    if (group.current) {
      // Floating up and down
      const float = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;

      group.current.position.y = float;
      // Remove roll for now to ensure "horizontal" stability unless requested
    }
  });

  return (
    <group
      ref={group}
      dispose={null}
      // Flying horizontally to the left, belly facing UP (toward top of screen)
      // X = PI/2 tilts body backward (face up)
      // Z = PI/2 rotates head to point left
      position={[1.5, 0, 0]} // Offset to center
      rotation={[Math.PI / 2, 0, Math.PI / 2]} // Face up, fly left
      scale={0.55}
    >
      <primitive object={clonedScene} />
    </group>
  );
}

useGLTF.preload("/person.glb");