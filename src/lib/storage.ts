import type { GeneratedSession, SavedSession, SessionFormData } from "@/types/session";

const STORAGE_KEY = "sfa.savedSessions.v1";

/** Read all saved sessions, newest first. Safe on server (returns []). */
export function getSavedSessions(): SavedSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedSession[];
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch {
    return [];
  }
}

/** Persist a new session and return the saved record. */
export function saveSession(
  input: SessionFormData,
  session: GeneratedSession
): SavedSession {
  const record: SavedSession = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now()),
    createdAt: Date.now(),
    input,
    session,
  };
  const all = getSavedSessions();
  all.unshift(record);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return record;
}

/** Update the session content of an already-saved record (e.g. after editing a drill). */
export function updateSession(id: string, session: GeneratedSession): SavedSession[] {
  const all = getSavedSessions().map((s) =>
    s.id === id ? { ...s, session } : s
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  return all;
}

/** Remove a saved session by id and return the remaining list. */
export function deleteSession(id: string): SavedSession[] {
  const remaining = getSavedSessions().filter((s) => s.id !== id);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
  return remaining;
}
