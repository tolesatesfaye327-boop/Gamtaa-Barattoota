import mongoose, { Schema, Document } from "mongoose";

export interface ITicketProduct extends Document {
  title: string;
  description: string;
  category: "membership" | "service" | "merchandise" | "donation" | "other";
  price: number;
  availableQuantity: number;
  soldQuantity: number;
  isActive: boolean;
  image?: string;
  validFrom?: Date;
  validUntil?: Date;
  features?: string[];
  metadata?: Record<string, any>;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ticketProductSchema = new Schema<ITicketProduct>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["membership", "service", "merchandise", "donation", "other"],
      default: "other",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availableQuantity: {
      type: Number,
      required: true,
      min: 0,
    },
    soldQuantity: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
    },
    validFrom: {
      type: Date,
    },
    validUntil: {
      type: Date,
    },
    features: [
      {
        type: String,
      },
    ],
    metadata: {
      type: Schema.Types.Mixed,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const TicketProduct = mongoose.model<ITicketProduct>(
  "TicketProduct",
  ticketProductSchema
);
