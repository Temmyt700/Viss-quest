import { and, gte, inArray } from "drizzle-orm";
import { db, sql } from "../db/client.js";
import { spinHistory, users } from "../db/schema/index.js";
import { getUtcDayStart } from "../utils/time.js";

const isProduction = process.env.NODE_ENV === "production";
const allowInProduction = process.env.ALLOW_TEST_SPIN_RESET === "true";

async function main() {
  if (isProduction && !allowInProduction) {
    throw new Error("Spin reset is blocked in production unless ALLOW_TEST_SPIN_RESET=true is provided.");
  }

  // This helper is intentionally script-only so test resets stay restricted to
  // trusted operators and do not become a normal user-facing feature.
  const filters = process.argv.slice(2);
  const todayStart = getUtcDayStart();
  const matchedUsers = filters.length
    ? await db.select({ id: users.id, email: users.email, referenceId: users.referenceId }).from(users).where(inArray(users.email, filters))
    : await db.select({ id: users.id, email: users.email, referenceId: users.referenceId }).from(users);

  if (!matchedUsers.length) {
    console.log("No matching users found for spin reset.");
    await sql.end({ timeout: 5 });
    return;
  }

  const userIds = matchedUsers.map((user) => user.id);
  const deletedRows = await db
    .delete(spinHistory)
    .where(and(inArray(spinHistory.userId, userIds), gte(spinHistory.spinDate, todayStart)))
    .returning({ userId: spinHistory.userId });

  console.log(`Reset today's spin usage for ${new Set(deletedRows.map((row) => row.userId)).size} user(s).`);
  matchedUsers.forEach((user) => {
    console.log(`- ${user.referenceId ?? "PENDING_REF"} (${user.email})`);
  });

  await sql.end({ timeout: 5 });
}

main().catch(async (error) => {
  console.error(error);
  await sql.end({ timeout: 5 });
  process.exit(1);
});
