"use client";

import { useState } from "react";
import type { ActivityBlock, Drill } from "@/types/session";
import { ClockIcon, TargetIcon, ListIcon, WhistleIcon, SwapIcon } from "./icons";

interface Props {
  /** Accepts a full Drill or a lighter ActivityBlock (no coaching points). */
  drill: Drill | ActivityBlock;
  accent?: "green" | "white";
  /** When true (Edit mode), shows the "Find alternatives" control. */
  editable?: boolean;
  /** Fetches alternative drills for this slot. */
  onFindAlternatives?: () => Promise<Drill[]>;
  /** Replaces this drill with the chosen alternative. */
  onReplace?: (chosen: Drill) => void;
}

function hasCoachingPoints(d: Drill | ActivityBlock): d is Drill {
  return Array.isArray((d as Drill).coachingPoints);
}

export default function DrillCard({
  drill,
  accent = "green",
  editable = false,
  onFindAlternatives,
  onReplace,
}: Props) {
  const accentText = accent === "green" ? "text-pitch-400" : "text-chalk";

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alternatives, setAlternatives] = useState<Drill[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSwap = editable && !!onFindAlternatives && !!onReplace;

  async function loadAlternatives() {
    if (!onFindAlternatives) return;
    setOpen(true);
    setLoading(true);
    setError(null);
    setAlternatives(null);
    try {
      const alts = await onFindAlternatives();
      setAlternatives(alts);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load alternatives.");
    } finally {
      setLoading(false);
    }
  }

  function choose(alt: Drill) {
    onReplace?.(alt);
    setOpen(false);
    setAlternatives(null);
  }

  return (
    <article className="animate-fade-up rounded-xl border border-slate-750 bg-slate-950/60 p-5">
      <header className="flex items-start justify-between gap-3">
        <h4 className="font-display text-lg font-semibold tracking-wide text-chalk">
          {drill.name}
        </h4>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-pitch-500/15 px-2.5 py-1 text-xs font-medium text-pitch-200">
          <ClockIcon className="h-3.5 w-3.5" />
          {drill.durationMinutes} min
        </span>
      </header>

      <div className="mt-3 flex items-start gap-2 text-sm text-pitch-100/90">
        <TargetIcon className={`mt-0.5 h-4 w-4 shrink-0 ${accentText}`} />
        <p>{drill.objective}</p>
      </div>

      <div className="mt-4">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pitch-200/60">
          <ListIcon className="h-3.5 w-3.5" /> Instructions
        </p>
        <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-sm text-chalk/90 marker:text-pitch-400">
          {drill.instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </div>

      {hasCoachingPoints(drill) && drill.coachingPoints.length > 0 && (
        <div className="mt-4 rounded-lg border border-pitch-800/40 bg-pitch-950/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-pitch-300">
            <WhistleIcon className="h-3.5 w-3.5" /> Coaching points
          </p>
          <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-pitch-100/90 marker:text-pitch-500">
            {drill.coachingPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Edit-mode: find & pick alternatives for this drill. */}
      {canSwap && (
        <div className="no-print mt-4 border-t border-slate-750 pt-3">
          {!open ? (
            <button
              onClick={loadAlternatives}
              className="flex items-center gap-1.5 rounded-lg border border-pitch-500/40 bg-pitch-500/10 px-3 py-1.5 text-xs font-semibold
                text-pitch-200 transition hover:bg-pitch-500/20 focus:outline-none focus:ring-2 focus:ring-pitch-400"
            >
              <SwapIcon className="h-3.5 w-3.5" /> Find alternatives
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-pitch-300">
                  Alternatives
                </p>
                <button
                  onClick={() => setOpen(false)}
                  className="text-xs text-pitch-200/60 hover:text-pitch-200"
                >
                  Close
                </button>
              </div>

              {loading && (
                <p className="text-sm text-pitch-200/70">Asking the coach for options…</p>
              )}

              {error && <p className="text-sm text-red-300">{error}</p>}

              {alternatives?.map((alt, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-slate-750 bg-slate-950/40 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-chalk">{alt.name}</p>
                    <span className="shrink-0 text-xs text-pitch-200/70">
                      {alt.durationMinutes} min
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-pitch-100/80">{alt.objective}</p>
                  <button
                    onClick={() => choose(alt)}
                    className="mt-2 rounded-md border border-pitch-500/50 bg-pitch-500/15 px-2.5 py-1 text-xs font-semibold
                      text-pitch-100 transition hover:bg-pitch-500/25 focus:outline-none focus:ring-2 focus:ring-pitch-400"
                  >
                    Use this drill
                  </button>
                </div>
              ))}

              {!loading && !error && (
                <button
                  onClick={loadAlternatives}
                  className="text-xs text-pitch-300 hover:text-pitch-200"
                >
                  ↻ Show different options
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
