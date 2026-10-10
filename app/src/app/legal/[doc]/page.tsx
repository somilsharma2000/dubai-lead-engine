import { notFound } from 'next/navigation';
import Link from 'next/link';

const DOCS: Record<string, { title: string; updated: string; body: string }> = {
  terms: {
    title: 'Terms of Service',
    updated: '11 October 2026',
    body: `
## 1. Who we are
This platform ("the Service") is operated by Garuda Lead Engine ("we", "us"), providing AI-powered marketing, lead management and content tools for real estate professionals. By creating an account you agree to these terms.

## 2. The service we provide
- Content packages: editing of client-shot raw clips into reels, Shorts, carousels and tour edits. **We do not shoot video.** Clients supply their own footage.
- Software: lead CRM, WhatsApp-ready AI drafting, campaign pipeline, social growth toolkit, and reporting.
- A free sample (one edit or bot demo, delivered within 48 hours) may be offered. There is **no free trial** of paid plans.

## 3. Billing and plans
Plans are billed monthly in advance. Prices are shown on the Billing page at checkout. You may cancel any time; cancellation stops future renewals and takes effect at the end of the current paid month. No lock-in contracts.

## 4. Client responsibilities
- You own the footage and content you upload; you confirm you have the rights to use it.
- You are responsible for the accuracy of property details, prices, and any claim in the content we publish for you.
- You must comply with your local property-marketing rules (e.g. RERA permit numbers in Dubai/UAE, RERA registration in India, Fair Housing rules in the US). We provide a compliance reference inside the Social Growth toolkit, but the legal duty to comply is yours.

## 5. Acceptable use
No spam, unsolicited bulk messaging, misleading claims, discriminatory targeting, or unlawful content. We may suspend accounts that break these rules.

## 6. Data
Your workspace data belongs to you. You can export leads at any time and admins can download a full backup from Settings. See our Privacy Policy for how we handle personal data.

## 7. Liability
The Service is provided "as is". We are not liable for lost profits, lost deals, or indirect damages. Our total liability in any 12-month period is limited to the fees you paid in the prior 3 months. Nothing in these terms limits liability that cannot be limited by law.

## 8. Termination
You can close your account any time. We can suspend the Service for non-payment or breach of these terms, with notice where practical.

## 9. Contact
Questions about these terms? Reach us through the support channel inside the app.
`,
  },
  privacy: {
    title: 'Privacy Policy',
    updated: '11 October 2026',
    body: `
## 1. Plain-language summary
We collect the minimum data needed to run your workspace: your account details, the leads you record, and usage needed to operate the Service. We do not sell personal data. Ever.

## 2. Data we collect
- **Account data**: name, email, password (hashed), organization name and country.
- **Workspace data**: leads you or your public forms capture (name, phone, email, property interest, consent status), tasks, campaigns, messages.
- **Technical data**: session cookies for login, basic request logs for security and rate limiting.

## 3. How we use it
- To operate your workspace and show you your data.
- To send messages you approve through WhatsApp (only with recorded consent, which leads can withdraw; denied leads are blocked from messaging).
- To keep the Service secure (rate limiting, audit logs).

## 4. Where data lives
Application data is stored with our hosting and database providers. Owners and admins of a workspace can see that workspace's data; members see only what their role permits; other workspaces can never see yours.

## 5. Your rights
You may access, correct, export or delete your data:
- Leads: export any time (CSV) from the Leads page.
- Full workspace: admins can download a complete JSON backup from Settings.
- Account deletion: contact us and we will remove your workspace data within 30 days, except records we must keep for tax or legal reasons.

## 6. Marketing consent
Lead contacts recorded in the CRM are messaged only with their recorded consent. Any lead can be set to "consent denied", which hard-blocks all messaging.

## 7. Changes
If this policy changes materially, we will notify workspace owners inside the app before it takes effect.
`,
  },
  refund: {
    title: 'Refund & Cancellation Policy',
    updated: '11 October 2026',
    body: `
## 1. Monthly plans
- **Cancel any time.** Cancellation stops the next renewal; you keep access until the end of the paid month. No lock-in, no cancellation fees.
- Because work begins immediately (content editing, bot setup, campaign building), the current month is non-refundable once delivery has started.

## 2. Free sample
The free sample (one edit or bot demo in 48 hours) costs nothing and needs no payment details. If the sample is not delivered within 48 hours of receiving your raw material, you owe nothing for it — it stays free regardless.

## 3. If we cannot deliver
If we cannot deliver the month's committed work for reasons on our side (outage, non-delivery), you choose: a pro-rata refund of the undelivered portion, or the same value credited to the next month.

## 4. How to cancel or request a refund
Use the Billing page to switch or cancel your plan, or message us on WhatsApp. Refunds, where owed, are processed to the original payment method within 7-10 business days.

## 5. Disputes
Something feel wrong? Tell us first — we fix problems fast and fairly, in that order.
`,
  },
};

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const { doc } = await params;
  const d = DOCS[doc];
  if (!d) notFound();
  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="max-w-2xl mx-auto px-5 py-12">
        <div className="mb-8">
          <div className="text-amber-700 font-semibold tracking-wide text-xs uppercase">Garuda Lead Engine</div>
          <h1 className="text-3xl font-bold mt-1">{d.title}</h1>
          <p className="text-xs text-stone-500 mt-1">Last updated: {d.updated}</p>
        </div>
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
          {d.body.split('\n').filter(Boolean).map((line, i) =>
            line.startsWith('## ') ? (
              <h2 key={i} className="text-lg font-semibold mt-6 first:mt-0">{line.slice(3)}</h2>
            ) : (
              <p key={i} className="text-sm text-stone-700 mt-2 leading-relaxed">{line}</p>
            )
          )}
        </div>
        <div className="flex gap-4 mt-6 text-xs text-stone-500 justify-center flex-wrap">
          <Link href="/legal/terms" className="hover:text-amber-700 underline">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-amber-700 underline">Privacy</Link>
          <Link href="/legal/refund" className="hover:text-amber-700 underline">Refunds</Link>
          <Link href="/login" className="hover:text-amber-700 underline">Back to sign in</Link>
        </div>
      </div>
    </div>
  );
}
