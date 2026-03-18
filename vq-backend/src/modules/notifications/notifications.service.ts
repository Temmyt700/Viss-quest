import { and, count, desc, eq, gte, isNull, or } from "drizzle-orm";
import { db } from "../../db/client.js";
import { notificationSettings, notifications, users } from "../../db/schema/index.js";

type NotificationSettingsRow = typeof notificationSettings.$inferSelect;

const defaultSettings = {
  fundingApproved: true,
  prizeWon: true,
  referralReward: true,
};

export const notificationsService = {
  async list(userId: string, { limit = 20, offset = 0 } = {}) {
    const [user] = await db.select({ createdAt: users.createdAt }).from(users).where(eq(users.id, userId)).limit(1);
    const visibilityFilter = or(
      eq(notifications.userId, userId),
      and(isNull(notifications.userId), user?.createdAt ? gte(notifications.createdAt, user.createdAt) : isNull(notifications.userId)),
    );

    const [items, [totalRow], [unreadRow]] = await Promise.all([
      db
        .select()
        .from(notifications)
        .where(visibilityFilter)
        .orderBy(desc(notifications.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(notifications).where(visibilityFilter),
      db
        .select({ total: count() })
        .from(notifications)
        .where(and(visibilityFilter, eq(notifications.isRead, false))),
    ]);

    const total = Number(totalRow?.total ?? 0);
    return {
      items,
      total,
      unreadCount: Number(unreadRow?.total ?? 0),
      hasMore: offset + items.length < total,
      nextOffset: offset + items.length,
    };
  },

  async getSettings(client: any = db): Promise<NotificationSettingsRow> {
    const [settings] = await client.select().from(notificationSettings).limit(1);
    if (settings) {
      return settings;
    }

    const [created] = await client
      .insert(notificationSettings)
      .values(defaultSettings)
      .returning();

    return created;
  },

  async updateSettings(input: Partial<typeof defaultSettings>) {
    const settings = await this.getSettings();
    const [updated] = await db
      .update(notificationSettings)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(notificationSettings.id, settings.id))
      .returning();

    return updated;
  },

  async isEventEnabled(eventKey: keyof typeof defaultSettings, client: any = db) {
    const settings = await this.getSettings(client);
    return Boolean(settings[eventKey]);
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

  async broadcast(input: { title: string; message: string; type?: string }) {
    // Fan broadcasts out to the users who exist at send time so read state and
    // badge counts remain user-specific, and new accounts do not inherit old announcements.
    const recipients = await db.select({ id: users.id }).from(users);
    if (!recipients.length) {
      return [];
    }

    return db.insert(notifications).values(
      recipients.map((recipient) => ({
        userId: recipient.id,
        title: input.title,
        message: input.message,
        type: input.type ?? "announcement",
      })),
    ).returning();
  },

  async markRead(notificationId: string, userId: string) {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, notificationId),
          or(eq(notifications.userId, userId), isNull(notifications.userId)),
        ),
      );
    return { success: true };
  },

  async markAllRead(userId: string) {
    // Mark both personal and broadcast notifications as read once the user
    // has viewed the notification center.
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(or(eq(notifications.userId, userId), isNull(notifications.userId)));

    return { success: true };
  },
};
