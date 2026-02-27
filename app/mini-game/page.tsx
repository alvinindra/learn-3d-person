"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const GameScene = dynamic(
  () => import("../components/GameScene").then((m) => m.GameScene),
  {
    ssr: false,
    loading: () => <div className="h-full w-full bg-[#050505]" />,
  }
);

type Phase = "idle" | "playing" | "over";

export default function MiniGamePage() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [hitFlash, setHitFlash] = useState(false);

  const scoreRef = useRef(0);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    try {
      const stored = localStorage.getItem("mg-hs");
      if (stored) setHighScore(parseInt(stored, 10));
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (phase === "idle") {
        setScore(0);
        scoreRef.current = 0;
        setLives(3);
        setTime(0);
        setPhase("playing");
      } else if (phase === "over") {
        setScore(0);
        scoreRef.current = 0;
        setLives(3);
        setTime(0);
        setPhase("playing");
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [phase]);

  const onCollect = useCallback(() => {
    setScore((s) => {
      const next = s + 10;
      scoreRef.current = next;
      return next;
    });
  }, []);

  const onDamage = useCallback(() => {
    setLives((l) => l - 1);
    setHitFlash(true);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setHitFlash(false), 200);
  }, []);

  const onTick = useCallback((s: number) => {
    setTime(s);
  }, []);

  const onDead = useCallback(() => {
    setPhase("over");
    const final = scoreRef.current;
    setHighScore((prev) => {
      if (final > prev) {
        try {
          localStorage.setItem("mg-hs", final.toString());
        } catch {
          /* noop */
        }
        return final;
      }
      return prev;
    });
  }, []);

  const fmtTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#050505]">
      {hitFlash && (
        <div className="pointer-events-none absolute inset-0 z-50 bg-red-500/20" />
      )}

      <div className="absolute inset-0">
        <GameScene
          gamePhase={phase}
          onCollect={onCollect}
          onDamage={onDamage}
          onTick={onTick}
          onDead={onDead}
        />
      </div>

      <Link
        href="/"
        className="fixed left-5 top-5 z-40 text-sm text-neutral-600 transition-colors hover:text-white"
      >
        &larr; Back
      </Link>

      {/* ─── HUD ─── */}
      {phase === "playing" && (
        <div className="pointer-events-none absolute left-0 right-0 top-0 z-30">
          <div className="flex items-start justify-between px-6 pt-14">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-600">
                Score
              </div>
              <div className="font-mono text-3xl font-bold tabular-nums text-white">
                {score}
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`h-2.5 w-2.5 rounded-full transition-colors ${
                    i < lives ? "bg-emerald-400" : "bg-neutral-800"
                  }`}
                />
              ))}
            </div>

            <div>
              <div className="text-right text-[10px] font-medium uppercase tracking-[0.3em] text-neutral-600">
                Time
              </div>
              <div className="font-mono text-xl tabular-nums text-neutral-400">
                {fmtTime(time)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Start Screen ─── */}
      {phase === "idle" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center">
          <h1 className="text-7xl font-black tracking-tighter text-white md:text-8xl">
            MINI GAME
          </h1>
          <p className="mt-3 text-sm tracking-wide text-neutral-600">
            collect the golden orbs &middot; avoid the red ones
          </p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
              {["W", "A", "S", "D"].map((k) => (
                <kbd
                  key={k}
                  className="flex h-8 w-8 items-center justify-center rounded border border-neutral-700 bg-neutral-800/80 font-mono text-xs text-neutral-400"
                >
                  {k}
                </kbd>
              ))}
              <span className="ml-3 text-xs text-neutral-600">to move</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-neutral-700">
              <span>drag to rotate</span>
              <span>&middot;</span>
              <span>scroll to zoom</span>
            </div>
          </div>

          <p className="mt-12 animate-pulse text-sm text-neutral-600">
            press ENTER to start
          </p>
        </div>
      )}

      {/* ─── Game Over ─── */}
      {phase === "over" && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/50">
          <p className="text-sm font-bold uppercase tracking-[0.5em] text-red-500">
            dead
          </p>

          <p className="mt-6 font-mono text-8xl font-black tabular-nums text-white">
            {score}
          </p>
          <p className="mt-2 text-sm text-neutral-500">
            {fmtTime(time)} survived
          </p>

          {score > 0 && score >= highScore ? (
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
              new best
            </p>
          ) : highScore > 0 ? (
            <p className="mt-5 text-xs text-neutral-700">best: {highScore}</p>
          ) : null}

          <p className="mt-12 animate-pulse text-sm text-neutral-600">
            press ENTER to retry
          </p>
        </div>
      )}
    </div>
  );
}
