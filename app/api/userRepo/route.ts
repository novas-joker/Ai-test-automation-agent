import { db } from "@/db";
import { Repositories } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    //@ts-ignore
    const { repoId, userId, name, fullName, private_, htmlUrl, description, language, owner, default_branch, githubUsername } = await req.json();

    if (userId !== authUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!repoId || isNaN(Number(repoId))) {
        return NextResponse.json({ error: "Invalid repoId" }, { status: 400 });
    }

    const result = await db.insert(Repositories).values({
        repoId: Number(repoId),
        userId: authUserId,
        name,
        fullName: fullName,
        private: private_ ? "true" : "false",
        htmlUrl: htmlUrl,
        description: description || "",
        language: language || "",
        defaultBranch: default_branch || "",
        owner,
        githubUsername: githubUsername || ""
    }).returning();
    return NextResponse.json(result[0]);
}

export async function GET(req: NextRequest) {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    if (!userId) {
        return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    if (userId !== authUserId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Try to get current GitHub username from token
    const cookieStore = await cookies();
    const token = cookieStore.get(`gh_token_${authUserId}`)?.value;
    
    let currentGithubUsername = null;
    if (token) {
        try {
            const userRes = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/vnd.github+json'
                }
            });
            
            // If token is invalid (401 or 403), clear it
            if (!userRes.ok) {
                const cookieStore = await cookies();
                cookieStore.delete(`gh_token_${authUserId}`);
                const response = NextResponse.json([]);
                response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                return response;
            }
            
            const userData = await userRes.json();
            currentGithubUsername = userData.login;
        } catch (error) {
            console.error('Failed to fetch current GitHub user:', error);
        }
    }

    // Filter repos by current GitHub username (if connected)
    // If not connected (no token), return empty array
    let result: any[] = [];
    
    if (currentGithubUsername) {
        result = await db.select().from(Repositories).where(
            and(
                eq(Repositories.userId, authUserId),
                eq(Repositories.githubUsername, currentGithubUsername)
            )
        );
    } else {
        // If no GitHub token or invalid token, return empty repos (user is disconnected)
        result = [];
    }

    const response = NextResponse.json(result);
    // Prevent caching of auth/user data endpoints
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
}