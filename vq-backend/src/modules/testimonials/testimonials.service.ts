import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { testimonialImages, testimonials, users, winners } from "../../db/schema/index.js";
import { uploadBufferToCloudinary } from "../../utils/upload.js";

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
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [winner] = await db.select().from(winners).where(eq(winners.userId, userId)).limit(1);

    if (!user || !winner) {
      throw new Error("Only verified winners can submit testimonials.");
    }

    const [testimonial] = await db
      .insert(testimonials)
      .values({
        userId,
        referenceId: user.referenceId ?? "UNKNOWN",
        prizeTitle: input.prizeTitle,
        winningDate: new Date(input.winningDate),
        message: input.message,
      })
      .returning();

    for (const file of files.slice(0, 3)) {
      const upload = await uploadBufferToCloudinary(file.buffer, "vissquest/testimonials");
      await db.insert(testimonialImages).values({
        testimonialId: testimonial.id,
        imageUrl: upload.secure_url,
        imagePublicId: upload.public_id,
      });
    }

    return testimonial;
  },
};
