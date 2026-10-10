import { redirect } from 'next/navigation';
import { getCtx } from '@/server/auth';
export default async function Home() {
  const ctx = await getCtx();
  redirect(ctx ? '/dashboard' : '/login');
}
