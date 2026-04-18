import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";
import { env } from "../config/env.js";

const sql = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false,
  // Allow more time before surfacing connectivity errors on slower networks.
  connect_timeout: 15,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(sql, { schema });
export type DbClient = typeof db;
export { sql };
