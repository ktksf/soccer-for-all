"use client";

import { useEffect, useState } from "react";

const STAGES = [
  "Reading your player profile…",
  "Choosing drills for your goal…",
  "Balancing the session timing…",
  "Adding coaching points…",
];

export default function LoadingState() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setStage((s) => (s < STAGES.length - 1 ? s + 1 : s));
    }, 1400);
    return () => clearInterval(id);
  }, []);

  const progress = ((stage + 1) / STAGES.length) * 100;

  return (
    <div className="rounded-2xl border border-pitch-800/40 bg-slate-850 p-8 text-center">
      <h3 className="font-display text-2xl font-semibold tracking-wide text-chalk">
        Building your personalized training session…
      </h3>

      {/* Rolling ball */}
      <div className="mx-auto mt-6 h-10 w-48 overflow-hidden">
        <div className="animate-ball-roll text-pitch-400">
          <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none">
            <circle cx="12" cy="12" r="10" fill="#fbfdfb" />
            <path
              d="M12 6l3.5 2.5-1.3 4h-4.4l-1.3-4L12 6z"
              fill="#0b1220"
            />
          </svg>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mx-auto mt-4 h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-750">
        <div
          className="h-full rounded-full bg-pitch-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-pitch-200/80" aria-live="polite">
        {STAGES[stage]}
      </p>
    </div>
  );
}
