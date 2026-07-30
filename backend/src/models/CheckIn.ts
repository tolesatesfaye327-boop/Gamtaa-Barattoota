import mongoose, { Schema, Document } from "mongoose";

export interface ICheckIn extends Document {
  ticket: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkInBy: mongoose.Types.ObjectId; // Admin who checked in
  method: "qr" | "manual";
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const checkInSchema = new Schema<ICheckIn>(
  {
    ticket: {
      type: Schema.Types.ObjectId,
      ref: "Ticket",
      required: true,
      index: true,
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
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkInBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    method: {
      type: String,
      enum: ["qr", "manual"],
      default: "qr",
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate check-ins
checkInSchema.index({ ticket: 1, event: 1 }, { unique: true });

export const CheckIn = mongoose.model<ICheckIn>("CheckIn", checkInSchema);
