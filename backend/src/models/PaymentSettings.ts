import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentAccount {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branch?: string;
  /** The name users should use when making payment (e.g., recipient name for transfer) */
  payerNameInstruction?: string;
  instructions: string[];
  requiresPhone: boolean;
  enabled: boolean;
  accent: string;
  iconPath: string;
}

export interface IPaymentSettings extends Document {
  accounts: IPaymentAccount[];
  lastUpdatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const paymentAccountSchema = new Schema<IPaymentAccount>({
  id: {
    type: String,
    required: true,
    enum: ["telebirr", "mpesa", "cbebirr", "bank_transfer"],
  },
  label: {
    type: String,
    required: true,
  },
  shortLabel: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
    default: "",
  },
  branch: {
    type: String,
    default: "",
  },
  payerNameInstruction: {
    type: String,
    default: "",
  },
  instructions: {
    type: [String],
    required: true,
  },
  requiresPhone: {
    type: Boolean,
    default: false,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  accent: {
    type: String,
    default: "blue",
  },
  iconPath: {
    type: String,
    required: true,
  },
}, { _id: false });

const paymentSettingsSchema = new Schema<IPaymentSettings>(
  {
    accounts: {
      type: [paymentAccountSchema],
      required: true,
    },
    lastUpdatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const PaymentSettings = mongoose.model<IPaymentSettings>(
  "PaymentSettings",
  paymentSettingsSchema
);

// Default payment accounts
export const DEFAULT_PAYMENT_ACCOUNTS: IPaymentAccount[] = [
  {
    id: "telebirr",
    label: "TeleBirr",
    shortLabel: "TeleBirr",
    description: "Pay via TeleBirr mobile money to the association account",
    accountName: "Gamtaa Barattoota Ada'aa Bargaa (GBAABW)",
    accountNumber: "0912345678",
    instructions: [
      "Open your TeleBirr app and choose Send Money / Transfer",
      "Enter the association TeleBirr number shown above",
      "Send the exact ticket amount",
      "Copy the transaction ID from the SMS/receipt and paste it below",
    ],
    requiresPhone: true,
    enabled: true,
    accent: "emerald",
    iconPath: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  },
  {
    id: "mpesa",
    label: "M-Pesa",
    shortLabel: "M-Pesa",
    description: "Pay via M-Pesa to the association account",
    accountName: "Gamtaa Barattoota Ada'aa Bargaa (GBAABW)",
    accountNumber: "0712345678",
    instructions: [
      "Open M-Pesa and choose Send Money",
      "Enter the association M-Pesa number shown above",
      "Send the exact ticket amount",
      "Copy the confirmation code and paste it below",
    ],
    requiresPhone: true,
    enabled: true,
    accent: "green",
    iconPath: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "cbebirr",
    label: "CBE Birr",
    shortLabel: "CBE Birr",
    description: "Pay via CBE Birr mobile wallet",
    accountName: "Gamtaa Barattoota Ada'aa Bargaa (GBAABW)",
    accountNumber: "0911223344",
    instructions: [
      "Open CBE Birr and choose Transfer / Send Money",
      "Enter the association CBE Birr number shown above",
      "Send the exact ticket amount",
      "Copy the transaction reference and paste it below",
    ],
    requiresPhone: true,
    enabled: true,
    accent: "blue",
    iconPath: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    shortLabel: "Bank",
    description: "Transfer to the association bank account (auditor account)",
    accountName: "Gamtaa Barattoota Ada'aa Bargaa (GBAABW)",
    accountNumber: "1000123456789",
    bankName: "Commercial Bank of Ethiopia (CBE)",
    branch: "Haramaya Branch",
    instructions: [
      "Transfer the exact ticket amount to the bank account above",
      "Use your full name + ticket purpose in the transfer remark",
      "Keep the bank slip / SMS confirmation",
      "Enter the bank transaction / FT reference number below",
    ],
    requiresPhone: false,
    enabled: true,
    accent: "purple",
    iconPath: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
  },
];
