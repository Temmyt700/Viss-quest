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
      { folder, resource_type: resourceType },
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
