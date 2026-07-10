import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookiStore = await cookies();
    const token = cookiStore.get(`gh_token_${userId}`)?.value

    return NextResponse.json({ token: token })
}