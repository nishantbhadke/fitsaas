"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number | null;
}

export default function ProgressPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect("/login");
    },
  });

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Calculate stats
  const totalWorkouts = workouts.length;
  const totalMinutes = workouts.reduce(
    (sum, w) => sum + (w.duration || 0),
    0
  );
  const avgDuration =
    totalWorkouts > 0 ? Math.round(totalMinutes / totalWorkouts) : 0;

  // Weekly breakdown (last 7 days)
  const now = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const weeklyData = days.map((day) => {
    const dayStr = day.toISOString().split("T")[0];
    const count = workouts.filter(
      (w) => new Date(w.date).toISOString().split("T")[0] === dayStr
    ).length;
    return {
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      count,
    };
  });

  const maxCount = Math.max(...weeklyData.map((d) => d.count), 1);

  // Monthly breakdown
  const thisMonth = workouts.filter((w) => {
    const d = new Date(w.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const lastMonth = workouts.filter((w) => {
    const d = new Date(w.date);
    const lm = new Date(now.getFullYear(), now.getMonth() - 1);
    return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-foreground/60 mt-1">
          Visualize your fitness journey over time.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-foreground/60">
            Total Workouts
          </h3>
          <p className="text-4xl font-bold mt-2 text-brand-600">
            {totalWorkouts}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-foreground/60">
            Total Minutes
          </h3>
          <p className="text-4xl font-bold mt-2">
            {totalMinutes}
            <span className="text-base font-normal text-foreground/40">
              {" "}
              min
            </span>
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-foreground/60">
            Avg Duration
          </h3>
          <p className="text-4xl font-bold mt-2">
            {avgDuration}
            <span className="text-base font-normal text-foreground/40">
              {" "}
              min
            </span>
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h3 className="text-sm font-medium text-foreground/60">This Month</h3>
          <p className="text-4xl font-bold mt-2">
            {thisMonth.length}
            {lastMonth.length > 0 && (
              <span
                className={`text-sm font-medium ml-2 ${
                  thisMonth.length >= lastMonth.length
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {thisMonth.length >= lastMonth.length ? "↑" : "↓"}{" "}
                {Math.abs(thisMonth.length - lastMonth.length)} vs last month
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-6">Last 7 Days</h2>
        {totalWorkouts === 0 ? (
          <div className="text-center py-12 text-foreground/40">
            <p className="text-lg">No workout data yet.</p>
            <p className="text-sm mt-1">
              Start logging workouts to see your trends here.
            </p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-2 h-48">
            {weeklyData.map((day, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-xs font-medium text-foreground/60">
                  {day.count}
                </span>
                <div className="w-full flex items-end justify-center">
                  <div
                    className="w-full max-w-[40px] rounded-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500"
                    style={{
                      height: `${Math.max((day.count / maxCount) * 160, day.count > 0 ? 12 : 4)}px`,
                      opacity: day.count > 0 ? 1 : 0.15,
                    }}
                  />
                </div>
                <span className="text-xs font-medium text-foreground/40">
                  {day.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        {workouts.length === 0 ? (
          <p className="text-foreground/40 text-center py-8">
            No workouts logged yet.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {workouts.slice(0, 10).map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-500" />
                  <span className="font-medium text-sm">{workout.title}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-foreground/60">
                  {workout.duration && <span>{workout.duration} min</span>}
                  <span>
                    {new Date(workout.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
