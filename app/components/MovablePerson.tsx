"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";

interface MovablePersonProps {
  color?: string | null;
  walkSpeed?: number;
}

interface BoneData {
  bone: THREE.Bone;
  initialRotation: THREE.Euler;
}

interface FootstepData {
  id: number;
  position: [number, number, number];
  rotation: number;
  time: number;
}

function Footstep({ position, rotation, onComplete }: { position: [number, number, number], rotation: number, onComplete: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTimeRef = useRef<number | null>(null);
  const duration = 3.0; // 3 seconds total

  useFrame((state) => {
    if (!meshRef.current) return;
    if (startTimeRef.current === null) startTimeRef.current = state.clock.elapsedTime;

    const elapsed = state.clock.elapsedTime - startTimeRef.current;
    const progress = Math.min(elapsed / duration, 1);

    if (progress >= 1) {
      onComplete();
      return;
    }

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    // Stay visible for first 1s, then fade out in remaining 2s
    const fadeStart = 0.33; // 1s / 3s
    if (progress < fadeStart) {
      mat.opacity = 0.35;
    } else {
      const fadeProgress = (progress - fadeStart) / (1 - fadeStart);
      mat.opacity = 0.35 * (1 - fadeProgress);
    }
  });

  return (
    <mesh
      position={position}
      rotation={[-Math.PI / 2, 0, rotation]}
      scale={[0.7, 1.2, 1]}
      receiveShadow
    >
      <circleGeometry args={[0.15, 32]} />
      <meshStandardMaterial
        color="#000000"
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.MultiplyBlending}
        premultipliedAlpha={true}
      />
    </mesh>
  );
}

export function MovablePerson({ color, walkSpeed = 3 }: MovablePersonProps) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF("/person.glb");

  // Clone the scene so we don't affect other pages
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);

  // Store bone references with initial rotations
  const bonesRef = useRef<Record<string, BoneData>>({});
  const bonesInitialized = useRef(false);

  // Movement state
  const [movement, setMovement] = useState({ x: 0, z: 0 });
  const [targetRotation, setTargetRotation] = useState(0);
  const positionRef = useRef({ x: 0, z: 0 });
  const keysPressed = useRef<Set<string>>(new Set());
  const walkCycleRef = useRef(0);
  const [footsteps, setFootsteps] = useState<FootstepData[]>([]);
  const lastFootStepRef = useRef<"left" | "right" | null>(null);

  // Current animation values for smooth transitions
  const currentAnimRef = useRef({
    legSwing: 0,
    leftArmSwing: 0,  // Separate arm swings for alternating motion
    rightArmSwing: 0,
    bodySwing: 0,
    forwardLean: 0, // Forward lean when walking
  });

  // Find all bones in the cloned scene and store initial rotations
  useEffect(() => {
    if (bonesInitialized.current) return;

    const bones: Record<string, BoneData> = {};

    clonedScene.traverse((child) => {
      if (child instanceof THREE.Bone) {
        bones[child.name] = {
          bone: child,
          initialRotation: child.rotation.clone(),
        };
      }
    });

    bonesRef.current = bones;
    bonesInitialized.current = true;

    // Log all bone names for debugging
    console.log("All bones in model:", Object.keys(bones));

    // Bring arms and shoulders down from T-pose
    if (bones["epaule_L"]) {
      bones["epaule_L"].bone.rotation.z -= 0.8; // Lower shoulder more
      bones["epaule_L"].initialRotation = bones["epaule_L"].bone.rotation.clone();
    }
    if (bones["epaule_R"]) {
      bones["epaule_R"].bone.rotation.z += 0.8; // Lower shoulder more
      bones["epaule_R"].initialRotation = bones["epaule_R"].bone.rotation.clone();
    }

    if (bones["bras_L"]) {
      bones["bras_L"].bone.rotation.z -= 0.5; // Rotate down
      bones["bras_L"].initialRotation = bones["bras_L"].bone.rotation.clone();
    }
    if (bones["bras_R"]) {
      bones["bras_R"].bone.rotation.z += 0.5; // Rotate down
      bones["bras_R"].initialRotation = bones["bras_R"].bone.rotation.clone();
    }

    // Straighten spine (fix hunchback)
    if (bones["torse"]) {
      bones["torse"].bone.rotation.x -= 0.15; // Pull chest back/up
      bones["torse"].initialRotation = bones["torse"].bone.rotation.clone();
    }

    // Adjust head to look forward if needed
    if (bones["tete"]) {
      bones["tete"].bone.rotation.x += 0.5; // chin up slightly
      bones["tete"].initialRotation = bones["tete"].bone.rotation.clone();
    }
  }, [clonedScene]);

  // Keyboard event handlers
  useEffect(() => {
    let rotationTimeout: NodeJS.Timeout;

    const updateMovement = (isKeyUp = false) => {
      let x = 0;
      let z = 0;

      if (keysPressed.current.has("ArrowUp") || keysPressed.current.has("w")) z = -1;
      if (keysPressed.current.has("ArrowDown") || keysPressed.current.has("s")) z = 1;
      if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a")) x = -1;
      if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d")) x = 1;

      setMovement({ x, z });

      if (x !== 0 || z !== 0) {
        const angle = Math.atan2(x, z);

        if (isKeyUp) {
          // When a key is released, wait a tiny bit before updating rotation.
          // This allows for nearly-simultaneous key releases to stop the rotation
          // update before it snaps to a cardinal direction.
          if (rotationTimeout) clearTimeout(rotationTimeout);
          rotationTimeout = setTimeout(() => {
            setTargetRotation(angle);
          }, 100);
        } else {
          // When a key is pressed, update rotation immediately for responsiveness.
          if (rotationTimeout) clearTimeout(rotationTimeout);
          setTargetRotation(angle);
        }
      } else {
        // If movement stopped completely, cancel any pending rotation updates.
        if (rotationTimeout) clearTimeout(rotationTimeout);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }
      if (keysPressed.current.has(e.key)) return; // Prevent repeat events
      keysPressed.current.add(e.key);
      updateMovement(false);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
      updateMovement(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      if (rotationTimeout) clearTimeout(rotationTimeout);
    };
  }, []);

  // Apply color change to meshes
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
        const mat = child.material as THREE.MeshStandardMaterial | THREE.MeshStandardMaterial[];
        const applyColor = (material: THREE.MeshStandardMaterial) => {
          if (color) material.color.set(color);
          else material.color.set("white");
        };
        if (Array.isArray(mat)) mat.forEach(applyColor);
        else if (mat) applyColor(mat);
      }
    });
  }, [color, clonedScene]);

  // Update position and procedural walking animation
  useFrame((state, delta) => {
    if (!group.current) return;

    const speed = walkSpeed;
    const isMoving = movement.x !== 0 || movement.z !== 0;
    const bones = bonesRef.current;
    const anim = currentAnimRef.current;

    // Update position when moving
    if (isMoving) {
      positionRef.current.x += movement.x * speed * delta;
      positionRef.current.z += movement.z * speed * delta;

      // Advance walk cycle
      walkCycleRef.current += delta * 6;
    }

    // Apply position
    group.current.position.x = positionRef.current.x;
    group.current.position.z = positionRef.current.z;

    // Smooth rotation interpolation (shortest angle path for diagonal movement)
    let currentRot = group.current.rotation.y;
    let angleDiff = targetRotation - currentRot;
    // Wrap to shortest path (-π to π)
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    group.current.rotation.y += angleDiff * 0.1;

    // Target animation values based on walk cycle
    const walkPhase = walkCycleRef.current;
    const targetLegSwing = isMoving ? Math.sin(walkPhase) : 0;
    // Arms swing opposite to legs (offset by π) and opposite to each other
    const targetLeftArmSwing = isMoving ? Math.sin(walkPhase + Math.PI) : 0;  // Left arm opposite to left leg
    const targetRightArmSwing = isMoving ? Math.sin(walkPhase) : 0;  // Right arm opposite to right leg
    const targetBodySwing = isMoving ? Math.sin(walkPhase) : 0;

    // Smooth interpolation of animation values
    const lerpSpeed = delta * 6;
    anim.legSwing = THREE.MathUtils.lerp(anim.legSwing, targetLegSwing, lerpSpeed);
    anim.leftArmSwing = THREE.MathUtils.lerp(anim.leftArmSwing, targetLeftArmSwing, lerpSpeed);
    anim.rightArmSwing = THREE.MathUtils.lerp(anim.rightArmSwing, targetRightArmSwing, lerpSpeed);
    anim.bodySwing = THREE.MathUtils.lerp(anim.bodySwing, targetBodySwing, lerpSpeed);

    // --- Footstep spawning ---
    if (isMoving) {
      const stepThreshold = 0.95;
      const currentSwing = Math.sin(walkPhase);

      let newFoot: "left" | "right" | null = null;
      if (currentSwing > stepThreshold && lastFootStepRef.current !== "left") {
        newFoot = "left";
      } else if (currentSwing < -stepThreshold && lastFootStepRef.current !== "right") {
        newFoot = "right";
      }

      if (newFoot) {
        lastFootStepRef.current = newFoot;
        const footOffset = 0.2;
        // Calculate foot position relative to body rotation
        const angle = group.current.rotation.y;

        // Offset for left/right foot
        const sideOffset = newFoot === "left" ? footOffset : -footOffset;

        // World position calculation
        const footX = positionRef.current.x + Math.cos(angle) * sideOffset;
        const footZ = positionRef.current.z - Math.sin(angle) * sideOffset;

        setFootsteps(prev => [
          ...prev,
          {
            id: Date.now(),
            position: [footX, -1.48, footZ] as [number, number, number],
            rotation: angle,
            time: Date.now()
          }
        ].slice(-10)); // Keep only last 10 steps for performance
      }
    } else {
      lastFootStepRef.current = null;
    }

    // Body bob
    const bob = Math.abs(anim.legSwing) * 0.02;
    group.current.position.y = -1.5 + bob;

    // === LEG ANIMATIONS ===
    if (bones["cuisse_L"]) {
      const b = bones["cuisse_L"];
      b.bone.rotation.x = b.initialRotation.x + anim.legSwing * 0.4;
    }
    if (bones["cuisse_R"]) {
      const b = bones["cuisse_R"];
      b.bone.rotation.x = b.initialRotation.x - anim.legSwing * 0.4;
    }
    if (bones["mollet_L"]) {
      const b = bones["mollet_L"];
      b.bone.rotation.x = b.initialRotation.x + Math.max(0, anim.legSwing) * 0.3;
    }
    if (bones["mollet_R"]) {
      const b = bones["mollet_R"];
      b.bone.rotation.x = b.initialRotation.x + Math.max(0, -anim.legSwing) * 0.3;
    }

    // === ARM ANIMATIONS ===
    // Arms swing in opposite directions (like natural walking)
    if (bones["bras_L"]) {
      const b = bones["bras_L"];
      // Left arm swings with its own phase
      b.bone.rotation.y = b.initialRotation.y + anim.leftArmSwing * 0.6;
    }
    if (bones["bras_R"]) {
      const b = bones["bras_R"];
      // Right arm swings with its own phase (opposite direction)
      b.bone.rotation.y = b.initialRotation.y - anim.rightArmSwing * 0.6;
    }

    // Hands/forearms follow with slight bend
    if (bones["main_L"]) {
      const b = bones["main_L"];
      b.bone.rotation.y = b.initialRotation.y + anim.leftArmSwing * 0.3;
      // Elbow bends more when arm swings back
      b.bone.rotation.x = b.initialRotation.x + Math.max(0, anim.leftArmSwing) * 0.2;
    }
    if (bones["main_R"]) {
      const b = bones["main_R"];
      b.bone.rotation.y = b.initialRotation.y - anim.rightArmSwing * 0.3;
      // Elbow bends more when arm swings back
      b.bone.rotation.x = b.initialRotation.x + Math.max(0, -anim.rightArmSwing) * 0.2;
    }

    // === BODY ANIMATIONS ===
    // Forward lean when walking
    const targetForwardLean = isMoving ? 0.25 : 0; // Lean forward when moving
    anim.forwardLean = THREE.MathUtils.lerp(anim.forwardLean, targetForwardLean, lerpSpeed);

    if (bones["torse"]) {
      const b = bones["torse"];
      b.bone.rotation.x = b.initialRotation.x + anim.forwardLean; // Forward lean
      b.bone.rotation.y = b.initialRotation.y + anim.bodySwing * 0.04;
    }
    if (bones["bassin"]) {
      const b = bones["bassin"];
      // Slight forward tilt from hips too
      b.bone.rotation.x = b.initialRotation.x + anim.forwardLean * 0.3;
      b.bone.rotation.z = b.initialRotation.z + anim.bodySwing * 0.02;
    }

    if (bones["tete"]) {
      const b = bones["tete"];
      b.bone.rotation.y = b.initialRotation.y - anim.bodySwing * 0.02;
    }
  });

  return (
    <>
      {footsteps.map(step => (
        <Footstep
          key={step.id}
          position={step.position}
          rotation={step.rotation}
          onComplete={() => setFootsteps(prev => prev.filter(s => s.id !== step.id))}
        />
      ))}
      <group ref={group} dispose={null} position={[0, -1.5, 0]}>
        <primitive object={clonedScene} scale={0.6} />
      </group>
    </>
  );
}

useGLTF.preload("/person.glb");
