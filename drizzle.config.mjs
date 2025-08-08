/** @type {import("drizzle-kit").Config} */
export default {
  schema: "./src/app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://postgres:123456.789@db.vwhijymzsudgidphygzj.supabase.co:5432/postgres",
  },
};
