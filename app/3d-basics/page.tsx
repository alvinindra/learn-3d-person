"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import Scene to avoid SSR issues with Three.js
const BasicsScene = dynamic(
  () => import("../components/BasicsScene").then((mod) => mod.BasicsScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-black border-t-transparent" />
          <p className="text-sm text-neutral-500 animate-pulse">Loading 3D Scene...</p>
        </div>
      </div>
    ),
  }
);

export default function ThreeDBasicsPage() {
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

      {/* Main content */}
      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-0 py-16">
        {/* Title Section */}
        <div className="mb-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black">
            3D BASICS
          </h1>
          <p className="mt-2 text-sm md:text-base text-neutral-400 font-light tracking-[0.3em] uppercase">
            Master the Fundamentals
          </p>
        </div>

        {/* 3D Canvas Container - Full Width */}
        <div className="relative h-[65vh] w-full">
          {/* 3D Scene */}
          <BasicsScene />
        </div>

        {/* Controls hint - Redesigned */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-6 rounded-full border border-neutral-200 bg-white/80 backdrop-blur-sm px-6 py-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                <kbd className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs text-neutral-600 shadow-sm">W</kbd>
              </div>
              <div className="flex flex-col gap-1">
                <kbd className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs text-neutral-600 shadow-sm">A</kbd>
              </div>
              <div className="flex gap-1">
                <kbd className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs text-neutral-600 shadow-sm">S</kbd>
              </div>
              <div className="flex flex-col gap-1">
                <kbd className="w-7 h-7 flex items-center justify-center rounded-md border border-neutral-300 bg-neutral-100 font-mono text-xs text-neutral-600 shadow-sm">D</kbd>
              </div>
              <span className="text-sm text-neutral-500 ml-1">Move</span>
            </div>
            <div className="w-px h-5 bg-neutral-200" />
            <div className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12h8" />
              </svg>
              <span className="text-sm text-neutral-500">Scroll to zoom</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />
    </div>
  );
}
