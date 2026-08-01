import express, { Request, Response, Router } from "express";
import { Payment } from "../models/Payment.js";
import { PurchasedTicket } from "../models/PurchasedTicket.js";
import { StandaloneWinner } from "../models/StandaloneWinner.js";
import { TicketProduct } from "../models/TicketProduct.js";
import { Notification } from "../models/Notification.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router: Router = express.Router();
const ADMIN_ROLES = ["admin", "superadmin"];
const CATEGORIES = ["grand", "first", "second", "third", "consolation"];
const activeDraws = new Map<string, { prize: string; selectedTicket?: string }>();

async function completedPaymentIds() {
  return Payment.distinct("_id", { status: "completed" });
}

async function liveDraw(ticketProductId: string) {
  const product = await TicketProduct.findById(ticketProductId).select(
    "title luckyDrawVisible",
  );
  if (!product) return null;

  const tickets = await PurchasedTicket.find({
    ticketProduct: ticketProductId,
    status: "active",
    payment: { $in: await completedPaymentIds() },
  }).select("ticketNumber").lean();
  const winners = await StandaloneWinner.find({ ticketProduct: ticketProductId })
    .populate("ticket", "ticketNumber")
    .populate("user", "firstName lastName email phone")
    .sort({ drawDate: -1 })
    .lean();

  return {
    event: { _id: product._id, title: product.title, luckyDrawVisible: product.luckyDrawVisible },
    tickets,
    winners,
    isDrawing: activeDraws.has(ticketProductId),
    currentPrize: activeDraws.get(ticketProductId)?.prize || "",
    selectedTicket: activeDraws.get(ticketProductId)?.selectedTicket || "",
  };
}

router.get("/live", async (_req: Request, res: Response) => {
  try {
    const products = await TicketProduct.find({ luckyDrawVisible: true }).select("_id");
    const draws = await Promise.all(products.map((product) => liveDraw(product._id.toString())));
    res.json({ draws: draws.filter(Boolean) });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch live ticket draws" });
  }
});

router.get("/live/:ticketProductId", async (req: Request, res: Response) => {
  try {
    const draw = await liveDraw(req.params.ticketProductId);
    if (!draw) { res.status(404).json({ message: "Ticket product not found" }); return; }
    res.json(draw);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch live ticket draw" });
  }
});

router.patch("/visibility/:ticketProductId", authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  if (typeof req.body.visible !== "boolean") { res.status(400).json({ message: "visible must be a boolean" }); return; }
  const product = await TicketProduct.findByIdAndUpdate(req.params.ticketProductId, { luckyDrawVisible: req.body.visible }, { new: true }).select("_id title luckyDrawVisible");
  if (!product) { res.status(404).json({ message: "Ticket product not found" }); return; }
  res.json({ event: product, message: req.body.visible ? "Ticket draw enabled" : "Ticket draw disabled" });
});

router.post("/conduct", authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  try {
    const { ticketProductId, prizes, allowDuplicateWins = false } = req.body;
    if (!ticketProductId || !Array.isArray(prizes) || prizes.length === 0) { res.status(400).json({ message: "Ticket product and prizes are required" }); return; }
    if (prizes.some((prize: any) => !CATEGORIES.includes(prize.category) || !prize.prize?.trim() || !Number.isInteger(prize.count) || prize.count < 1)) {
      res.status(400).json({ message: "Each prize must have a valid category, name, and count" }); return;
    }
    const product = await TicketProduct.findById(ticketProductId);
    if (!product) { res.status(404).json({ message: "Ticket product not found" }); return; }
    activeDraws.set(ticketProductId, { prize: "Preparing the draw" });
    const filter: any = { ticketProduct: ticketProductId, status: "active", payment: { $in: await completedPaymentIds() } };
    const existingWinnerTickets = allowDuplicateWins ? [] : await StandaloneWinner.find({ ticketProduct: ticketProductId }).distinct("ticket");
    if (existingWinnerTickets.length) filter._id = { $nin: existingWinnerTickets };
    const tickets = await PurchasedTicket.find(filter).populate("user", "firstName lastName email phone");
    const needed = prizes.reduce((sum: number, prize: any) => sum + prize.count, 0);
    if (tickets.length < needed) { res.status(400).json({ message: `Not enough paid tickets (${tickets.length}) for ${needed} prizes` }); return; }
    const last = await StandaloneWinner.findOne({ ticketProduct: ticketProductId }).sort({ drawRound: -1 }).select("drawRound");
    const drawRound = last ? last.drawRound + 1 : 1;
    const selected = new Set<string>();
    const winners = [];
    for (const prize of prizes) {
      activeDraws.set(ticketProductId, { prize: `${prize.prize} (${prize.category})` });
      for (let i = 0; i < prize.count; i++) {
        const available = allowDuplicateWins ? tickets : tickets.filter((ticket) => !selected.has(ticket._id.toString()));
        const ticket: any = available[Math.floor(Math.random() * available.length)];
        activeDraws.set(ticketProductId, {
          prize: `${prize.prize} (${prize.category})`,
          selectedTicket: ticket.ticketNumber,
        });
        const winner = await StandaloneWinner.create({ ticketProduct: ticketProductId, ticket: ticket._id, user: ticket.user._id, prize: prize.prize, prizeCategory: prize.category, drawRound, createdBy: req.userId });
        selected.add(ticket._id.toString());
        await Notification.create({ recipient: ticket.user._id, title: "Congratulations! You Won!", message: `Your ticket ${ticket.ticketNumber} won ${prize.prize} in ${product.title}.`, type: "winner", relatedEntity: "StandaloneWinner", relatedId: winner._id });
        winners.push(await StandaloneWinner.findById(winner._id).populate("ticket", "ticketNumber").populate("user", "firstName lastName email phone"));
      }
    }
    res.json({ message: "Ticket lucky draw conducted successfully", winners, totalWinners: winners.length, eligibleTickets: tickets.length, drawRound });
  } catch (error) {
    console.error("Standalone draw error:", error);
    res.status(500).json({ message: "Failed to conduct ticket lucky draw" });
  } finally {
    activeDraws.delete(req.body.ticketProductId);
  }
});

router.get("/winners/:ticketProductId", async (req: Request, res: Response) => {
  const winners = await StandaloneWinner.find({ ticketProduct: req.params.ticketProductId }).populate("ticket", "ticketNumber").populate("user", "firstName lastName email phone").populate("ticketProduct", "title").sort({ drawDate: -1 });
  res.json({ winners, totalWinners: winners.length });
});

router.get("/all-winners", async (_req: Request, res: Response) => {
  const winners = await StandaloneWinner.find().populate("ticket", "ticketNumber").populate("user", "firstName lastName email phone").populate("ticketProduct", "title").sort({ drawDate: -1 });
  const normalized = winners.map((winner: any) => ({ ...winner.toObject(), event: { _id: winner.ticketProduct?._id, title: winner.ticketProduct?.title } }));
  res.json({ winners: normalized, events: [], totalWinners: normalized.length });
});

router.get("/stats/:ticketProductId", authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  const filter = { ticketProduct: req.params.ticketProductId, status: "active", payment: { $in: await completedPaymentIds() } };
  const [totalTickets, eligibleTickets, totalWinners, claimedPrizes, notifiedWinners] = await Promise.all([
    PurchasedTicket.countDocuments({ ticketProduct: req.params.ticketProductId }),
    PurchasedTicket.countDocuments(filter),
    StandaloneWinner.countDocuments({ ticketProduct: req.params.ticketProductId }),
    StandaloneWinner.countDocuments({ ticketProduct: req.params.ticketProductId, claimed: true }),
    StandaloneWinner.countDocuments({ ticketProduct: req.params.ticketProductId, notified: true }),
  ]);
  res.json({ stats: { totalTickets, eligibleTickets, totalWinners, claimedPrizes, notifiedWinners, unclaimedPrizes: totalWinners - claimedPrizes }, winnersByCategory: [] });
});

router.post("/notify-winners/:ticketProductId", authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  const winners: any[] = await StandaloneWinner.find({ ticketProduct: req.params.ticketProductId, notified: false }).populate("ticket", "ticketNumber").populate("user", "firstName lastName").populate("ticketProduct", "title");
  for (const winner of winners) { await Notification.create({ recipient: winner.user._id, title: "Lucky Draw Winner!", message: `Your ticket ${winner.ticket.ticketNumber} won ${winner.prize} in ${winner.ticketProduct.title}.`, type: "winner", relatedEntity: "StandaloneWinner", relatedId: winner._id }); winner.notified = true; winner.notificationDate = new Date(); await winner.save(); }
  res.json({ message: `${winners.length} winners notified successfully`, notifiedCount: winners.length });
});

router.patch("/claim/:winnerId", authenticate, authorize(ADMIN_ROLES), async (req: Request, res: Response) => {
  const winner = await StandaloneWinner.findByIdAndUpdate(req.params.winnerId, { claimed: true, claimDate: new Date(), notes: req.body.notes }, { new: true });
  if (!winner) { res.status(404).json({ message: "Winner not found" }); return; }
  res.json({ message: "Prize marked as claimed", winner });
});

// Delete winner (superadmin only)
router.delete("/winner/:winnerId", authenticate, authorize(["superadmin"]), async (req: Request, res: Response) => {
  try {
    const winner = await StandaloneWinner.findByIdAndDelete(req.params.winnerId);
    if (!winner) { 
      res.status(404).json({ message: "Winner not found" }); 
      return; 
    }
    res.json({ message: "Winner deleted successfully", winner });
  } catch (error) {
    console.error("Error deleting winner:", error);
    res.status(500).json({ message: "Failed to delete winner" });
  }
});

export default router;
