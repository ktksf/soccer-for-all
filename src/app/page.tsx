import Link from "next/link";
import { BallIcon, TargetIcon, ClockIcon, WhistleIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: <TargetIcon className="h-6 w-6" />,
    title: "Goal-driven",
    body: "Pick a focus — dribbling, finishing, defending — and get drills built around it.",
  },
  {
    icon: <ClockIcon className="h-6 w-6" />,
    title: "Fits your time",
    body: "From a 20-minute backyard session to a full 90-minute team practice.",
  },
  {
    icon: <WhistleIcon className="h-6 w-6" />,
    title: "Coaching points",
    body: "Every drill comes with cues, so anyone can run it — coach or not.",
  },
];

export default function LandingPage() {
  return (
    <main className="pitch-stripes min-h-screen">
      {/* Nav */}
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-chalk">
          <BallIcon className="h-6 w-6 text-pitch-400" />
          Soccer for All
        </span>
        <Link
          href="/dashboard"
          className="rounded-lg border border-slate-750 px-4 py-2 text-sm font-medium text-pitch-100 transition hover:border-pitch-600"
        >
          Open generator
        </Link>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-4xl px-5 pb-20 pt-16 text-center sm:pt-24">
        <span className="inline-block rounded-full border border-pitch-700/50 bg-pitch-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-pitch-300">
          AI Drill Generator
        </span>
        <h1 className="mt-6 font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight text-chalk sm:text-7xl">
          Train smarter
          <span className="block text-pitch-400">with AI</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-pitch-100/80">
          Generate personalized soccer training sessions in seconds. Built for players,
          parents, and coaches — whatever your level, whatever your gear.
        </p>
        <div className="mt-8 flex justify-center">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 rounded-xl bg-pitch-500 px-7 py-4 font-display text-lg font-semibold uppercase tracking-wide text-slate-950 transition hover:bg-pitch-400 focus:outline-none focus:ring-2 focus:ring-pitch-300"
          >
            <BallIcon className="h-5 w-5" />
            Generate a session
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-5 pb-24 sm:grid-cols-3">
        {FEATURES.map((f) => (
          <div
            key={f.title}
            className="rounded-2xl border border-slate-750 bg-slate-850 p-6"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-pitch-500/15 text-pitch-400">
              {f.icon}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold tracking-wide text-chalk">
              {f.title}
            </h3>
            <p className="mt-2 text-sm text-pitch-100/75">{f.body}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-850 py-6 text-center text-xs text-pitch-200/40">
        Soccer for All — coaching for everyone.
      </footer>
    </main>
  );
}
