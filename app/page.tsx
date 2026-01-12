import Link from "next/link";

const showcases = [
  {
    id: "walking",
    title: "WALKING",
    subtitle: "Keep Moving",
    href: "/walking",
  },
  {
    id: "flying",
    title: "FLYING",
    subtitle: "Touch the Sky",
    href: "/flying",
  },
];

export default function Home() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-size-[60px_60px]" />

      {/* Main content */}
      <main className="relative z-10 min-h-screen px-6 py-20 md:px-12 lg:px-20">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-black">
            3D SHOWCASE
          </h1>
          <p className="mt-3 text-sm md:text-base text-neutral-400 font-light tracking-[0.3em] uppercase">
            Interactive Experiments
          </p>
        </div>

        {/* Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {showcases.map((showcase) => (
            <ShowcaseCard key={showcase.id} {...showcase} />
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 flex flex-wrap gap-12 md:gap-20 opacity-50">
          <StatCard value={showcases.length.toString()} label="Showcases" />
          <StatCard value="∞" label="Possibilities" />
        </div>
      </main>

      {/* Footer accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-neutral-200" />
    </div>
  );
}

function ShowcaseCard({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group relative block aspect-4/3 overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition-all hover:border-neutral-300 hover:shadow-lg"
    >
      {/* Decorative circle */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
        <div className="h-32 w-32 rounded-full border border-neutral-200 group-hover:border-neutral-300 transition-colors" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-black group-hover:text-neutral-700 transition-colors">
            {title}
          </h2>
          <p className="mt-1 text-[10px] md:text-xs text-neutral-400 font-light tracking-[0.2em] uppercase">
            {subtitle}
          </p>
        </div>

        {/* Arrow */}
        <div className="flex justify-end">
          <div className="h-10 w-10 rounded-full border border-neutral-200 flex items-center justify-center group-hover:border-black group-hover:bg-black transition-all">
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
              className="text-neutral-400 group-hover:text-white transition-colors"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-left">
      <div className="text-2xl font-bold text-black">{value}</div>
      <div className="mt-1 text-[10px] text-neutral-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  );
}
