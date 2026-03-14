import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema/index.js";
import { env } from "../config/env.js";

const sql = postgres(env.DATABASE_URL, {
  max: 10,
  prepare: false,
});

export const db = drizzle(sql, { schema });
export type DbClient = typeof db;
export { sql };
