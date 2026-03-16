import { sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { users } from "../db/schema/index.js";

export const generateReferenceId = async () => {
  const [{ maxReferenceNumber }] = await db
    .select({
      maxReferenceNumber: sql<number>`
        coalesce(
          max(
            case
              when ${users.referenceId} is not null and ${users.referenceId} like 'VQ%'
              then cast(substring(${users.referenceId} from 3) as integer)
              else 0
            end
          ),
          0
        )
      `,
    })
    .from(users);

  return `VQ${String((maxReferenceNumber ?? 0) + 1).padStart(3, "0")}`;
};
