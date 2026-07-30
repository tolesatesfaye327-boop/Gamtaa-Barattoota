import express, { Router, Request, Response } from "express";
import { Ticket } from "../models/Ticket.js";
import { Event } from "../models/Event.js";
import { Payment } from "../models/Payment.js";
import { AuditLog } from "../models/AuditLog.js";
import { Notification } from "../models/Notification.js";
import { authenticate } from "../middleware/auth.js";
import { v4 as uuidv4 } from "uuid";

const router: Router = express.Router();

// Helper function to generate unique ticket number
async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const lastTicket = await Ticket.findOne()
    .sort({ createdAt: -1 })
    .select("ticketNumber");

  let sequence = 1;
  if (lastTicket && lastTicket.ticketNumber) {
    const lastSequence = parseInt(
      lastTicket.ticketNumber.split("-").pop() || "0"
    );
    sequence = lastSequence + 1;
  }

  const ticketNumber = `EVT-${year}-${sequence.toString().padStart(6, "0")}`;
  return ticketNumber;
}

// Helper function to generate QR code data
function generateQRCodeData(ticketNumber: string, eventId: string): string {
  return JSON.stringify({
    ticketNumber,
    eventId,
    timestamp: new Date().toISOString(),
    uuid: uuidv4(),
  });
}

// Create audit log helper
async function createAuditLog(
  action: string,
  entity: "ticket" | "event" | "payment" | "checkin" | "draw" | "winner",
  entityId: string,
  userId: string,
  details: Record<string, any>,
  status: "success" | "failed" = "success",
  errorMessage?: string
) {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      user: userId,
      details,
      status,
      errorMessage,
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
  }
}

// POST /api/tickets/purchase - Purchase a ticket for an event
router.post(
  "/purchase",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { eventId, paymentId } = req.body;
      const userId = req.userId;

      if (!eventId || !paymentId) {
        res.status(400).json({
          message: "Event ID and Payment ID are required",
        });
        return;
      }

      // Check if event exists and has ticketing enabled
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      if (!event.ticketingEnabled || !event.hasTicketing) {
        res.status(400).json({
          message: "Ticketing is not enabled for this event",
        });
        return;
      }

      // Check if tickets are available
      if (event.ticketsSold >= event.ticketsAvailable) {
        res.status(400).json({
          message: "Sorry, all tickets are sold out",
        });
        return;
      }

      // Verify payment exists and is successful
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        res.status(404).json({ message: "Payment not found" });
        return;
      }

      if (payment.status !== "completed") {
        res.status(400).json({
          message: "Payment is not completed. Please complete payment first.",
        });
        return;
      }

      // Check if user already has a ticket for this event with this payment
      const existingTicket = await Ticket.findOne({
        event: eventId,
        user: userId,
        payment: paymentId,
      });

      if (existingTicket) {
        res.status(400).json({
          message: "You already have a ticket for this event with this payment",
          ticket: existingTicket,
        });
        return;
      }

      // Verify payment amount matches ticket price
      if (payment.amount !== event.ticketPrice) {
        res.status(400).json({
          message: "Payment amount does not match ticket price",
        });
        return;
      }

      // Generate unique ticket number
      const ticketNumber = await generateTicketNumber();

      // Generate QR code data
      const qrCodeData = generateQRCodeData(ticketNumber, eventId);

      // Create ticket
      const ticket = await Ticket.create({
        ticketNumber,
        event: eventId,
        user: userId,
        payment: paymentId,
        qrCode: qrCodeData,
        status: "active",
        purchaseDate: new Date(),
        luckyDrawEligible: true,
        isCheckedIn: false,
        hasWon: false,
      });

      // Update event tickets sold count
      event.ticketsSold += 1;
      await event.save();

      // Create audit log
      await createAuditLog(
        "TICKET_PURCHASED",
        "ticket",
        ticket._id.toString(),
        userId as string,
        {
          eventId,
          paymentId,
          ticketNumber,
          ticketPrice: event.ticketPrice,
        }
      );

      // Create notification for user
      await Notification.create({
        recipient: userId,
        title: "Ticket Purchase Successful",
        message: `Your ticket ${ticketNumber} for ${event.title} has been generated successfully.`,
        type: "ticket",
        relatedEntity: "Ticket",
        relatedId: ticket._id,
      });

      // Populate ticket data
      const populatedTicket = await Ticket.findById(ticket._id)
        .populate("event", "title date location image")
        .populate("user", "firstName lastName email")
        .populate("payment", "amount status paymentMethod");

      res.status(201).json({
        message: "Ticket purchased successfully",
        ticket: populatedTicket,
      });
    } catch (error) {
      console.error("Error purchasing ticket:", error);
      res.status(500).json({
        message: "Failed to purchase ticket",
        error,
      });
    }
  }
);

// GET /api/tickets/my-tickets - Get all tickets for logged-in user
router.get("/my-tickets", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { status, eventId } = req.query;

    const filter: any = { user: userId };
    if (status) filter.status = status;
    if (eventId) filter.event = eventId;

    const tickets = await Ticket.find(filter)
      .populate("event", "title date location image category")
      .populate("payment", "amount status paymentMethod transactionId")
      .sort({ createdAt: -1 });

    res.json({
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Failed to fetch tickets", error });
  }
});

// GET /api/tickets/:id - Get single ticket details
router.get("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const ticketId = req.params.id;
    const userId = req.userId;

    const ticket = await Ticket.findById(ticketId)
      .populate("event", "title date endDate location image category description")
      .populate("user", "firstName lastName email phone")
      .populate("payment", "amount status paymentMethod transactionId");

    if (!ticket) {
      res.status(404).json({ message: "Ticket not found" });
      return;
    }

    // Check if user owns this ticket or is admin/superadmin
    if (
      ticket.user._id.toString() !== userId?.toString() &&
      req.userRole !== "admin" &&
      req.userRole !== "superadmin"
    ) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    res.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    res.status(500).json({ message: "Failed to fetch ticket", error });
  }
});

// GET /api/tickets/verify/:ticketNumber - Verify ticket by number
router.get(
  "/verify/:ticketNumber",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { ticketNumber } = req.params;

      const ticket = await Ticket.findOne({ ticketNumber })
        .populate("event", "title date location")
        .populate("user", "firstName lastName email");

      if (!ticket) {
        res.status(404).json({
          message: "Ticket not found",
          valid: false,
        });
        return;
      }

      res.json({
        valid: true,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event,
          user: ticket.user,
          status: ticket.status,
          isCheckedIn: ticket.isCheckedIn,
          checkInDate: ticket.checkInDate,
        },
      });
    } catch (error) {
      console.error("Error verifying ticket:", error);
      res.status(500).json({ message: "Failed to verify ticket", error });
    }
  }
);

// POST /api/tickets/:id/cancel - Cancel a ticket
router.post(
  "/:id/cancel",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const ticketId = req.params.id;
      const userId = req.userId;

      const ticket = await Ticket.findById(ticketId);

      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }

      // Check ownership
      if (ticket.user.toString() !== userId?.toString()) {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      // Check if ticket can be cancelled
      if (ticket.status === "used" || ticket.status === "cancelled") {
        res.status(400).json({
          message: `Ticket cannot be cancelled. Current status: ${ticket.status}`,
        });
        return;
      }

      // Update ticket status
      ticket.status = "cancelled";
      await ticket.save();

      // Update event tickets sold count
      await Event.findByIdAndUpdate(ticket.event, {
        $inc: { ticketsSold: -1 },
      });

      // Create audit log
      await createAuditLog(
        "TICKET_CANCELLED",
        "ticket",
        ticket._id.toString(),
        userId as string,
        { ticketNumber: ticket.ticketNumber }
      );

      res.json({
        message: "Ticket cancelled successfully",
        ticket,
      });
    } catch (error) {
      console.error("Error cancelling ticket:", error);
      res.status(500).json({ message: "Failed to cancel ticket", error });
    }
  }
);

// GET /api/tickets/event/:eventId - Get all tickets for an event (Admin only)
router.get(
  "/event/:eventId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      // Check if user is admin or superadmin
      if (req.userRole !== "admin" && req.userRole !== "superadmin") {
        res.status(403).json({ message: "Access denied. Admin only." });
        return;
      }

      const { eventId } = req.params;
      const { status, page = 1, limit = 50 } = req.query;

      const filter: any = { event: eventId };
      if (status) filter.status = status;

      const skip = (Number(page) - 1) * Number(limit);

      const tickets = await Ticket.find(filter)
        .populate("user", "firstName lastName email phone")
        .populate("payment", "amount status paymentMethod")
        .skip(skip)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

      const totalTickets = await Ticket.countDocuments(filter);

      res.json({
        tickets,
        pagination: {
          total: totalTickets,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalTickets / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching event tickets:", error);
      res.status(500).json({ message: "Failed to fetch tickets", error });
    }
  }
);

export default router;
