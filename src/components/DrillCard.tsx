import type { ActivityBlock, Drill } from "@/types/session";
import { ClockIcon, TargetIcon, ListIcon, WhistleIcon } from "./icons";

interface Props {
  /** Accepts a full Drill or a lighter ActivityBlock (no coaching points). */
  drill: Drill | ActivityBlock;
  accent?: "green" | "white";
}

function hasCoachingPoints(d: Drill | ActivityBlock): d is Drill {
  return Array.isArray((d as Drill).coachingPoints);
}

export default function DrillCard({ drill, accent = "green" }: Props) {
  const accentText = accent === "green" ? "text-pitch-400" : "text-chalk";

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
    </article>
  );
}
