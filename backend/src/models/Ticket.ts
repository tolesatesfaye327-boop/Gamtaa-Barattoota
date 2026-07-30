import mongoose, { Schema, Document } from "mongoose";

export interface ITicket extends Document {
  ticketNumber: string;
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  payment: mongoose.Types.ObjectId;
  qrCode: string;
  status: "active" | "used" | "cancelled" | "refunded";
  purchaseDate: Date;
  checkInDate?: Date;
  isCheckedIn: boolean;
  luckyDrawEligible: boolean;
  hasWon: boolean;
  prizeWon?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    qrCode: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "used", "cancelled", "refunded"],
      default: "active",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    checkInDate: {
      type: Date,
    },
    isCheckedIn: {
      type: Boolean,
      default: false,
    },
    luckyDrawEligible: {
      type: Boolean,
      default: true,
    },
    hasWon: {
      type: Boolean,
      default: false,
    },
    prizeWon: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
ticketSchema.index({ event: 1, user: 1 });

export const Ticket = mongoose.model<ITicket>("Ticket", ticketSchema);
