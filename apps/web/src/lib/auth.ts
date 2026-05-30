import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession } from "better-auth/plugins";
import dbPkg from "database";
const prisma = (dbPkg as any).prisma || dbPkg;
import jwt from "jsonwebtoken";
import crypto from "crypto";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  secret: process.env.BETTER_AUTH_SECRET || "fitsaas-super-secret-better-auth-key-default-123456",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password: string) => {
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
        return `${salt}:${hash}`;
      },
      verify: async ({ password, hash }) => {
        if (hash.includes(':')) {
          const [salt, originalHash] = hash.split(':');
          const calculatedHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
          return calculatedHash === originalHash;
        }
        return hash === password;
      }
    }
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    customSession(async ({ user, session }) => {
      // Sign a standard Fastify JWT token containing the user id and email
      const secret = process.env.JWT_SECRET || "supersecret";
      const appToken = jwt.sign(
        { id: user.id, email: user.email },
        secret
      );
      
      return {
        session: {
          ...session,
          appToken, // Dynamic property mapped directly to the session response!
        },
        user,
      };
    })
  ]
});
