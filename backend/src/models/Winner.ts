import mongoose, { Schema, Document } from "mongoose";

export interface IWinner extends Document {
  event: mongoose.Types.ObjectId;
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
  createdBy: mongoose.Types.ObjectId; // Admin who conducted the draw
  createdAt: Date;
  updatedAt: Date;
}

const winnerSchema = new Schema<IWinner>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    prize: {
      type: String,
      required: true,
    },
    prizeCategory: {
      type: String,
      enum: ["grand", "first", "second", "third", "consolation"],
      required: true,
    },
    drawDate: {
      type: Date,
      default: Date.now,
    },
    drawRound: {
      type: Number,
      default: 1,
    },
    notified: {
      type: Boolean,
      default: false,
    },
    notificationDate: {
      type: Date,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    claimDate: {
      type: Date,
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
winnerSchema.index({ event: 1, prizeCategory: 1 });
winnerSchema.index({ ticket: 1 });

export const Winner = mongoose.model<IWinner>("Winner", winnerSchema);
