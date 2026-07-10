import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function GET() {
    const state = crypto.randomBytes(16).toString("hex");
    const cookieStore = await cookies();
    cookieStore.set("github_oauth_state", state, {
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
    })
    redirect(`https://github.com/login/oauth/authorize?${params}`)
}