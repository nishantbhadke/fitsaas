"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  exercises,
  categories,
  categoryIcons,
  type Exercise,
  type ExerciseCategory,
} from "@/data/exercises-data";
import { ShareModal } from "@/components/ShareModal";

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number | null;
  notes: string | null;
}

function ExerciseIcon({ category, size = 24 }: { category: ExerciseCategory; size?: number }) {
  const path = categoryIcons[category];
  const cat = categories.find((c) => c.id === category);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={cat?.color || "#666"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  );
}

function FlipCard({
  exercise,
  onLog,
}: {
  exercise: Exercise;
  onLog: (name: string, duration: string, notes: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isForm, setIsForm] = useState(false);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cat = categories.find((c) => c.id === exercise.category);

  const handleLog = async () => {
    setSubmitting(true);
    await onLog(exercise.name, duration, notes);
    setSubmitting(false);
    setDuration("");
    setNotes("");
    setIsForm(false);
    setIsFlipped(false);
  };

  return (
    <div
      className="group"
      style={{ perspective: "1000px" }}
    >
      <div
        className="relative w-full transition-transform duration-500 ease-in-out"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          minHeight: "220px",
        }}
      >
        {/* FRONT */}
        <div
          className="absolute inset-0 bg-card border border-border rounded-2xl p-5 flex flex-col cursor-pointer hover:shadow-lg hover:border-brand-500/30 transition-all"
          style={{ backfaceVisibility: "hidden" }}
          onClick={() => { setIsFlipped(true); setIsForm(false); }}
        >
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: cat?.bgColor }}
            >
              <ExerciseIcon category={exercise.category} size={20} />
            </div>
            <span
              className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
              style={{ color: cat?.color, backgroundColor: cat?.bgColor }}
            >
              {cat?.label}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm mt-auto">{exercise.name}</h3>
          <p className="text-[11px] text-foreground/40 mt-1">{exercise.muscles}</p>
          <div className="mt-3 flex items-center gap-1 text-[10px] text-foreground/30">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></svg>
            Click to learn more
          </div>
        </div>

        {/* BACK — Info or Form */}
        <div
          className="absolute inset-0 bg-card border border-border rounded-2xl p-5 flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          {!isForm ? (
            <>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat?.bgColor }}>
                    <ExerciseIcon category={exercise.category} size={16} />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground truncate">{exercise.name}</h3>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                  className="text-foreground/40 hover:text-foreground text-xs shrink-0"
                  aria-label={`Close ${exercise.name} details`}
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-foreground/60 leading-relaxed flex-1">{exercise.description}</p>
              <div className="mt-2 mb-3">
                <span className="text-[10px] font-medium text-foreground/40">TARGETS</span>
                <p className="text-xs font-medium text-foreground/80 mt-0.5">{exercise.muscles}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsForm(true); }}
                className="w-full py-2 rounded-xl text-white font-medium text-xs transition-colors"
                style={{ backgroundColor: cat?.color }}
              >
                Log This Workout →
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-foreground">{exercise.name}</h3>
                <button onClick={() => { setIsForm(false); setIsFlipped(false); }} className="text-foreground/40 hover:text-foreground text-xs">✕</button>
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <div>
                  <label className="text-[10px] font-medium text-foreground/50 uppercase tracking-wider">Duration (min)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="45"
                    min="1"
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-medium text-foreground/50 uppercase tracking-wider">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any PRs? How did it feel?"
                    rows={2}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                </div>
                <div className="text-[10px] text-foreground/30">
                  ⏱ {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </div>
              </div>
              <button
                onClick={handleLog}
                disabled={submitting}
                className="w-full py-2 rounded-xl text-white font-medium text-xs transition-colors disabled:opacity-50 mt-2"
                style={{ backgroundColor: cat?.color }}
              >
                {submitting ? "Saving..." : "Save Workout"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CustomWorkoutCard({
  onLog,
}: {
  onLog: (name: string, duration: string, notes: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLog = async () => {
    if (!name.trim()) return;
    setSubmitting(true);
    await onLog(name.trim(), duration, notes);
    setSubmitting(false);
    setName("");
    setDuration("");
    setNotes("");
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <div
        onClick={() => setIsOpen(true)}
        className="bg-card border-2 border-dashed border-border rounded-2xl p-5 flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/40 hover:shadow-md transition-all group"
        style={{ minHeight: "220px" }}
      >
        <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="font-semibold text-sm text-foreground/70">Custom Workout</h3>
        <p className="text-[11px] text-foreground/40 mt-1">Create your own</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-brand-500/30 rounded-2xl p-5 flex flex-col shadow-lg" style={{ minHeight: "220px" }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-foreground">Custom Workout</h3>
        <button onClick={() => setIsOpen(false)} className="text-foreground/40 hover:text-foreground text-xs">✕</button>
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name..."
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500"
          autoFocus
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (min)"
          min="1"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground text-xs placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
        />
        <div className="text-[10px] text-foreground/30">
          ⏱ {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      </div>
      <button
        onClick={handleLog}
        disabled={submitting || !name.trim()}
        className="w-full py-2 rounded-xl bg-brand-600 text-white font-medium text-xs hover:bg-brand-500 transition-colors disabled:opacity-50 mt-2"
      >
        {submitting ? "Saving..." : "Save Custom Workout"}
      </button>
    </div>
  );
}

export default function WorkoutsPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [activeCategory, setActiveCategory] = useState<ExerciseCategory | "all">("all");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [shareWorkout, setShareWorkout] = useState<any>(null);

  const fetchWorkouts = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workouts`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
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
    if (status === "authenticated") fetchWorkouts();
  }, [status, fetchWorkouts]);

  const handleLog = async (name: string, duration: string, notes: string) => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workouts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({
          title: name,
          duration: duration ? parseInt(duration) : null,
          notes: notes.trim() || null,
        }),
      });
      if (res.ok) {
        setToast(`✅ "${name}" logged!`);
        setTimeout(() => setToast(null), 3000);
        fetchWorkouts();
      }
    } catch (err) {
      console.error("Failed to log workout:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!session?.appToken) return;
    if (!confirm("Are you sure you want to delete this workout?")) return;
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workouts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${(session as any).appToken}`,
        },
      });
      if (res.ok) {
        setToast("🗑 Workout deleted");
        setTimeout(() => setToast(null), 3000);
        fetchWorkouts();
      }
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  const filtered = activeCategory === "all" ? exercises : exercises.filter((e) => e.category === activeCategory);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-brand-500/30 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-foreground animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workouts</h1>
        <p className="text-foreground/60 mt-1">
          Click an exercise to learn about it. Click "Log" to record your session.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
            activeCategory === "all"
              ? "bg-foreground text-background shadow-sm"
              : "bg-card border border-border text-foreground/60 hover:text-foreground hover:border-foreground/20"
          }`}
        >
          All Exercises
        </button>
        {categories.filter(c => c.id !== "custom").map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              activeCategory === cat.id
                ? "shadow-sm"
                : "bg-card border border-border text-foreground/60 hover:text-foreground hover:border-foreground/20"
            }`}
            style={activeCategory === cat.id ? { backgroundColor: cat.bgColor, color: cat.color, borderColor: cat.color + "40" } : {}}
          >
            <ExerciseIcon category={cat.id} size={14} />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Exercise Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.map((exercise) => (
          <FlipCard key={exercise.id} exercise={exercise} onLog={handleLog} />
        ))}
        <CustomWorkoutCard onLog={handleLog} />
      </div>

      {/* Recent Logs */}
      {!loading && workouts.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-3">Recent Logs</h2>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {workouts.slice(0, 8).map((w) => (
              <div key={w.id} className="flex items-center justify-between px-5 py-3 border-b border-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-xs">
                    {w.title.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{w.title}</h4>
                    <p className="text-[11px] text-foreground/50">
                      {new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                      {w.duration && ` • ${w.duration} min`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {w.notes && <p className="text-[11px] text-foreground/30 max-w-[150px] truncate hidden md:block mr-2">{w.notes}</p>}
                  
                  <button onClick={() => setShareWorkout(w)} className="p-1.5 text-foreground/40 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors" title="Share workout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                  </button>

                  <button onClick={() => handleDelete(w.id)} className="p-1.5 text-foreground/40 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors" title="Delete workout">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal 
        isOpen={!!shareWorkout} 
        onClose={() => setShareWorkout(null)} 
        workout={shareWorkout} 
      />
    </div>
  );
}
