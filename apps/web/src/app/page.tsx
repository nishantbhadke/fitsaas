"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] text-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-emerald-400/80 animate-pulse">
          Connecting to command center...
        </p>
      </div>
    </main>
  );
}
