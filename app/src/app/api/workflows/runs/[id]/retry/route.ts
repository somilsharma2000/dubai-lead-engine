import { NextRequest, NextResponse } from 'next/server';
import { requirePerm } from '@/auth';
import { retryRun } from '@/workflow';

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await requirePerm('workflows.manage');
    const result = await retryRun(params.id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) { return NextResponse.json({ ok: false, error: e.message }, { status: 400 }); }
}
