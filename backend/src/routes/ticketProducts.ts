import express, { Router, Request, Response } from "express";
import { TicketProduct } from "../models/TicketProduct.js";
import { PurchasedTicket } from "../models/PurchasedTicket.js";
import { Payment } from "../models/Payment.js";
import { Notification } from "../models/Notification.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router: Router = express.Router();

// Helper function to generate unique ticket number
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastTicket = await PurchasedTicket.findOne()
    .sort({ createdAt: -1 })
    .select("ticketNumber");

  let sequence = 1;
  if (lastTicket && lastTicket.ticketNumber) {
    const lastSequence = parseInt(
      lastTicket.ticketNumber.split("-").pop() || "0"
    );
    sequence = lastSequence + 1;
  }

  const ticketNumber = `TKT-${year}-${sequence.toString().padStart(6, "0")}`;
  return ticketNumber;
}

// Helper function to generate QR code data
function generateQRCodeData(
  ticketNumber: string,
  ticketProductId: string
): string {
  return JSON.stringify({
    ticketNumber,
    ticketProductId,
    timestamp: new Date().toISOString(),
    uuid: uuidv4(),
  });
}

// GET /api/ticket-products - Get all active ticket products (public)
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, active } = req.query;
    
    const filter: any = {};
    if (category) filter.category = category;
    if (active !== undefined) filter.isActive = active === "true";
    else filter.isActive = true; // Default: only show active

    const products = await TicketProduct.find(filter)
      .populate("createdBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch ticket products", error });
  }
});

// GET /api/ticket-products/my/purchases - Get user's purchased tickets
// MUST be before /:id route to avoid conflict
router.get(
  "/my/purchases",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?._id;
      const { status } = req.query;

      const filter: any = { user: userId };
      if (status) filter.status = status;

      const tickets = await PurchasedTicket.find(filter)
        .populate("ticketProduct", "title description price image category")
        .populate("payment", "amount status paymentMethod")
        .sort({ createdAt: -1 });

      res.json({ tickets, count: tickets.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets", error });
    }
  }
);

// GET /api/ticket-products/:id - Get single ticket product
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const product = await TicketProduct.findById(req.params.id).populate(
      "createdBy",
      "firstName lastName"
    );

    if (!product) {
      res.status(404).json({ message: "Ticket product not found" });
      return;
    }

    res.json(product);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch ticket product", error });
  }
});

// POST /api/ticket-products - Create ticket product (Admin)
router.post(
  "/",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const {
        title,
        description,
        category,
        price,
        availableQuantity,
        image,
        validFrom,
        validUntil,
        features,
        metadata,
      } = req.body;

      const product = await TicketProduct.create({
        title,
        description,
        category,
        price,
        availableQuantity,
        image,
        validFrom,
        validUntil,
        features,
        metadata,
        createdBy: req.user?._id,
      });

      res.status(201).json({
        message: "Ticket product created successfully",
        product,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to create ticket product", error });
    }
  }
);

// PATCH /api/ticket-products/:id - Update ticket product (Admin)
router.patch(
  "/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const product = await TicketProduct.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

      if (!product) {
        res.status(404).json({ message: "Ticket product not found" });
        return;
      }

      res.json({
        message: "Ticket product updated successfully",
        product,
      });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update ticket product", error });
    }
  }
);

// DELETE /api/ticket-products/:id - Delete ticket product (Admin)
router.delete(
  "/:id",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const product = await TicketProduct.findByIdAndDelete(req.params.id);

      if (!product) {
        res.status(404).json({ message: "Ticket product not found" });
        return;
      }

      res.json({ message: "Ticket product deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete ticket product", error });
    }
  }
);

// GET /api/ticket-products/:id/stats - Get product statistics (Admin)
// MUST be before /:id/purchase to avoid conflict
router.get(
  "/:id/stats",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const productId = req.params.id;

      const product = await TicketProduct.findById(productId);
      if (!product) {
        res.status(404).json({ message: "Ticket product not found" });
        return;
      }

      const totalSold = await PurchasedTicket.countDocuments({
        ticketProduct: productId,
      });

      const activeSold = await PurchasedTicket.countDocuments({
        ticketProduct: productId,
        status: "active",
      });

      const usedTickets = await PurchasedTicket.countDocuments({
        ticketProduct: productId,
        status: "used",
      });

      const revenue = product.price * product.soldQuantity;

      res.json({
        product: {
          title: product.title,
          price: product.price,
          availableQuantity: product.availableQuantity,
          soldQuantity: product.soldQuantity,
        },
        stats: {
          totalSold,
          activeSold,
          usedTickets,
          remaining: product.availableQuantity - product.soldQuantity,
          soldPercentage:
            product.availableQuantity > 0
              ? ((product.soldQuantity / product.availableQuantity) * 100).toFixed(2)
              : 0,
        },
        revenue: {
          total: revenue,
          perTicket: product.price,
        },
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics", error });
    }
  }
);

// POST /api/ticket-products/:id/purchase - Purchase a ticket
router.post(
  "/:id/purchase",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { paymentId, quantity = 1 } = req.body;
      const userId = req.user?._id;
      const productId = req.params.id;

      // Get product
      const product = await TicketProduct.findById(productId);
      if (!product) {
        res.status(404).json({ message: "Ticket product not found" });
        return;
      }

      if (!product.isActive) {
        res.status(400).json({ message: "This ticket is no longer available" });
        return;
      }

      // Check availability
      if (product.soldQuantity + quantity > product.availableQuantity) {
        res.status(400).json({
          message: "Not enough tickets available",
          available: product.availableQuantity - product.soldQuantity,
        });
        return;
      }

      // Verify payment
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      if (payment.status !== "completed") {
        res.status(400).json({
          message: "Payment is not completed",
        });
        return;
      }

      const totalAmount = product.price * quantity;
      if (payment.amount !== totalAmount) {
        res.status(400).json({
          message: "Payment amount does not match ticket price",
        });
        return;
      }

      // Check for duplicate purchase with same payment
      const existingTicket = await PurchasedTicket.findOne({
        ticketProduct: productId,
        user: userId,
        payment: paymentId,
      });

      if (existingTicket) {
        res.status(400).json({
          message: "You already purchased this ticket with this payment",
          ticket: existingTicket,
        });
        return;
      }

      // Generate ticket
      const ticketNumber = await generateTicketNumber();
      const qrCodeData = generateQRCodeData(ticketNumber, productId);

      const ticket = await PurchasedTicket.create({
        ticketNumber,
        ticketProduct: productId,
        user: userId,
        payment: paymentId,
        qrCode: qrCodeData,
        quantity,
        totalAmount,
        validUntil: product.validUntil,
        status: "active",
      });

      // Update product sold quantity
      product.soldQuantity += quantity;
      await product.save();

      // Create notification
      await Notification.create({
        recipient: userId,
        title: "Ticket Purchase Successful",
        message: `Your ticket ${ticketNumber} for ${product.title} has been generated successfully.`,
        type: "ticket",
        relatedEntity: "PurchasedTicket",
        relatedId: ticket._id,
      });

      // Populate and return
      const populatedTicket = await PurchasedTicket.findById(ticket._id)
        .populate("ticketProduct", "title description price image")
        .populate("user", "firstName lastName email")
        .populate("payment", "amount status paymentMethod");

      res.status(201).json({
        message: "Ticket purchased successfully",
        ticket: populatedTicket,
      });
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      res.status(500).json({ message: "Failed to purchase ticket", error });
    }
  }
);

export default router;
