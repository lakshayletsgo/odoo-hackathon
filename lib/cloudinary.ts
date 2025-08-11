import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (fileData: string): Promise<string> => {
  try {
    const result = await cloudinary.uploader.upload(fileData, {
      folder: "profile-pictures",
      transformation: [
        { width: 300, height: 300, crop: "fill" },
        { quality: "auto" },
        { format: "webp" },
      ],
    });

    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
};

// Legacy function for backward compatibility
export const uploadImage = uploadToCloudinary;
export { cloudinary };
export default cloudinary;
