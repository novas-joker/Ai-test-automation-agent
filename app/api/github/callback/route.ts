import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const code = req.nextUrl.searchParams.get('code');
    const state = req.nextUrl.searchParams.get('state');
    const cookieStore = await cookies();
    const savedState = cookieStore.get("github_oauth_state")?.value;

    if (!state || state !== savedState) {
        return NextResponse.redirect(new URL(`/workspace?error=invalid_state`, req.url))
    }

    if (!code) {
        return NextResponse.redirect(new URL(`/workspace?error=missing_code`, req.url))
    }
    const res = await fetch('https://github.com/login/oauth/access_token',
        {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                Accept: 'application/json'
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID!,
                client_secret: process.env.GITHUB_CLIENT_SECRET!,
                code
            })
        })

    const data = await res.json();
    const token = data.access_token;

    if (!token) {
        return NextResponse.redirect(new URL(`/workspace?error=token_exchange-failed`, req.url))
    }

    const response = NextResponse.redirect(new URL('/workspace', req.url))

    //store token in http-only cookie
    response.cookies.set('gh_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: '/',
        sameSite: 'lax'
    });

    // Clear state cookie
    response.cookies.delete("github_oauth_state");
    return response;
}