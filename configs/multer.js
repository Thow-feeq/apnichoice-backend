import { v2 as cloudinary } from "cloudinary";

export const uploadImage = async (req, res) => {
  try {
    const file = req.file;

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "apnichoice" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      stream.end(file.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};