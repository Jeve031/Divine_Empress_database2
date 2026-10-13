import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

// Netlify / production ready:
// - Works with local Postgres AND hosted Postgres (Neon, Supabase, etc.)
// - Does NOT crash the build when DATABASE_URL is missing (Netlify build step)
// - Enables SSL automatically for hosted providers that require it
// - Uses a small pool suitable for serverless functions

const databaseUrl = process.env.DATABASE_URL;

function needsSSL(url: string | undefined): boolean {
  if (!url) return false;
  return (
    url.includes("sslmode=require") ||
    url.includes("neon.tech") ||
    url.includes("supabase.co") ||
    url.includes("render.com") ||
    process.env.PGSSLMODE === "require"
  );
}

const globalForDb = globalThis as typeof globalThis & {
  __divineEmpressPool?: Pool;
};

function getPool(): Pool {
  if (globalForDb.__divineEmpressPool) {
    return globalForDb.__divineEmpressPool;
  }

  // Fallback placeholder lets `next build` succeed on Netlify even if
  // DATABASE_URL isn't set at build time. Real queries will fail at
  // runtime with a clear error until you set DATABASE_URL in Netlify env vars.
  const connectionString =
    databaseUrl ?? "postgresql://postgres:postgres@localhost:5432/app_db";

  if (!databaseUrl) {
    console.warn(
      "[db] DATABASE_URL is not set — using placeholder. Set DATABASE_URL in your environment (Netlify: Site settings → Environment variables)."
    );
  }

  const pool = new Pool({
    connectionString,
    ssl: needsSSL(databaseUrl) ? { rejectUnauthorized: false } : undefined,
    // Serverless-friendly: Netlify Functions are short-lived
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  globalForDb.__divineEmpressPool = pool;
  return pool;
}

export const pool = getPool();
export const db = drizzle(pool);
