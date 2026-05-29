"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface MenstrualLog {
  id: string;
  startDate: string;
  endDate: string | null;
  symptoms: string[];
  mood: string | null;
  energy: number | null;
  notes: string | null;
}

const getCyclePhaseDetails = (currentDay: number, cycleLength: number = 28) => {
  if (currentDay <= 5) {
    return {
      name: "Menstrual Phase",
      icon: "🌸",
      intensity: "Low Intensity",
      hormones: "Estrogen & Progesterone are at their lowest baseline.",
      nutrition: "Focus on iron-rich foods (spinach, lentils, dark chocolate, beetroot) and active recovery hydration.",
      recommendation: "Honor your body: opt for low-intensity sessions like active recovery, walking, light yoga, or gentle steady-state cardio.",
      color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      progressBg: "bg-rose-500",
      phaseKey: "menstrual",
    };
  } else if (currentDay <= 13) {
    return {
      name: "Follicular Phase",
      icon: "🌱",
      intensity: "High Intensity",
      hormones: "Estrogen levels are climbing steadily. Physical energy and focus are rising.",
      nutrition: "Consume complex carbs (oats, brown rice) and lean proteins (chicken, tofu, lentils).",
      recommendation: "Stamina is climbing! This is an ideal window for high-intensity cardio, hypertrophy, and heavy resistance training.",
      color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      progressBg: "bg-emerald-500",
      phaseKey: "follicular",
    };
  } else if (currentDay <= 15) {
    return {
      name: "Ovulatory Phase",
      icon: "🔥",
      intensity: "Peak Intensity (PR Focus)",
      hormones: "Estrogen & LH hormone levels peak. Physical power is maximized.",
      nutrition: "Focus on fiber-rich fruits (berries, oranges), raw seeds (pumpkin, sesame), and light digestible proteins.",
      recommendation: "You are at your absolute strongest! Perfect time to test personal records (PRs), run max sprints, or do demanding explosive lifting.",
      color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      progressBg: "bg-amber-500",
      phaseKey: "ovulatory",
    };
  } else {
    return {
      name: "Luteal Phase",
      icon: "🍂",
      intensity: "Moderate Intensity",
      hormones: "Progesterone rises and peaks. Core body temperature climbs.",
      nutrition: "Eat complex carbs (sweet potatoes, squash) and magnesium-rich items (bananas, almonds) to prevent PMS spikes.",
      recommendation: "Focus on endurance, moderate weight volumes, steady state aerobic sessions, and mind-muscle connection.",
      color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
      progressBg: "bg-indigo-500",
      phaseKey: "luteal",
    };
  }
};

const SYMPTOMS_OPTIONS = [
  { id: "cramps", label: "Cramps" },
  { id: "fatigue", label: "Fatigue" },
  { id: "bloating", label: "Bloating" },
  { id: "headache", label: "Headache" },
  { id: "mood_swings", label: "Mood Swings" },
  { id: "backache", label: "Lower Back Pain" },
];

const MOODS_OPTIONS = [
  { id: "calm", label: "Calm 🧘" },
  { id: "happy", label: "Happy ☀️" },
  { id: "anxious", label: "Anxious ☁️" },
  { id: "irritable", label: "Irritable ⚡" },
  { id: "fatigued", label: "Fatigued 🔋" },
];

export default function WellnessPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [trackingEnabled, setTrackingEnabled] = useState(false);
  const [logs, setLogs] = useState<MenstrualLog[]>([]);
  const [cycleLength, setCycleLength] = useState(28);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedMood, setSelectedMood] = useState("");
  const [energyLevel, setEnergyLevel] = useState(3);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);

  // active selected phase detail browsing
  const [selectedPhase, setSelectedPhase] = useState("menstrual");

  const showToastMessage = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/me`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setTrackingEnabled(Boolean(data.user?.menstrualTrackingEnabled));
        setCycleLength(data.user?.cycleLength || 28);
      }
    } catch (err) {
      console.error("Failed to fetch profile in wellness page:", err);
    }
  }, [session]);

  const fetchLogs = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/menstrual`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch logs in wellness page:", err);
    }
  }, [session]);

  const handleToggleTracking = async (enabled: boolean) => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/menstrual/toggle`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({ enabled }),
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        setTrackingEnabled(enabled);
        showToastMessage(enabled ? "🌸 Menstrual Cycle Tracking Activated" : "🔒 Cycle Tracking Deactivated & Hidden");
      }
    } catch (err) {
      console.error("Failed to toggle tracking:", err);
    }
  };

  useEffect(() => {
    const initData = async () => {
      if (status === "authenticated") {
        setLoading(true);
        await Promise.all([fetchProfile(), fetchLogs()]);
        setLoading(false);
      }
    };
    initData();
  }, [status, fetchProfile, fetchLogs]);

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.appToken) return;

    // Validation checks
    const parsedStart = new Date(startDate);
    if (isNaN(parsedStart.getTime())) {
      showToastMessage("❌ Please enter a valid start date.");
      return;
    }
    if (parsedStart > new Date()) {
      showToastMessage("❌ Start date cannot be in the future.");
      return;
    }

    if (endDate) {
      const parsedEnd = new Date(endDate);
      if (isNaN(parsedEnd.getTime())) {
        showToastMessage("❌ Please enter a valid end date.");
        return;
      }
      if (parsedEnd > new Date()) {
        showToastMessage("❌ End date cannot be in the future.");
        return;
      }
      if (parsedEnd < parsedStart) {
        showToastMessage("❌ End date cannot be before the start date.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const url = editingLogId
        ? `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/menstrual/${editingLogId}`
        : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/menstrual`;
      const method = editingLogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({
          startDate,
          endDate: endDate || null,
          symptoms: selectedSymptoms,
          mood: selectedMood || null,
          energy: energyLevel,
          notes: notes.trim() || null,
        }),
      });

      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }

      if (res.ok) {
        showToastMessage(editingLogId ? "✅ Cycle parameters updated successfully!" : "✅ Cycle parameters logged successfully!");
        setEditingLogId(null);
        setEndDate("");
        setSelectedSymptoms([]);
        setSelectedMood("");
        setEnergyLevel(3);
        setNotes("");
        fetchLogs();
      } else {
        const errData = await res.json();
        showToastMessage(`❌ Error: ${errData.error || "Failed to save cycle data"}`);
      }
    } catch (err) {
      console.error(err);
      showToastMessage("❌ Connection failure. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteLog = async (id: string) => {
    if (!session?.appToken) return;
    if (!confirm("Are you sure you want to delete this menstrual log?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/menstrual/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.status === 401 || res.status === 403) {
        signOut({ callbackUrl: "/login" });
        return;
      }
      if (res.ok) {
        showToastMessage("🗑 Log deleted");
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
      showToastMessage("❌ Failed to delete log.");
    }
  };

  const handleAddEndDate = async (id: string, logStart: string) => {
    if (!session?.appToken) return;
    const endStr = prompt("Enter period end date (YYYY-MM-DD):", new Date().toISOString().split("T")[0]);
    if (!endStr) return;

    const parsedStart = new Date(logStart);
    const parsedEnd = new Date(endStr);
    if (isNaN(parsedEnd.getTime())) {
      alert("Invalid date format.");
      return;
    }
    if (parsedEnd < parsedStart) {
      alert("End date cannot be before the start date.");
      return;
    }
    if (parsedEnd > new Date()) {
      alert("End date cannot be in the future.");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/menstrual/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({ endDate: endStr }),
      });
      if (res.ok) {
        showToastMessage("📅 Cycle end boundary logged!");
        fetchLogs();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSelect = (log: MenstrualLog) => {
    setEditingLogId(log.id);
    setStartDate(log.startDate ? new Date(log.startDate).toISOString().split("T")[0] : "");
    setEndDate(log.endDate ? new Date(log.endDate).toISOString().split("T")[0] : "");
    setSelectedSymptoms(log.symptoms || []);
    setSelectedMood(log.mood || "");
    setEnergyLevel(log.energy || 3);
    setNotes(log.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setSelectedSymptoms([]);
    setSelectedMood("");
    setEnergyLevel(3);
    setNotes("");
  };

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId]
    );
  };

  // Phase calculations
  const latestLog = logs.length > 0 ? logs[0] : null;
  const currentCycleDay = latestLog ? Math.floor((new Date().getTime() - new Date(latestLog.startDate).getTime()) / (1000 * 60 * 60 * 24)) % cycleLength + 1 : null;
  const activePhase = currentCycleDay ? getCyclePhaseDetails(currentCycleDay, cycleLength) : null;

  useEffect(() => {
    if (activePhase) {
      setSelectedPhase(activePhase.phaseKey);
    }
  }, [activePhase]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-foreground">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-brand-500/30 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-foreground animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Wellness Center</h1>
          <p className="text-foreground/60 mt-1">Female wellness, strength output analytics, and cycle metrics.</p>
        </div>

        {/* Feature Enable/Disable Switcher */}
        <div className="flex items-center gap-3 bg-card border border-border px-4 py-2.5 rounded-2xl shrink-0 shadow-sm sm:mr-24 md:mr-28">
          <span className="text-xs font-bold text-foreground/70">Enable Tracker</span>
          <button
            onClick={() => handleToggleTracking(!trackingEnabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              trackingEnabled ? "bg-brand-500" : "bg-card border-border"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                trackingEnabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {!trackingEnabled ? (
        /* Disabled Opt-In Onboarding Screen */
        <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center flex flex-col items-center justify-center gap-5 max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-brand-500/10 text-brand-500 flex items-center justify-center text-3xl shadow-sm animate-pulse">
            🌸
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold tracking-tight">Menstrual Health & Strength Tracker</h2>
            <p className="text-sm text-foreground/50 leading-relaxed">
              Track cycle phases to understand workout energy fluctuations, coordinate training load adjustments, log symptoms, and access customized gym programs tailored exactly to your body's rhythm.
            </p>
          </div>
          <button
            onClick={() => handleToggleTracking(true)}
            className="px-6 h-12 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-500 transition-colors shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
          >
            Activate Cycle Tracker
          </button>
        </div>
      ) : (
        /* Enabled Dashboard State */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT PANEL: Log new period & History logs list (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Cycle boundary input card */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-5">
              <div>
                <h2 className="text-lg font-bold">{editingLogId ? "✏️ Edit Cycle Parameters" : "Log Cycle Parameters"}</h2>
                <p className="text-xs text-foreground/45 mt-0.5">{editingLogId ? "Modify dates, fatigue parameters, and symptom indicators for this log." : "Log dates, fatigue parameters, and symptom indicators."}</p>
              </div>

              <form onSubmit={handleLogSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1.5">Period Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1.5">Period End Date (Optional)</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="w-full h-12 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Energy Slider */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40">Current Energy Output</label>
                    <span className="text-xs font-bold text-brand-500">Level {energyLevel} / 5</span>
                  </div>
                  <input
                    type="range"
                    min="1" max="5"
                    value={energyLevel}
                    onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-brand-500"
                  />
                  <div className="flex justify-between text-[10px] text-foreground/30 font-semibold px-0.5 mt-1.5">
                    <span>Low Power 🔋</span>
                    <span>Peak Stamina ⚡</span>
                  </div>
                </div>

                {/* Symptom Checkboxes */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40">Track Active Symptoms</label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS_OPTIONS.map((sym) => {
                      const isSelected = selectedSymptoms.includes(sym.id);
                      return (
                        <button
                          key={sym.id}
                          type="button"
                          onClick={() => handleSymptomToggle(sym.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-brand-500/10 text-brand-500 border-brand-500/30"
                              : "bg-background border-border text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          {sym.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Mood buttons selection */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40">Current Primary Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS_OPTIONS.map((m) => {
                      const isSelected = selectedMood === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMood(isSelected ? "" : m.id)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                              : "bg-background border-border text-foreground/60 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                          }`}
                        >
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1.5">Personal Fitness Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe cramps severity, energy spikes, or lifting capacity notes..."
                    rows={3}
                    className="w-full px-3 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
                  />
                </div>

                 <div className="flex gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`h-12 flex-1 flex items-center justify-center rounded-xl text-white text-xs font-black transition-colors shadow-md active:scale-[0.98] disabled:opacity-50 ${
                      editingLogId ? "bg-amber-600 hover:bg-amber-500" : "bg-brand-600 hover:bg-brand-500"
                    }`}
                  >
                    {submitting ? "SAVING..." : editingLogId ? "SAVE CHANGES" : "LOG CYCLE STATUS"}
                  </button>
                  {editingLogId && (
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="h-12 px-6 rounded-xl border border-border bg-background hover:bg-white/[0.04] text-xs font-bold text-foreground/75 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Historical list */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-bold">Historical Log History</h2>
                <p className="text-xs text-foreground/45 mt-0.5">Logs of active boundaries and symptoms records.</p>
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-10 rounded-xl border border-dashed border-border bg-background/20 text-foreground/40 text-xs">
                  No cycle logs entered yet. Set your first period start boundary above to begin tracking.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-border bg-background/25 p-4 rounded-xl flex justify-between items-start gap-4 hover:border-brand-500/20 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-foreground">
                            📅 {new Date(log.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                          <span className="text-[10px] text-foreground/40 font-semibold">•</span>
                          {log.endDate ? (
                            <span className="text-xs font-bold text-foreground/60">
                              End: {new Date(log.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAddEndDate(log.id, log.startDate)}
                              className="px-2.5 py-0.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-[10px] font-black hover:bg-rose-500/20 transition-colors cursor-pointer"
                            >
                              Log Period End
                            </button>
                          )}
                        </div>

                        {/* Symptoms & mood pill badges */}
                        <div className="flex flex-wrap gap-1">
                          {log.mood && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold">
                              Mood: {log.mood}
                            </span>
                          )}
                          {log.energy && (
                            <span className="px-2 py-0.5 rounded-md bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[10px] font-bold">
                              Energy: {log.energy}/5
                            </span>
                          )}
                          {log.symptoms.map((s) => (
                            <span
                              key={s}
                              className="px-2 py-0.5 rounded-md bg-foreground/5 border border-border text-foreground/70 text-[10px] font-medium"
                            >
                              {s}
                            </span>
                          ))}
                        </div>

                        {log.notes && (
                          <p className="text-xs text-foreground/65 leading-relaxed pl-1.5 border-l border-border italic">
                            "{log.notes}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleEditSelect(log)}
                          className="text-foreground/30 hover:text-brand-500 hover:bg-brand-500/10 h-7 w-7 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer"
                          title="Edit log"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteLog(log.id)}
                          className="text-foreground/30 hover:text-red-500 hover:bg-red-500/10 h-7 w-7 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer"
                          title="Delete log"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT PANEL: Biological cycle phase details browser (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* active phase banner */}
            {activePhase ? (
              <div className={`border rounded-2xl p-6 flex flex-col gap-4 shadow-md ${activePhase.color}`}>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{activePhase.icon}</span>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{activePhase.name}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider opacity-60 mt-0.5">
                      Cycle day {currentCycleDay} of {cycleLength}
                    </p>
                  </div>
                </div>

                <div className="h-1.5 w-full rounded-full bg-current/10 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${activePhase.progressBg}`}
                    style={{ width: `${Math.min(Math.round((currentCycleDay! / cycleLength) * 100), 100)}%` }}
                  />
                </div>

                <div className="space-y-1 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Workout Intensity Focus</span>
                  <p className="text-sm font-black">{activePhase.intensity}</p>
                </div>

                <div className="space-y-1.5 border-t border-current/10 pt-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">Phase Insights</span>
                  <p className="text-xs font-semibold leading-relaxed">{activePhase.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="border border-border bg-card rounded-2xl p-6 text-center text-foreground/40 text-xs">
                ⚠️ Complete your first period log on the left to activate your personalized biological phase analysis.
              </div>
            )}

            {/* Cycle Phases Library / browser tabs */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col gap-4">
              <div>
                <h3 className="text-base font-bold">Biometrics Phase Guidelines</h3>
                <p className="text-xs text-foreground/45 mt-0.5">Browse recommended training cycles, hormonal details, and nutrition guides.</p>
              </div>

              {/* mini tabs */}
              <div className="flex flex-wrap gap-1.5 border-b border-border pb-3">
                {["menstrual", "follicular", "ovulatory", "luteal"].map((key) => {
                  const isSelected = selectedPhase === key;
                  const phaseDetail = getCyclePhaseDetails(
                    key === "menstrual" ? 2 : key === "follicular" ? 9 : key === "ovulatory" ? 14 : 22,
                    28
                  );
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedPhase(key)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-foreground text-background font-black shadow-sm"
                          : "bg-foreground/5 hover:bg-foreground/10 text-foreground/70"
                      }`}
                    >
                      <span>{phaseDetail.icon}</span>
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </button>
                  );
                })}
              </div>

              {/* tab contents */}
              {(() => {
                const phaseKeyToDay = selectedPhase === "menstrual" ? 2 : selectedPhase === "follicular" ? 9 : selectedPhase === "ovulatory" ? 14 : 22;
                const p = getCyclePhaseDetails(phaseKeyToDay, 28);
                return (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Active Hormones Flow</span>
                      <p className="text-xs font-semibold leading-relaxed text-foreground/80">{p.hormones}</p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Nutrition & Stamina Support</span>
                      <p className="text-xs font-semibold leading-relaxed text-foreground/80">{p.nutrition}</p>
                    </div>

                    <div className="space-y-2 border-t border-border pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-foreground/45">Recommended Phase Workouts</span>
                      <div className="space-y-2">
                        {selectedPhase === "menstrual" && (
                          <>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">🧘 Yin Yoga & Stretching</span>
                              <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md font-bold">Gentle</span>
                            </div>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">🚶 Steady State Walk</span>
                              <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded-md font-bold">Light</span>
                            </div>
                          </>
                        )}
                        {selectedPhase === "follicular" && (
                          <>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">🏋️ Heavy Squats (Hypertrophy)</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold">High</span>
                            </div>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">🏃 HIIT Cardio Intervals</span>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-md font-bold">Max</span>
                            </div>
                          </>
                        )}
                        {selectedPhase === "ovulatory" && (
                          <>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">💥 Deadlifts (PR Capacity)</span>
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold">Peak</span>
                            </div>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">💥 Box Jumps & Plyometrics</span>
                              <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-md font-bold">Explosive</span>
                            </div>
                          </>
                        )}
                        {selectedPhase === "luteal" && (
                          <>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">🏃 Aerobic Steady State Jog</span>
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-bold">Moderate</span>
                            </div>
                            <div className="flex justify-between items-center bg-foreground/[0.02] border border-border p-2.5 rounded-xl">
                              <span className="text-xs font-semibold">🧘 Pilates & Core Sculpting</span>
                              <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-bold">Control</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
