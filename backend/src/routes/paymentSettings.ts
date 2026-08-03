import express from "express";
import mongoose from "mongoose";
import { authenticate, authorize } from "../middleware/auth.js";
import {
  PaymentSettings,
  DEFAULT_PAYMENT_ACCOUNTS,
} from "../models/PaymentSettings.js";

const router = express.Router();

/**
 * GET /api/payment-settings
 * Public endpoint - get payment account details for users
 * Only returns enabled accounts
 */
router.get("/", async (req, res) => {
  try {
    let settings = await PaymentSettings.findOne();

    // If no settings exist, create default
    if (!settings) {
      settings = await PaymentSettings.create({
        accounts: DEFAULT_PAYMENT_ACCOUNTS,
      });
    }

    // Only return enabled accounts to users
    const enabledAccounts = settings.accounts.filter((acc) => acc.enabled);

    res.json({
      accounts: enabledAccounts,
    });
  } catch (error) {
    console.error("Error fetching payment settings:", error);
    res.status(500).json({ message: "Failed to fetch payment settings" });
  }
});

/**
 * GET /api/payment-settings/admin
 * Admin only - get all payment settings including disabled accounts
 */
router.get(
  "/admin",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req, res) => {
    try {
      let settings = await PaymentSettings.findOne().populate(
        "lastUpdatedBy",
        "firstName lastName email"
      );

      // If no settings exist, create default
      if (!settings) {
        settings = await PaymentSettings.create({
          accounts: DEFAULT_PAYMENT_ACCOUNTS,
        });
      }

      res.json({
        settings,
      });
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ message: "Failed to fetch payment settings" });
    }
  }
);

/**
 * PUT /api/payment-settings/admin
 * Admin only - update payment account settings
 */
router.put(
  "/admin",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { accounts } = req.body;

      if (!accounts || !Array.isArray(accounts)) {
        return res.status(400).json({ message: "Invalid accounts data" });
      }

      // Validate accounts
      const validIds = ["telebirr", "mpesa", "cbebirr", "bank_transfer"];
      for (const account of accounts) {
        if (!validIds.includes(account.id)) {
          return res
            .status(400)
            .json({ message: `Invalid account ID: ${account.id}` });
        }

        if (!account.accountName || !account.accountNumber) {
          return res.status(400).json({
            message: `Account name and number are required for ${account.label}`,
          });
        }

        if (!account.instructions || account.instructions.length === 0) {
          return res.status(400).json({
            message: `Instructions are required for ${account.label}`,
          });
        }
      }

      let settings = await PaymentSettings.findOne();

      const userObjectId = new mongoose.Types.ObjectId(userId) as any;

      if (!settings) {
        // Create new settings
        settings = await PaymentSettings.create({
          accounts,
          lastUpdatedBy: userObjectId,
        });
      } else {
        // Update existing settings
        settings.accounts = accounts;
        settings.lastUpdatedBy = userObjectId;
        await settings.save();
      }

      await settings.populate("lastUpdatedBy", "firstName lastName email");

      res.json({
        message: "Payment settings updated successfully",
        settings,
      });
    } catch (error) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ message: "Failed to update payment settings" });
    }
  }
);

/**
 * POST /api/payment-settings/admin/reset
 * Admin only - reset to default payment settings
 */
router.post(
  "/admin/reset",
  authenticate,
  authorize(["superadmin"]),
  async (req, res) => {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      let settings = await PaymentSettings.findOne();

      const userObjectId = new mongoose.Types.ObjectId(userId) as any;

      if (!settings) {
        settings = await PaymentSettings.create({
          accounts: DEFAULT_PAYMENT_ACCOUNTS,
          lastUpdatedBy: userObjectId,
        });
      } else {
        settings.accounts = DEFAULT_PAYMENT_ACCOUNTS;
        settings.lastUpdatedBy = userObjectId;
        await settings.save();
      }

      await settings.populate("lastUpdatedBy", "firstName lastName email");

      res.json({
        message: "Payment settings reset to defaults",
        settings,
      });
    } catch (error) {
      console.error("Error resetting payment settings:", error);
      res.status(500).json({ message: "Failed to reset payment settings" });
    }
  }
);

export default router;
