"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number | null;
  notes: string | null;
}

export default function WorkoutsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkouts = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch("http://localhost:3001/workouts", {
        headers: {
          Authorization: `Bearer ${(session as any).appToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setWorkouts(data.workouts || []);
      }
    } catch (err) {
      console.error("Failed to fetch workouts:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchWorkouts();
    }
  }, [status, fetchWorkouts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !session?.appToken) return;
    setSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/workouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          duration: duration ? parseInt(duration) : null,
          notes: notes.trim() || null,
        }),
      });

      if (res.ok) {
        setTitle("");
        setDuration("");
        setNotes("");
        setShowForm(false);
        fetchWorkouts();
      }
    } catch (err) {
      console.error("Failed to create workout:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
          <p className="text-foreground/60 mt-1">
            Log and manage your training sessions.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Log Workout
        </button>
      </div>

      {/* Create Workout Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300"
        >
          <h2 className="text-lg font-semibold mb-4">New Workout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Upper Body Strength"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground/70 mb-1.5">
                Duration (minutes)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 45"
                min="1"
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it feel? Any PRs?"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-foreground/30 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 rounded-full border border-border font-medium text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Saving..." : "Save Workout"}
            </button>
          </div>
        </form>
      )}

      {/* Workout List */}
      {loading ? (
        <div className="flex items-center justify-center p-16">
          <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : workouts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🏋️</div>
          <h3 className="text-xl font-semibold mb-2">No workouts yet</h3>
          <p className="text-foreground/60 mb-6">
            Start by logging your first workout above.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors"
          >
            Log Your First Workout
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          <div className="flex flex-col">
            {workouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between p-5 border-b border-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                    {workout.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">
                      {workout.title}
                    </h4>
                    <p className="text-sm text-foreground/60">
                      {new Date(workout.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                      {workout.duration && ` • ${workout.duration} min`}
                    </p>
                  </div>
                </div>
                {workout.notes && (
                  <p className="text-sm text-foreground/40 max-w-xs truncate hidden md:block">
                    {workout.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
