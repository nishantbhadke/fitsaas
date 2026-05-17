"use client";

import { useSession, signOut } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect, useCallback, useRef } from "react";

interface Workout {
  id: string;
  title: string;
  date: string;
  duration: number | null;
  notes: string | null;
}

/* ─── SVG Line Chart ─── */
function ActivityChart({ workouts }: { workouts: Workout[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const now = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const data = days.map((day) => {
    const dayStr = day.toISOString().split("T")[0];
    const dayWorkouts = workouts.filter(
      (w) => new Date(w.date).toISOString().split("T")[0] === dayStr
    );
    return {
      date: day,
      label: day.toLocaleDateString("en-US", { weekday: "short" }),
      dateLabel: day.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: dayWorkouts.length,
      minutes: dayWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
    };
  });

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const W = 600, H = 200, PAD = 30, CHART_H = H - PAD * 2;
  const stepX = (W - PAD * 2) / (data.length - 1);

  const points = data.map((d, i) => ({
    x: PAD + i * stepX,
    y: PAD + CHART_H - (d.count / maxCount) * CHART_H,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${H - PAD} L ${points[0].x} ${H - PAD} Z`;

  const lineLen = useRef(0);
  useEffect(() => {
    if (ref.current) {
      const path = ref.current.querySelector(".chart-line") as SVGPathElement;
      if (path) lineLen.current = path.getTotalLength();
    }
  }, []);

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Activity (Last 14 Days)</h2>
        <div className="flex items-center gap-3 text-xs text-foreground/50">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-500" /> Active</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400" /> Missed</span>
        </div>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
          <line key={i} x1={PAD} x2={W - PAD} y1={PAD + CHART_H * (1 - pct)} y2={PAD + CHART_H * (1 - pct)} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="4 4" />
        ))}
        {/* Area fill */}
        <path d={areaPath} fill="url(#areaGrad)" className={`transition-opacity duration-1000 ${animated ? "opacity-100" : "opacity-0"}`} />
        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke="#22c55e"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-line"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: animated ? 0 : 2000,
            transition: "stroke-dashoffset 1.5s ease-out",
          }}
        />
        {/* Data points */}
        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoveredIdx(i)} onMouseLeave={() => setHoveredIdx(null)} className="cursor-pointer">
            <circle cx={p.x} cy={p.y} r={hoveredIdx === i ? 6 : 4} fill={data[i].count > 0 ? "#22c55e" : "#f87171"} stroke="white" strokeWidth="2" className="transition-all duration-200" />
            {/* Hit area */}
            <circle cx={p.x} cy={p.y} r={15} fill="transparent" />
          </g>
        ))}
        {/* Hover tooltip */}
        {hoveredIdx !== null && (
          <g>
            <rect x={points[hoveredIdx].x - 55} y={points[hoveredIdx].y - 52} width="110" height="40" rx="8" fill="var(--foreground)" fillOpacity="0.9" />
            <text x={points[hoveredIdx].x} y={points[hoveredIdx].y - 36} textAnchor="middle" fill="var(--background)" fontSize="10" fontWeight="600">
              {data[hoveredIdx].dateLabel}
            </text>
            <text x={points[hoveredIdx].x} y={points[hoveredIdx].y - 22} textAnchor="middle" fill="var(--background)" fontSize="9" opacity="0.7">
              {data[hoveredIdx].count} workout{data[hoveredIdx].count !== 1 ? "s" : ""} • {data[hoveredIdx].minutes} min
            </text>
          </g>
        )}
        {/* X-axis labels */}
        {data.filter((_, i) => i % 2 === 0).map((d, idx) => {
          const i = idx * 2;
          return (
            <text key={i} x={points[i].x} y={H - 5} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.35">
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/* ─── SVG Donut Chart ─── */
function WorkoutTypeChart({ workouts }: { workouts: Workout[] }) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(t);
  }, []);

  const typeColors = [
    { color: "#6366f1", label: "Gym" },
    { color: "#f59e0b", label: "Calisthenics" },
    { color: "#ef4444", label: "Weight Lifting" },
    { color: "#10b981", label: "Cardio" },
    { color: "#8b5cf6", label: "Other" },
  ];

  // Categorize workouts by name heuristic
  const gymKeywords = ["lat", "cable", "leg press", "seated row", "leg curl", "machine"];
  const calisKeywords = ["push-up", "pull-up", "dip", "plank", "muscle-up", "pushup", "pullup"];
  const liftKeywords = ["bench", "deadlift", "squat", "overhead", "barbell", "press"];
  const cardioKeywords = ["run", "cycling", "jump rope", "rowing", "hiit", "cardio", "jog", "walk"];

  const categorized = workouts.map((w) => {
    const name = w.title.toLowerCase();
    if (gymKeywords.some((k) => name.includes(k))) return 0;
    if (calisKeywords.some((k) => name.includes(k))) return 1;
    if (liftKeywords.some((k) => name.includes(k))) return 2;
    if (cardioKeywords.some((k) => name.includes(k))) return 3;
    return 4;
  });

  const counts = [0, 0, 0, 0, 0];
  categorized.forEach((c) => counts[c]++);
  const total = workouts.length || 1;

  const CX = 80, CY = 80, R = 60, STROKE = 16;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Workout Types</h2>
      {workouts.length === 0 ? (
        <p className="text-foreground/40 text-center py-8 text-sm">No data yet</p>
      ) : (
        <div className="flex items-center gap-6">
          <svg width="160" height="160" viewBox="0 0 160 160">
            {counts.map((count, i) => {
              if (count === 0) return null;
              const pct = count / total;
              const dashLen = pct * circumference;
              const currentOffset = offset;
              offset += dashLen;
              return (
                <circle
                  key={i}
                  cx={CX} cy={CY} r={R}
                  fill="none"
                  stroke={typeColors[i].color}
                  strokeWidth={hoveredIdx === i ? STROKE + 4 : STROKE}
                  strokeDasharray={`${dashLen} ${circumference - dashLen}`}
                  strokeDashoffset={animated ? -currentOffset : circumference}
                  strokeLinecap="round"
                  className="cursor-pointer"
                  style={{ transition: "stroke-dashoffset 1s ease-out, stroke-width 0.2s" }}
                  transform={`rotate(-90 ${CX} ${CY})`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
            <text x={CX} y={CY - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="currentColor">
              {total}
            </text>
            <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9" fill="currentColor" opacity="0.4">
              total
            </text>
          </svg>
          <div className="flex flex-col gap-2">
            {typeColors.map((tc, i) => (
              counts[i] > 0 && (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-xs cursor-pointer transition-opacity ${hoveredIdx !== null && hoveredIdx !== i ? "opacity-40" : ""}`}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: tc.color }} />
                  <span className="text-foreground/70">{tc.label}</span>
                  <span className="font-semibold text-foreground ml-auto">{counts[i]}</span>
                  <span className="text-foreground/40">{Math.round((counts[i] / total) * 100)}%</span>
                </div>
              )
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Consistency Heatmap ─── */
function ConsistencyHeatmap({ workouts }: { workouts: Workout[] }) {
  const [hoveredDay, setHoveredDay] = useState<{ date: string; count: number; x: number; y: number } | null>(null);

  const now = new Date();
  const weeks = 8;
  const days: { date: Date; count: number }[] = [];

  for (let i = weeks * 7 - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().split("T")[0];
    const count = workouts.filter((w) => new Date(w.date).toISOString().split("T")[0] === dayStr).length;
    days.push({ date: d, count });
  }

  const getColor = (count: number) => {
    if (count === 0) return "var(--border)";
    if (count === 1) return "#86efac";
    if (count === 2) return "#22c55e";
    return "#15803d";
  };

  const CELL = 14, GAP = 3;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Consistency (Last {weeks} Weeks)</h2>
      <div className="relative">
        <svg width={(CELL + GAP) * weeks + GAP} height={(CELL + GAP) * 7 + GAP} style={{ overflow: "visible" }}>
          {days.map((day, i) => {
            const week = Math.floor(i / 7);
            const weekday = i % 7;
            const x = week * (CELL + GAP) + GAP;
            const y = weekday * (CELL + GAP) + GAP;
            return (
              <rect
                key={i}
                x={x} y={y}
                width={CELL} height={CELL}
                rx={3}
                fill={getColor(day.count)}
                className="cursor-pointer transition-all duration-150 hover:stroke-foreground hover:stroke-1"
                onMouseEnter={() => setHoveredDay({
                  date: day.date.toLocaleDateString("en-US", { month: "short", day: "numeric", weekday: "short" }),
                  count: day.count,
                  x: x + CELL / 2,
                  y: y - 8,
                })}
                onMouseLeave={() => setHoveredDay(null)}
              />
            );
          })}
        </svg>
        {hoveredDay && (
          <div
            className="absolute bg-foreground text-background text-[10px] px-2.5 py-1.5 rounded-lg font-medium pointer-events-none whitespace-nowrap z-10"
            style={{ left: hoveredDay.x, top: hoveredDay.y, transform: "translate(-50%, -100%)" }}
          >
            {hoveredDay.date}: {hoveredDay.count} workout{hoveredDay.count !== 1 ? "s" : ""}
          </div>
        )}
        <div className="flex items-center gap-1 mt-3 text-[10px] text-foreground/40">
          <span>Less</span>
          {[0, 1, 2, 3].map((n) => (
            <div key={n} className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(n) }} />
          ))}
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Dashboard ─── */
export default function DashboardPage() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() { redirect("/login"); },
  });

  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const lastWeekAgo = new Date(weekAgo);
  lastWeekAgo.setDate(lastWeekAgo.getDate() - 7);

  const thisWeek = workouts.filter((w) => new Date(w.date) >= weekAgo);
  const lastWeek = workouts.filter((w) => { const d = new Date(w.date); return d >= lastWeekAgo && d < weekAgo; });
  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);

  // Streak
  let streak = 0;
  const sortedDates = [...new Set(workouts.map((w) => new Date(w.date).toISOString().split("T")[0]).sort().reverse())];
  if (sortedDates.length > 0) {
    let checkDate = new Date(now.toISOString().split("T")[0]);
    for (const dateStr of sortedDates) {
      if (dateStr === checkDate.toISOString().split("T")[0]) { streak++; checkDate.setDate(checkDate.getDate() - 1); }
      else if (dateStr < checkDate.toISOString().split("T")[0]) break;
    }
  }

  // Most active day
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  workouts.forEach((w) => { dayCounts[new Date(w.date).getDay()]++; });
  const maxDayIdx = dayCounts.indexOf(Math.max(...dayCounts));
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const mostActiveDay = workouts.length > 0 ? dayNames[maxDayIdx] : "—";

  // Week comparison
  const weekDiff = thisWeek.length - lastWeek.length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {session?.user?.name?.split(" ")[0] || "User"}</h1>
          <p className="text-foreground/60 mt-1">Here is your fitness overview.</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: "/login" })} className="px-4 py-2 text-sm font-medium border border-border rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Logout</button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-medium text-foreground/50">This Week</h3>
          <p className="text-3xl font-bold mt-1 text-brand-600">{loading ? "—" : thisWeek.length}</p>
          {!loading && lastWeek.length > 0 && (
            <p className={`text-[10px] mt-1 font-medium ${weekDiff >= 0 ? "text-green-500" : "text-red-500"}`}>
              {weekDiff >= 0 ? "↑" : "↓"} {Math.abs(weekDiff)} vs last week
            </p>
          )}
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-medium text-foreground/50">Total Minutes</h3>
          <p className="text-3xl font-bold mt-1">{loading ? "—" : totalMinutes}<span className="text-sm font-normal text-foreground/40"> min</span></p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-medium text-foreground/50">Streak</h3>
          <p className="text-3xl font-bold mt-1">{loading ? "—" : streak}<span className="text-sm font-normal text-foreground/40"> {streak === 1 ? "day" : "days"}</span></p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-medium text-foreground/50">Most Active Day</h3>
          <p className="text-3xl font-bold mt-1">{loading ? "—" : mostActiveDay}</p>
        </div>
        <div className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-xs font-medium text-foreground/50">All Time</h3>
          <p className="text-3xl font-bold mt-1">{loading ? "—" : workouts.length}<span className="text-sm font-normal text-foreground/40"> workouts</span></p>
        </div>
      </div>

      {/* Charts Row */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ActivityChart workouts={workouts} />
          <WorkoutTypeChart workouts={workouts} />
        </div>
      )}

      {/* Heatmap */}
      {!loading && <ConsistencyHeatmap workouts={workouts} />}

      {/* Recent Workouts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Recent Workouts</h2>
          <a href="/dashboard/workouts" className="text-xs text-brand-600 font-medium hover:underline">View All →</a>
        </div>
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center p-12"><div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : workouts.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-foreground/40 mb-4">No workouts logged yet.</p>
              <a href="/dashboard/workouts" className="inline-flex px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors">Log Your First Workout</a>
            </div>
          ) : (
            <div className="flex flex-col">
              {workouts.slice(0, 5).map((w) => (
                <div key={w.id} className="flex items-center justify-between p-4 border-b border-border last:border-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">{w.title.charAt(0).toUpperCase()}</div>
                    <div>
                      <h4 className="font-medium text-sm">{w.title}</h4>
                      <p className="text-[11px] text-foreground/50">
                        {new Date(w.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        {w.duration && ` • ${w.duration} min`}
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
