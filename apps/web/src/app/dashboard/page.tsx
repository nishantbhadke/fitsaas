"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback } from "react";

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number | null;
}

export default function DashboardPage() {
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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Compute greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  // Calculate stats
  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const thisWeekWorkouts = workouts.filter(
    (w) => new Date(w.date) >= weekAgo
  );
  const totalMinutes = workouts.reduce(
    (sum, w) => sum + (w.duration || 0),
    0
  );

  // Calculate streak
  let streak = 0;
  const sortedDates = [
    ...new Set(
      workouts
        .map((w) => new Date(w.date).toISOString().split("T")[0])
        .sort()
        .reverse()
    ),
  ];
  if (sortedDates.length > 0) {
    const today = new Date().toISOString().split("T")[0];
    let checkDate = new Date(today);
    for (const dateStr of sortedDates) {
      const checkStr = checkDate.toISOString().split("T")[0];
      if (dateStr === checkStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (dateStr < checkStr) {
        break;
      }
    }
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {session?.user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-foreground/60 mt-1">
            Here is your summary for today.
          </p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="px-4 py-2 text-sm font-medium border border-border rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-foreground/60">
            Workouts This Week
          </h3>
          <p className="text-4xl font-bold mt-2 text-brand-600">
            {loading ? "—" : thisWeekWorkouts.length}
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-foreground/60">
            Total Minutes
          </h3>
          <p className="text-4xl font-bold mt-2">
            {loading ? "—" : totalMinutes}
            <span className="text-base font-normal text-foreground/40">
              {" "}
              min
            </span>
          </p>
        </div>
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-sm font-medium text-foreground/60">
            Current Streak
          </h3>
          <p className="text-4xl font-bold mt-2">
            {loading ? "—" : streak}
            <span className="text-base font-normal text-foreground/40">
              {" "}
              {streak === 1 ? "day" : "days"}
            </span>
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Workouts</h2>
          <a
            href="/dashboard/workouts"
            className="text-sm text-brand-600 font-medium hover:underline"
          >
            View All
          </a>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : workouts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-foreground/40 mb-4">No workouts logged yet.</p>
              <a
                href="/dashboard/workouts"
                className="inline-flex px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors"
              >
                Log Your First Workout
              </a>
            </div>
          ) : (
            <div className="flex flex-col">
              {workouts.slice(0, 5).map((workout) => (
                <div
                  key={workout.id}
                  className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
                      {workout.title.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-medium">{workout.title}</h4>
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
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
