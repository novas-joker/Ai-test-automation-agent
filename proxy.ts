import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher(['/workspace(.*)'])

export default clerkMiddleware(async (auth, req) => {
  // Protect workspace routes
  if (isProtectedRoute(req)) await auth.protect();

  // Check if user is authenticated
  const { userId } = await auth();
  
  if (!userId) {
    // User is NOT authenticated - ensure GitHub token is cleared
    const response = NextResponse.next();
    
    // Explicitly delete GitHub-related cookies
    response.cookies.delete('gh_token');
    response.cookies.delete('github_oauth_state');
    
    // Add cache prevention headers for auth-related requests
    if (req.nextUrl.pathname.startsWith('/api/github') || 
        req.nextUrl.pathname.startsWith('/api/userRepo')) {
      response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
    }
    
    return response;
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
    // Always run for Clerk-specific frontend API routes
    '/__clerk/(.*)',
  ],
}
