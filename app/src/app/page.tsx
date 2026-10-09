import { redirect } from 'next/navigation';
import { getCtx } from '@/auth';
export default async function Home() {
  const ctx = await getCtx();
  redirect(ctx ? '/dashboard' : '/login');
}
