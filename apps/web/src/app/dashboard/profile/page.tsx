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
  const [gender, setGender] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [lastPeriodStart, setLastPeriodStart] = useState("");
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
        setName(data.user?.name || "");
        setGender(data.user?.gender || "");
        setCycleLength(data.user?.cycleLength || 28);
        if (data.user?.lastPeriodStart) {
          setLastPeriodStart(new Date(data.user.lastPeriodStart).toISOString().split("T")[0]);
        }
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
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Trigger NextAuth update to sync session client-side
        await updateSession({
          ...session,
          user: {
            ...session.user,
            name: data.user.name,
            gender: data.user.gender,
            cycleLength: data.user.cycleLength,
            lastPeriodStart: data.user.lastPeriodStart,
          }
        });
        setToast("✨ Profile updated successfully!");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("❌ Failed to update profile.");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error(err);
      setToast("❌ An error occurred while saving.");
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
    <div className="max-w-xl mx-auto flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-white">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-card border border-brand-500/30 shadow-xl rounded-xl px-5 py-3 text-sm font-medium text-foreground animate-in fade-in slide-in-from-top-2 duration-300">
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Personal Profile</h1>
        <p className="text-white/60 mt-1">
          Customize your information to refine your personalized workout insights.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info Section */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold border-b border-border pb-3">Basic Information</h2>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500 transition-all"
              required
            />
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

        {/* Women's Health Section */}
        {gender === "FEMALE" && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm space-y-4 animate-in slide-in-from-top-4 duration-300">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <span className="text-xl">🌸</span>
              <h2 className="text-lg font-semibold">Women's Health Integration</h2>
            </div>
            <p className="text-xs text-white/50 leading-relaxed">
              By inputting your cycle details, FitSaaS will dynamically suggest optimal training intensities corresponding to your current hormonal phases (Follicular, Ovulatory, Luteal, or Menstrual).
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
          className="w-full h-12 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition-all disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
