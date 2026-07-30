import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  member: mongoose.Types.ObjectId;
  /** User who submitted the payment (for ticket issuance) */
  user: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  paymentType: "membership_fee" | "donation" | "event_fee" | "other";
  paymentMethod:
    | "cash"
    | "bank_transfer"
    | "mobile_money"
    | "credit_card"
    | "other";
  /** Specific channel: telebirr | mpesa | cbebirr | bank_transfer */
  paymentChannel: string;
  /** Association / auditor account number the user paid to */
  associationAccount: string;
  /** Name the payer used on the transfer */
  payerName: string;
  /** Phone the payer sent money from (mobile money) */
  phoneNumber: string;
  transactionId: string;
  status: "pending" | "completed" | "failed" | "refunded" | "rejected";
  /** Screenshot / slip URL uploaded by user */
  receiptUrl: string;
  notes: string;
  purpose: string;
  description: string;
  metadata: Record<string, unknown>;
  /** Ticket target after approval */
  relatedType: "event_ticket" | "ticket_product" | "other" | "";
  relatedEvent?: mongoose.Types.ObjectId;
  relatedTicketProduct?: mongoose.Types.ObjectId;
  quantity: number;
  /** Issued ticket after auditor approval */
  issuedTicket?: mongoose.Types.ObjectId;
  issuedTicketModel?: "Ticket" | "PurchasedTicket" | "";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewNotes: string;
  paymentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    member: {
      type: Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "ETB",
    },
    paymentType: {
      type: String,
      enum: ["membership_fee", "donation", "event_fee", "other"],
      default: "other",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank_transfer", "mobile_money", "credit_card", "other"],
      default: "other",
    },
    paymentChannel: {
      type: String,
      default: "",
    },
    associationAccount: {
      type: String,
      default: "",
    },
    payerName: {
      type: String,
      default: "",
    },
    phoneNumber: {
      type: String,
      default: "",
    },
    transactionId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded", "rejected"],
      default: "pending",
      index: true,
    },
    receiptUrl: {
      type: String,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    purpose: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    relatedType: {
      type: String,
      enum: ["event_ticket", "ticket_product", "other", ""],
      default: "",
    },
    relatedEvent: {
      type: Schema.Types.ObjectId,
      ref: "Event",
    },
    relatedTicketProduct: {
      type: Schema.Types.ObjectId,
      ref: "TicketProduct",
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    issuedTicket: {
      type: Schema.Types.ObjectId,
      refPath: "issuedTicketModel",
    },
    issuedTicketModel: {
      type: String,
      enum: ["Ticket", "PurchasedTicket", ""],
      default: "",
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    reviewNotes: {
      type: String,
      default: "",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ user: 1, status: 1 });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
