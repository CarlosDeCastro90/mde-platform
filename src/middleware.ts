import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  const isProtected = path.startsWith("/dashboard") || 
                      path.startsWith("/projects") || 
                      path.startsWith("/editor");

  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get("sb-access-token") ||
                request.cookies.getAll().find(c => c.name.includes("auth-token") || c.name.includes("access-token"));

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/editor/:path*"],
};