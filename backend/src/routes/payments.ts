import express, { Router, Request, Response } from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Payment } from "../models/Payment.js";
import { Member } from "../models/Member.js";
import { User } from "../models/User.js";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";
import { TicketProduct } from "../models/TicketProduct.js";
import { PurchasedTicket } from "../models/PurchasedTicket.js";
import { Notification } from "../models/Notification.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { paymentReceiptStorage } from "../config/cloudinary.js";

const router: Router = express.Router();

const ADMIN_ROLES = ["superadmin", "admin"];

const upload = multer({
  storage: paymentReceiptStorage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB
  fileFilter: (_req, file, cb) => {
    const ok = /jpeg|jpg|png|webp|gif|pdf/i.test(file.mimetype);
    if (ok) cb(null, true);
    else cb(new Error("Only image or PDF receipts are allowed"));
  },
});

async function ensureMember(userId: string, phoneFallback?: string) {
  let member = await Member.findOne({ userId });
  if (member) return member;

  const user = await User.findById(userId);
  if (!user) return null;

  const count = await Member.countDocuments();
  const year = new Date().getFullYear();
  member = await Member.create({
    userId: user._id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || phoneFallback || "0900000000",
    membershipNumber: `MEM-${year}-${(count + 1).toString().padStart(4, "0")}`,
    membershipStatus: "active",
  });
  return member;
}

async function generateEventTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastTicket = await Ticket.findOne()
    .sort({ createdAt: -1 })
    .select("ticketNumber");
  let sequence = 1;
  if (lastTicket?.ticketNumber) {
    const lastSequence = parseInt(
      lastTicket.ticketNumber.split("-").pop() || "0",
      10,
    );
    sequence = lastSequence + 1;
  }
  return `EVT-${year}-${sequence.toString().padStart(6, "0")}`;
}

async function generateProductTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastTicket = await PurchasedTicket.findOne()
    .sort({ createdAt: -1 })
    .select("ticketNumber");
  let sequence = 1;
  if (lastTicket?.ticketNumber) {
    const lastSequence = parseInt(
      lastTicket.ticketNumber.split("-").pop() || "0",
      10,
    );
    sequence = lastSequence + 1;
  }
  return `TKT-${year}-${sequence.toString().padStart(6, "0")}`;
}

function generateQRCodeData(ticketNumber: string, refId: string): string {
  return JSON.stringify({
    ticketNumber,
    refId,
    timestamp: new Date().toISOString(),
    uuid: uuidv4(),
  });
}

/** Issue ticket after auditor approval */
async function issueTicketForPayment(payment: any, auditorId: string) {
  if (payment.issuedTicket) {
    return { alreadyIssued: true, payment };
  }

  if (payment.relatedType === "event_ticket" && payment.relatedEvent) {
    const event = await Event.findById(payment.relatedEvent);
    if (!event) throw new Error("Event not found for this payment");
    if (!event.ticketingEnabled || !event.hasTicketing) {
      throw new Error("Ticketing is not enabled for this event");
    }
    if (event.ticketsSold >= event.ticketsAvailable) {
      throw new Error("Sorry, all tickets are sold out");
    }
    if (payment.amount !== event.ticketPrice) {
      throw new Error("Payment amount does not match ticket price");
    }

    const existing = await Ticket.findOne({
      event: event._id,
      user: payment.user,
      payment: payment._id,
    });
    if (existing) {
      payment.issuedTicket = existing._id;
      payment.issuedTicketModel = "Ticket";
      payment.status = "completed";
      payment.reviewedBy = auditorId;
      payment.reviewedAt = new Date();
      await payment.save();
      return { ticket: existing, payment, type: "event_ticket" as const };
    }

    const ticketNumber = await generateEventTicketNumber();
    const qrCode = generateQRCodeData(ticketNumber, event._id.toString());

    const ticket = await Ticket.create({
      ticketNumber,
      event: event._id,
      user: payment.user,
      payment: payment._id,
      qrCode,
      status: "active",
      purchaseDate: new Date(),
      luckyDrawEligible: true,
      isCheckedIn: false,
      hasWon: false,
    });

    event.ticketsSold += 1;
    await event.save();

    payment.status = "completed";
    payment.issuedTicket = ticket._id;
    payment.issuedTicketModel = "Ticket";
    payment.reviewedBy = auditorId;
    payment.reviewedAt = new Date();
    await payment.save();

    await Notification.create({
      recipient: payment.user,
      title: "Payment Approved — Ticket Issued",
      message: `Your payment was approved. Ticket number: ${ticketNumber} for "${event.title}".`,
      type: "ticket",
      link: `/my-tickets/${ticket._id}`,
    });

    return { ticket, payment, type: "event_ticket" as const };
  }

  if (
    payment.relatedType === "ticket_product" &&
    payment.relatedTicketProduct
  ) {
    const product = await TicketProduct.findById(payment.relatedTicketProduct);
    if (!product) throw new Error("Ticket product not found");
    if (!product.isActive)
      throw new Error("This ticket is no longer available");

    const quantity = payment.quantity || 1;
    if (product.soldQuantity + quantity > product.availableQuantity) {
      throw new Error("Not enough tickets available");
    }

    const totalAmount = product.price * quantity;
    if (payment.amount !== totalAmount) {
      throw new Error("Payment amount does not match ticket price");
    }

    const existing = await PurchasedTicket.findOne({
      ticketProduct: product._id,
      user: payment.user,
      payment: payment._id,
    });
    if (existing) {
      payment.issuedTicket = existing._id;
      payment.issuedTicketModel = "PurchasedTicket";
      payment.status = "completed";
      payment.reviewedBy = auditorId;
      payment.reviewedAt = new Date();
      await payment.save();
      return {
        ticket: existing,
        payment,
        type: "ticket_product" as const,
      };
    }

    const ticketNumber = await generateProductTicketNumber();
    const qrCode = generateQRCodeData(ticketNumber, product._id.toString());

    const ticket = await PurchasedTicket.create({
      ticketNumber,
      ticketProduct: product._id,
      user: payment.user,
      payment: payment._id,
      qrCode,
      quantity,
      totalAmount,
      validUntil: product.validUntil,
      status: "active",
    });

    product.soldQuantity += quantity;
    await product.save();

    payment.status = "completed";
    payment.issuedTicket = ticket._id;
    payment.issuedTicketModel = "PurchasedTicket";
    payment.reviewedBy = auditorId;
    payment.reviewedAt = new Date();
    await payment.save();

    await Notification.create({
      recipient: payment.user,
      title: "Payment Approved — Ticket Issued",
      message: `Your payment was approved. Ticket number: ${ticketNumber} for "${product.title}".`,
      type: "ticket",
      link: "/my-tickets",
    });

    return { ticket, payment, type: "ticket_product" as const };
  }

  // Generic payment (no ticket) — just mark completed
  payment.status = "completed";
  payment.reviewedBy = auditorId;
  payment.reviewedAt = new Date();
  await payment.save();

  await Notification.create({
    recipient: payment.user,
    title: "Payment Approved",
    message: `Your payment of ${payment.amount} ${payment.currency} was approved by the auditor.`,
    type: "system",
    link: "/my-payments",
  });

  return { payment, type: "other" as const };
}

// ── Stats (admin) ──────────────────────────────────────────────
router.get(
  "/stats",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const [totalStats, pendingStats, byType, byStatus] = await Promise.all([
        Payment.aggregate([
          { $match: { status: "completed" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Payment.aggregate([
          { $match: { status: "pending" } },
          {
            $group: {
              _id: null,
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Payment.aggregate([
          {
            $group: {
              _id: "$paymentType",
              total: { $sum: "$amount" },
              count: { $sum: 1 },
            },
          },
        ]),
        Payment.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      ]);

      res.json({
        totalCollected: totalStats[0]?.total || 0,
        totalCount: totalStats[0]?.count || 0,
        pendingTotal: pendingStats[0]?.total || 0,
        pendingCount: pendingStats[0]?.count || 0,
        byType,
        byStatus,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payment stats", error });
    }
  },
);

// ── Current user's payments ────────────────────────────────────
router.get("/my", authenticate, async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({ user: req.userId })
      .populate("relatedEvent", "title date location image ticketPrice")
      .populate("relatedTicketProduct", "title price image category")
      .populate("issuedTicket")
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payments", error });
  }
});

// ── Pending queue for auditor ──────────────────────────────────
router.get(
  "/pending",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const payments = await Payment.find({ status: "pending" })
        .populate("member", "fullName email membershipNumber phone")
        .populate("user", "firstName lastName email phone")
        .populate("relatedEvent", "title date location ticketPrice")
        .populate("relatedTicketProduct", "title price category")
        .sort({ createdAt: 1 });

      res.json(payments);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to fetch pending payments", error });
    }
  },
);

// ── List all payments (admin) ──────────────────────────────────
router.get(
  "/",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const filter: Record<string, unknown> = {};
      if (status && typeof status === "string") filter.status = status;

      const payments = await Payment.find(filter)
        .populate("member", "fullName email membershipNumber")
        .populate("user", "firstName lastName email phone")
        .populate("relatedEvent", "title date")
        .populate("relatedTicketProduct", "title price")
        .populate("reviewedBy", "firstName lastName")
        .sort({ createdAt: -1 });

      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments", error });
    }
  },
);

// ── Submit payment proof (user) — creates PENDING payment ──────
// multipart: receipt (file) + JSON fields
router.post(
  "/",
  authenticate,
  (req: Request, res: Response, next) => {
    upload.single("receipt")(req, res, (err: unknown) => {
      if (err) {
        const message =
          err instanceof Error ? err.message : "Failed to upload receipt";
        res.status(400).json({ message });
        return;
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      const {
        amount,
        currency,
        paymentType,
        paymentMethod,
        paymentChannel,
        associationAccount,
        payerName,
        phoneNumber,
        transactionId,
        notes,
        purpose,
        description,
        metadata,
        relatedType,
        relatedEvent,
        relatedTicketProduct,
        quantity,
      } = req.body;

      if (amount === undefined || amount === null || Number(amount) <= 0) {
        res.status(400).json({ message: "A valid payment amount is required" });
        return;
      }

      if (!transactionId || String(transactionId).trim().length < 4) {
        res.status(400).json({
          message: "Transaction / reference number is required",
        });
        return;
      }

      const receiptUrl =
        (req.file as Express.Multer.File & { path?: string })?.path ||
        (req.file as any)?.secure_url ||
        req.body.receiptUrl ||
        "";

      if (!receiptUrl) {
        res.status(400).json({
          message:
            "Payment screenshot / receipt is required. Please upload a photo of your transfer confirmation.",
        });
        return;
      }

      const member = await ensureMember(
        req.userId as string,
        phoneNumber as string | undefined,
      );
      if (!member) {
        res.status(404).json({ message: "User profile not found" });
        return;
      }

      // Validate related ticket target early
      const relType = relatedType || "";
      if (relType === "event_ticket") {
        if (!relatedEvent) {
          res.status(400).json({ message: "Event ID is required" });
          return;
        }
        const event = await Event.findById(relatedEvent);
        if (!event) {
          res.status(404).json({ message: "Event not found" });
          return;
        }
        if (!event.ticketingEnabled || !event.hasTicketing) {
          res
            .status(400)
            .json({ message: "Ticketing is not enabled for this event" });
          return;
        }
        if (event.ticketsSold >= event.ticketsAvailable) {
          res.status(400).json({ message: "Sorry, all tickets are sold out" });
          return;
        }
        if (Number(amount) !== event.ticketPrice) {
          res.status(400).json({
            message: "Payment amount does not match ticket price",
          });
          return;
        }
        // Block duplicate pending/completed for same event
        const dup = await Payment.findOne({
          user: req.userId,
          relatedEvent,
          relatedType: "event_ticket",
          status: { $in: ["pending", "completed"] },
        });
        if (dup) {
          res.status(400).json({
            message:
              dup.status === "pending"
                ? "You already have a pending payment for this event. Wait for auditor approval."
                : "You already have an approved ticket payment for this event.",
            payment: dup,
          });
          return;
        }
      }

      if (relType === "ticket_product") {
        if (!relatedTicketProduct) {
          res.status(400).json({ message: "Ticket product ID is required" });
          return;
        }
        const product = await TicketProduct.findById(relatedTicketProduct);
        if (!product) {
          res.status(404).json({ message: "Ticket product not found" });
          return;
        }
        const qty = Number(quantity) || 1;
        if (product.soldQuantity + qty > product.availableQuantity) {
          res.status(400).json({ message: "Not enough tickets available" });
          return;
        }
        if (Number(amount) !== product.price * qty) {
          res.status(400).json({
            message: "Payment amount does not match ticket total",
          });
          return;
        }
      }

      const allowedMethods = [
        "cash",
        "bank_transfer",
        "mobile_money",
        "credit_card",
        "other",
      ];
      const method = allowedMethods.includes(paymentMethod)
        ? paymentMethod
        : "mobile_money";

      let parsedMetadata: Record<string, unknown> = {};
      if (metadata) {
        try {
          parsedMetadata =
            typeof metadata === "string" ? JSON.parse(metadata) : metadata;
        } catch {
          parsedMetadata = {};
        }
      }

      const payment = await Payment.create({
        member: member._id,
        user: req.userId,
        amount: Number(amount),
        currency: currency || "ETB",
        paymentType: paymentType || "event_fee",
        paymentMethod: method,
        paymentChannel: paymentChannel || "",
        associationAccount: associationAccount || "",
        payerName: payerName || member.fullName || "",
        phoneNumber: phoneNumber || "",
        // Always pending until auditor approves
        status: "pending",
        transactionId: String(transactionId).trim(),
        receiptUrl,
        notes: notes || "",
        purpose: purpose || "",
        description: description || "",
        metadata: parsedMetadata,
        relatedType: relType || "",
        relatedEvent: relatedEvent || undefined,
        relatedTicketProduct: relatedTicketProduct || undefined,
        quantity: Number(quantity) || 1,
        paymentDate: new Date(),
      });

      // Notify admins
      try {
        const admins = await User.find({
          role: { $in: ADMIN_ROLES },
        }).select("_id");
        await Promise.all(
          admins.map((admin) =>
            Notification.create({
              recipient: admin._id,
              title: "New payment awaiting approval",
              message: `${payerName || member.fullName} submitted ${amount} ${currency || "ETB"} (${paymentChannel || method}). Review the screenshot.`,
              type: "system",
              link: "/admin/payments",
            }),
          ),
        );
      } catch (notifyErr) {
        console.error("Failed to notify admins:", notifyErr);
      }

      // Confirm to user
      await Notification.create({
        recipient: req.userId,
        title: "Payment submitted — awaiting auditor",
        message:
          "Your payment screenshot was received. The association auditor will verify it. You will get your ticket number after approval.",
        type: "ticket",
        link: "/my-payments",
      });

      const populated = await Payment.findById(payment._id)
        .populate("relatedEvent", "title date location")
        .populate("relatedTicketProduct", "title price");

      res.status(201).json({
        message:
          "Payment submitted successfully. Waiting for auditor approval. Your ticket will be issued after verification.",
        payment: populated,
      });
    } catch (error) {
      console.error("Failed to create payment:", error);
      res.status(500).json({ message: "Failed to create payment", error });
    }
  },
);

// ── Auditor APPROVE → issue ticket ─────────────────────────────
router.post(
  "/:id/approve",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      if (payment.status === "completed" && payment.issuedTicket) {
        res.json({
          message: "Payment already approved and ticket already issued",
          payment,
        });
        return;
      }

      if (payment.status === "rejected") {
        res.status(400).json({
          message: "This payment was rejected. User must submit a new payment.",
        });
        return;
      }

      if (payment.status !== "pending" && payment.status !== "completed") {
        res.status(400).json({
          message: `Cannot approve payment with status: ${payment.status}`,
        });
        return;
      }

      if (req.body.reviewNotes) {
        payment.reviewNotes = req.body.reviewNotes;
      }

      const result = await issueTicketForPayment(payment, req.userId as string);

      const refreshed = await Payment.findById(payment._id)
        .populate("member", "fullName email")
        .populate("user", "firstName lastName email")
        .populate("relatedEvent", "title date")
        .populate("relatedTicketProduct", "title")
        .populate("reviewedBy", "firstName lastName");

      res.json({
        message:
          result.type === "other"
            ? "Payment approved"
            : "Payment approved and ticket issued",
        payment: refreshed,
        ticket: "ticket" in result ? result.ticket : undefined,
        ticketNumber:
          "ticket" in result && result.ticket
            ? (result.ticket as any).ticketNumber
            : undefined,
      });
    } catch (error: any) {
      console.error("Failed to approve payment:", error);
      res.status(400).json({
        message: error?.message || "Failed to approve payment",
      });
    }
  },
);

// ── Auditor REJECT ─────────────────────────────────────────────
router.post(
  "/:id/reject",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const { reviewNotes } = req.body;
      const payment = await Payment.findById(req.params.id);

      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      if (payment.status !== "pending") {
        res.status(400).json({
          message: `Only pending payments can be rejected (current: ${payment.status})`,
        });
        return;
      }

      payment.status = "rejected";
      payment.reviewedBy = req.userId as any;
      payment.reviewedAt = new Date();
      payment.reviewNotes = reviewNotes || "Payment proof rejected by auditor";
      await payment.save();

      if (payment.user) {
        await Notification.create({
          recipient: payment.user,
          title: "Payment rejected",
          message: `Your payment was not approved. Reason: ${payment.reviewNotes}. Please submit a new payment with a clear screenshot.`,
          type: "system",
          link: "/my-payments",
        });
      }

      const refreshed = await Payment.findById(payment._id)
        .populate("member", "fullName email")
        .populate("user", "firstName lastName email")
        .populate("reviewedBy", "firstName lastName");

      res.json({
        message: "Payment rejected",
        payment: refreshed,
      });
    } catch (error) {
      console.error("Failed to reject payment:", error);
      res.status(500).json({ message: "Failed to reject payment", error });
    }
  },
);

// ── Get single payment ─────────────────────────────────────────
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate("member", "fullName email membershipNumber phone")
      .populate("user", "firstName lastName email phone")
      .populate("relatedEvent", "title date location image ticketPrice")
      .populate("relatedTicketProduct", "title price image category")
      .populate("reviewedBy", "firstName lastName")
      .populate("issuedTicket");

    if (!payment) {
      res.status(404).json({ message: "Payment not found" });
      return;
    }

    const isAdmin = ADMIN_ROLES.includes(req.userRole || "");
    if (!isAdmin && payment.user?.toString() !== req.userId?.toString()) {
      // also allow if member matches
      const member = await Member.findOne({ userId: req.userId });
      if (!member || payment.member.toString() !== member._id.toString()) {
        res.status(403).json({ message: "Access denied" });
        return;
      }
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch payment", error });
  }
});

// ── Legacy status patch (admin) ────────────────────────────────
router.patch(
  "/:id/status",
  authenticate,
  authorize(ADMIN_ROLES),
  async (req: Request, res: Response) => {
    try {
      const { status, transactionId, receiptUrl, notes } = req.body;

      if (status === "completed") {
        // Prefer approve endpoint so ticket is issued
        const payment = await Payment.findById(req.params.id);
        if (!payment) {
          res.status(404).json({ message: "Payment not found" });
          return;
        }
        if (notes) payment.reviewNotes = notes;
        if (transactionId) payment.transactionId = transactionId;
        if (receiptUrl) payment.receiptUrl = receiptUrl;
        await payment.save();
        const result = await issueTicketForPayment(
          payment,
          req.userId as string,
        );
        res.json({
          message: "Payment completed and ticket issued if applicable",
          payment: result.payment,
          ticket: "ticket" in result ? result.ticket : undefined,
        });
        return;
      }

      const payment = await Payment.findByIdAndUpdate(
        req.params.id,
        { status, transactionId, receiptUrl, notes },
        { new: true },
      ).populate("member", "fullName email membershipNumber");

      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      res.json({ message: "Payment status updated successfully", payment });
    } catch (error: any) {
      res.status(400).json({
        message: error?.message || "Failed to update payment status",
      });
    }
  },
);

export default router;
