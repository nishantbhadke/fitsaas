import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Here we send the Google profile to our Fastify backend
        try {
          const res = await fetch("http://localhost:3001/auth/google", {
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
      }
      return token;
    },
    async session({ session, token }: any) {
      // Send properties to the client
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
