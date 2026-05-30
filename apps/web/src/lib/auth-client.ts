import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXTAUTH_URL || "http://localhost:3000",
});

export function useSession(options?: { required?: boolean; onUnauthenticated?: () => void }) {
  const { data, isPending, error, refetch } = authClient.useSession();
  
  const status = isPending 
    ? "loading" 
    : data 
      ? "authenticated" 
      : "unauthenticated";
      
  // Handle NextAuth-style automatic unauthenticated redirection
  if (status === "unauthenticated" && options?.required) {
    if (options.onUnauthenticated) {
      options.onUnauthenticated();
    } else if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
      
  return {
    data: data ? {
      ...data,
      expires: data.session.expiresAt ? new Date(data.session.expiresAt).toISOString() : "",
      appToken: (data as any).appToken || "",
      user: data.user,
    } : null,
    status,
    isPending,
    error,
    update: async (newData?: any) => {
      console.log("[Better-Auth Client Bridge] Session update triggered. Refetching active session...");
      await refetch();
      return null;
    }
  };
}

export async function signIn(provider: string, options?: any) {
  console.log(`[Better-Auth Client Bridge] signIn triggered for provider: ${provider}`);
  if (provider === "credentials") {
    try {
      const res = await authClient.signIn.email({
        email: options.email,
        password: options.password,
      });
      if (res?.error) {
        return { ok: false, error: res.error.message || "Invalid credentials", status: 401, url: null };
      }
      return { ok: true, error: null, status: 200, url: options?.callbackUrl || "/dashboard" };
    } catch (err: any) {
      return { ok: false, error: err.message || "Invalid credentials", status: 500, url: null };
    }
  } else if (provider === "google") {
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: options?.callbackUrl || "/dashboard",
      });
      return { ok: true, error: null, status: 200, url: options?.callbackUrl || "/dashboard" };
    } catch (err: any) {
      return { ok: false, error: err.message || "Google auth failed", status: 500, url: null };
    }
  }
  return { ok: false, error: `Unsupported provider: ${provider}`, status: 400, url: null };
}

export async function signOut(options?: { callbackUrl?: string }) {
  console.log(`[Better-Auth Client Bridge] signOut triggered`);
  await authClient.signOut();
  if (options?.callbackUrl) {
    window.location.href = options.callbackUrl;
  } else {
    window.location.href = "/login";
  }
}
