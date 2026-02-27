/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, OrbitControls, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { SkeletonUtils } from "three-stdlib";
import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

const ARENA_HALF = 12;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;
const COLLECT_DIST = 1.3;
const HIT_DIST = 1.0;
const INVULN_SECS = 2;
const COIN_INTERVAL = 2.5;
const ENEMY_INTERVAL = 14;
const MAX_COINS = 8;
const MAX_ENEMIES = 5;
const GROUND_Y = -1.5;

type Phase = "idle" | "playing" | "over";

interface GameState {
  phase: Phase;
  px: number;
  pz: number;
  keys: Set<string>;
  invulnUntil: number;
  startTime: number;
  lives: number;
}

interface FootstepData {
  id: number;
  position: [number, number, number];
  rotation: number;
}

const GS: GameState = {
  phase: "idle",
  px: 0,
  pz: 0,
  keys: new Set(),
  invulnUntil: 0,
  startTime: 0,
  lives: 3,
};

function randPos(margin = 2): number {
  return (Math.random() - 0.5) * 2 * (ARENA_HALF - margin);
}

function dist2D(ax: number, az: number, bx: number, bz: number): number {
  return Math.hypot(ax - bx, az - bz);
}

function findClipName(names: string[], patterns: RegExp[]): string | null {
  for (const p of patterns) {
    const m = names.find((n) => p.test(n));
    if (m) return m;
  }
  return names[0] ?? null;
}

// ─── Keyboard ────────────────────────────────────────

function KeyboardInput() {
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (
        [
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(k)
      ) {
        e.preventDefault();
        GS.keys.add(k);
      }
    };
    const up = (e: KeyboardEvent) => GS.keys.delete(e.key.toLowerCase());
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  return null;
}

// ─── Footstep ────────────────────────────────────────

function Footstep({
  position,
  rotation,
  onComplete,
}: {
  position: [number, number, number];
  rotation: number;
  onComplete: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const t0 = useRef<number | null>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    if (t0.current === null) t0.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - t0.current;
    const progress = Math.min(elapsed / 3, 1);
    if (progress >= 1) {
      onComplete();
      return;
    }
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const fadeStart = 0.33;
    mat.opacity =
      progress < fadeStart
        ? 0.35
        : 0.35 * (1 - (progress - fadeStart) / (1 - fadeStart));
  });

  return (
    <mesh
      ref={meshRef}
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
        premultipliedAlpha
      />
    </mesh>
  );
}

// ─── Arena ───────────────────────────────────────────

function Arena() {
  const edges: [number, number, number, number, number, number][] = useMemo(
    () => [
      [0, GROUND_Y + 0.15, -ARENA_HALF, ARENA_HALF * 2 + 0.2, 0.3, 0.08],
      [0, GROUND_Y + 0.15, ARENA_HALF, ARENA_HALF * 2 + 0.2, 0.3, 0.08],
      [-ARENA_HALF, GROUND_Y + 0.15, 0, 0.08, 0.3, ARENA_HALF * 2 + 0.2],
      [ARENA_HALF, GROUND_Y + 0.15, 0, 0.08, 0.3, ARENA_HALF * 2 + 0.2],
    ],
    []
  );

  return (
    <group>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, GROUND_Y, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#0f0f0f" />
      </mesh>

      <gridHelper
        args={[ARENA_HALF * 2, 24, "#1a1a1a", "#141414"]}
        position={[0, GROUND_Y + 0.01, 0]}
      />

      {edges.map(([x, y, z, w, h, d], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[w, h, d]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.6}
            transparent
            opacity={0.35}
          />
        </mesh>
      ))}

      {(
        [
          [-1, -1],
          [-1, 1],
          [1, -1],
          [1, 1],
        ] as [number, number][]
      ).map(([sx, sz], i) => (
        <mesh
          key={`post-${i}`}
          position={[sx * ARENA_HALF, GROUND_Y + 0.4, sz * ARENA_HALF]}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.8, 8]} />
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── Player ──────────────────────────────────────────

function Player() {
  const groupRef = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/person.glb");
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { actions, names } = useAnimations(animations, clone);
  const hasClips = animations.length > 0;
  const activeAction = useRef<THREE.AnimationAction | null>(null);
  const usingClips = useRef(false);

  const controlsRef = useRef<any>(null);
  const vel = useRef(new THREE.Vector3());
  const smoothedTarget = useRef(new THREE.Vector3(0, 0.8, 0));
  const orbitOffset = useRef<THREE.Vector3 | null>(null);
  const walkPhase = useRef(0);
  const targetAngle = useRef(0);
  const lastPhase = useRef<Phase>("idle");
  const [footsteps, setFootsteps] = useState<FootstepData[]>([]);
  const lastFoot = useRef<"left" | "right" | null>(null);

  const bones = useRef<
    Record<string, { bone: THREE.Bone; init: THREE.Euler }>
  >({});
  const bonesReady = useRef(false);

  const anim = useRef({
    legSwing: 0,
    leftArmSwing: 0,
    rightArmSwing: 0,
    bodySwing: 0,
    forwardLean: 0,
  });

  const idleClipName = useMemo(
    () => findClipName(names, [/idle/i, /breath/i, /stand/i, /wait/i]),
    [names]
  );
  const walkClipName = useMemo(
    () => findClipName(names, [/walk/i, /jog/i, /run/i, /move/i]),
    [names]
  );
  const idleAction = idleClipName ? actions[idleClipName] : undefined;
  const walkAction = walkClipName ? actions[walkClipName] : undefined;

  useEffect(() => {
    if (!hasClips) return;
    usingClips.current = Boolean(idleAction || walkAction);
    if (!usingClips.current) return;
    const initial = idleAction ?? walkAction;
    if (!initial) return;
    initial.reset().fadeIn(0.3).play();
    activeAction.current = initial;
    return () => {
      Object.values(actions).forEach((a) => a?.stop());
      activeAction.current = null;
    };
  }, [actions, hasClips, idleAction, walkAction]);

  useEffect(() => {
    if (bonesReady.current) return;
    const found: typeof bones.current = {};
    clone.traverse((c) => {
      if (c instanceof THREE.Bone)
        found[c.name] = { bone: c, init: c.rotation.clone() };
    });

    if (!hasClips) {
      const adj = (name: string, axis: "x" | "y" | "z", val: number) => {
        if (found[name]) {
          found[name].bone.rotation[axis] += val;
          found[name].init = found[name].bone.rotation.clone();
        }
      };
      adj("epaule_L", "z", -0.8);
      adj("epaule_R", "z", 0.8);
      adj("bras_L", "z", -0.5);
      adj("bras_R", "z", 0.5);
      adj("torse", "x", -0.15);
      adj("tete", "x", 0.5);
    }

    bones.current = found;
    bonesReady.current = true;
  }, [clone, hasClips]);

  useEffect(() => {
    clone.traverse((c) => {
      if (c instanceof THREE.SkinnedMesh || c instanceof THREE.Mesh) {
        const m = c.material as THREE.MeshStandardMaterial;
        if (m?.color) m.color.set("#ffffff");
        c.frustumCulled = false;
        c.castShadow = true;
      }
    });
  }, [clone]);

  useFrame((state, dt) => {
    if (!groupRef.current) return;

    if (GS.phase === "playing" && lastPhase.current !== "playing") {
      vel.current.set(0, 0, 0);
      walkPhase.current = 0;
      orbitOffset.current = null;
      targetAngle.current = 0;
      const a = anim.current;
      a.legSwing = 0;
      a.leftArmSwing = 0;
      a.rightArmSwing = 0;
      a.bodySwing = 0;
      a.forwardLean = 0;
      setFootsteps([]);
      lastFoot.current = null;
    }
    lastPhase.current = GS.phase;

    let inputX = 0,
      inputZ = 0;
    if (GS.phase === "playing") {
      if (GS.keys.has("w") || GS.keys.has("arrowup")) inputZ = -1;
      if (GS.keys.has("s") || GS.keys.has("arrowdown")) inputZ = 1;
      if (GS.keys.has("a") || GS.keys.has("arrowleft")) inputX = -1;
      if (GS.keys.has("d") || GS.keys.has("arrowright")) inputX = 1;
    }

    const isMoving = inputX !== 0 || inputZ !== 0;

    const desiredVelocity = new THREE.Vector3();
    if (isMoving) {
      const inputVec = new THREE.Vector2(inputX, inputZ).normalize();

      const camFwd = new THREE.Vector3();
      state.camera.getWorldDirection(camFwd);
      camFwd.y = 0;
      camFwd.normalize();

      const camRight = new THREE.Vector3();
      camRight.crossVectors(camFwd, state.camera.up).normalize();

      const moveDir = new THREE.Vector3();
      moveDir.addScaledVector(camFwd, -inputVec.y);
      moveDir.addScaledVector(camRight, inputVec.x);
      if (moveDir.lengthSq() > 0) moveDir.normalize();

      desiredVelocity.copy(moveDir).multiplyScalar(PLAYER_SPEED);
      targetAngle.current = Math.atan2(moveDir.x, moveDir.z);
      walkPhase.current += dt * 6 * (PLAYER_SPEED / 3);
    }

    const moveLerp = 1 - Math.exp(-10 * dt);
    vel.current.lerp(desiredVelocity, moveLerp);

    if (GS.phase === "playing") {
      GS.px += vel.current.x * dt;
      GS.pz += vel.current.z * dt;
      GS.px = THREE.MathUtils.clamp(
        GS.px,
        -ARENA_HALF + 0.5,
        ARENA_HALF - 0.5
      );
      GS.pz = THREE.MathUtils.clamp(
        GS.pz,
        -ARENA_HALF + 0.5,
        ARENA_HALF - 0.5
      );
    }

    const movingByVel = vel.current.lengthSq() > 0.05;

    if (usingClips.current) {
      const next = movingByVel
        ? (walkAction ?? idleAction)
        : (idleAction ?? walkAction);
      if (next && activeAction.current !== next) {
        activeAction.current?.fadeOut(0.25);
        next.reset().fadeIn(0.25).play();
        activeAction.current = next;
      }
      if (walkAction) {
        walkAction.setEffectiveTimeScale(
          THREE.MathUtils.clamp(
            vel.current.length() / Math.max(PLAYER_SPEED, 0.001),
            0.75,
            1.35
          )
        );
      }
    }

    if (controlsRef.current) {
      const controlsTarget = controlsRef.current.target as THREE.Vector3;
      const liveOffset = state.camera.position.clone().sub(controlsTarget);

      if (!orbitOffset.current) {
        orbitOffset.current = liveOffset.clone();
      } else {
        orbitOffset.current.lerp(liveOffset, 1 - Math.exp(-8 * dt));
      }

      const hVel = new THREE.Vector3(vel.current.x, 0, vel.current.z);
      const lookAhead = hVel.clone().multiplyScalar(0.4);
      if (lookAhead.length() > 0.9) lookAhead.setLength(0.9);

      const desiredTarget = new THREE.Vector3(GS.px, 0.8, GS.pz).add(lookAhead);
      const targetLerp = 1 - Math.exp(-7 * dt);
      smoothedTarget.current.lerp(desiredTarget, targetLerp);
      controlsTarget.copy(smoothedTarget.current);

      const desiredCamPos = smoothedTarget.current
        .clone()
        .add(orbitOffset.current);
      state.camera.position.lerp(desiredCamPos, 1 - Math.exp(-6 * dt));

      controlsRef.current.update();
    }

    groupRef.current.position.set(GS.px, GROUND_Y, GS.pz);

    let angleDiff = targetAngle.current - groupRef.current.rotation.y;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    groupRef.current.rotation.y += angleDiff * 0.15;

    const now = state.clock.elapsedTime;
    groupRef.current.visible =
      GS.invulnUntil > now ? Math.sin(now * 20) > 0 : true;

    const wp = walkPhase.current;
    const a = anim.current;
    const b = bones.current;

    if (usingClips.current) {
      groupRef.current.position.y = GROUND_Y;
    } else {
      const targetLeg = isMoving ? Math.sin(wp) : 0;
      const targetLeftArm = isMoving ? Math.sin(wp + Math.PI) : 0;
      const targetRightArm = isMoving ? Math.sin(wp) : 0;
      const targetBody = isMoving ? Math.sin(wp) : 0;

      const lr = dt * 6;
      a.legSwing = THREE.MathUtils.lerp(a.legSwing, targetLeg, lr);
      a.leftArmSwing = THREE.MathUtils.lerp(
        a.leftArmSwing,
        targetLeftArm,
        lr
      );
      a.rightArmSwing = THREE.MathUtils.lerp(
        a.rightArmSwing,
        targetRightArm,
        lr
      );
      a.bodySwing = THREE.MathUtils.lerp(a.bodySwing, targetBody, lr);

      groupRef.current.position.y =
        GROUND_Y + Math.abs(a.legSwing) * 0.02;

      if (b["cuisse_L"])
        b["cuisse_L"].bone.rotation.x =
          b["cuisse_L"].init.x + a.legSwing * 0.4;
      if (b["cuisse_R"])
        b["cuisse_R"].bone.rotation.x =
          b["cuisse_R"].init.x - a.legSwing * 0.4;
      if (b["mollet_L"])
        b["mollet_L"].bone.rotation.x =
          b["mollet_L"].init.x + Math.max(0, a.legSwing) * 0.3;
      if (b["mollet_R"])
        b["mollet_R"].bone.rotation.x =
          b["mollet_R"].init.x + Math.max(0, -a.legSwing) * 0.3;

      if (b["bras_L"])
        b["bras_L"].bone.rotation.y =
          b["bras_L"].init.y + a.leftArmSwing * 0.6;
      if (b["bras_R"])
        b["bras_R"].bone.rotation.y =
          b["bras_R"].init.y - a.rightArmSwing * 0.6;

      if (b["main_L"]) {
        b["main_L"].bone.rotation.y =
          b["main_L"].init.y + a.leftArmSwing * 0.3;
        b["main_L"].bone.rotation.x =
          b["main_L"].init.x + Math.max(0, a.leftArmSwing) * 0.2;
      }
      if (b["main_R"]) {
        b["main_R"].bone.rotation.y =
          b["main_R"].init.y - a.rightArmSwing * 0.3;
        b["main_R"].bone.rotation.x =
          b["main_R"].init.x + Math.max(0, -a.rightArmSwing) * 0.2;
      }

      const targetLean = isMoving ? 0.25 : 0;
      a.forwardLean = THREE.MathUtils.lerp(a.forwardLean, targetLean, lr);

      if (b["torse"]) {
        b["torse"].bone.rotation.x = b["torse"].init.x + a.forwardLean;
        b["torse"].bone.rotation.y =
          b["torse"].init.y + a.bodySwing * 0.04;
      }
      if (b["bassin"]) {
        b["bassin"].bone.rotation.x =
          b["bassin"].init.x + a.forwardLean * 0.3;
        b["bassin"].bone.rotation.z =
          b["bassin"].init.z + a.bodySwing * 0.02;
      }
      if (b["tete"]) {
        b["tete"].bone.rotation.y =
          b["tete"].init.y - a.bodySwing * 0.02;
      }
    }

    if (isMoving) {
      const stepThreshold = 0.95;
      const currentSwing = Math.sin(wp);
      let newFoot: "left" | "right" | null = null;
      if (currentSwing > stepThreshold && lastFoot.current !== "left")
        newFoot = "left";
      else if (
        currentSwing < -stepThreshold &&
        lastFoot.current !== "right"
      )
        newFoot = "right";

      if (newFoot) {
        lastFoot.current = newFoot;
        const angle = groupRef.current.rotation.y;
        const sideOff = newFoot === "left" ? 0.2 : -0.2;
        const footX = GS.px + Math.cos(angle) * sideOff;
        const footZ = GS.pz - Math.sin(angle) * sideOff;

        setFootsteps((prev) =>
          [
            ...prev,
            {
              id: Date.now() + Math.random(),
              position: [footX, GROUND_Y + 0.02, footZ] as [
                number,
                number,
                number,
              ],
              rotation: angle,
            },
          ].slice(-10)
        );
      }
    } else {
      lastFoot.current = null;
    }
  });

  return (
    <>
      {footsteps.map((step) => (
        <Footstep
          key={step.id}
          position={step.position}
          rotation={step.rotation}
          onComplete={() =>
            setFootsteps((prev) => prev.filter((s) => s.id !== step.id))
          }
        />
      ))}
      <group ref={groupRef} dispose={null} position={[0, GROUND_Y, 0]}>
        <primitive object={clone} scale={0.6} />
        <spotLight
          position={[0, 4, 3]}
          angle={0.6}
          penumbra={0.5}
          intensity={5}
          castShadow
        />
      </group>
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={2}
        maxDistance={12}
        makeDefault
      />
    </>
  );
}

// ─── Coin ────────────────────────────────────────────

function Coin({ x, z }: { x: number; z: number }) {
  const ref = useRef<THREE.Mesh>(null);
  const spawnT = useRef(0);

  useFrame((state) => {
    if (!ref.current) return;
    if (!spawnT.current) spawnT.current = state.clock.elapsedTime;

    const t = state.clock.elapsedTime;
    const age = t - spawnT.current;

    ref.current.rotation.y = t * 2;
    ref.current.position.y = 0.5 + Math.sin(t * 3 + x * 7) * 0.15;
    ref.current.scale.setScalar(Math.min(1, age * 5) * 0.35);
  });

  return (
    <group position={[x, GROUND_Y, z]}>
      <mesh ref={ref} position={[0, 0.5, 0]} castShadow>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      <pointLight
        position={[0, 0.6, 0]}
        intensity={1.5}
        distance={4}
        color="#f59e0b"
      />
    </group>
  );
}

// ─── Enemy ───────────────────────────────────────────

function EnemyUnit({
  id,
  initialX,
  initialZ,
  posMap,
}: {
  id: number;
  initialX: number;
  initialZ: number;
  posMap: React.MutableRefObject<Map<number, THREE.Vector3>>;
}) {
  const ref = useRef<THREE.Group>(null);
  const pos = useRef(new THREE.Vector3(initialX, 0, initialZ));
  const wanderDir = useRef(0);
  const wanderCD = useRef(0);

  useEffect(() => {
    wanderDir.current = Math.random() * Math.PI * 2;
    const map = posMap.current;
    map.set(id, pos.current);
    return () => {
      map.delete(id);
    };
  }, [id, posMap]);

  useFrame((state, dt) => {
    if (!ref.current) return;
    if (GS.phase !== "playing") return;

    const p = pos.current;
    const gameT = state.clock.elapsedTime - GS.startTime;
    const speed = ENEMY_SPEED * (1 + gameT * 0.006);

    const dx = GS.px - p.x;
    const dz = GS.pz - p.z;
    const dist = Math.hypot(dx, dz);

    let mx: number, mz: number;
    if (dist < 9) {
      mx = dx / dist;
      mz = dz / dist;
    } else {
      wanderCD.current -= dt;
      if (wanderCD.current <= 0) {
        wanderDir.current += (Math.random() - 0.5) * 2;
        wanderCD.current = 2 + Math.random() * 3;
      }
      mx = Math.sin(wanderDir.current);
      mz = Math.cos(wanderDir.current);
    }

    p.x += mx * speed * dt;
    p.z += mz * speed * dt;
    p.x = THREE.MathUtils.clamp(p.x, -ARENA_HALF + 0.5, ARENA_HALF - 0.5);
    p.z = THREE.MathUtils.clamp(p.z, -ARENA_HALF + 0.5, ARENA_HALF - 0.5);

    ref.current.position.set(p.x, GROUND_Y, p.z);
    ref.current.rotation.y = Math.atan2(mx, mz);

    const pulse =
      1 + Math.sin(state.clock.elapsedTime * 4 + id * 1.7) * 0.06;
    ref.current.scale.setScalar(pulse);
  });

  return (
    <group ref={ref} position={[initialX, GROUND_Y, initialZ]}>
      <mesh position={[0, 0.65, 0]} castShadow>
        <capsuleGeometry args={[0.28, 0.7, 4, 12]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshStandardMaterial
          color="#ef4444"
          emissive="#dc2626"
          emissiveIntensity={0.4}
        />
      </mesh>
      <pointLight
        position={[0, 1, 0]}
        intensity={0.8}
        distance={3.5}
        color="#ef4444"
      />
    </group>
  );
}

// ─── Game World ──────────────────────────────────────

function GameWorld({
  gamePhase,
  onCollect,
  onDamage,
  onTick,
  onDead,
}: {
  gamePhase: Phase;
  onCollect: () => void;
  onDamage: () => void;
  onTick: (s: number) => void;
  onDead: () => void;
}) {
  const [coins, setCoins] = useState<{ id: number; x: number; z: number }[]>(
    []
  );
  const [enemies, setEnemies] = useState<
    { id: number; sx: number; sz: number }[]
  >([]);
  const enemyPos = useRef(new Map<number, THREE.Vector3>());
  const nextId = useRef(0);
  const lastCoinT = useRef(0);
  const lastEnemyT = useRef(0);
  const lastTick = useRef(-1);

  const coinsRef = useRef(coins);
  const enemiesRef = useRef(enemies);
  const onCollectRef = useRef(onCollect);
  const onDamageRef = useRef(onDamage);
  const onTickRef = useRef(onTick);
  const onDeadRef = useRef(onDead);

  useEffect(() => {
    coinsRef.current = coins;
  }, [coins]);
  useEffect(() => {
    enemiesRef.current = enemies;
  }, [enemies]);
  useEffect(() => {
    onCollectRef.current = onCollect;
    onDamageRef.current = onDamage;
    onTickRef.current = onTick;
    onDeadRef.current = onDead;
  }, [onCollect, onDamage, onTick, onDead]);

  const needsReset = useRef(false);

  useEffect(() => {
    GS.phase = gamePhase;
    if (gamePhase === "playing") {
      GS.px = 0;
      GS.pz = 0;
      GS.lives = 3;
      GS.invulnUntil = 0;
      GS.startTime = -1;
      lastCoinT.current = 0;
      lastEnemyT.current = 0;
      lastTick.current = -1;
      nextId.current = 0;
      needsReset.current = true;
    }
  }, [gamePhase]);

  useFrame((state) => {
    if (needsReset.current) {
      needsReset.current = false;
      setCoins([]);
      setEnemies([]);
      enemyPos.current.clear();
    }

    if (GS.phase !== "playing") return;

    const now = state.clock.elapsedTime;

    if (GS.startTime < 0) {
      GS.startTime = now;
      lastCoinT.current = now - COIN_INTERVAL + 0.5;
      lastEnemyT.current = now;
    }

    const gameTime = now - GS.startTime;
    const tick = Math.floor(gameTime);
    if (tick !== lastTick.current) {
      lastTick.current = tick;
      onTickRef.current(tick);
    }

    if (
      now - lastCoinT.current > COIN_INTERVAL &&
      coinsRef.current.length < MAX_COINS
    ) {
      lastCoinT.current = now;
      let cx: number, cz: number;
      let attempts = 0;
      do {
        cx = randPos();
        cz = randPos();
        attempts++;
      } while (dist2D(GS.px, GS.pz, cx, cz) < 3 && attempts < 10);

      const cid = nextId.current++;
      setCoins((prev) => [...prev, { id: cid, x: cx, z: cz }]);
    }

    if (
      gameTime > 5 &&
      now - lastEnemyT.current > ENEMY_INTERVAL &&
      enemiesRef.current.length < MAX_ENEMIES
    ) {
      lastEnemyT.current = now;
      const eid = nextId.current++;
      const side = Math.floor(Math.random() * 4);
      let sx = 0,
        sz = 0;
      if (side === 0) {
        sx = randPos();
        sz = -ARENA_HALF + 1;
      } else if (side === 1) {
        sx = randPos();
        sz = ARENA_HALF - 1;
      } else if (side === 2) {
        sx = -ARENA_HALF + 1;
        sz = randPos();
      } else {
        sx = ARENA_HALF - 1;
        sz = randPos();
      }
      setEnemies((prev) => [...prev, { id: eid, sx, sz }]);
    }

    const collected: number[] = [];
    for (const c of coinsRef.current) {
      if (dist2D(GS.px, GS.pz, c.x, c.z) < COLLECT_DIST) {
        collected.push(c.id);
      }
    }
    if (collected.length > 0) {
      setCoins((prev) => prev.filter((c) => !collected.includes(c.id)));
      for (let i = 0; i < collected.length; i++) onCollectRef.current();
    }

    if (GS.invulnUntil < now) {
      for (const e of enemiesRef.current) {
        const ep = enemyPos.current.get(e.id);
        if (ep && dist2D(GS.px, GS.pz, ep.x, ep.z) < HIT_DIST) {
          GS.invulnUntil = now + INVULN_SECS;
          GS.lives--;
          onDamageRef.current();
          if (GS.lives <= 0) {
            GS.phase = "over";
            onDeadRef.current();
          }
          break;
        }
      }
    }
  });

  return (
    <>
      <KeyboardInput />

      <fog attach="fog" args={["#050505", 20, 38]} />
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[8, 15, 8]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      <directionalLight position={[-5, 8, -5]} intensity={0.2} />
      <directionalLight position={[0, 5, -10]} intensity={0.15} />

      <Arena />

      <Suspense fallback={null}>
        <Player />
      </Suspense>

      {coins.map((c) => (
        <Coin key={c.id} x={c.x} z={c.z} />
      ))}

      {enemies.map((e) => (
        <EnemyUnit
          key={e.id}
          id={e.id}
          initialX={e.sx}
          initialZ={e.sz}
          posMap={enemyPos}
        />
      ))}
    </>
  );
}

// ─── Exported Scene ──────────────────────────────────

export function GameScene({
  gamePhase,
  onCollect,
  onDamage,
  onTick,
  onDead,
}: {
  gamePhase: Phase;
  onCollect: () => void;
  onDamage: () => void;
  onTick: (s: number) => void;
  onDead: () => void;
}) {
  return (
    <Canvas
      camera={{ position: [0, 2, 8], fov: 50 }}
      shadows
      className="touch-none"
      gl={{ antialias: true }}
      style={{ background: "#050505" }}
    >
      <GameWorld
        gamePhase={gamePhase}
        onCollect={onCollect}
        onDamage={onDamage}
        onTick={onTick}
        onDead={onDead}
      />
    </Canvas>
  );
}

useGLTF.preload("/person.glb");
