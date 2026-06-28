import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    const cookiStore = await cookies();
    const token = cookiStore.get('gh_token')?.value

    return NextResponse.json({ token: token })
}