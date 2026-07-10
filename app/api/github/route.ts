import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"
import { auth } from "@clerk/nextjs/server"

export async function GET(req: Request) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const state = crypto.randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set(`github_oauth_state_${userId}`, state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 10, // 10 minutes
        path: "/",
        sameSite: "lax",
    });

    const params = new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID!,
        redirect_uri: process.env.GITHUB_REDIRECT_URI!,
        scope: "repo read:user",
        state: state,
        prompt: "select_account", // Force GitHub to show account picker even if user is logged in
    })
    return NextResponse.redirect(`https://github.com/login/oauth/authorize?${params}`)
}