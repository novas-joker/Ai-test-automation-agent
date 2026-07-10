import { db } from "@/db";
import { users } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const user = await currentUser();

    if (!user || !user.id || !user.primaryEmailAddress?.emailAddress) {
        return NextResponse.json({ error: "Unauthorized or missing user details" }, { status: 401 });
    }

    try {
        const userResult = await db.select().from(users).where(
            eq(users.id, user.id)
        );

        if (userResult.length == 0) {
            const newUser = await db.insert(users).values({
                id: user.id,
                email: user.primaryEmailAddress.emailAddress,
                name: user.fullName ?? 'New User'
            }).onConflictDoUpdate({
                target: users.id,
                set: {
                    email: user.primaryEmailAddress.emailAddress,
                    name: user.fullName ?? 'New User'
                }
            }).returning()
            return NextResponse.json({ user: newUser[0] });
        }
        else {
            return NextResponse.json({ user: userResult[0] });
        }
    }
    catch (err) {
        console.log("Error creating user", err);
        return NextResponse.json({ error: "Failed to create new user" }, { status: 500 })

    }
}
