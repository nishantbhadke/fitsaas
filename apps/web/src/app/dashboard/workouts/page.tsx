"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  exercises,
  categories,
  categoryIcons,
  type Exercise,
  type ExerciseCategory,
} from "@/data/exercises-data";
import dynamic from "next/dynamic";
const ShareModal = dynamic(
  () => import("@/components/ShareModal").then((mod) => mod.ShareModal),
  { ssr: false }
);


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

function WorkoutCard({
  exercise,
  onLog,
}: {
  exercise: Exercise;
  onLog: (name: string, duration: string, notes: string) => void;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [duration, setDuration] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cat = categories.find((c) => c.id === exercise.category);

  const handleLog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await onLog(exercise.name, duration, notes);
    setSubmitting(false);
    setDuration("");
    setNotes("");
    setIsFlipped(false);
  };

  return (
    <div className="perspective-1000 w-full relative">
      <div
        className={`transform-style-3d transition-transform duration-700 ease-out w-full relative ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* FRONT FACE */}
        <article
          className={`bg-card border border-border rounded-2xl p-5 flex flex-col shadow-sm transition-all hover:shadow-lg hover:border-brand-500/30 backface-hidden ${
            isFlipped
              ? "absolute inset-0 opacity-0 pointer-events-none"
              : "relative w-full h-auto opacity-100"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center"
              style={{ backgroundColor: `${cat?.color || "#22c55e"}18` }}
            >
              <ExerciseIcon category={exercise.category} size={22} />
            </div>
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ color: cat?.color, backgroundColor: `${cat?.color || "#22c55e"}18` }}
            >
              {cat?.label}
            </span>
          </div>

          <div className="mt-5 flex-1">
            <h3 className="font-semibold text-foreground text-base leading-tight">{exercise.name}</h3>
            <p className="text-xs text-foreground/50 mt-1.5 leading-relaxed">{exercise.muscles}</p>
            <p className={`text-sm text-foreground/60 mt-4 leading-6 ${!showDetails ? "line-clamp-3" : ""}`}>
              {exercise.description}
            </p>

            {showDetails && (
              <div className="mt-4 rounded-xl border border-border bg-background/60 p-3 animate-in fade-in duration-300">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">Targets</span>
                <p className="text-xs font-semibold text-foreground/80 mt-1">{exercise.muscles}</p>
              </div>
            )}
          </div>

          <div className="mt-5 grid grid-cols-[0.85fr_1.15fr] gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="h-11 rounded-xl border border-border bg-background text-xs font-semibold text-foreground/70 transition-colors hover:text-foreground hover:bg-white/[0.04]"
            >
              {showDetails ? "Less" : "Details"}
            </button>
            <button
              onClick={() => setIsFlipped(true)}
              className="h-11 rounded-xl text-white font-semibold text-xs transition-colors hover:opacity-90"
              style={{ backgroundColor: cat?.color }}
            >
              Record Workout
            </button>
          </div>
        </article>

        {/* BACK FACE (Record Form) */}
        <article
          className={`bg-card border border-border rounded-2xl p-5 flex flex-col shadow-lg backface-hidden rotate-y-180 ${
            isFlipped
              ? "relative w-full h-auto opacity-100"
              : "absolute inset-0 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h3 className="font-semibold text-base text-foreground truncate">{exercise.name}</h3>
              <p className="text-xs text-foreground/45 mt-1">Record your session</p>
            </div>
            <button
              onClick={() => setIsFlipped(false)}
              className="text-foreground/40 hover:text-foreground text-sm shrink-0"
              aria-label={`Close ${exercise.name} record form`}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleLog} className="flex-1 flex flex-col gap-4">
            <div>
              <label className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Duration (min)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="45"
                min="1"
                className="w-full mt-2 px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500"
                required
              />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-foreground/50 uppercase tracking-wider">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sets, reps, PRs, or how it felt"
                rows={3}
                className="w-full mt-2 px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground/25 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 rounded-xl text-white font-semibold text-xs transition-all disabled:opacity-50 mt-2 hover:opacity-90"
              style={{ backgroundColor: cat?.color }}
            >
              {submitting ? "Saving..." : "Save Workout Record"}
            </button>
          </form>
        </article>
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
        className="bg-card border-2 border-dashed border-border rounded-2xl p-5 min-h-[286px] flex flex-col items-center justify-center cursor-pointer hover:border-brand-500/40 hover:shadow-md transition-all group"
      >
        <div className="w-12 h-12 rounded-2xl bg-brand-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
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
    <div className="bg-card border border-brand-500/30 rounded-2xl p-5 min-h-[286px] flex flex-col shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-base text-foreground">Custom Workout</h3>
          <p className="text-xs text-foreground/45 mt-1">Record anything not in the library</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-foreground/40 hover:text-foreground text-xs">✕</button>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Workout name..."
          className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          autoFocus
        />
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="Duration (min)"
          min="1"
          className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
        />
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes..."
          rows={3}
          className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-foreground/25 focus:outline-none focus:ring-2 focus:ring-brand-500/40 resize-none"
        />
        <div className="text-[10px] text-foreground/30">
          ⏱ {new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      </div>
      <button
        onClick={handleLog}
        disabled={submitting || !name.trim()}
        className="w-full h-11 rounded-xl bg-brand-600 text-white font-semibold text-xs hover:bg-brand-500 transition-colors disabled:opacity-50 mt-5"
      >
        {submitting ? "Saving..." : "Save Custom Workout"}
      </button>
    </div>
  );
}

const muscleGroups = [
  { id: "chest", label: "Chest", keywords: ["Chest", "Pecs"] },
  { id: "back", label: "Back & Lats", keywords: ["Back", "Lats", "Lats,", "Mid Back"] },
  { id: "shoulders", label: "Shoulders", keywords: ["Shoulders", "Delts", "Front Delts", "Rear Delts"] },
  { id: "arms", label: "Arms & Triceps", keywords: ["Biceps", "Triceps", "Arms", "Upper Body"] },
  { id: "legs", label: "Legs & Calves", keywords: ["Quads", "Glutes", "Hamstrings", "Legs", "Calves"] },
  { id: "core", label: "Core & Abs", keywords: ["Core", "Abs"] },
];

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
  const [selectedMuscle, setSelectedMuscle] = useState<string>("all");

  const fetchWorkouts = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/workouts`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
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
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
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
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        setToast("🗑 Workout deleted");
        setTimeout(() => setToast(null), 3000);
        fetchWorkouts();
      }
    } catch (err) {
      console.error("Failed to delete workout:", err);
    }
  };

  const filteredByCategory = activeCategory === "all" ? exercises : exercises.filter((e) => e.category === activeCategory);

  const filtered = selectedMuscle === "all"
    ? filteredByCategory
    : filteredByCategory.filter((e) => {
        const exerciseMuscles = e.muscles.toLowerCase();
        const targetGroup = muscleGroups.find((m) => m.id === selectedMuscle);
        if (!targetGroup) return true;
        return targetGroup.keywords.some((k) => exerciseMuscles.includes(k.toLowerCase()));
      });

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
          Use Details to learn the movement, or Record Workout to save your session.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Column: Exercises & Categories */}
        <div className="flex-1 w-full space-y-6">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
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
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {filtered.map((exercise) => (
              <WorkoutCard key={exercise.id} exercise={exercise} onLog={handleLog} />
            ))}
            <CustomWorkoutCard onLog={handleLog} />
          </div>
        </div>

        {/* Right Column: Interactive Body Map */}
        <div className="w-full lg:w-80 bg-card border border-border rounded-2xl p-5 shrink-0 shadow-sm flex flex-col items-center gap-5">
          <div className="w-full text-left">
            <h2 className="text-base font-bold text-foreground">Interactive Muscle Filter</h2>
            <p className="text-xs text-foreground/50 mt-1">Select a muscle group to filter exercises.</p>
          </div>

          {/* Interactive Body Map SVG */}
          <div className="relative w-full flex justify-center py-2 bg-background/30 dark:bg-background/10 rounded-xl border border-border/40">
            <svg width="150" height="260" viewBox="0 0 120 180" className="select-none">
              {/* Head */}
              <circle 
                cx="60" cy="18" r="9" 
                className="transition-all duration-200 fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10 cursor-pointer"
                strokeWidth="1.5"
              />
              {/* Neck */}
              <rect 
                x="57" y="27" width="6" height="5" rx="1" 
                className="fill-foreground/10 stroke-foreground/20"
                strokeWidth="1.5"
              />

              {/* Shoulders */}
              <path 
                d="M 37 38 L 47 32 L 73 32 L 83 38 Z"
                onClick={() => setSelectedMuscle(selectedMuscle === "shoulders" ? "all" : "shoulders")}
                className={`transition-all duration-200 cursor-pointer stroke-2 ${
                  selectedMuscle === "shoulders"
                    ? "fill-brand-500/20 stroke-brand-500"
                    : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                }`}
              />

              {/* Chest */}
              <g 
                onClick={() => setSelectedMuscle(selectedMuscle === "chest" ? "all" : "chest")}
                className="cursor-pointer"
              >
                <rect 
                  x="44" y="38" width="15" height="15" rx="2" 
                  className={`transition-all duration-200 stroke-1.5 ${
                    selectedMuscle === "chest" ? "fill-brand-500/20 stroke-brand-500" : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                  }`}
                />
                <rect 
                  x="61" y="38" width="15" height="15" rx="2" 
                  className={`transition-all duration-200 stroke-1.5 ${
                    selectedMuscle === "chest" ? "fill-brand-500/20 stroke-brand-500" : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                  }`}
                />
              </g>

              {/* Arms (Biceps/Triceps) */}
              <g 
                onClick={() => setSelectedMuscle(selectedMuscle === "arms" ? "all" : "arms")}
                className="cursor-pointer"
              >
                {/* Left Arm */}
                <rect 
                  x="26" y="42" width="9" height="36" rx="4" 
                  className={`transition-all duration-200 stroke-1.5 ${
                    selectedMuscle === "arms" ? "fill-brand-500/20 stroke-brand-500" : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                  }`}
                />
                {/* Right Arm */}
                <rect 
                  x="85" y="42" width="9" height="36" rx="4" 
                  className={`transition-all duration-200 stroke-1.5 ${
                    selectedMuscle === "arms" ? "fill-brand-500/20 stroke-brand-500" : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                  }`}
                />
              </g>

              {/* Core / Abs */}
              <rect 
                x="44" y="56" width="32" height="24" rx="3" 
                onClick={() => setSelectedMuscle(selectedMuscle === "core" ? "all" : "core")}
                className={`transition-all duration-200 cursor-pointer stroke-1.5 ${
                  selectedMuscle === "core"
                    ? "fill-brand-500/20 stroke-brand-500"
                    : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                }`}
              />

              {/* Back & Lats (Behind arms, overlay outline indicator) */}
              <path 
                d="M 39 42 Q 33 55 42 66 L 78 66 Q 87 55 81 42 Z"
                onClick={() => setSelectedMuscle(selectedMuscle === "back" ? "all" : "back")}
                className={`transition-all duration-200 cursor-pointer stroke-1.5 fill-transparent ${
                  selectedMuscle === "back"
                    ? "fill-brand-500/20 stroke-brand-500 stroke-2"
                    : "stroke-foreground/10 hover:stroke-brand-500/50 hover:fill-brand-500/5"
                }`}
              />

              {/* Legs */}
              <g 
                onClick={() => setSelectedMuscle(selectedMuscle === "legs" ? "all" : "legs")}
                className="cursor-pointer"
              >
                {/* Left Leg */}
                <rect 
                  x="43" y="84" width="15" height="54" rx="5" 
                  className={`transition-all duration-200 stroke-1.5 ${
                    selectedMuscle === "legs" ? "fill-brand-500/20 stroke-brand-500" : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                  }`}
                />
                {/* Right Leg */}
                <rect 
                  x="62" y="84" width="15" height="54" rx="5" 
                  className={`transition-all duration-200 stroke-1.5 ${
                    selectedMuscle === "legs" ? "fill-brand-500/20 stroke-brand-500" : "fill-foreground/10 stroke-foreground/20 hover:stroke-brand-500 hover:fill-brand-500/10"
                  }`}
                />
              </g>
            </svg>
          </div>

          {/* Quick List Selector Badges */}
          <div className="w-full flex flex-col gap-2">
            <button
              onClick={() => setSelectedMuscle("all")}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all text-left flex justify-between items-center cursor-pointer ${
                selectedMuscle === "all"
                  ? "bg-foreground text-background border-foreground font-black shadow-sm"
                  : "bg-background/50 hover:bg-black/5 dark:hover:bg-white/5 border-border text-foreground/75"
              }`}
            >
              <span>⭐ All Muscle Groups</span>
              <span className="text-[10px] opacity-60">({filteredByCategory.length})</span>
            </button>
            {muscleGroups.map((m) => {
              // Count matching exercises inside the currently active category
              const count = filteredByCategory.filter((e) => {
                const exerciseMuscles = e.muscles.toLowerCase();
                return m.keywords.some((k) => exerciseMuscles.includes(k.toLowerCase()));
              }).length;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMuscle(selectedMuscle === m.id ? "all" : m.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all text-left flex justify-between items-center cursor-pointer ${
                    selectedMuscle === m.id
                      ? "bg-brand-500 text-white border-brand-500 font-black shadow-sm"
                      : "bg-background/50 hover:bg-black/5 dark:hover:bg-white/5 border-border text-foreground/75"
                  }`}
                >
                  <span>{m.label}</span>
                  <span className="text-[10px] opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
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
