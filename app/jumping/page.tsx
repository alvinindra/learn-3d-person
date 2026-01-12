"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Link from "next/link";

// Dynamically import Scene to avoid SSR issues with Three.js
const JumpingScene = dynamic(
  () => import("../components/JumpingScene").then((mod) => mod.JumpingScene),
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

export default function JumpingPage() {
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
    <div className="relative h-screen w-full bg-white">
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

      {/* Color Picker */}
      <div className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-full border border-neutral-200 bg-white/90 p-2 shadow-lg backdrop-blur-sm">
        {colors.map((c) => (
          <button
            key={c.name}
            onClick={() => setColor(c.value)}
            className={`h-8 w-8 rounded-full border-2 transition-all hover:scale-110 ${c.bg
              } ${(color === c.value) ? "border-black scale-110" : "border-transparent"
              }`}
            title={c.name}
          />
        ))}
      </div>

      {/* Hero Text */}
      <div className="pointer-events-none fixed top-14 left-1/2 z-10 w-full -translate-x-1/2 text-center">
        <h1 className="text-6xl font-black uppercase tracking-tighter text-black md:text-8xl">
          Scroll to Jump
        </h1>
        <div className="mt-0 flex flex-col items-center gap-2 opacity-30">
          <p className="text-[10px] uppercase tracking-[0.3em]">Smooth Scroll Enabled</p>
        </div>
      </div>

      {/* Main Experience */}
      <main className="h-full w-full">
        <JumpingScene personColor={color} />
      </main>
    </div>
  );
}
