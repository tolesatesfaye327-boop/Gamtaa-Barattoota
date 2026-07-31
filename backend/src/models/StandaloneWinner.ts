import mongoose, { Document, Schema } from "mongoose";

export interface IStandaloneWinner extends Document {
  ticketProduct: mongoose.Types.ObjectId;
  ticket: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  prize: string;
  prizeCategory: "grand" | "first" | "second" | "third" | "consolation";
  drawDate: Date;
  drawRound: number;
  notified: boolean;
  notificationDate?: Date;
  claimed: boolean;
  claimDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
}

const standaloneWinnerSchema = new Schema<IStandaloneWinner>(
  {
    ticketProduct: { type: Schema.Types.ObjectId, ref: "TicketProduct", required: true, index: true },
    ticket: { type: Schema.Types.ObjectId, ref: "PurchasedTicket", required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    prize: { type: String, required: true },
    prizeCategory: {
      type: String,
      enum: ["grand", "first", "second", "third", "consolation"],
      required: true,
    },
    drawDate: { type: Date, default: Date.now },
    drawRound: { type: Number, default: 1 },
    notified: { type: Boolean, default: false },
    notificationDate: Date,
    claimed: { type: Boolean, default: false },
    claimDate: Date,
    notes: String,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true },
);

export const StandaloneWinner = mongoose.model<IStandaloneWinner>(
  "StandaloneWinner",
  standaloneWinnerSchema,
);
