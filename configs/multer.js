import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: "apnichoice",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
    transformation: [{ width: 1920, crop: "limit" }]
  })
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,
    files: 60
  }
});