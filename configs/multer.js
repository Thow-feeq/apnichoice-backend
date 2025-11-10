import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📁 Created uploads folder in configs/multer.js");
}

// Storage location
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// ✅ FINAL MULTER EXPORT WITH LIMITS
export const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024,  // ✅ 20MB per file
    files: 60                    // ✅ up to 60 images per request
  }
});
