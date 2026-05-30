"use client";

import Link from "next/link";
import { useState } from "react";

interface DocSection {
  id: string;
  category: "getting-started" | "key-features" | "privacy-security" | "faqs";
  title: string;
  icon: string;
  summary: string;
  details: string[];
}

const DOCS_DATABASE: DocSection[] = [
  {
    id: "about-fitsaas",
    category: "getting-started",
    title: "What is FitSaaS?",
    icon: "🚀",
    summary: "A clean, minimalist fitness dashboard engineered to log your workouts, monitor physiological trends, and export social-ready training wins without clutter.",
    details: [
      "💪 **Simple Workouts**: Browse our preloaded categorized movement library or create custom entries on the fly.",
      "📊 **Dynamic Analytics**: View interactive charts detailing consistency, muscle group distributions, and weight forecasts.",
      "🌸 **Women's Health Integration**: Calendar synchronization mapping menstrual cycle phases to tailored cardiorespiratory and strength training intensities.",
      "🥗 **Personalized Nutrition**: Complete high-protein meal blueprints customized for lactose/gluten sensitivities and major therapeutic targets (PCOS, IBS, Diabetes, Thyroid)."
    ]
  },
  {
    id: "signing-in",
    category: "getting-started",
    title: "How to Access & Sign In",
    icon: "🔑",
    summary: "Secure and frictionless access utilizing Google Connected OAuth or standard Email & Password credentials.",
    details: [
      "🌐 **Google OAuth (Recommended)**: Single-click instant sync. Safely maps your email and display name via Google Secure Core.",
      "✉️ **Standalone Credentials**: Secure local registry. Enter your email and a strong password to spin up a private database partition.",
      "⚠️ **Production Note (Free-Tier API Cold Start)**: In order to keep hosting 100% free, our API backend goes to sleep after 15 minutes of inactivity. When logging in for the very first time after a break, you may experience a brief authentication delay or a minor redirect back as our servers wake up. Once awake, the app operates instantly!"
    ]
  },
  {
    id: "logging-workouts",
    category: "key-features",
    title: "Recording Workouts & Dumbbell Weights",
    icon: "🏋️",
    summary: "Record physical milestones with a highly visual, 3D interactive layout.",
    details: [
      "🎯 **Browse Categories**: Filter standard exercises across Gym, Calisthenics, Weight Lifting, Cardio, Yoga, and Pilates.",
      "🔄 **3D Card Flip**: Click 'Record Workout' on any exercise card. The card will perform a hardware-accelerated 3D flip revealing a clean logging form.",
      "💾 **Save Metrics**: Log the duration in minutes, worked weights in kg, and custom sets/reps in the notes field.",
      "🌸 **Menstrual Adjustment**: Enable Period Tracking in your settings to view cycle-phase banners. During high-fatigue phases, toggle 'Trained Lighter' to automatically mark adjusted loads."
    ]
  },
  {
    id: "nutrition-planner",
    category: "key-features",
    title: "Clinical Subtypes & Indian Protein Diets",
    icon: "🥗",
    summary: "Tailor your nutrition to your body's specific metabolic and clinical requirements.",
    details: [
      "🩺 **Past Diseases & Clinical Subtypes**: Check the 'Medical History' box in your profile to unlock custom plans. We support deep clinical subtypes (e.g. Insulin-Resistant/Inflammatory PCOS, Hypo/Hyperthyroidism, IBS-C/D/M) to remove unnecessary health hassles.",
      "🥗 **Indian High-Protein Generator**: Toggle 'Diet Customizer' to receive tailored Vegetarian, Vegan, or Non-Vegetarian high-protein Indian meal logs based on your daily calorie budget.",
      "🥛 **Sensitivity Filters**: Instantly trigger Lactose-Free or Gluten-Free variations across all meals.",
      "📋 **Instant Sharing**: Click 'Copy Plan' to format your complete therapeutic diet into clean markdown, perfect for sharing with your nutritionist or printing out."
    ]
  },
  {
    id: "privacy",
    category: "privacy-security",
    title: "Privacy, Data, & Secure Encryption",
    icon: "🛡️",
    summary: "We prioritize your data security. Your physical and physiological metrics are private and protected.",
    details: [
      "🔐 **Hash Encryption**: All account passwords are encrypted using state-of-the-art cryptographic hashing before entering our database.",
      "🍪 **Secure JWT Sessions**: NextAuth generates temporary encrypted JSON Web Tokens (JWTs) stored inside your browser cookies, shielding you from session intercepts.",
      "💾 **Local Personalization**: Selected dietary preferences, subtypes, and active tabs are cached locally in your browser storage (`localStorage`) to avoid loading delays.",
      "🚫 **Zero Data Selling**: Your physical weights, cycle logs, and notes are never shared with external aggregators or third parties."
    ]
  },
  {
    id: "faq-login",
    category: "faqs",
    title: "FAQ: Why did my first sign-in redirect back to login?",
    icon: "❓",
    summary: "An explanation of the temporary production authentication redirect loop.",
    details: [
      "⏰ **The Cause**: Our production API server is hosted on a free tier which hibernates to conserve energy. Waking the server up on your very first login attempt can take up to 45 seconds, which exceeds the browser's initial NextAuth cookie sync threshold.",
      "✨ **The Solution**: Simply click 'Sign in with Google' again! Waking up the server is a one-time event. Once awake, your session will commit immediately and keep you logged in seamlessly.",
      "📈 **Future Improvement**: We have active designs to integrate a serverless KeyDB caching layer and automated ping keep-alives to eliminate cold-start delays completely in our next release."
    ]
  },
  {
    id: "faq-phone",
    category: "faqs",
    title: "FAQ: Can I use FitSaaS on my mobile phone?",
    icon: "📱",
    summary: "Yes! FitSaaS is fully responsive and supports standalone Progressive Web App (PWA) installation.",
    details: [
      "📲 **How to Install**: Open FitSaaS on your mobile browser (Safari on iOS or Chrome on Android). Tap 'Share' or the menu button, and select 'Add to Home Screen'.",
      "🏃 **Benefits**: The app will launch in full-screen mode, removing browser navigation bars for a native application feel and faster load speeds."
    ]
  }
];

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("about-fitsaas");

  const filteredDocs = DOCS_DATABASE.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.details.some((d) => d.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = activeCategory === "all" || doc.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#030712] text-white px-4 py-8 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background kinetic decorations */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-teal-500/[0.03] blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto space-y-8">
        {/* Header Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-black text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.25)]">
              F
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">FitSaaS</h1>
              <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Product Documentation</p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.06] active:scale-[0.98] px-4 text-xs font-bold text-emerald-400 transition-all cursor-pointer"
          >
            ← Return to Dashboard
          </Link>
        </div>

        {/* Hero Section */}
        <div className="text-center space-y-3 py-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
            Welcome to the FitSaaS Deck
          </h2>
          <p className="text-sm text-white/50 max-w-xl mx-auto leading-relaxed">
            Everything you need to know about setting up your account, recording exercises, customizing clinical nutrition, and protecting your data privacy.
          </p>
        </div>

        {/* Live Search Bar */}
        <div className="relative max-w-lg mx-auto">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/30">
            🔍
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides, key features, FAQs..."
            className="w-full h-12 pl-11 pr-4 rounded-2xl border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl text-white placeholder:text-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-4 flex items-center text-xs text-white/40 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex justify-center gap-2 overflow-x-auto pb-1 max-w-full">
          {[
            { id: "all", label: "All Topics" },
            { id: "getting-started", label: "Getting Started" },
            { id: "key-features", label: "Key Features" },
            { id: "privacy-security", label: "Privacy & Data" },
            { id: "faqs", label: "FAQs" }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setActiveCategory(cat.id);
                setExpandedId(null);
              }}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                activeCategory === cat.id
                  ? "bg-emerald-400/10 border-emerald-400/40 text-emerald-400 shadow-sm"
                  : "bg-white/[0.02] border-white/[0.06] text-white/60 hover:text-white hover:border-white/[0.12]"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Documentation Content Accordions */}
        <div className="space-y-4">
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const isExpanded = expandedId === doc.id;
              return (
                <article
                  key={doc.id}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden bg-zinc-950/20 backdrop-blur-xl ${
                    isExpanded
                      ? "border-emerald-400/30 shadow-[0_0_30px_rgba(52,211,153,0.05)]"
                      : "border-white/[0.06] hover:border-white/[0.12] hover:bg-zinc-950/30"
                  }`}
                >
                  {/* Accordion Trigger */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                    className="w-full text-left p-5 flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                  >
                    <div className="flex gap-4 items-start">
                      <span className="text-2xl shrink-0 bg-white/[0.03] w-12 h-12 rounded-xl flex items-center justify-center border border-white/[0.06]">
                        {doc.icon}
                      </span>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white transition-colors group-hover:text-emerald-400">
                          {doc.title}
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed max-w-[550px]">
                          {doc.summary}
                        </p>
                      </div>
                    </div>
                    <span className={`text-sm text-white/30 transform transition-transform duration-300 shrink-0 mt-3 ${
                      isExpanded ? "rotate-180 text-emerald-400" : ""
                    }`}>
                      ▼
                    </span>
                  </button>

                  {/* Accordion Content Details */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-1 border-t border-white/[0.04] bg-white/[0.01] animate-in fade-in duration-300">
                      <ul className="space-y-4 mt-3">
                        {doc.details.map((detail, index) => {
                          // Parse markdown bullet styling slightly
                          const hasBold = detail.includes("**");
                          let renderedText = detail;
                          if (hasBold) {
                            const parts = detail.split("**");
                            renderedText = parts.map((part, idx) => 
                              idx % 2 === 1 ? <strong key={idx} className="text-emerald-400 font-extrabold">{part}</strong> : part
                            ) as any;
                          }
                          return (
                            <li
                              key={index}
                              className="text-xs text-white/70 leading-relaxed pl-4 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-emerald-400/40"
                            >
                              {renderedText}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })
          ) : (
            <div className="text-center py-12 border border-dashed border-white/[0.08] rounded-2xl">
              <span className="text-3xl">🔍</span>
              <h3 className="mt-4 text-sm font-bold">No documentation found</h3>
              <p className="mt-1 text-xs text-white/40">Try searching for keywords like 'Google', 'PCOS', 'IBS', or 'PWA'.</p>
            </div>
          )}
        </div>

        {/* Future Milestones Section */}
        <div className="rounded-3xl border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2.5 border-b border-white/[0.08] pb-3">
            <span className="text-2xl">🔮</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">Future Roadmap & Milestones</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-1">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                KeyDB Caching Layer
              </h4>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Integrating a serverless KeyDB layer in our next major release to cache active sessions, user parameters, and aggregate statistics. This will eliminate database latency and keep dashboard load speeds under 100ms.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl border border-white/[0.04] bg-white/[0.01] space-y-1">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Community & Shared Plans
              </h4>
              <p className="text-[11px] text-white/50 leading-relaxed">
                Unlock shared workout plans, community challenges, and active partner syncs to let users compete, follow custom routines, and share logs.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] uppercase tracking-wider text-white/20 pb-4">
          FitSaaS Ecosystem • Built for Simplified Training Calibration
        </p>
      </div>
    </main>
  );
}
