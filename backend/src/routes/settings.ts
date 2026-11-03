import express, { Router, Request, Response } from "express";
import { Settings } from "../models/Settings.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = express.Router();

// Get all settings (public - only returns non-sensitive settings)
router.get("/", async (req: Request, res: Response) => {
  try {
    const settings = await Settings.find();
    const settingsMap: Record<string, any> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });
    res.json(settingsMap);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch settings", error });
  }
});

// Get specific setting by key (public)
router.get("/:key", async (req: Request, res: Response) => {
  try {
    const setting = await Settings.findOne({ key: req.params.key });
    if (!setting) {
      res.status(404).json({ message: "Setting not found" });
      return;
    }
    res.json({ key: setting.key, value: setting.value });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch setting", error });
  }
});

// Update or create setting (superadmin only)
router.put(
  "/:key",
  authenticate,
  authorize(["superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { value, description } = req.body;

      const setting = await Settings.findOneAndUpdate(
        { key: req.params.key },
        {
          value,
          description,
          updatedBy: req.userId,
        },
        { new: true, upsert: true }
      );

      res.json({
        message: "Setting updated successfully",
        setting,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to update setting", error });
    }
  }
);

// Delete setting (superadmin only)
router.delete(
  "/:key",
  authenticate,
  authorize(["superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const setting = await Settings.findOneAndDelete({ key: req.params.key });
      if (!setting) {
        res.status(404).json({ message: "Setting not found" });
        return;
      }
      res.json({ message: "Setting deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete setting", error });
    }
  }
);

export default router;
