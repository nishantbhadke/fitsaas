"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";
import { useState } from "react";

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function ProductPreview() {
  const bars = [42, 64, 38, 82, 56, 92, 70];

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#121316] p-5 shadow-2xl shadow-black/30">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">Today</p>
          <h2 className="mt-1 text-xl font-bold text-white">Training Room</h2>
        </div>
        <div className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-zinc-950">Live</div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {[
          ["12", "sessions"],
          ["7.4h", "duration"],
          ["86%", "consistency"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div className="text-2xl font-black text-white">{value}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wider text-white/40">{label}</div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Weekly load</div>
          <div className="text-xs text-emerald-300">+18%</div>
        </div>
        <div className="mt-5 flex h-28 items-end gap-2">
          {bars.map((height, index) => (
            <div key={index} className="flex flex-1 items-end rounded-full bg-white/[0.06]">
              <div
                className="w-full rounded-full bg-gradient-to-t from-indigo-500 to-emerald-300"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {[
          ["Lat Pulldown", "Back and biceps", "Recorded"],
          ["Push-ups", "Chest and core", "Ready"],
        ].map(([name, group, status]) => (
          <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            <div>
              <div className="text-sm font-semibold text-white">{name}</div>
              <div className="text-xs text-white/45">{group}</div>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white/70">{status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TourModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[1.75rem] border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">What you can do inside</h2>
            <p className="mt-2 text-sm leading-6 text-foreground/60">
              FitSaaS is built around a simple loop: choose a movement, record the session, and watch your progress become visible.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-foreground/60 hover:text-foreground">
            Close
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            ["Record", "Save duration, notes, and workout history from the exercise library."],
            ["Analyze", "Use charts, heatmaps, and recent logs to see training patterns."],
            ["Share", "Export a clean workout summary image for social or your camera roll."],
          ].map(([title, copy]) => (
            <div key={title} className="rounded-2xl border border-border bg-background p-4">
              <div className="text-sm font-bold text-foreground">{title}</div>
              <p className="mt-2 text-xs leading-5 text-foreground/55">{copy}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="mt-6 flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-foreground px-5 text-sm font-bold text-background transition-opacity hover:opacity-90"
        >
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export function AuthLanding() {
  const { data: session } = useSession();
  const [showTour, setShowTour] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090b] text-white">
      <div className="mx-auto grid min-h-screen w-full max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
        <section className="max-w-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-base font-black text-zinc-950">F</div>
            <div>
              <div className="text-lg font-black tracking-tight">FitSaaS</div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/40">Fitness command center</div>
            </div>
          </div>

          <h1 className="mt-12 text-5xl font-black tracking-tight text-white sm:text-6xl">
            Record workouts without fighting the app.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-white/60">
            A focused training workspace for logging sessions, reading progress, and exporting workout moments.
          </p>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            {session ? (
              <Link href="/dashboard" className="flex h-[52px] items-center justify-center rounded-2xl bg-emerald-400 px-6 text-sm font-black text-zinc-950 transition-opacity hover:opacity-90">
                Open dashboard
              </Link>
            ) : (
              <button
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                className="flex h-[52px] items-center justify-center gap-3 rounded-2xl bg-emerald-400 px-6 text-sm font-black text-zinc-950 transition-opacity hover:opacity-90"
              >
                <GoogleIcon />
                Continue with Google
              </button>
            )}
            <button
              onClick={() => setShowTour(true)}
              className="flex h-[52px] items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-6 text-sm font-bold text-white transition-colors hover:bg-white/[0.08]"
            >
              Short tour of app
            </button>
          </div>

          <div className="mt-8 grid max-w-md grid-cols-3 gap-3 text-center">
            {["Log", "Track", "Share"].map((item) => (
              <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.035] px-3 py-3 text-xs font-bold uppercase tracking-wider text-white/55">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="lg:pl-6">
          <ProductPreview />
        </section>
      </div>

      {showTour && <TourModal onClose={() => setShowTour(false)} />}
    </main>
  );
}
