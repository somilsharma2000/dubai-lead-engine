import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';
import { requirePerm } from '@/server/auth';
import { apiFail } from '@/server/api';

export async function GET(req: NextRequest) {
  try {
    const ctx = await requirePerm('leads.read');
    const where: any = { orgId: ctx.org.id, archivedAt: null };
    const sp = req.nextUrl.searchParams;
    if (sp.get('stage')) where.stage = sp.get('stage');
    const leads = await prisma.lead.findMany({ where, orderBy: { createdAt: 'desc' } });
    const esc = (v: any) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const cols = ['id','name','phone','email','source','city','country','intent','propertyType','budgetMin','budgetMax','stage','score','consent','createdAt'];
    const rows = leads.map(l => cols.map(c => esc((l as any)[c])).join(','));
    const csv = cols.join(',') + '\n' + rows.join('\n');
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="leads.csv"' } });
  } catch (e) { return apiFail(e); }
}
