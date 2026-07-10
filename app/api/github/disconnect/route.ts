import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@clerk/nextjs/server";

export async function POST() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    cookieStore.delete(`gh_token_${userId}`);

    return NextResponse.json({ 
        message: "GitHub account disconnected successfully",
        success: true 
    });
}
