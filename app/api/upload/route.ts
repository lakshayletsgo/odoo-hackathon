import { v2 as cloudinary } from "cloudinary";
import { NextRequest, NextResponse } from "next/server";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      return new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              resource_type: "image",
              folder: "venues",
              transformation: [
                { width: 800, height: 600, crop: "fill" },
                { quality: "auto" },
                { format: "webp" },
              ],
            },
            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result?.secure_url);
              }
            }
          )
          .end(buffer);
      });
    });

    const uploadedUrls = await Promise.all(uploadPromises);

    return NextResponse.json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}
