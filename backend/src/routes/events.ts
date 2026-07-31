import express, { Router, Request, Response } from "express";
import { Event } from "../models/Event.js";
import { Ticket } from "../models/Ticket.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = express.Router();

// Get all events (public, or all for authenticated users)
router.get("/", async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated (via query param or header)
    const authHeader = req.headers.authorization;
    let isAdmin = false;
    if (authHeader) {
      try {
        const jwt = await import("jsonwebtoken");
        const token = authHeader.split(" ")[1];
        const decoded = jwt.default.verify(
          token,
          process.env.JWT_SECRET ||
            "your-super-secret-jwt-key-change-in-production",
        ) as { role: string };
        if (decoded.role === "admin" || decoded.role === "superadmin") {
          isAdmin = true;
        }
      } catch {
        // Token invalid, treat as public
      }
    }

    let events;
    if (isAdmin) {
      events = await Event.find()
        .populate("organizer", "firstName lastName")
        .populate("attendees", "firstName lastName")
        .sort({ date: 1 });
    } else {
      events = await Event.find({ isPublic: true })
        .populate("organizer", "firstName lastName")
        .populate("attendees", "firstName lastName")
        .sort({ date: 1 });
    }
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events", error });
  }
});

// Get event by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("organizer", "firstName lastName email")
      .populate("attendees", "firstName lastName");
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event", error });
  }
});

// Create event (authenticated users)
router.post("/", authenticate, async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      date,
      endDate,
      location,
      category,
      maxAttendees,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      date,
      endDate,
      location,
      category,
      maxAttendees,
      organizer: req.userId,
    });

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    res.status(500).json({ message: "Failed to create event", error });
  }
});

// Register for event
router.post(
  "/:id/register",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const event = await Event.findById(req.params.id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Check if already registered
      if (event.attendees.includes(req.userId as any)) {
        res.status(400).json({ message: "Already registered for this event" });
        return;
      }

      // Check max attendees
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        res.status(400).json({ message: "Event is full" });
        return;
      }

      event.attendees.push(req.userId as any);
      await event.save();

      res.json({ message: "Registered for event successfully", event });
    } catch (error) {
      res.status(500).json({ message: "Failed to register for event", error });
    }
  },
);

// Unregister from event
router.post(
  "/:id/unregister",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const event = await Event.findByIdAndUpdate(
        req.params.id,
        { $pull: { attendees: req.userId } },
        { new: true },
      );

      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      res.json({ message: "Unregistered from event successfully", event });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to unregister from event", error });
    }
  },
);

// Update event (organizer or admin)
router.patch("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const hasPermission =
      req.userRole === "superadmin" ||
      req.userRole === "admin" ||
      req.userId === event.organizer.toString();
    if (!hasPermission) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const updates = req.body;
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });

    res.json({ message: "Event updated successfully", event: updatedEvent });
  } catch (error) {
    res.status(500).json({ message: "Failed to update event", error });
  }
});

// Delete event (organizer or admin)
router.delete("/:id", authenticate, async (req: Request, res: Response) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      res.status(404).json({ message: "Event not found" });
      return;
    }

    const hasPermission =
      req.userRole === "superadmin" ||
      req.userRole === "admin" ||
      req.userId === event.organizer.toString();
    if (!hasPermission) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event", error });
  }
});

// GET /api/events/:id/ticket-stats - Get ticket statistics for an event (Admin)
router.get(
  "/:id/ticket-stats",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Get ticket stats
      const totalTickets = await Ticket.countDocuments({ event: id });
      const activeTickets = await Ticket.countDocuments({
        event: id,
        status: "active",
      });
      const usedTickets = await Ticket.countDocuments({
        event: id,
        status: "used",
      });
      const cancelledTickets = await Ticket.countDocuments({
        event: id,
        status: "cancelled",
      });

      // Calculate revenue
      const tickets = await Ticket.find({ event: id }).populate("payment");
      const totalRevenue = tickets.reduce((sum, ticket: any) => {
        if (
          ticket.payment &&
          ticket.payment.status === "completed" &&
          ticket.status !== "cancelled"
        ) {
          return sum + ticket.payment.amount;
        }
        return sum;
      }, 0);

      // Recent sales
      const recentSales = await Ticket.find({ event: id })
        .populate("user", "firstName lastName email")
        .populate("payment", "amount paymentMethod")
        .sort({ createdAt: -1 })
        .limit(10);

      res.json({
        event: {
          title: event.title,
          ticketPrice: event.ticketPrice,
          ticketsAvailable: event.ticketsAvailable,
          ticketsSold: event.ticketsSold,
        },
        stats: {
          totalTickets,
          activeTickets,
          usedTickets,
          cancelledTickets,
          availableTickets: event.ticketsAvailable - event.ticketsSold,
          soldPercentage:
            event.ticketsAvailable > 0
              ? ((event.ticketsSold / event.ticketsAvailable) * 100).toFixed(2)
              : 0,
        },
        revenue: {
          totalRevenue,
          expectedRevenue: event.ticketPrice * event.ticketsSold,
          perTicket: event.ticketPrice,
        },
        recentSales,
      });
    } catch (error) {
      console.error("Error fetching ticket stats:", error);
      res.status(500).json({ message: "Failed to fetch ticket statistics", error });
    }
  }
);

// GET /api/events/:id/revenue - Get revenue details (Admin)
router.get(
  "/:id/revenue",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Get all payments for this event's tickets
      const tickets = await Ticket.find({ event: id }).populate("payment");

      let totalRevenue = 0;
      let completedPayments = 0;
      let pendingPayments = 0;
      let failedPayments = 0;

      const paymentBreakdown: any = {};

      tickets.forEach((ticket: any) => {
        if (ticket.payment) {
          const payment = ticket.payment;
          if (payment.status === "completed" && ticket.status !== "cancelled") {
            totalRevenue += payment.amount;
            completedPayments++;

            // Group by payment method
            if (!paymentBreakdown[payment.paymentMethod]) {
              paymentBreakdown[payment.paymentMethod] = {
                count: 0,
                amount: 0,
              };
            }
            paymentBreakdown[payment.paymentMethod].count++;
            paymentBreakdown[payment.paymentMethod].amount += payment.amount;
          } else if (payment.status === "pending") {
            pendingPayments++;
          } else if (payment.status === "failed") {
            failedPayments++;
          }
        }
      });

      res.json({
        eventTitle: event.title,
        ticketPrice: event.ticketPrice,
        totalRevenue,
        expectedRevenue: event.ticketPrice * event.ticketsSold,
        payments: {
          completed: completedPayments,
          pending: pendingPayments,
          failed: failedPayments,
        },
        paymentBreakdown,
        revenuePerTicket: event.ticketPrice,
      });
    } catch (error) {
      console.error("Error fetching revenue:", error);
      res.status(500).json({ message: "Failed to fetch revenue data", error });
    }
  }
);

// POST /api/events/:id/export-tickets - Export ticket data (Admin)
router.post(
  "/:id/export-tickets",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { format = "json" } = req.body;

      const event = await Event.findById(id);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      const tickets = await Ticket.find({ event: id })
        .populate("user", "firstName lastName email phone")
        .populate("payment", "amount status paymentMethod transactionId")
        .sort({ createdAt: -1 });

      // Format data for export
      const exportData = tickets.map((ticket: any) => ({
        ticketNumber: ticket.ticketNumber,
        userName: `${ticket.user.firstName} ${ticket.user.lastName}`,
        email: ticket.user.email,
        phone: ticket.user.phone,
        status: ticket.status,
        purchaseDate: ticket.purchaseDate,
        paymentAmount: ticket.payment?.amount,
        paymentStatus: ticket.payment?.status,
        paymentMethod: ticket.payment?.paymentMethod,
        transactionId: ticket.payment?.transactionId,
        isCheckedIn: ticket.isCheckedIn,
        checkInDate: ticket.checkInDate,
        hasWon: ticket.hasWon,
        prizeWon: ticket.prizeWon,
      }));

      if (format === "csv") {
        // Convert to CSV (simplified)
        const headers = Object.keys(exportData[0] || {}).join(",");
        const rows = exportData
          .map((row) => Object.values(row).join(","))
          .join("\n");
        const csv = `${headers}\n${rows}`;

        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=tickets-${event.title}-${Date.now()}.csv`
        );
        res.send(csv);
      } else {
        res.json({
          event: {
            title: event.title,
            date: event.date,
            location: event.location,
          },
          exportDate: new Date(),
          totalTickets: exportData.length,
          tickets: exportData,
        });
      }
    } catch (error) {
      console.error("Error exporting tickets:", error);
      res.status(500).json({ message: "Failed to export tickets", error });
    }
  }
);

export default router;
