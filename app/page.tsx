"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import Scene to avoid SSR issues with Three.js
const Scene = dynamic(
  () => import("./components/Scene").then((mod) => mod.Scene),
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

export default function Home() {
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

      {/* Floating Color Picker - Right Side Vertical */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 rounded-full border border-neutral-200 bg-white/90 px-3 py-4 shadow-lg backdrop-blur-sm">
        {colors.map((c) => (
          <button
            key={c.name}
            onClick={() => setColor(c.value)}
            className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 ${color === c.value
              ? "border-black scale-110"
              : "border-transparent"
              } ${c.bg}`}
            title={c.name}
          />
        ))}
      </div>

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        {/* Title Section */}
        <div className="mb-4 text-center">
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-black">
            WALKING
          </h1>
          <p className="mt-2 text-sm md:text-base text-neutral-400 font-light tracking-[0.3em] uppercase">
            Keep Moving
          </p>
        </div>

        {/* 3D Canvas Container */}
        <div className="relative h-[55vh] md:h-[60vh] w-full max-w-3xl">
          {/* Minimal decorative circle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-64 w-64 md:h-80 md:w-80 rounded-full border border-neutral-200" />
          </div>

          {/* 3D Scene */}
          <Scene personColor={color} />
        </div>

        {/* Stats Section */}
        <div className="mt-4 flex flex-wrap justify-center gap-12 md:gap-20 opacity-50">
          <StatCard value="∞" label="Distance" />
          <StatCard value="100%" label="Focus" />
        </div>
      </main>

      {/* Footer accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold text-black">
        {value}
      </div>
      <div className="mt-1 text-[10px] text-neutral-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
