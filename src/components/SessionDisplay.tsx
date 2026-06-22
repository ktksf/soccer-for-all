"use client";

import { useState } from "react";
import type {
  ActivityBlock,
  Drill,
  DrillSlot,
  GeneratedSession,
  SessionFormData,
} from "@/types/session";
import DrillCard from "./DrillCard";
import {
  ClockIcon,
  FlameIcon,
  PrinterIcon,
  SnowflakeIcon,
  SwapIcon,
  WhistleIcon,
} from "./icons";

interface Props {
  session: GeneratedSession;
  /** The form parameters that produced this session, shown on the printed sheet. */
  input?: SessionFormData;
  onSave?: () => void;
  saved?: boolean;
  /** Replace one drill in the session with a chosen alternative (enables Edit mode). */
  onReplaceDrill?: (slot: DrillSlot, drill: Drill) => void;
}

function SectionHeading({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <h3 className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-pitch-300">
      {icon}
      {children}
    </h3>
  );
}

export default function SessionDisplay({
  session,
  input,
  onSave,
  saved,
  onReplaceDrill,
}: Props) {
  const [editing, setEditing] = useState(false);

  // Editing needs the session parameters (to ask for fitting alternatives)
  // and a handler to apply the swap.
  const canEdit = !!input && !!onReplaceDrill;

  function handlePrint() {
    window.print();
  }

  function allDrillNames(): string[] {
    return [
      ...session.warmup.map((d) => d.name),
      ...session.technicalDrills.map((d) => d.name),
      session.gameActivity.name,
      session.conditioning.name,
      session.coolDown.name,
    ];
  }

  async function getAlternatives(
    slot: DrillSlot,
    current: Drill | ActivityBlock
  ): Promise<Drill[]> {
    if (!input) return [];
    const res = await fetch("/api/alternatives", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        input,
        blockType: slot.block,
        sessionTitle: session.sessionTitle,
        current: {
          name: current.name,
          durationMinutes: current.durationMinutes,
          objective: current.objective,
        },
        existingNames: allDrillNames(),
      }),
    });
    const payload = await res.json();
    if (!res.ok) {
      throw new Error(payload.error || "Couldn't load alternatives.");
    }
    return payload.alternatives as Drill[];
  }

  /** Props that turn a DrillCard into an editable, swappable card. */
  function editProps(slot: DrillSlot, drill: Drill | ActivityBlock) {
    if (!editing || !canEdit) return {};
    return {
      editable: true,
      onFindAlternatives: () => getAlternatives(slot, drill),
      onReplace: (chosen: Drill) => onReplaceDrill!(slot, chosen),
    };
  }

  return (
    <div id="printable-session" className="space-y-6">
      {/* Print-only document header: hidden on screen, shown on paper. */}
      <div className="hidden print:block">
        <h1 className="font-display text-3xl font-semibold tracking-wide">
          {session.sessionTitle}
        </h1>
        {input && (
          <p className="mt-1 text-sm">
            {input.skillLevel} · {input.position} · Age {input.age} ·{" "}
            {input.numberOfPlayers}{" "}
            {input.numberOfPlayers === 1 ? "player" : "players"} ·{" "}
            {input.durationMinutes} min · Focus: {input.goal}
            {input.equipment ? ` · Equipment: ${input.equipment}` : ""}
          </p>
        )}
        <p className="mt-2 text-xs uppercase tracking-widest">
          Soccer for All — Training session plan
        </p>
        <hr className="mt-3" />
      </div>

      {/* Overview */}
      <div className="rounded-2xl border border-pitch-700/40 bg-gradient-to-br from-pitch-900/50 to-slate-850 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="print:hidden">
            <p className="text-xs font-semibold uppercase tracking-widest text-pitch-300/80">
              Session overview
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-wide text-chalk">
              {session.sessionTitle}
            </h2>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-pitch-500/20 px-3 py-1.5 text-sm font-medium text-pitch-100">
            <ClockIcon className="h-4 w-4" />
            {session.totalDurationMinutes} min total
          </span>
        </div>
        <p className="mt-3 text-pitch-100/90">{session.overview}</p>

        <div className="no-print mt-4 flex flex-wrap gap-2">
          {onSave && (
            <button
              onClick={onSave}
              disabled={saved}
              className="rounded-lg border border-pitch-500/50 bg-pitch-500/10 px-4 py-2 text-sm font-semibold
                text-pitch-200 transition hover:bg-pitch-500/20 focus:outline-none focus:ring-2 focus:ring-pitch-400
                disabled:opacity-60"
            >
              {saved ? "Saved ✓" : "Save session"}
            </button>
          )}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-750 bg-slate-950/40 px-4 py-2 text-sm font-semibold
              text-chalk transition hover:border-pitch-700/50 hover:bg-slate-950/70 focus:outline-none focus:ring-2 focus:ring-pitch-400"
          >
            <PrinterIcon className="h-4 w-4" />
            Print / PDF
          </button>
          {canEdit && (
            <button
              onClick={() => setEditing((v) => !v)}
              className={`flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-pitch-400 ${
                editing
                  ? "border-pitch-500/60 bg-pitch-500/20 text-pitch-100"
                  : "border-slate-750 bg-slate-950/40 text-chalk hover:border-pitch-700/50 hover:bg-slate-950/70"
              }`}
            >
              <SwapIcon className="h-4 w-4" />
              {editing ? "Done editing" : "Edit plan"}
            </button>
          )}
        </div>

        {editing && (
          <p className="no-print mt-3 text-xs text-pitch-200/70">
            Edit mode on — tap <span className="font-semibold text-pitch-200">Find alternatives</span> on any drill to swap it for another option.
          </p>
        )}
      </div>

      {/* Warm-up */}
      <section className="space-y-3">
        <SectionHeading icon={<FlameIcon className="h-5 w-5" />}>Warm-up</SectionHeading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {session.warmup.map((d, i) => (
            <DrillCard
              key={i}
              drill={d}
              {...editProps({ block: "warmup", index: i }, d)}
            />
          ))}
        </div>
      </section>

      {/* Technical drills */}
      <section className="space-y-3">
        <SectionHeading icon={<WhistleIcon className="h-5 w-5" />}>
          Technical drills
        </SectionHeading>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {session.technicalDrills.map((d, i) => (
            <DrillCard
              key={i}
              drill={d}
              {...editProps({ block: "technicalDrills", index: i }, d)}
            />
          ))}
        </div>
      </section>

      {/* Game activity */}
      <section className="space-y-3">
        <SectionHeading>Game activity</SectionHeading>
        <DrillCard
          drill={session.gameActivity}
          {...editProps({ block: "gameActivity" }, session.gameActivity)}
        />
      </section>

      {/* Conditioning */}
      <section className="space-y-3">
        <SectionHeading icon={<FlameIcon className="h-5 w-5" />}>Conditioning</SectionHeading>
        <DrillCard
          drill={session.conditioning}
          {...editProps({ block: "conditioning" }, session.conditioning)}
        />
      </section>

      {/* Cool down */}
      <section className="space-y-3">
        <SectionHeading icon={<SnowflakeIcon className="h-5 w-5" />}>Cool down</SectionHeading>
        <DrillCard
          drill={session.coolDown}
          {...editProps({ block: "coolDown" }, session.coolDown)}
        />
      </section>

      {/* Coach notes */}
      <section className="rounded-2xl border border-slate-750 bg-slate-850 p-6">
        <SectionHeading icon={<WhistleIcon className="h-5 w-5" />}>Coach notes</SectionHeading>
        <p className="mt-3 leading-relaxed text-pitch-100/90">{session.coachNotes}</p>
      </section>
    </div>
  );
}
