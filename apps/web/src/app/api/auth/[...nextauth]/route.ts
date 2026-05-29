import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const data = await res.json();
          if (res.ok && data.token && data.user) {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              appToken: data.token,
              user: data.user,
            };
          }
          return null;
        } catch (error) {
          console.error("Credentials authorize error:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === "google") {
          const startTime = performance.now();
          console.log(`[Google Sync] 🚀 Initiating backend database synchronization for user: ${user.email} in jwt callback...`);
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/auth/google`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
                image: user.image,
              }),
            });
            const endTime = performance.now();
            const latency = (endTime - startTime).toFixed(2);
            console.log(`[Google Sync] ⚡ Backend responded in ${latency}ms with status: ${res.status}`);

            if (!res.ok) {
              console.error(`[Google Sync] ❌ Failed to sync Google user with backend. Status: ${res.status}`);
              throw new Error("sync_failed");
            }

            const data = await res.json();
            if (data.token) {
              token.appToken = data.token; // The Fastify JWT
              token.user = data.user;      // The Fastify User
              console.log(`[Google Sync] ✅ Successfully populated token.appToken and token.user in NextAuth JWT`);
            } else {
              console.error("[Google Sync] ❌ Backend sync succeeded but token is missing from response data");
              throw new Error("sync_failed");
            }
          } catch (error) {
            console.error("[Google Sync] ❌ Exception during backend user synchronization fetch:", error);
            throw error;
          }
        } else if (account.provider === "credentials") {
          token.appToken = (user as any).appToken;
          token.user = (user as any).user;
        }
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token.appToken) {
        session.appToken = token.appToken;
        session.user = token.user;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/login',
  },
});

export { handler as GET, handler as POST };
