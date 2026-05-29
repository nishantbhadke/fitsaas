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
        console.log(`[NextAuth API: authorize] 🚀 STARTING AUTHORIZE LIFECYCLE for email: ${credentials?.email}`);
        if (!credentials?.email || !credentials?.password) {
          console.warn(`[NextAuth API: authorize] ⚠️ Credentials validation failed: Missing email or password.`);
          return null;
        }
        try {
          const targetUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/auth/login`;
          console.log(`[NextAuth API: authorize] 🔍 Fetching backend credentials login from: ${targetUrl}`);
          
          const startTime = performance.now();
          const res = await fetch(targetUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          const endTime = performance.now();
          const latency = (endTime - startTime).toFixed(2);
          
          console.log(`[NextAuth API: authorize] ⚡ Backend responded in ${latency}ms with status: ${res.status}`);
          
          if (!res.ok) {
            const errText = await res.text().catch(() => "N/A");
            console.error(`[NextAuth API: authorize] ❌ Backend rejected credentials. Status: ${res.status}, Error: ${errText}`);
            return null;
          }

          const data = await res.json();
          if (data.token && data.user) {
            console.log(`[NextAuth API: authorize] ✅ Credentials accepted. Returning authorized user object: id=${data.user.id}, email=${data.user.email}`);
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              appToken: data.token,
              user: data.user,
            };
          } else {
            console.error(`[NextAuth API: authorize] ❌ Backend accepted login but response is missing token or user payload!`, data);
            return null;
          }
        } catch (error) {
          console.error("[NextAuth API: authorize] ❌ CRITICAL EXCEPTION during credentials authorize fetch:", error);
          return null;
        }
      }
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      console.log(`[NextAuth API: signIn callback] 🛡️ Triggered. Provider: ${account?.provider}, User: ${user?.email}`);
      return true;
    },
    async jwt({ token, user, account }) {
      console.log(`[NextAuth API: jwt callback] 🔄 Triggered. Account provider: ${account?.provider || "none (subsequent call)"}`);
      
      // Initial sign in
      if (account && user) {
        console.log(`[NextAuth API: jwt callback] 🆕 Initial sign-in detected. Provider: ${account.provider}`);
        if (account.provider === "google") {
          const startTime = performance.now();
          const requestBody = {
            email: user.email,
            name: user.name,
            image: user.image,
          };
          console.log(`[Google Sync Callback] 🚀 INITIATING BACKEND REQUEST:
Method: POST
URL: ${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/auth/google
Headers: { "Content-Type": "application/json" }
Body JSON: ${JSON.stringify(requestBody, null, 2)}`);

          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/auth/google`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(requestBody),
            });
            const endTime = performance.now();
            const latency = (endTime - startTime).toFixed(2);
            console.log(`[Google Sync Callback] ⚡ RESPONSE RECEIVED in ${latency}ms:
Status: ${res.status} ${res.statusText}`);

            if (!res.ok) {
              const errText = await res.text().catch(() => "N/A");
              console.error(`[Google Sync Callback] ❌ BACKEND RESPONSE ERROR:
Status Code: ${res.status}
Error Payload: ${errText}`);
              throw new Error("sync_failed");
            }

            const data = await res.json();
            console.log(`[Google Sync Callback] 📥 SUCCESSFUL SYNC PAYLOAD JSON:
${JSON.stringify(data, null, 2)}`);

            if (data.token) {
              token.appToken = data.token; // The Fastify JWT
              token.user = data.user;      // The Fastify User
              console.log(`[Google Sync Callback] ✅ Successfully assigned token.appToken and token.user in NextAuth JWT`);
            } else {
              console.error("[Google Sync Callback] ❌ Backend sync succeeded but token is missing in response JSON!");
              throw new Error("sync_failed");
            }
          } catch (error) {
            console.error("[Google Sync Callback] ❌ EXCEPTION during backend user sync fetch:", error);
            throw error;
          }
        } else if (account.provider === "credentials") {
          console.log(`[NextAuth API: jwt callback] 🔑 Credentials provider detected. Attaching token.appToken and token.user.`);
          token.appToken = (user as any).appToken;
          token.user = (user as any).user;
        }
      } else {
        console.log(`[NextAuth API: jwt callback] 🔄 Subsequent session check. token.appToken is: ${token.appToken ? "PRESENT" : "ABSENT"}`);
      }
      return token;
    },
    async session({ session, token }: any) {
      console.log(`[NextAuth API: session callback] 🛡️ Triggered. Session check from client. token.appToken: ${token.appToken ? "PRESENT" : "ABSENT"}`);
      if (token.appToken) {
        session.appToken = token.appToken;
        session.user = token.user;
        console.log(`[NextAuth API: session callback] ✅ successfully attached appToken and user payload to session.`);
      } else {
        console.warn(`[NextAuth API: session callback] ⚠️ Warning: token.appToken was missing in session callback!`);
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
