'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/server/db';
import { getCtx, requirePerm, S, recordUsage } from '@/server/action-utils';


export async function createPropertyAction(fd: FormData) {
  const ctx = await requirePerm('properties.write');
  if (!S(fd, 'title')) return;
  await prisma.property.create({
    data: {
      orgId: ctx.org.id, title: S(fd, 'title')!, intent: S(fd, 'intent') || 'SALE',
      type: S(fd, 'type') || 'APARTMENT', price: S(fd, 'price') ? Number(S(fd, 'price')) : null,
      bedrooms: S(fd, 'bedrooms') ? Number(S(fd, 'bedrooms')) : null,
      bathrooms: S(fd, 'bathrooms') ? Number(S(fd, 'bathrooms')) : null,
      area: S(fd, 'area'), city: S(fd, 'city'), address: S(fd, 'address')
    }
  });
  revalidatePath('/properties');
}

