import express, { Router, Request, Response } from "express";
import multer from "multer";
import { Gallery } from "../models/Gallery.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { galleryStorage } from "../config/cloudinary.js";

const router: Router = express.Router();

const ADMIN_ROLES = ["superadmin", "admin"];

// Configure multer with Cloudinary storage
const upload = multer({
  storage: galleryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Get all public galleries (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const galleries = await Gallery.find({ isPublic: true })
      .populate("uploadedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(galleries);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch galleries", error });
  }
});

// Get all galleries including private (admin only)
router.get(
  "/admin",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const galleries = await Gallery.find({})
        .populate("uploadedBy", "firstName lastName")
        .sort({ createdAt: -1 });

      res.json(galleries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch galleries", error });
    }
  },
);

// Get single gallery with images/videos
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const gallery = await Gallery.findById(req.params.id)
      .populate("uploadedBy", "firstName lastName")
      .populate("images.uploadedBy", "firstName lastName")
      .populate("videos.uploadedBy", "firstName lastName");

    if (!gallery) {
      res.status(404).json({ message: "Gallery not found" });
      return;
    }

    res.json(gallery);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch gallery", error });
  }
});

// Create gallery (admin only)
router.post(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const { title, description, type, coverImage, category } = req.body;

      const gallery = await Gallery.create({
        title,
        description,
        type,
        coverImage,
        category,
        uploadedBy: req.userId,
      });

      res
        .status(201)
        .json({ message: "Gallery created successfully", gallery });
    } catch (error) {
      res.status(500).json({ message: "Failed to create gallery", error });
    }
  },
);

// Upload photo to gallery (admin) - supports both file upload and URL
router.post(
  "/:id/images",
  authenticate,
  authorize(ADMIN_ROLES),
  upload.single("photo"),
  async (req: Request, res: Response) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (!gallery) {
        res.status(404).json({ message: "Gallery not found" });
        return;
      }

      let url: string;
      let caption: string = "";

      if (req.file) {
        // Cloudinary upload - get the secure URL
        url = (req.file as any).path; // Cloudinary provides secure_url in file.path
        caption = req.body.caption || "";
      } else {
        // URL input fallback
        url = req.body.url;
        caption = req.body.caption || "";
        if (!url) {
          res
            .status(400)
            .json({ message: "Please provide a photo file or image URL" });
          return;
        }
      }

      gallery.images.push({ url, caption, uploadedBy: req.userId as any });
      await gallery.save();

      res.json({ message: "Image added successfully", gallery });
    } catch (error) {
      res.status(500).json({ message: "Failed to add image", error });
    }
  },
);

// Upload multiple photos at once (admin)
router.post(
  "/:id/images/bulk",
  authenticate,
  authorize(ADMIN_ROLES),
  upload.array("photos", 20),
  async (req: Request, res: Response) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (!gallery) {
        res.status(404).json({ message: "Gallery not found" });
        return;
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ message: "No photo files provided" });
        return;
      }

      const captions = req.body.captions ? JSON.parse(req.body.captions) : [];

      files.forEach((file, index) => {
        // Cloudinary provides secure URL in file.path
        gallery.images.push({
          url: (file as any).path,
          caption: captions[index] || "",
          uploadedBy: req.userId as any,
        });
      });

      await gallery.save();
      res.json({
        message: `${files.length} image(s) added successfully`,
        gallery,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload images", error });
    }
  },
);

// Add video to gallery (admin)
router.post(
  "/:id/videos",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (!gallery) {
        res.status(404).json({ message: "Gallery not found" });
        return;
      }

      const { url, title } = req.body;
      gallery.videos.push({ url, title, uploadedBy: req.userId as any });
      await gallery.save();

      res.json({ message: "Video added successfully", gallery });
    } catch (error) {
      res.status(500).json({ message: "Failed to add video", error });
    }
  },
);

// Remove image from gallery (admin)
router.delete(
  "/:id/images/:imageId",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const gallery = await Gallery.findById(req.params.id);
      if (!gallery) {
        res.status(404).json({ message: "Gallery not found" });
        return;
      }

      gallery.images = gallery.images.filter(
        (img: any) => img._id.toString() !== req.params.imageId,
      );
      await gallery.save();

      res.json({ message: "Image removed successfully", gallery });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove image", error });
    }
  },
);

// Update gallery (admin)
router.patch(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const gallery = await Gallery.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
      });

      if (!gallery) {
        res.status(404).json({ message: "Gallery not found" });
        return;
      }

      res.json({ message: "Gallery updated successfully", gallery });
    } catch (error) {
      res.status(500).json({ message: "Failed to update gallery", error });
    }
  },
);

// Delete gallery (admin)
router.delete(
  "/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const gallery = await Gallery.findByIdAndDelete(req.params.id);

      if (!gallery) {
        res.status(404).json({ message: "Gallery not found" });
        return;
      }

      res.json({ message: "Gallery deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete gallery", error });
    }
  },
);

export default router;
