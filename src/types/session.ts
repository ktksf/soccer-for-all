// Shared domain types used across the form, API route, and UI.

export type SkillLevel = "Beginner" | "Intermediate" | "Advanced";

export type Position =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Winger"
  | "Forward"
  | "Any / All-rounder";

export type TrainingGoal =
  | "Dribbling"
  | "Passing"
  | "Shooting"
  | "First Touch"
  | "Ball Control"
  | "Finishing"
  | "Defending"
  | "Goalkeeping";

/** Raw values collected from the generator form. */
export interface SessionFormData {
  age: number;
  skillLevel: SkillLevel;
  position: Position;
  numberOfPlayers: number;
  durationMinutes: number;
  equipment: string;
  goal: TrainingGoal;
}

/** A single drill block returned by the AI. */
export interface Drill {
  name: string;
  durationMinutes: number;
  objective: string;
  instructions: string[];
  coachingPoints: string[];
}

/** A focused single-block activity (game / cool down). */
export interface ActivityBlock {
  name: string;
  durationMinutes: number;
  objective: string;
  instructions: string[];
}

/** The structured JSON contract the AI must return. */
export interface GeneratedSession {
  sessionTitle: string;
  overview: string;
  totalDurationMinutes: number;
  warmup: Drill[];
  technicalDrills: Drill[];
  gameActivity: ActivityBlock;
  conditioning: ActivityBlock;
  coolDown: ActivityBlock;
  coachNotes: string;
}

/** A session persisted to local storage. */
export interface SavedSession {
  id: string;
  createdAt: number;
  input: SessionFormData;
  session: GeneratedSession;
}

/** The named blocks of a session that hold drills/activities. */
export type DrillBlockType =
  | "warmup"
  | "technicalDrills"
  | "gameActivity"
  | "conditioning"
  | "coolDown";

/** Points at one specific drill within a session, used when swapping it out. */
export type DrillSlot =
  | { block: "warmup"; index: number }
  | { block: "technicalDrills"; index: number }
  | { block: "gameActivity" }
  | { block: "conditioning" }
  | { block: "coolDown" };
