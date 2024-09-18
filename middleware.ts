import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = await getToken({ req });
  const publicPaths =
    path === "/" || path === "/api/auth/signin" || path === "/protected";

  if (publicPaths && token) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl));
  }

  if (path === "/dashboard" && !token) {
    return NextResponse.redirect(new URL("/api/auth/signin", req.nextUrl));
  }

  if (!publicPaths && !token) {
    return NextResponse.redirect(new URL("/protected", req.nextUrl));
  }
}

export const config = {
  matcher: ["/api/auth/signin", "/dashboard", "/protected", "/"],
};
