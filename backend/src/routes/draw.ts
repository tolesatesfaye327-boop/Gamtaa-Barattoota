import express, { Router, Request, Response } from "express";
import { Winner } from "../models/Winner.js";
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

// POST /api/draw/conduct - Conduct lucky draw for an event
router.post(
  "/conduct",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { eventId, prizes, allowDuplicateWins = false } = req.body;
      const adminId = req.userId;

      if (!eventId || !prizes || !Array.isArray(prizes)) {
        res.status(400).json({
          message: "Event ID and prizes array are required",
        });
        return;
      }

      // Validate prizes structure
      // Expected: [{ category: "grand", prize: "Grand Prize Name", count: 1 }, ...]
      const validCategories = ["grand", "first", "second", "third", "consolation"];
      for (const prize of prizes) {
        if (!prize.category || !prize.prize || !prize.count) {
          res.status(400).json({
            message: "Each prize must have category, prize name, and count",
          });
          return;
        }
        if (!validCategories.includes(prize.category)) {
          res.status(400).json({
            message: `Invalid prize category: ${prize.category}`,
          });
          return;
        }
      }

      // Check if event exists
      const event = await Event.findById(eventId);
      if (!event) {
        res.status(404).json({ message: "Event not found" });
        return;
      }

      // Get all eligible tickets (paid, active, not won if duplicates not allowed)
      let eligibleFilter: any = {
        event: eventId,
        status: "active",
        luckyDrawEligible: true,
      };

      if (!allowDuplicateWins) {
        eligibleFilter.hasWon = false;
      }

      const eligibleTickets = await Ticket.find(eligibleFilter)
        .populate("user", "firstName lastName email phone");

      if (eligibleTickets.length === 0) {
        res.status(400).json({
          message: "No eligible tickets found for lucky draw",
        });
        return;
      }

      // Calculate total prizes needed
      const totalPrizesNeeded = prizes.reduce(
        (sum: number, p: any) => sum + p.count,
        0
      );

      if (eligibleTickets.length < totalPrizesNeeded) {
        res.status(400).json({
          message: `Not enough eligible tickets (${eligibleTickets.length}) for ${totalPrizesNeeded} prizes`,
        });
        return;
      }

      // Conduct the draw
      const winners: any[] = [];
      const selectedTicketIds = new Set<string>();

      // Get the latest draw round number
      const lastDraw = await Winner.findOne({ event: eventId })
        .sort({ drawRound: -1 })
        .select("drawRound");
      const drawRound = lastDraw ? lastDraw.drawRound + 1 : 1;

      for (const prizeConfig of prizes) {
        for (let i = 0; i < prizeConfig.count; i++) {
          // Filter out already selected tickets if duplicates not allowed
          let availableTickets = eligibleTickets;
          if (!allowDuplicateWins) {
            availableTickets = eligibleTickets.filter(
              (t) => !selectedTicketIds.has(t._id.toString())
            );
          }

          if (availableTickets.length === 0) {
            console.warn("No more tickets available for prize:", prizeConfig.prize);
            break;
          }

          // Randomly select a winner
          const randomIndex = Math.floor(Math.random() * availableTickets.length);
          const winningTicket = availableTickets[randomIndex];

          // Create winner record
          const winner = await Winner.create({
            event: eventId,
            ticket: winningTicket._id,
            user: winningTicket.user._id,
            prize: prizeConfig.prize,
            prizeCategory: prizeConfig.category,
            drawDate: new Date(),
            drawRound,
            notified: false,
            claimed: false,
            createdBy: adminId,
          });

          // Update ticket
          winningTicket.hasWon = true;
          winningTicket.prizeWon = prizeConfig.prize;
          await winningTicket.save();

          // Mark as selected
          selectedTicketIds.add(winningTicket._id.toString());

          // Populate winner for response
          const populatedWinner = await Winner.findById(winner._id)
            .populate("ticket", "ticketNumber")
            .populate("user", "firstName lastName email phone")
            .populate("event", "title date");

          winners.push(populatedWinner);

          // Create notification for winner
          await Notification.create({
            recipient: winningTicket.user._id,
            title: "Congratulations! You Won!",
            message: `Congratulations! Your ticket ${winningTicket.ticketNumber} won ${prizeConfig.prize} in the lucky draw for ${event.title}!`,
            type: "winner",
            relatedEntity: "Winner",
            relatedId: winner._id,
          });
        }
      }

      // Create audit log
      await createAuditLog(
        "LUCKY_DRAW_CONDUCTED",
        "draw",
        eventId,
        adminId as string,
        {
          eventId,
          drawRound,
          totalWinners: winners.length,
          prizes: prizes.map((p: any) => ({
            category: p.category,
            prize: p.prize,
            count: p.count,
          })),
          allowDuplicateWins,
        }
      );

      res.json({
        message: "Lucky draw conducted successfully",
        drawRound,
        winners,
        totalWinners: winners.length,
        eligibleTickets: eligibleTickets.length,
      });
    } catch (error) {
      console.error("Error conducting lucky draw:", error);
      res.status(500).json({ message: "Failed to conduct lucky draw", error });
    }
  }
);

// GET /api/draw/all-winners - Get all winners across all events (Public)
router.get("/all-winners", async (req: Request, res: Response) => {
  try {
    const { eventId, prizeCategory } = req.query;

    const filter: any = {};
    if (eventId) filter.event = eventId;
    if (prizeCategory) filter.prizeCategory = prizeCategory;

    const winners = await Winner.find(filter)
      .populate("ticket", "ticketNumber")
      .populate("user", "firstName lastName email")
      .populate("event", "title date location image")
      .sort({ drawDate: -1 });

    const eventsWithDraws = await Event.find({
      _id: { $in: await Winner.distinct("event") },
    }).select("title date location image");

    res.json({
      winners,
      events: eventsWithDraws,
      totalWinners: winners.length,
    });
  } catch (error) {
    console.error("Error fetching all winners:", error);
    res.status(500).json({ message: "Failed to fetch winners", error });
  }
});

// GET /api/draw/winners/:eventId - Get all winners for an event
router.get(
  "/winners/:eventId",
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { prizeCategory, drawRound } = req.query;

      const filter: any = { event: eventId };
      if (prizeCategory) filter.prizeCategory = prizeCategory;
      if (drawRound) filter.drawRound = Number(drawRound);

      const winners = await Winner.find(filter)
        .populate("ticket", "ticketNumber")
        .populate("user", "firstName lastName email phone")
        .populate("event", "title date location")
        .sort({ prizeCategory: 1, drawDate: -1 });

      // Group winners by prize category
      const groupedWinners = {
        grand: winners.filter((w) => w.prizeCategory === "grand"),
        first: winners.filter((w) => w.prizeCategory === "first"),
        second: winners.filter((w) => w.prizeCategory === "second"),
        third: winners.filter((w) => w.prizeCategory === "third"),
        consolation: winners.filter((w) => w.prizeCategory === "consolation"),
      };

      res.json({
        winners,
        groupedWinners,
        totalWinners: winners.length,
      });
    } catch (error) {
      console.error("Error fetching winners:", error);
      res.status(500).json({ message: "Failed to fetch winners", error });
    }
  }
);

// GET /api/draw/my-wins - Get user's winning tickets
router.get("/my-wins", authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    const myWins = await Winner.find({ user: userId })
      .populate("ticket", "ticketNumber")
      .populate("event", "title date location image")
      .sort({ drawDate: -1 });

    res.json({
      wins: myWins,
      totalWins: myWins.length,
    });
  } catch (error) {
    console.error("Error fetching user wins:", error);
    res.status(500).json({ message: "Failed to fetch wins", error });
  }
});

// POST /api/draw/notify-winners/:eventId - Notify all winners of an event
router.post(
  "/notify-winners/:eventId",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;
      const { drawRound } = req.body;

      const filter: any = { event: eventId, notified: false };
      if (drawRound) filter.drawRound = drawRound;

      const winners = await Winner.find(filter)
        .populate("user", "firstName lastName email")
        .populate("ticket", "ticketNumber")
        .populate("event", "title");

      if (winners.length === 0) {
        res.status(404).json({
          message: "No unnotified winners found",
        });
        return;
      }

      // Send notifications
      for (const winner of winners) {
        await Notification.create({
          recipient: winner.user._id,
          title: "Lucky Draw Winner!",
          message: `Congratulations! Your ticket ${(winner.ticket as any)?.ticketNumber} won ${winner.prize} in ${(winner.event as any)?.title}. Please contact us to claim your prize.`,
          type: "winner",
          relatedEntity: "Winner",
          relatedId: winner._id,
        });

        winner.notified = true;
        winner.notificationDate = new Date();
        await winner.save();
      }

      res.json({
        message: `${winners.length} winners notified successfully`,
        notifiedCount: winners.length,
      });
    } catch (error) {
      console.error("Error notifying winners:", error);
      res.status(500).json({ message: "Failed to notify winners", error });
    }
  }
);

// PATCH /api/draw/claim/:winnerId - Mark prize as claimed
router.patch(
  "/claim/:winnerId",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { winnerId } = req.params;
      const { notes } = req.body;

      const winner = await Winner.findById(winnerId);
      if (!winner) {
        res.status(404).json({ message: "Winner not found" });
        return;
      }

      winner.claimed = true;
      winner.claimDate = new Date();
      if (notes) winner.notes = notes;
      await winner.save();

      res.json({
        message: "Prize marked as claimed",
        winner,
      });
    } catch (error) {
      console.error("Error marking prize as claimed:", error);
      res.status(500).json({ message: "Failed to update claim status", error });
    }
  }
);

// GET /api/draw/stats/:eventId - Get draw statistics
router.get(
  "/stats/:eventId",
  authenticate,
  authorize(["admin", "superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { eventId } = req.params;

      const totalTickets = await Ticket.countDocuments({ event: eventId });
      const eligibleTickets = await Ticket.countDocuments({
        event: eventId,
        status: "active",
        luckyDrawEligible: true,
      });
      const totalWinners = await Winner.countDocuments({ event: eventId });
      const claimedPrizes = await Winner.countDocuments({
        event: eventId,
        claimed: true,
      });
      const notifiedWinners = await Winner.countDocuments({
        event: eventId,
        notified: true,
      });

      // Winners by category
      const winnersByCategory = await Winner.aggregate([
        { $match: { event: eventId } },
        { $group: { _id: "$prizeCategory", count: { $sum: 1 } } },
      ]);

      res.json({
        stats: {
          totalTickets,
          eligibleTickets,
          totalWinners,
          claimedPrizes,
          notifiedWinners,
          unclaimedPrizes: totalWinners - claimedPrizes,
        },
        winnersByCategory,
      });
    } catch (error) {
      console.error("Error fetching draw stats:", error);
      res.status(500).json({ message: "Failed to fetch draw statistics", error });
    }
  }
);

// DELETE /api/draw/:winnerId - Delete a winner (admin only, for mistakes)
router.delete(
  "/:winnerId",
  authenticate,
  authorize(["superadmin"]),
  async (req: Request, res: Response) => {
    try {
      const { winnerId } = req.params;
      const adminId = req.userId;

      const winner = await Winner.findById(winnerId);
      if (!winner) {
        res.status(404).json({ message: "Winner not found" });
        return;
      }

      // Update ticket
      await Ticket.findByIdAndUpdate(winner.ticket, {
        hasWon: false,
        prizeWon: null,
      });

      // Delete winner
      await Winner.findByIdAndDelete(winnerId);

      // Create audit log
      await createAuditLog(
        "WINNER_DELETED",
        "winner",
        winnerId,
        adminId as string,
        {
          eventId: winner.event,
          ticketId: winner.ticket,
          prize: winner.prize,
        }
      );

      res.json({
        message: "Winner deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting winner:", error);
      res.status(500).json({ message: "Failed to delete winner", error });
    }
  }
);

export default router;
