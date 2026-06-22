"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SessionForm from "@/components/SessionForm";
import SessionDisplay from "@/components/SessionDisplay";
import SavedSessionsList from "@/components/SavedSessionsList";
import LoadingState from "@/components/LoadingState";
import { BallIcon } from "@/components/icons";
import type {
  GeneratedSession,
  SavedSession,
  SessionFormData,
} from "@/types/session";
import {
  deleteSession,
  getSavedSessions,
  saveSession,
} from "@/lib/storage";

export default function DashboardPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<GeneratedSession | null>(null);
  const [lastInput, setLastInput] = useState<SessionFormData | null>(null);
  const [saved, setSaved] = useState(false);
  const [savedList, setSavedList] = useState<SavedSession[]>([]);
  const [activeId, setActiveId] = useState<string | undefined>();

  // Load saved sessions from local storage on mount.
  useEffect(() => {
    setSavedList(getSavedSessions());
  }, []);

  async function handleGenerate(data: SessionFormData) {
    setLoading(true);
    setError(null);
    setSession(null);
    setSaved(false);
    setActiveId(undefined);
    setLastInput(data);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const payload = await res.json();

      if (!res.ok) {
        setError(payload.error || "Something went wrong. Please try again.");
        return;
      }

      setSession(payload.session as GeneratedSession);
    } catch {
      setError("We couldn't reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSave() {
    if (!session || !lastInput) return;
    const record = saveSession(lastInput, session);
    setSavedList(getSavedSessions());
    setActiveId(record.id);
    setSaved(true);
  }

  function handleView(s: SavedSession) {
    setSession(s.session);
    setLastInput(s.input);
    setActiveId(s.id);
    setSaved(true);
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleDelete(id: string) {
    const remaining = deleteSession(id);
    setSavedList(remaining);
    if (activeId === id) {
      setActiveId(undefined);
      setSaved(false);
    }
  }

  return (
    <main className="pitch-stripes min-h-screen">
      <nav className="no-print mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-wide text-chalk"
        >
          <BallIcon className="h-6 w-6 text-pitch-400" />
          Soccer for All
        </Link>
      </nav>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 pb-20 lg:grid-cols-[360px_1fr]">
        {/* Left column: form + saved list */}
        <div className="no-print space-y-6">
          <SessionForm onSubmit={handleGenerate} loading={loading} />
          <SavedSessionsList
            sessions={savedList}
            activeId={activeId}
            onView={handleView}
            onDelete={handleDelete}
          />
        </div>

        {/* Right column: results */}
        <div className="space-y-6">
          {loading && <LoadingState />}

          {error && !loading && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-6">
              <h3 className="font-display text-xl font-semibold text-red-200">
                Couldn&apos;t build that session
              </h3>
              <p className="mt-2 text-sm text-red-100/90">{error}</p>
            </div>
          )}

          {session && !loading && (
            <SessionDisplay
              session={session}
              input={lastInput ?? undefined}
              onSave={handleSave}
              saved={saved}
            />
          )}

          {!session && !loading && !error && (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-750 bg-slate-850/40 p-10 text-center">
              <BallIcon className="h-12 w-12 text-pitch-500/50" />
              <h3 className="mt-4 font-display text-2xl font-semibold tracking-wide text-chalk">
                Your session appears here
              </h3>
              <p className="mt-2 max-w-sm text-sm text-pitch-200/60">
                Fill in the player details on the left and tap Generate session. The AI
                coach builds a full plan in seconds.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
