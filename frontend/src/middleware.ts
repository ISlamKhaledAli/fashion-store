import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("accessToken")?.value;

  if (!token) {
    console.log(`[Middleware] No access token found. Redirecting to login. Path: ${request.nextUrl.pathname}`);
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || "ISLam9003";
    const secret = new TextEncoder().encode(jwtSecret);
    const { payload } = await jwtVerify(token, secret);

    if (payload.role !== "ADMIN") {
      console.log(`[Middleware] User is not ADMIN (role: ${payload.role}). Redirecting to home.`);
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }

    console.log(`[Middleware] Access authorized for ADMIN user. Path: ${request.nextUrl.pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] JWT verification failed:", error);
    if (!process.env.JWT_SECRET) {
      console.warn("[Middleware] WARNING: JWT_SECRET environment variable is not defined in the frontend env. Fell back to default secret.");
    }
    
    // Redirect to login on token verification failure
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
