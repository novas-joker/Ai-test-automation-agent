import {NextRequest, NextResponse} from 'next/server';
import {db, TestCasesTable} from "@/db";
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const searchParams = new URL(req.url).searchParams;
        const repoId = searchParams.get('repoId');
        const normalizedRepoId = String(repoId?.trim() ?? '');

        if (!normalizedRepoId) {
            return NextResponse.json(
                {
                    error: 'Missing required field: repoId',
                },
                { status: 400 }
            );
        }

        const result = await db
            .select()
            .from(TestCasesTable)
            .where(eq(TestCasesTable.repoId, normalizedRepoId));

        return NextResponse.json({ testCases: result });
    } catch (error: any) {
        console.error('Failed to load test cases:', error);
        return NextResponse.json(
            {
                error: error?.message || 'Failed to load test cases',
            },
            { status: 500 }
        );
    }
}