"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <header className="w-full border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 text-white flex items-center justify-center font-bold text-sm">
              F
            </div>
            <span className="font-bold text-xl text-foreground tracking-tight">
              FitSaaS
            </span>
          </div>
          <nav className="flex items-center gap-4">
            {session ? (
              <Link
                href="/dashboard"
                className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors"
              >
                Dashboard →
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full border border-border font-medium text-sm text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-2.5 rounded-full bg-brand-600 text-white font-medium text-sm hover:bg-brand-500 transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6">
        <section className="max-w-3xl mx-auto text-center py-24 md:py-32">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-8 border border-brand-100">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            Track · Analyze · Improve
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[1.1] mb-6">
            Your fitness journey,{" "}
            <span className="bg-gradient-to-r from-brand-500 to-emerald-400 bg-clip-text text-transparent">
              simplified.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-foreground/60 max-w-xl mx-auto mb-10 leading-relaxed">
            Log workouts, track progress, and crush your goals with an
            effortlessly clean experience. No clutter, no noise — just results.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full bg-brand-600 text-white font-semibold text-base hover:bg-brand-500 transition-all hover:shadow-lg hover:shadow-brand-500/25"
            >
              Start Tracking — Free
            </Link>
            <a
              href="#features"
              className="px-8 py-3.5 rounded-full border border-border font-semibold text-base text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              See Features
            </a>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="max-w-5xl mx-auto w-full pb-24">
          <h2 className="text-3xl font-bold text-center mb-12 tracking-tight">
            Everything you need, nothing you don't.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🏋️",
                title: "Log Workouts",
                desc: "Track exercises, sets, reps, and weight with a dead-simple interface.",
              },
              {
                icon: "📊",
                title: "Track Progress",
                desc: "Visualize your trends over time with beautiful, insightful charts.",
              },
              {
                icon: "🔒",
                title: "Secure by Default",
                desc: "Google Sign-In, JWT sessions, and encrypted data storage keep you safe.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-card border border-border p-8 rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1 group"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-brand-600 transition-colors">
                  {f.title}
                </h3>
                <p className="text-foreground/60 leading-relaxed text-sm">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-foreground/40 text-sm">
        <p>© 2026 FitSaaS. Built with ❤️ for fitness enthusiasts.</p>
      </footer>
    </div>
  );
}
