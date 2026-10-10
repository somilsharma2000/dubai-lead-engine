import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/db';
import { hashPassword, createSession, adminEmails, logAudit } from '@/server/auth';
import { seedDefaultWorkflows } from '@/server/workflow-engine';

const schema = z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(8),
  orgName: z.string().min(2), country: z.string().min(2).max(2), currency: z.string().min(3).max(3)
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const email = body.email.toLowerCase();
    if (await prisma.user.findUnique({ where: { email } })) {
      return NextResponse.json({ ok: false, error: 'An account with this email already exists.' }, { status: 409 });
    }
    let slug = body.orgName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'org';
    if (await prisma.organization.findUnique({ where: { slug } })) slug = slug + '-' + Math.random().toString(36).slice(2, 6);
    const user = await prisma.user.create({ data: {
      email, name: body.name, passwordHash: hashPassword(body.password),
      isPlatformAdmin: adminEmails().includes(email)
    }});
    const org = await prisma.organization.create({ data: { name: body.orgName, slug, country: body.country.toUpperCase(), currency: body.currency.toUpperCase() } });
    await prisma.membership.create({ data: { userId: user.id, orgId: org.id, role: 'OWNER' } });
    await seedDefaultWorkflows(org.id);
    await prisma.activity.create({ data: { orgId: org.id, userId: user.id, type: 'org.created', entity: 'Organization', entityId: org.id } });
    await logAudit(user.id, org.id, 'org.signup', org.slug);
    await createSession(user.id);
    return NextResponse.json({ ok: true, orgSlug: slug });
  } catch (e: any) {
    if (e instanceof z.ZodError) return NextResponse.json({ ok: false, error: 'Invalid input: ' + e.issues[0].message }, { status: 400 });
    return NextResponse.json({ ok: false, error: 'Signup failed: ' + e.message }, { status: 500 });
  }
}
