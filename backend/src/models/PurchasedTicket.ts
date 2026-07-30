import mongoose, { Schema, Document } from "mongoose";

export interface IPurchasedTicket extends Document {
  ticketNumber: string;
  ticketProduct: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  payment: mongoose.Types.ObjectId;
  qrCode: string;
  status: "active" | "used" | "expired" | "cancelled" | "refunded";
  purchaseDate: Date;
  usedDate?: Date;
  isUsed: boolean;
  quantity: number;
  totalAmount: number;
  validUntil?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const purchasedTicketSchema = new Schema<IPurchasedTicket>(
  {
    ticketNumber: {
      type: String,
      required: true,
      unique: true,
    },
    ticketProduct: {
      type: Schema.Types.ObjectId,
      ref: "TicketProduct",
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
      enum: ["active", "used", "expired", "cancelled", "refunded"],
      default: "active",
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    usedDate: {
      type: Date,
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    validUntil: {
      type: Date,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
purchasedTicketSchema.index({ ticketProduct: 1, user: 1 });
purchasedTicketSchema.index({ status: 1 });

export const PurchasedTicket = mongoose.model<IPurchasedTicket>(
  "PurchasedTicket",
  purchasedTicketSchema
);
