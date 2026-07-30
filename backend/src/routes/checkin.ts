import express, { Router, Request, Response } from "express";
import { CheckIn } from "../models/CheckIn.js";
import { Ticket } from "../models/Ticket.js";
import { Event } from "../models/Event.js";
import { AuditLog } from "../models/AuditLog.js";
import { Notification } from "../models/Notification.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = express.Router();

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

// POST /api/checkin/qr - Check-in using QR code
router.post(
  "/qr",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { qrCode } = req.body;
      const adminId = req.user?._id;

      if (!qrCode) {
        res.status(400).json({ message: "QR code is required" });
        return;
      }

      // Parse QR code data
      let qrData;
      try {
        qrData = JSON.parse(qrCode);
      } catch (error) {
        res.status(400).json({ message: "Invalid QR code format" });
        return;
      }

      const { ticketNumber, eventId } = qrData;

      // Find ticket
      const ticket = await Ticket.findOne({ ticketNumber })
        .populate("event", "title date location")
        .populate("user", "firstName lastName email");

      if (!ticket) {
        await createAuditLog(
          "CHECKIN_FAILED",
          "checkin",
          ticketNumber,
          adminId as string,
          { reason: "Ticket not found", ticketNumber },
          "failed",
          "Ticket not found"
        );

        res.status(404).json({ message: "Ticket not found" });
        return;
      }

      // Verify event matches
      if (ticket.event._id.toString() !== eventId) {
        res.status(400).json({ message: "Ticket is not for this event" });
        return;
      }

      // Check if ticket is already checked in
      if (ticket.isCheckedIn) {
        res.status(400).json({
          message: "This ticket has already been checked in",
          checkInDate: ticket.checkInDate,
        });
        return;
      }

      // Check ticket status
      if (ticket.status === "cancelled") {
        res.status(400).json({ message: "This ticket has been cancelled" });
        return;
      }

      if (ticket.status === "refunded") {
        res.status(400).json({ message: "This ticket has been refunded" });
        return;
      }

      // Check if event has already ended
      const event = await Event.findById(eventId);
      if (event && new Date() > event.endDate) {
        res.status(400).json({ message: "This event has already ended" });
        return;
      }

      // Create check-in record
      const checkIn = await CheckIn.create({
        ticket: ticket._id,
        event: ticket.event._id,
        user: ticket.user._id,
        checkInBy: adminId,
        method: "qr",
        checkInTime: new Date(),
      });

      // Update ticket
      ticket.isCheckedIn = true;
      ticket.checkInDate = new Date();
      ticket.status = "used";
      await ticket.save();

      // Create audit log
      await createAuditLog(
        "CHECKIN_SUCCESS",
        "checkin",
        checkIn._id.toString(),
        adminId as string,
        {
          ticketNumber: ticket.ticketNumber,
          eventId: ticket.event._id,
          method: "qr",
        }
      );

      // Notify user
      await Notification.create({
        recipient: ticket.user._id,
        title: "Event Check-in Successful",
        message: `You have been checked in to ${ticket.event.title}. Enjoy the event!`,
        type: "event",
        relatedEntity: "Event",
        relatedId: ticket.event._id,
      });

      res.json({
        message: "Check-in successful",
        checkIn,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event,
          user: ticket.user,
          checkInDate: ticket.checkInDate,
        },
      });
    } catch (error: any) {
      // Handle duplicate check-in error
      if (error.code === 11000) {
        res.status(400).json({
          message: "This ticket has already been checked in",
        });
        return;
      }

      console.error("Error during check-in:", error);
      res.status(500).json({ message: "Failed to check in", error });
    }
  }
);

// POST /api/checkin/manual - Manual check-in by ticket number
router.post(
  "/manual",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { ticketNumber, notes } = req.body;
      const adminId = req.user?._id;

      if (!ticketNumber) {
        res.status(400).json({ message: "Ticket number is required" });
        return;
      }

      // Find ticket
      const ticket = await Ticket.findOne({ ticketNumber })
        .populate("event", "title date location")
        .populate("user", "firstName lastName email");

      if (!ticket) {
        res.status(404).json({ message: "Ticket not found" });
        return;
      }

      // Check if ticket is already checked in
      if (ticket.isCheckedIn) {
        res.status(400).json({
          message: "This ticket has already been checked in",
          checkInDate: ticket.checkInDate,
        });
        return;
      }

      // Check ticket status
      if (ticket.status === "cancelled" || ticket.status === "refunded") {
        res.status(400).json({
          message: `Cannot check in: ticket is ${ticket.status}`,
        });
        return;
      }

      // Create check-in record
      const checkIn = await CheckIn.create({
        ticket: ticket._id,
        event: ticket.event._id,
        user: ticket.user._id,
        checkInBy: adminId,
        method: "manual",
        notes,
        checkInTime: new Date(),
      });

      // Update ticket
      ticket.isCheckedIn = true;
      ticket.checkInDate = new Date();
      ticket.status = "used";
      await ticket.save();

      // Create audit log
      await createAuditLog(
        "CHECKIN_MANUAL",
        "checkin",
        checkIn._id.toString(),
        adminId as string,
        {
          ticketNumber: ticket.ticketNumber,
          eventId: ticket.event._id,
          method: "manual",
          notes,
        }
      );

      res.json({
        message: "Manual check-in successful",
        checkIn,
        ticket: {
          ticketNumber: ticket.ticketNumber,
          event: ticket.event,
          user: ticket.user,
          checkInDate: ticket.checkInDate,
        },
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(400).json({
          message: "This ticket has already been checked in",
        });
        return;
      }

      console.error("Error during manual check-in:", error);
      res.status(500).json({ message: "Failed to check in", error });
    }
  }
);

// GET /api/checkin/event/:eventId - Get all check-ins for an event
router.get(
  "/event/:eventId",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { page = 1, limit = 50 } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const checkIns = await CheckIn.find({ event: eventId })
        .populate("user", "firstName lastName email")
        .populate("ticket", "ticketNumber")
        .populate("checkInBy", "firstName lastName")
        .skip(skip)
        .limit(Number(limit))
        .sort({ checkInTime: -1 });

      const totalCheckIns = await CheckIn.countDocuments({ event: eventId });

      // Get event stats
      const event = await Event.findById(eventId);
      const totalTickets = await Ticket.countDocuments({ event: eventId });

      res.json({
        checkIns,
        stats: {
          totalTickets,
          checkedIn: totalCheckIns,
          notCheckedIn: totalTickets - totalCheckIns,
          attendanceRate:
            totalTickets > 0
              ? ((totalCheckIns / totalTickets) * 100).toFixed(2)
              : 0,
        },
        pagination: {
          total: totalCheckIns,
          page: Number(page),
          limit: Number(limit),
          pages: Math.ceil(totalCheckIns / Number(limit)),
        },
      });
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      res.status(500).json({ message: "Failed to fetch check-ins", error });
    }
  }
);

// GET /api/checkin/stats/:eventId - Get check-in statistics
router.get(
  "/stats/:eventId",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      const totalTickets = await Ticket.countDocuments({ event: eventId });
      const checkedInCount = await CheckIn.countDocuments({ event: eventId });
      const notCheckedIn = totalTickets - checkedInCount;

      const recentCheckIns = await CheckIn.find({ event: eventId })
        .populate("user", "firstName lastName")
        .populate("ticket", "ticketNumber")
        .sort({ checkInTime: -1 })
        .limit(10);

      res.json({
        stats: {
          totalTickets,
          checkedIn: checkedInCount,
          notCheckedIn,
          attendanceRate:
            totalTickets > 0
              ? ((checkedInCount / totalTickets) * 100).toFixed(2)
              : 0,
        },
        recentCheckIns,
      });
    } catch (error) {
      console.error("Error fetching check-in stats:", error);
      res.status(500).json({
        message: "Failed to fetch check-in statistics",
        error,
      });
    }
  }
);

export default router;
