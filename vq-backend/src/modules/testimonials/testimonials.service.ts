import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "../../db/client.js";
import { testimonialImages, testimonials, users, winners } from "../../db/schema/index.js";
import { destroyCloudinaryAsset, uploadBufferToCloudinary } from "../../utils/upload.js";

export const testimonialsService = {
  async list() {
    const items = await db.select().from(testimonials).orderBy(desc(testimonials.createdAt));
    const images = await db.select().from(testimonialImages);
    return items.map((item) => ({
      ...item,
      images: images.filter((image) => image.testimonialId === item.id),
    }));
  },

  async create(
    userId: string,
    input: { prizeTitle: string; winningDate: string; message: string },
    files: Express.Multer.File[] = [],
  ) {
    const [[user], announcedWins, existingTestimonials] = await Promise.all([
      db.select().from(users).where(eq(users.id, userId)).limit(1),
      db.select().from(winners).where(and(eq(winners.userId, userId), isNotNull(winners.announcedAt))),
      db.select().from(testimonials).where(eq(testimonials.userId, userId)),
    ]);

    if (!user || !announcedWins.length) {
      throw new Error("Only verified winners can submit testimonials.");
    }

    if (existingTestimonials.length >= announcedWins.length) {
      throw new Error("You have already submitted your testimonial for your current winnings.");
    }

    const uploadedAssets: { secure_url: string; public_id: string }[] = [];

    try {
      // Upload first, then commit the testimonial + image rows in one
      // database transaction so a failed image or DB write never leaves a
      // half-saved testimonial behind.
      for (const file of files.slice(0, 3)) {
        const upload = await uploadBufferToCloudinary(file.buffer, "vissquest/testimonials");
        uploadedAssets.push({
          secure_url: upload.secure_url,
          public_id: upload.public_id,
        });
      }

      return await db.transaction(async (tx) => {
        const [testimonial] = await tx
          .insert(testimonials)
          .values({
            userId,
            referenceId: user.referenceId ?? "UNKNOWN",
            prizeTitle: input.prizeTitle,
            winningDate: new Date(input.winningDate),
            message: input.message,
          })
          .returning();

        if (uploadedAssets.length) {
          await tx.insert(testimonialImages).values(
            uploadedAssets.map((asset) => ({
              testimonialId: testimonial.id,
              imageUrl: asset.secure_url,
              imagePublicId: asset.public_id,
            })),
          );
        }

        return testimonial;
      });
    } catch (error) {
      await Promise.allSettled(uploadedAssets.map((asset) => destroyCloudinaryAsset(asset.public_id, "image")));
      throw error;
    }
  },

  async update(
    testimonialId: string,
    actor: { id: string; role: string },
    input: Partial<{ prizeTitle: string; winningDate: string; message: string }>,
    files: Express.Multer.File[] = [],
  ) {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, testimonialId)).limit(1);
    if (!testimonial) {
      throw new Error("Testimonial not found.");
    }

    if (actor.role !== "admin" && testimonial.userId !== actor.id) {
      throw new Error("You are not allowed to edit this testimonial.");
    }

    const existingImages = await db.select().from(testimonialImages).where(eq(testimonialImages.testimonialId, testimonialId));
    const uploadedAssets: { secure_url: string; public_id: string }[] = [];

    try {
      // Replacement uploads are staged first. Existing assets are only
      // removed after the database transaction succeeds, which keeps edits
      // atomic from the user's point of view.
      for (const file of files.slice(0, 3)) {
        const upload = await uploadBufferToCloudinary(file.buffer, "vissquest/testimonials");
        uploadedAssets.push({
          secure_url: upload.secure_url,
          public_id: upload.public_id,
        });
      }

      const updated = await db.transaction(async (tx) => {
        if (uploadedAssets.length) {
          await tx.delete(testimonialImages).where(eq(testimonialImages.testimonialId, testimonialId));
          await tx.insert(testimonialImages).values(
            uploadedAssets.map((asset) => ({
              testimonialId,
              imageUrl: asset.secure_url,
              imagePublicId: asset.public_id,
            })),
          );
        }

        const [updatedRow] = await tx
          .update(testimonials)
          .set({
            prizeTitle: input.prizeTitle ?? testimonial.prizeTitle,
            winningDate: input.winningDate ? new Date(input.winningDate) : testimonial.winningDate,
            message: input.message ?? testimonial.message,
          })
          .where(eq(testimonials.id, testimonialId))
          .returning();

        return updatedRow;
      });

      if (uploadedAssets.length) {
        await Promise.allSettled(existingImages.map((image) => destroyCloudinaryAsset(image.imagePublicId, "image")));
      }

      return updated;
    } catch (error) {
      await Promise.allSettled(uploadedAssets.map((asset) => destroyCloudinaryAsset(asset.public_id, "image")));
      throw error;
    }
  },

  async remove(testimonialId: string, actor: { id: string; role: string }) {
    const [testimonial] = await db.select().from(testimonials).where(eq(testimonials.id, testimonialId)).limit(1);
    if (!testimonial) {
      throw new Error("Testimonial not found.");
    }

    if (actor.role !== "admin") {
      throw new Error("Only admins can delete testimonials.");
    }

    const images = await db.select().from(testimonialImages).where(eq(testimonialImages.testimonialId, testimonialId));
    await Promise.all(images.map((image) => destroyCloudinaryAsset(image.imagePublicId, "image")));
    await db.delete(testimonials).where(eq(testimonials.id, testimonialId));
    return { success: true };
  },
};
