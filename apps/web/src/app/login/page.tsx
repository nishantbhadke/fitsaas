"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

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

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const err = searchParams?.get("error");
    if (err) {
      if (err === "sync_failed") {
        setError("Backend synchronization failed. Please verify that the API server is online.");
      } else if (err === "SessionRequired" || err === "CredentialsSignin") {
        setError("Authentication session has expired. Please sign in again.");
      } else {
        setError("Sign in sync rejected by server. Please try again.");
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (res?.error) {
        setError("Invalid email or password.");
      } else {
        window.location.href = callbackUrl;
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center bg-[#030712] px-4 overflow-hidden text-white">
      {/* Dynamic Keyframe Animations Injection */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-slow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(30px, -50px) scale(1.15); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0px, 0px) scale(1.1); }
          50% { transform: translate(-40px, 40px) scale(0.9); }
        }
        @keyframes pulse-gentle {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.45; }
        }
        @keyframes orbit-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float-1 { animation: float-slow 20s infinite ease-in-out; }
        .animate-float-2 { animation: float-reverse 25s infinite ease-in-out; }
        .animate-pulse-slow { animation: pulse-gentle 8s infinite ease-in-out; }
        .animate-orbit { animation: orbit-slow 40s infinite linear; }
      `}} />

      {/* Kinetic Active Gym Vectors & glowing blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Glow blob 1 */}
        <div className="absolute top-[10%] left-[15%] w-80 h-80 rounded-full bg-emerald-500/10 blur-[100px] animate-float-1" />
        
        {/* Glow blob 2 */}
        <div className="absolute bottom-[10%] right-[15%] w-96 h-96 rounded-full bg-teal-500/10 blur-[120px] animate-float-2" />

        {/* Orbit Grid lines */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] animate-pulse-slow">
          <svg className="w-[800px] h-[800px] text-white" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1 3" />
            <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="0.1" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="24" fill="none" stroke="currentColor" strokeWidth="0.1" />
          </svg>
        </div>

        {/* Spinning Kinetic Dumbbell & Cycle lines */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.08] animate-orbit">
          <svg className="w-full h-full text-emerald-400" viewBox="0 0 200 200">
            {/* Dumbbell Icon Path Floating */}
            <path 
              d="M30,100 L170,100 M65,85 L65,115 M50,80 L50,120 M135,85 L135,115 M150,80 L150,120" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
            />
            {/* Run vector trail */}
            <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.75" strokeDasharray="5 15" />
          </svg>
        </div>
      </div>

      {/* Sleek Compact Glassmorphic Card Container */}
      <div className="relative z-10 w-full max-w-[390px] rounded-3xl border border-white/[0.08] bg-zinc-950/40 backdrop-blur-xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.8)] shadow-black/80">
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-sm font-black text-zinc-950 shadow-[0_0_20px_rgba(52,211,153,0.3)] group-hover:scale-105 transition-transform duration-300">
              F
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">FitSaaS</div>
              <div className="text-[9px] uppercase tracking-[0.28em] text-white/30">Command Center</div>
            </div>
          </Link>
          <h2 className="mt-6 text-xl font-bold tracking-tight text-white text-center">Welcome Back</h2>
          <p className="mt-1 text-xs text-white/50 text-center">Access your personalized training vault</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-center text-xs font-semibold text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full h-12 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white/[0.05] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-12 px-4 rounded-xl border border-white/[0.08] bg-white/[0.03] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white/[0.05] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-12 flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-xs font-black text-zinc-950 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-5 cursor-pointer shadow-[0_4px_20px_rgba(52,211,153,0.15)]"
          >
            {submitting ? "AUTHORIZING..." : "SIGN IN"}
          </button>
        </form>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/[0.06]"></div>
          </div>
          <div className="relative flex justify-center text-[9px] font-bold uppercase tracking-widest">
            <span className="bg-zinc-950/20 px-2 text-white/30 backdrop-blur-md">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full h-12 flex items-center justify-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs font-bold text-white transition-all hover:bg-white/[0.06] active:scale-[0.98] cursor-pointer"
        >
          <GoogleIcon />
          Sign in with Google
        </button>

        <p className="mt-6 text-center text-xs text-white/30">
          New to the training deck?{" "}
          <Link href="/register" className="font-bold text-emerald-400 hover:underline">
            Join for free
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#030712] px-4 text-white">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
