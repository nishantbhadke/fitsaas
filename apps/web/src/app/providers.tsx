"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

function SessionControl() {
  const { data: session, status } = useSession();

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
    if (status === "authenticated" && !session?.appToken) {
      console.warn("Backend auth token is missing in session. Forcing clean signout.");
      signOut({ callbackUrl: "/login?error=sync_failed" });
    }
  }, [session, status]);

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
