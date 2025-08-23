import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// public paths that don't require auth
const publicPaths = [
  "/",
  "/auth/signin",
  "/auth/signup",
  "/auth/error",
  "/api/auth",
  "/api/register",
]

// protected paths that require auth
const protectedPaths = [
  "/dashboard",
  "/protected",
]

export default async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Allow public paths
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }
  
  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some((p) => pathname.startsWith(p))
  
  if (isProtectedPath) {
    const token = await getToken({ 
      req, 
      secureCookie: process.env.NODE_ENV === "production", 
      secret: process.env.NEXTAUTH_SECRET 
    })
    
    if (!token) {
      const url = new URL("/auth/signin", req.url)
      url.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search)
      return NextResponse.redirect(url)
    }
  }
  
  return NextResponse.next()
}

export const config = { 
  matcher: [
    "/dashboard/:path*",
    "/protected/:path*"
  ] 
}
