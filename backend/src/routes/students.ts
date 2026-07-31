import express, { Router, Request, Response } from "express";
import { Student } from "../models/Student.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = express.Router();

// Get all students (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch students", error });
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
