import { eq, or } from "drizzle-orm";
import { db, sql } from "../db/client.js";
import { users } from "../db/schema/index.js";

const args = process.argv.slice(2);
const emailArg = args.find((arg) => arg.startsWith("--email="));
const referenceArg = args.find((arg) => arg.startsWith("--reference="));

const email = emailArg?.split("=")[1];
const referenceId = referenceArg?.split("=")[1];

if (!email && !referenceId) {
  console.error("Provide either --email=<user@email.com> or --reference=<VQ001>.");
  process.exit(1);
}

const condition = email && referenceId
  ? or(eq(users.email, email), eq(users.referenceId, referenceId))
  : email
    ? eq(users.email, email)
    : eq(users.referenceId, referenceId!);

const [updatedUser] = await db
  .update(users)
  .set({
    role: "admin",
    updatedAt: new Date(),
  })
  .where(condition)
  .returning({
    id: users.id,
    email: users.email,
    referenceId: users.referenceId,
    role: users.role,
  });

if (!updatedUser) {
  console.error("No matching user was found.");
  await sql.end({ timeout: 5 });
  process.exit(1);
}

console.log(`Promoted ${updatedUser.email} (${updatedUser.referenceId}) to admin.`);
await sql.end({ timeout: 5 });
