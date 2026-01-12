"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";

// Dynamically import Scene to avoid SSR issues with Three.js
const DancingScene = dynamic(
  () => import("../components/DancingScene").then((mod) => mod.DancingScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm text-neutral-500 animate-pulse">Loading...</p>
        </div>
      </div>
    ),
  }
);

export default function DancingPage() {
  const [color, setColor] = useState<string | null>(null);

  const colors = [
    { name: "Default", value: null, bg: "bg-neutral-200" },
    { name: "Red", value: "#ef4444", bg: "bg-red-500" },
    { name: "Blue", value: "#3b82f6", bg: "bg-blue-500" },
    { name: "Green", value: "#22c55e", bg: "bg-green-500" },
    { name: "Yellow", value: "#eab308", bg: "bg-yellow-500" },
    { name: "Black", value: "#171717", bg: "bg-neutral-900" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />

      {/* Back button */}
      <Link
        href="/"
        className="fixed left-6 top-6 z-50 flex items-center gap-2 rounded-full border border-neutral-200 bg-white/90 px-4 py-2 text-sm text-neutral-600 shadow-sm backdrop-blur-sm transition-all hover:border-neutral-300 hover:text-black"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </Link>

      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Left Side: 3D Scene */}
        <div className="relative h-[60vh] w-full lg:h-screen lg:w-3/5">
          <DancingScene personColor={color} />

          {/* Action Label */}
          <div className="absolute bottom-12 left-12 hidden lg:block">
            <div className="flex items-center gap-4">
              <div className="h-px w-12 bg-black" />
              <span className="text-xs font-bold tracking-[0.4em] uppercase">Status: Drunk</span>
            </div>
          </div>
        </div>

        {/* Right Side: UI */}
        <div className="relative flex w-full flex-col justify-center bg-white px-8 py-12 lg:h-screen lg:w-2/5 lg:px-20">
          <div className="max-w-md">
            <span className="text-xs font-bold tracking-[0.3em] uppercase text-neutral-400">
              Animation Experiment 05
            </span>
            <h1 className="mt-4 text-6xl font-black text-black md:text-8xl">
              DANCING
            </h1>
            {/* <p className="mt-8 text-lg font-light leading-relaxed text-neutral-500">
              Interactive 3D dance motion using skeletal rigging and procedural bone rotation.
              The character responds to its environment with a natural rhythmic sway.
            </p> */}

            {/* Customization */}
            <div className="mt-12">
              <h3 className="text-xs font-bold tracking-widest uppercase text-black">
                Personalize Character
              </h3>
              <div className="mt-6 flex flex-wrap gap-4">
                {colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c.value)}
                    className="group flex flex-col items-center gap-2"
                  >
                    <div
                      className={`h-12 w-12 rounded-full border-2 transition-all ${color === c.value
                        ? "border-black scale-110 shadow-md"
                        : "border-transparent hover:border-neutral-300"
                        } ${c.bg}`}
                    />
                    <span className="text-[10px] uppercase tracking-tighter text-neutral-400 group-hover:text-black">
                      {c.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hint */}
            <div className="mt-16 flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/50 p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <path d="M12 17h.01" />
                </svg>
              </div>
              <p className="text-xs text-neutral-400">
                You can drag and rotate the scene to view the dance from any angle.
              </p>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute right-0 top-0 -z-10 select-none opacity-[0.02] mix-blend-multiply">
            <span className="text-[20rem] font-black tracking-tighter">05</span>
          </div>
        </div>
      </div>
    </div>
  );
}
