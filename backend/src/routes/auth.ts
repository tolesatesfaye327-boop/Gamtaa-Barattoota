import express, { Router, Request, Response } from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { User } from "../models/User.js";
import { authenticate } from "../middleware/auth.js";

const router: Router = express.Router();

// Register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Validation
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user (always student by default; roles set by superadmin)
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "student",
    });

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: (process.env.JWT_EXPIRE ||
          "7d") as jwt.SignOptions["expiresIn"],
      },
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed", error });
  }
});

// Login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check password
    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET || "secret",
      {
        expiresIn: (process.env.JWT_EXPIRE ||
          "7d") as jwt.SignOptions["expiresIn"],
      },
    );

    res.json({
      message: "Login successful",
      token,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error });
  }
});

// Forgot password
router.post("/forgot-password", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.json({ message: "If the email exists, a reset link will be sent" });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    // TODO: Send reset token via email in production
    // user.resetToken = resetToken;
    // user.resetTokenExpiry = Date.now() + 3600000;
    // await user.save();

    res.json({
      message: "If the email exists, a reset link will be sent",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to process request", error });
  }
});

// Update profile
router.patch("/profile", authenticate, async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } =
      req.body;
    const user = await User.findById(req.userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;

    if (currentPassword && newPassword) {
      const isValid = await bcryptjs.compare(currentPassword, user.password);
      if (!isValid) {
        res.status(400).json({ message: "Current password is incorrect" });
        return;
      }
      user.password = await bcryptjs.hash(newPassword, 10);
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ message: "Failed to update profile", error });
  }
});

// Get current user
router.get("/me", authenticate, async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.json(user.toJSON());
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
});

// Refresh token (issues new JWT with current DB role)
router.post(
  "/refresh-token",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET || "secret",
        {
          expiresIn: (process.env.JWT_EXPIRE ||
            "7d") as jwt.SignOptions["expiresIn"],
        },
      );

      res.json({ token, user: user.toJSON() });
    } catch (error) {
      res.status(500).json({ message: "Failed to refresh token", error });
    }
  },
);

export default router;
