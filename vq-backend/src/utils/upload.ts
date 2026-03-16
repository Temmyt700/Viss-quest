import { Readable } from "node:stream";
import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary.js";

export const uploadBufferToCloudinary = async (
  buffer: Buffer,
  folder: string,
  resourceType: "image" | "raw" = "image",
) =>
  new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: resourceType,
        ...(resourceType === "image"
          ? {
              transformation: [
                {
                  quality: "auto:good",
                  fetch_format: "auto",
                  width: 1600,
                  crop: "limit",
                },
              ],
            }
          : {}),
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Upload failed."));
          return;
        }

        resolve(result);
      },
    );

    Readable.from(buffer).pipe(stream);
  });

export const destroyCloudinaryAsset = async (publicId?: string | null, resourceType: "image" | "raw" = "image") => {
  if (!publicId) {
    return;
  }

  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
};
