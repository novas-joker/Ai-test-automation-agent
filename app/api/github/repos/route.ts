import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('gh_token')?.value;

    if (!token) {
        return NextResponse.json({ error: 'Github token not found' }, { status: 401 })
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
        owner: r.owner.login
    })));
}