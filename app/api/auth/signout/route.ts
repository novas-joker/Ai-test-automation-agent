import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
    const { userId } = await auth();
    const cookieStore = await cookies();

    // Explicitly delete GitHub token
    cookieStore.delete('gh_token');
    cookieStore.delete('github_oauth_state');
    if (userId) {
        cookieStore.delete(`gh_token_${userId}`);
        cookieStore.delete(`github_oauth_state_${userId}`);
    }

    return NextResponse.json({
        success: true,
        message: "Signed out and GitHub token cleared"
    });
}
