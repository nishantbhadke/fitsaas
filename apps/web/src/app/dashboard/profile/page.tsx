"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

export default function ProfilePage() {
  const { data: session, update: updateSession, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [gender, setGender] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [targetWeight, setTargetWeight] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [activityLevel, setActivityLevel] = useState("MODERATELY_ACTIVE");
  const [dailyWaterGoal, setDailyWaterGoal] = useState(2000);
  const [dailyCalorieGoal, setDailyCalorieGoal] = useState(2000);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!session?.appToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/me`, {
        headers: { Authorization: `Bearer ${(session as any).appToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        const u = data.user;
        setName(u.name || "");
        setImage(u.image || "");
        setGender(u.gender || "");
        setCycleLength(u.cycleLength || 28);
        if (u.lastPeriodStart) {
          setLastPeriodStart(new Date(u.lastPeriodStart).toISOString().split("T")[0]);
        }
        setWeight(u.weight ? u.weight.toString() : "");
        setHeight(u.height ? u.height.toString() : "");
        setTargetWeight(u.targetWeight ? u.targetWeight.toString() : "");
        if (u.birthDate) {
          setBirthDate(new Date(u.birthDate).toISOString().split("T")[0]);
        }
        setActivityLevel(u.activityLevel || "MODERATELY_ACTIVE");
        setDailyWaterGoal(u.dailyWaterGoal || 2000);
        setDailyCalorieGoal(u.dailyCalorieGoal || 2000);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === "authenticated") fetchProfile();
  }, [status, fetchProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.appToken) return;
    setSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).appToken}`,
        },
        body: JSON.stringify({
          name,
          gender: gender || null,
          cycleLength: gender === "FEMALE" ? cycleLength : null,
          lastPeriodStart: gender === "FEMALE" ? (lastPeriodStart || null) : null,
          weight: weight ? parseFloat(weight) : null,
          height: height ? parseFloat(height) : null,
          targetWeight: targetWeight ? parseFloat(targetWeight) : null,
          birthDate: birthDate ? new Date(birthDate) : null,
          activityLevel,
          dailyWaterGoal: dailyWaterGoal ? parseInt(dailyWaterGoal.toString()) : null,
          dailyCalorieGoal: dailyCalorieGoal ? parseInt(dailyCalorieGoal.toString()) : null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        await updateSession({
          ...session,
          user: {
            ...session.user,
            ...data.user,
          }
        });
        setToast("✨ Profile successfully synced!");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("❌ Failed to update profile.");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setToast("❌ Error saving profile details.");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-brand-500/30 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-foreground animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          {image ? (
            <img 
              src={image} 
              alt={name} 
              className="w-16 h-16 rounded-2xl border-2 border-emerald-400/20 object-cover shadow-md"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border-2 border-brand-500/20 flex items-center justify-center font-black text-2xl text-emerald-400">
              {name.charAt(0).toUpperCase() || "U"}
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{name || "User Profile"}</h1>
            <p className="text-white/40 text-sm mt-1">{session?.user?.email}</p>
          </div>
        </div>
        {image && (
          <div className="inline-flex h-9 items-center justify-center gap-2 rounded-xl bg-white/[0.04] border border-white/10 px-3 text-xs font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Google Connected
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Personal Characteristics */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-emerald-400 uppercase tracking-wider border-b border-border pb-3">Personal Metrics</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Birth Date</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="175"
                  min="50"
                  max="250"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="72.5"
                  min="20"
                  max="300"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Gender Identification</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
              >
                <option value="" disabled className="bg-card">Select gender...</option>
                <option value="MALE" className="bg-card">Male</option>
                <option value="FEMALE" className="bg-card">Female</option>
                <option value="OTHER" className="bg-card">Other</option>
                <option value="PREFER_NOT_TO_SAY" className="bg-card">Prefer not to say</option>
              </select>
            </div>
          </div>

          {/* Card 2: Fitness Goals & Guidelines */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-emerald-400 uppercase tracking-wider border-b border-border pb-3">Fitness & Lifestyle</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={targetWeight}
                  onChange={(e) => setTargetWeight(e.target.value)}
                  placeholder="68.0"
                  min="20"
                  max="300"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Activity Level</label>
                <select
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                >
                  <option value="SEDENTARY" className="bg-card">Sedentary (Little/no exercise)</option>
                  <option value="LIGHTLY_ACTIVE" className="bg-card">Light (1-3 days/wk)</option>
                  <option value="MODERATELY_ACTIVE" className="bg-card">Moderate (3-5 days/wk)</option>
                  <option value="VERY_ACTIVE" className="bg-card">Active (6-7 days/wk)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Daily Calorie Target (kcal)</label>
                <input
                  type="number"
                  value={dailyCalorieGoal}
                  onChange={(e) => setDailyCalorieGoal(parseInt(e.target.value) || 2000)}
                  placeholder="2200"
                  min="500"
                  max="10000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Daily Water Target (ml)</label>
                <input
                  type="number"
                  value={dailyWaterGoal}
                  onChange={(e) => setDailyWaterGoal(parseInt(e.target.value) || 2000)}
                  placeholder="2500"
                  min="500"
                  max="20000"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Women's Health (Conditional) */}
        {gender === "FEMALE" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xl">🌸</span>
              <h2 className="text-base font-bold text-emerald-400 uppercase tracking-wider">Women's Health Integration</h2>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              Dynamically maps hormonal cycle changes to optimize workout suggestions on your primary command dashboard.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Average Cycle Length (Days)</label>
                <input
                  type="number"
                  value={cycleLength}
                  onChange={(e) => setCycleLength(parseInt(e.target.value) || 28)}
                  placeholder="28"
                  min="20"
                  max="45"
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Last Period Start Date</label>
                <input
                  type="date"
                  value={lastPeriodStart}
                  onChange={(e) => setLastPeriodStart(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  required
                />
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full h-12 flex items-center justify-center rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all disabled:opacity-50"
        >
          {saving ? "Syncing details..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
