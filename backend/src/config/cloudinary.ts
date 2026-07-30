import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for gallery images
export const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "gbaabw/gallery",
      allowed_formats: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"],
      transformation: [{ width: 1920, height: 1080, crop: "limit" }],
      public_id: `gallery-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// Cloudinary storage for profile images
export const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "gbaabw/profiles",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [
        { width: 500, height: 500, crop: "fill", gravity: "face" },
      ],
      public_id: `profile-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// Cloudinary storage for documents/thumbnails
export const documentStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "gbaabw/documents",
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      public_id: `doc-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

// Cloudinary storage for payment receipt screenshots
export const paymentReceiptStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    return {
      folder: "gbaabw/payment-receipts",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "gif", "pdf"],
      transformation: [{ width: 2000, height: 2000, crop: "limit" }],
      public_id: `receipt-${Date.now()}-${Math.round(Math.random() * 1e9)}`,
    };
  },
});

export default cloudinary;
