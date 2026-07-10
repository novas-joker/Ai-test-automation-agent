import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", connected: false }, { status: 401 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(`gh_token_${userId}`)?.value;

    if (!token) {
        const response = NextResponse.json({ connected: false }, { status: 200 });
        // Prevent caching of auth endpoints
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    try {
        // Validate token by fetching user data
        const res = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/vnd.github+json",
            },
        });

        // If token is invalid/expired, return not connected
        if (!res.ok) {
            const cookieStore = await cookies();
            cookieStore.delete(`gh_token_${userId}`);
            const response = NextResponse.json({ connected: false }, { status: 200 });
            response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
            response.headers.set('Pragma', 'no-cache');
            response.headers.set('Expires', '0');
            return response;
        }

        const userData = await res.json();

        const response = NextResponse.json({
            connected: true,
            username: userData.login,
            avatarUrl: userData.avatar_url,
            profileUrl: userData.html_url,
        }, { status: 200 });
        
        // Prevent caching of auth endpoints
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    } catch (error) {
        console.error('GitHub user fetch error:', error);
        const response = NextResponse.json({ connected: false }, { status: 200 });
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }
}
