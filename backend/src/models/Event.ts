import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  endDate: Date;
  location: string;
  organizer: mongoose.Types.ObjectId;
  attendees: mongoose.Types.ObjectId[];
  image: string;
  category: string;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  maxAttendees: number;
  isPublic: boolean;
  // Ticketing fields
  hasTicketing: boolean;
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
  ticketingEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
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
    date: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    attendees: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    image: {
      type: String,
      default: "",
    },
    category: {
      type: String,
      enum: [
        "conference",
        "workshop",
        "social",
        "meeting",
        "seminar",
        "webinar",
        "training",
        "other",
      ],
      default: "other",
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    maxAttendees: {
      type: Number,
      default: null,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    // Ticketing fields
    hasTicketing: {
      type: Boolean,
      default: false,
    },
    ticketPrice: {
      type: Number,
      default: 0,
    },
    ticketsAvailable: {
      type: Number,
      default: 0,
    },
    ticketsSold: {
      type: Number,
      default: 0,
    },
    ticketingEnabled: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
