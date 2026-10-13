import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // Works locally AND for Netlify: set DATABASE_URL to your Neon/Supabase URL
    // before running `npx drizzle-kit push`
    url: process.env.DATABASE_URL || "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
