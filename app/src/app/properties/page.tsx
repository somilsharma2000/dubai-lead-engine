import { prisma } from '@/server/db';
import { requireCtx } from '@/server/auth';
import { createPropertyAction } from '../actions';

export default async function Properties() {
  const ctx = await requireCtx();
  const properties = await prisma.property.findMany({ where: { orgId: ctx.org.id, status: 'ACTIVE' }, orderBy: { createdAt: 'desc' }, take: 100 });
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Properties</h1>
      <form action={createPropertyAction} className="card grid md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2"><label className="label">Title *</label><input name="title" required className="input" placeholder="e.g. Marina 2BR sea view" /></div>
        <div><label className="label">For</label><select name="intent" className="input"><option>SALE</option><option>RENT</option></select></div>
        <div><label className="label">Type</label><select name="type" className="input"><option>APARTMENT</option><option>VILLA</option><option>PLOT</option><option>OFFICE</option></select></div>
        <div><label className="label">Price</label><input name="price" type="number" min="0" className="input" /></div>
        <div><label className="label">Bedrooms</label><input name="bedrooms" type="number" min="0" className="input" /></div>
        <div><label className="label">City</label><input name="city" className="input" /></div>
        <div><label className="label">Area</label><input name="area" className="input" /></div>
        <button className="btn-gold text-xs md:col-span-4">Add property</button>
      </form>
      <div className="card !p-0 overflow-x-auto">
        {properties.length === 0 ? <div className="p-10 text-center text-sm text-zinc-500">No properties yet. Add your first listing.</div> : (
          <table className="w-full">
            <thead><tr><th className="th">Title</th><th className="th">For</th><th className="th">Type</th><th className="th">Price</th><th className="th">Beds</th><th className="th">City / Area</th></tr></thead>
            <tbody>
              {properties.map(p => (
                <tr key={p.id} className="hover:bg-zinc-50">
                  <td className="td font-medium">{p.title}</td><td className="td">{p.intent}</td><td className="td">{p.type}</td>
                  <td className="td">{p.price ? p.price.toLocaleString() : '—'}</td>
                  <td className="td">{p.bedrooms ?? '—'}</td>
                  <td className="td">{[p.city, p.area].filter(Boolean).join(' · ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
