"use client";

import type { SavedSession } from "@/types/session";
import { TrashIcon } from "./icons";

interface Props {
  sessions: SavedSession[];
  activeId?: string;
  onView: (s: SavedSession) => void;
  onDelete: (id: string) => void;
}

export default function SavedSessionsList({
  sessions,
  activeId,
  onView,
  onDelete,
}: Props) {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-750 bg-slate-850/50 p-5 text-center text-sm text-pitch-200/60">
        No saved sessions yet. Generate one and tap <span className="text-pitch-300">Save session</span> to keep it here.
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-750 bg-slate-850 p-4">
      <h3 className="font-display text-lg font-semibold uppercase tracking-wide text-pitch-300">
        Saved sessions
      </h3>
      <ul className="mt-3 space-y-2">
        {sessions.map((s) => {
          const isActive = s.id === activeId;
          return (
            <li
              key={s.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 transition ${
                isActive
                  ? "border-pitch-500/60 bg-pitch-500/10"
                  : "border-slate-750 bg-slate-950/40 hover:border-pitch-700/50"
              }`}
            >
              <button
                onClick={() => onView(s)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-chalk">
                  {s.session.sessionTitle}
                </p>
                <p className="text-xs text-pitch-200/60">
                  {s.input.goal} · {s.input.durationMinutes} min ·{" "}
                  {new Date(s.createdAt).toLocaleDateString()}
                </p>
              </button>
              <button
                onClick={() => onDelete(s.id)}
                aria-label={`Delete ${s.session.sessionTitle}`}
                className="shrink-0 rounded-md p-1.5 text-pitch-200/50 transition hover:bg-red-500/15 hover:text-red-300 focus:outline-none focus:ring-2 focus:ring-red-400/40"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
