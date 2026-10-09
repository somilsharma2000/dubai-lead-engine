# Put the OS + client demo online — click by click (free)

Total time: ~15 minutes. The demo link you send to clients comes from this.

## What you need
- Your GitHub account (you already have it)
- 10 minutes at vercel.com

## Steps
1. Go to **vercel.com** → click **Sign Up** → choose **Continue with GitHub** → log in with your GitHub account → click **Authorize Vercel**.
2. On the Vercel home screen click **Add New → Project**.
3. Find **dubai-lead-engine** in the list → click **Import**. (If it's not in the list: click "Adjust GitHub App Permissions" and allow Vercel to see the repo, then refresh.)
4. On the configure screen:
   - Framework Preset: **Next.js** (it detects this itself)
   - Find **Root Directory** → click **Edit** → set it to **app** → Continue.
5. Before deploying, click the **Storage** tab (same screen):
   - Click **Create Database** (Neon Postgres) → keep the free/Basic plan → name it **growthos** → **Create**.
   - Vercel adds a `DATABASE_URL` setting automatically. That's the database.
6. Click **Environment Variables** tab (same screen) and add these two:
   - Key: `ADMIN_EMAILS` → Value: `somil@leadengine.com`
   - Key: `APP_URL` → Value: (leave — set after first deploy; see below)
7. Click **Deploy**. Wait 3-5 minutes. You get a link like `dubai-lead-engine.vercel.app` — that's your live OS.
8. Open the link. Click **▶ Try the live client demo** — the demo workspace loads itself automatically on first click.
9. Copy that link. That's what you send to clients: "Here's my system, click the demo."

## After first deploy (1 minute)
- In Vercel: your project → **Settings → Environment Variables** → add `APP_URL` = your link (like `https://dubai-lead-engine.vercel.app`) → **Redeploy** from the Deployments tab.
- To make your own admin account: open your link → **Create one** (signup) with the email you put in ADMIN_EMAILS. You become platform admin automatically.

## Your own domain (optional, later)
Buy a domain → Vercel → Settings → Domains → Add → follow the DNS steps shown.

## If the Storage tab doesn't offer a database
Backup plan: create a free database at **supabase.com** (New Project → wait ~2 min → Settings → Database → Connection string → copy it). Then in step 6 also add: Key `DATABASE_URL` → Value: the connection string you copied.

## Notes
- Free tier limits are generous (fine for a demo and first clients).
- Every `git push` to GitHub automatically updates the live site in ~2 minutes.
- Demo data is synthetic and clearly labelled. Real signups are separate.
