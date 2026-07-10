import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { Repositories } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function GET() {
    const { userId: authUserId } = await auth();

    if (!authUserId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(`gh_token_${authUserId}`)?.value;

    if (!token) {
        return NextResponse.json({ error: 'Github token not found' }, { status: 401 })
    }

    // Fetch current GitHub user
    let currentGithubUsername = '';
    try {
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json'
            }
        });
        const userData = await userRes.json();
        currentGithubUsername = userData.login;

        // Auto-migrate: backfill githubUsername for existing repos with NULL value
        if (currentGithubUsername) {
            await db.update(Repositories)
                .set({ githubUsername: currentGithubUsername })
                .where(
                    and(
                        eq(Repositories.userId, authUserId),
                        isNull(Repositories.githubUsername)
                    )
                );
        }
    } catch (error) {
        console.error('Failed to fetch GitHub user:', error);
        return NextResponse.json({ error: 'Failed to fetch GitHub user' }, { status: 500 });
    }

    const allRepo = [];
    let page = 1;

    while (true) {
        const res = await fetch(`https://api.github.com/user/repos?per_page=100&page=${page}&sort=updated`, {
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json'
            }
        })
        const repos = await res.json();
        if (!repos.length) break;
        allRepo.push(...repos);
        page++;

    }
    return NextResponse.json(allRepo.map(r => ({
        id: r.id,
        name: r.name,
        full_name: r.full_name,
        private_: r.private,
        html_url: r.html_url,
        description: r.description,
        updated_at: r.updated_at,
        language: r.language,
        default_branch: r.default_branch,
        owner: r.owner.login,
        githubUsername: currentGithubUsername
    })));
}