import { desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { notifications } from "../../db/schema/index.js";

export const notificationsService = {
  async list(userId: string) {
    return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  },

  async create(input: { userId?: string; title: string; message: string; type?: string }) {
    const [notification] = await db.insert(notifications).values({
      userId: input.userId,
      title: input.title,
      message: input.message,
      type: input.type ?? "announcement",
    }).returning();

    return notification;
  },

  async markRead(notificationId: string, userId: string) {
    await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
    return { success: true };
  },
};
