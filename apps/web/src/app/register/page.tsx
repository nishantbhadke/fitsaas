"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
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

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError(null);
    setSubmitting(true);

    try {
      // 1. Post to our Fastify backend registration endpoint
      const registerRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(registerData.error || "Failed to create account. Email may already be registered.");
        setSubmitting(false);
        return;
      }

      // 2. Automatically log them in after registration
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl: "/dashboard",
      });

      if (res?.error) {
        setError("Account created, but automatic sign in failed. Please sign in manually.");
        router.push("/login");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#121316] p-8 shadow-2xl shadow-black/50">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-400 text-base font-black text-zinc-950">F</div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">FitSaaS</div>
              <div className="text-xs uppercase tracking-[0.24em] text-white/40">Command Center</div>
            </div>
          </Link>
          <h2 className="mt-8 text-2xl font-bold tracking-tight text-white text-center">Create Account</h2>
          <p className="mt-2 text-sm text-white/60 text-center">Join FitSaaS and track your physical growth</p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nishant Bhadke"
              className="w-full h-[52px] px-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white/[0.06] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full h-[52px] px-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white/[0.06] transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full h-[52px] px-4 rounded-2xl border border-white/10 bg-white/[0.04] text-white text-sm placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 focus:bg-white/[0.06] transition-all"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full h-[52px] flex items-center justify-center rounded-2xl bg-emerald-400 text-sm font-black text-zinc-950 transition-all hover:opacity-90 disabled:opacity-50 mt-6"
          >
            {submitting ? "Creating account..." : "Register Free"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-xs font-semibold uppercase tracking-wider">
            <span className="bg-[#121316] px-3 text-white/40">Or continue with</span>
          </div>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full h-[52px] flex items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-bold text-white transition-all hover:bg-white/[0.08]"
        >
          <GoogleIcon />
          Sign up with Google
        </button>

        <p className="mt-8 text-center text-sm text-white/40">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-emerald-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
