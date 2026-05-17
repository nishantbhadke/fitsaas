import { NextResponse, type NextRequest } from "next/server";

const canonicalHost = "fitsaas-web.vercel.app";

export function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.toLowerCase();

  if (
    host &&
    host !== canonicalHost &&
    host.endsWith(".vercel.app") &&
    !host.includes("localhost")
  ) {
    const url = request.nextUrl.clone();
    url.protocol = "https:";
    url.host = canonicalHost;
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
