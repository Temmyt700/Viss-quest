import { count } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema/index.js";

export const generateReferenceId = async () => {
  const [{ total }] = await db.select({ total: count() }).from(users);
  return `VQ${String(total + 1).padStart(3, "0")}`;
};
