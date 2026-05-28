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
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/login`, {
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
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        if (account.provider === "google") {
          // Send Google profile to Fastify backend
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/google`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: user.email,
                name: user.name,
              }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
              token.appToken = data.token; // The Fastify JWT
              token.user = data.user;      // The Fastify User
            }
          } catch (error) {
            console.error("Failed to sync with backend:", error);
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
