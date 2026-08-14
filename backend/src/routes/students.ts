import express, { Router, Request, Response } from "express";
import multer from "multer";
import { Student } from "../models/Student.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { profileStorage } from "../config/cloudinary.js";

const router: Router = express.Router();

// Configure multer with Cloudinary profile storage
const upload = multer({
  storage: profileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Upload student profile image (authenticated)
router.post(
  "/upload-image",
  authenticate,
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "No image file provided" });
        return;
      }
      // Cloudinary provides secure URL in file.path
      const url = (req.file as any).path;
      res.json({ message: "Image uploaded successfully", url });
    } catch (error) {
      res.status(500).json({ message: "Failed to upload image", error });
    }
  },
);

// Get all students (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error });
  }
});

// Get current user's own student profile (authenticated)
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const student = await Student.findOne({ userId: req.userId });
    if (!student) {
      res.status(404).json({ message: "Student profile not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student profile", error });
  }
});

// Get student by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch student", error });
  }
});

// Create student (authenticated - admin/superadmin)
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      name,
      field,
      year,
      village,
      school,
      phone,
      email,
      telegram,
      entry,
      role,
      message,
      bio,
      image,
    } = req.body;

    // Prevent duplicate profiles: check if this user already has a student profile
    const existingStudent = await Student.findOne({ userId: req.userId });
    if (existingStudent) {
      // If a profile already exists, update it instead of creating a duplicate
      const updatedStudent = await Student.findByIdAndUpdate(
        existingStudent._id,
        {
          $set: {
            name,
            field,
            year,
            village,
            school,
            phone,
            email,
            telegram,
            entry,
            role,
            message,
            bio,
            image,
          },
        },
        { new: true },
      );
      res.status(200).json({
        message:
          "You already have a student profile. If you want, you can update it.",
        student: updatedStudent,
      });
      return;
    }

    // Check if another student with the same full name already exists
    const nameMatch = await Student.findOne({
      name: {
        $regex: new RegExp(
          `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i",
        ),
      },
    });
    if (nameMatch) {
      res.status(409).json({
        message:
          "You already have a student profile with this name. If you want, you can update it.",
        student: nameMatch,
      });
      return;
    }

    const student = await Student.create({
      userId: req.userId,
      name,
      field,
      year,
      village,
      school,
      phone,
      email,
      telegram,
      entry,
      role,
      message,
      bio,
      image,
    });

    res.status(201).json({ message: "Student created successfully", student });
  } catch (error) {
    res.status(500).json({ message: "Failed to create student", error });
  }
});

// Update student (owner student or superadmin)
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    const isAuthorized =
      req.userRole === "superadmin" ||
      req.userId === student.userId?.toString();

    if (!isAuthorized) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    // Apply updates directly via findByIdAndUpdate (most reliable approach)
    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true },
    );

    res.json({
      message: "Student updated successfully",
      student: updatedStudent,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update student", error });
  }
});

// Delete student (superadmin only)
router.delete(
  "/:id",
  authenticate,
  authorize(["superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const student = await Student.findByIdAndDelete(req.params.id);
      if (!student) {
        res.status(404).json({ message: "Student not found" });
        return;
      }
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete student", error });
    }
  },
);

// Seed initial students from static data (superadmin only)
router.post(
  "/seed",
  authenticate,
  authorize(["superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { students } = req.body;
      if (!Array.isArray(students) || students.length === 0) {
        res
          .status(400)
          .json({ message: "Please provide an array of students" });
        return;
      }

      // Clear existing and seed
      await Student.deleteMany({});
      const seeded = await Student.insertMany(students);
      res.status(201).json({
        message: `${seeded.length} students seeded successfully`,
        students: seeded,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to seed students", error });
    }
  },
);

export default router;
