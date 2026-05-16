import "next-auth";

declare module "next-auth" {
  interface Session {
    appToken?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    appToken?: string;
    user?: {
      id?: string;
      name?: string | null;
      email?: string | null;
    };
  }
}
