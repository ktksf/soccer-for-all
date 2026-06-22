"use client";

import { useState } from "react";
import type {
  Position,
  SessionFormData,
  SkillLevel,
  TrainingGoal,
} from "@/types/session";
import { BallIcon } from "./icons";

const SKILL_LEVELS: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];
const POSITIONS: Position[] = [
  "Goalkeeper",
  "Defender",
  "Midfielder",
  "Winger",
  "Forward",
  "Any / All-rounder",
];
const GOALS: TrainingGoal[] = [
  "Dribbling",
  "Passing",
  "Shooting",
  "First Touch",
  "Ball Control",
  "Finishing",
  "Defending",
  "Goalkeeping",
];

const DEFAULTS: SessionFormData = {
  age: 12,
  skillLevel: "Intermediate",
  position: "Midfielder",
  numberOfPlayers: 1,
  durationMinutes: 60,
  equipment: "Ball, cones",
  goal: "Dribbling",
};

interface Props {
  onSubmit: (data: SessionFormData) => void;
  loading: boolean;
}

const labelClass = "block text-xs font-semibold uppercase tracking-wider text-pitch-200/70 mb-1.5";
const fieldClass =
  "w-full rounded-lg border border-slate-750 bg-slate-950 px-3 py-2.5 text-chalk " +
  "focus:border-pitch-500 focus:outline-none focus:ring-2 focus:ring-pitch-500/30 transition";

export default function SessionForm({ onSubmit, loading }: Props) {
  const [form, setForm] = useState<SessionFormData>(DEFAULTS);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof SessionFormData>(key: K, value: SessionFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSubmit() {
    // Client-side guard so users get instant feedback on empty/invalid fields.
    if (!form.age || form.age < 4) return setError("Enter a valid age.");
    if (!form.numberOfPlayers || form.numberOfPlayers < 1)
      return setError("There must be at least one player.");
    if (!form.durationMinutes || form.durationMinutes < 10)
      return setError("Sessions should be at least 10 minutes.");
    if (!form.equipment.trim()) return setError("List the equipment you have (or type 'ball only').");
    setError(null);
    onSubmit(form);
  }

  return (
    <div className="rounded-2xl border border-slate-750 bg-slate-850 p-5 sm:p-6">
      <h2 className="font-display text-2xl font-semibold tracking-wide text-chalk">
        Build a session
      </h2>
      <p className="mt-1 text-sm text-pitch-200/70">
        Tell us about the player and what you have. The AI coach does the rest.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass} htmlFor="age">Age</label>
          <input
            id="age"
            type="number"
            min={4}
            max={99}
            value={form.age}
            onChange={(e) => update("age", Number(e.target.value))}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="skill">Skill level</label>
          <select
            id="skill"
            value={form.skillLevel}
            onChange={(e) => update("skillLevel", e.target.value as SkillLevel)}
            className={fieldClass}
          >
            {SKILL_LEVELS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="position">Position</label>
          <select
            id="position"
            value={form.position}
            onChange={(e) => update("position", e.target.value as Position)}
            className={fieldClass}
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="players">Number of players</label>
          <input
            id="players"
            type="number"
            min={1}
            max={30}
            value={form.numberOfPlayers}
            onChange={(e) => update("numberOfPlayers", Number(e.target.value))}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="duration">Session duration (minutes)</label>
          <input
            id="duration"
            type="number"
            min={10}
            max={180}
            step={5}
            value={form.durationMinutes}
            onChange={(e) => update("durationMinutes", Number(e.target.value))}
            className={fieldClass}
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="goal">Training goal</label>
          <select
            id="goal"
            value={form.goal}
            onChange={(e) => update("goal", e.target.value as TrainingGoal)}
            className={fieldClass}
          >
            {GOALS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="equipment">Equipment available</label>
          <input
            id="equipment"
            type="text"
            placeholder="e.g. Ball, cones, small goal, wall"
            value={form.equipment}
            onChange={(e) => update("equipment", e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-pitch-500 px-5 py-3.5
          font-display text-lg font-semibold uppercase tracking-wide text-slate-950
          transition hover:bg-pitch-400 focus:outline-none focus:ring-2 focus:ring-pitch-300
          disabled:cursor-not-allowed disabled:opacity-60"
      >
        <BallIcon className="h-5 w-5" />
        {loading ? "Generating…" : "Generate session"}
      </button>
    </div>
  );
}
