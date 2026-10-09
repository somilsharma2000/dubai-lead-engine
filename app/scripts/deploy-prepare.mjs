import { readFileSync, writeFileSync } from 'fs';
// When deploying with a Postgres database (Neon/Supabase), switch the Prisma
// provider from SQLite to PostgreSQL. Local dev keeps SQLite untouched.
const url = process.env.DATABASE_URL || '';
if (url.startsWith('postgres')) {
  const p = 'prisma/schema.prisma';
  const s = readFileSync(p, 'utf8');
  if (s.includes('provider = "sqlite"')) {
    writeFileSync(p, s.replace('provider = "sqlite"', 'provider = "postgresql"'));
    console.log('DEPLOY: switched Prisma provider to PostgreSQL');
  } else {
    console.log('DEPLOY: provider already postgresql');
  }
} else {
  console.log('DEPLOY: local SQLite mode, no change');
}
