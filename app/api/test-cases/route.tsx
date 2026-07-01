import {NextRequest, NextResponse} from 'next/server';
import {db, TestCasesTable} from "@/db";
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {

    const searchParams = new URL(req.url).searchParams;
    const repoId = searchParams.get('repoId');

    if(!repoId) {
        return NextResponse.json(
            {
                error: "Missing required field: repoId",
            },
            { status: 400 }
        );
    }

    const result = await db.select().from(TestCasesTable).where(eq(TestCasesTable.repoId, repoId));
    return NextResponse.json({ testCases: result });

}