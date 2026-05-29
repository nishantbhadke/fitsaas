"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

function SessionControl() {
  const { data: session, status } = useSession();
  const [isSyncing, setIsSyncing] = useState(false);

  // 1. Redeployment Auto-Logout Detection
  useEffect(() => {
    if (status === "authenticated") {
      const currentBuildTime = process.env.NEXT_PUBLIC_BUILD_TIME;
      if (currentBuildTime) {
        const storedBuildTime = localStorage.getItem("fitsaas_last_build_time");
        if (storedBuildTime && storedBuildTime !== currentBuildTime) {
          // New build deployed! Clear storage and force logout
          localStorage.removeItem("fitsaas_last_build_time");
          signOut({ callbackUrl: "/login" });
        } else {
          localStorage.setItem("fitsaas_last_build_time", currentBuildTime);
        }
      }
    }
  }, [status]);

  // 2. 2-Minute Inactivity Auto-Logout
  useEffect(() => {
    if (status !== "authenticated") return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      // 2 minutes = 120,000 milliseconds
      timeoutId = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, 120000);
    };

    // Events to monitor for activity
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    // Initialize timer
    resetTimer();

    // Add listeners
    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Cleanup
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [status]);

  // 3. Backend Auth Token Missing Guard (Failed Sync or server down)
  useEffect(() => {
    console.log(`[SessionControl Trace] status: "${status}" | session exists: ${!!session} | appToken exists: ${!!session?.appToken}`);
    if (session) {
      console.log(`[SessionControl Trace] session detail JSON: ${JSON.stringify({
        expires: session.expires,
        hasAppToken: !!(session as any).appToken,
        user: session.user,
      }, null, 2)}`);
    }

    if (status === "authenticated" && !session?.appToken) {
      setIsSyncing(true);
      console.warn(`[SessionControl Warn] Authenticated in NextAuth, but Fastify appToken is missing! Session:`, session);
      // Allow a brief grace period (10 seconds) for session token synchronization to resolve.
      // This prevents race conditions on first-time login where status becomes "authenticated"
      // while the backend database synchronization callback is still in progress.
      const timer = setTimeout(() => {
        if (!session?.appToken) {
          console.error("[SessionControl Error] appToken remained missing after 10-second grace period! Triggering clean auto-logout.");
          setIsSyncing(false);
          signOut({ callbackUrl: "/login?error=sync_failed" });
        }
      }, 10000);

      return () => {
        clearTimeout(timer);
      };
    } else {
      setIsSyncing(false);
    }
  }, [session, status]);

  if (isSyncing) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#09090b]/80 backdrop-blur-md text-white select-none">
        <div className="flex flex-col items-center gap-6 max-w-sm px-6 text-center">
          {/* Animated Spinner with Pulsing Core */}
          <div className="relative flex items-center justify-center">
            <div className="w-14 h-14 rounded-full border-4 border-emerald-500/10 border-t-emerald-400 animate-spin duration-700" />
            <div className="absolute w-6 h-6 rounded-full bg-emerald-500/15 blur-sm animate-pulse" />
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-base font-bold tracking-tight text-white">Synchronizing Command Center</h3>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Establishing a secure connection and loading your fitness analytics. Please hold on a moment...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SessionControl />
      {children}
    </SessionProvider>
  );
}
