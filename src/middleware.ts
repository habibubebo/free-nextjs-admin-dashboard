import { NextRequest, NextResponse } from "next/server";
import { isPageAccessible } from "@/lib/roleUtils";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public pages that don't require authentication
  const publicPages = ["/instructor-login", "/signin", "/signup", "/login"];
  const isPublicPage = publicPages.some(page => pathname === page);

  // Get session cookie
  const sessionCookie = request.cookies.get("instructor_session");

  // If trying to access public page and already logged in, redirect to dashboard
  if (isPublicPage && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If trying to access protected page without session, redirect to login
  if (!isPublicPage && !sessionCookie) {
    return NextResponse.redirect(new URL("/instructor-login", request.url));
  }

  // If user is logged in, check role-based access
  if (sessionCookie && !isPublicPage) {
    try {
      const session = JSON.parse(sessionCookie.value);
      
      // Check if page is accessible for this role
      if (!isPageAccessible(session.role, pathname)) {
        // Redirect to dashboard if not accessible
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // Invalid session, redirect to login
      return NextResponse.redirect(new URL("/instructor-login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};