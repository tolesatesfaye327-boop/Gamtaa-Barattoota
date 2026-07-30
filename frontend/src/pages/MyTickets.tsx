import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";
import QRCode from "qrcode";

interface Ticket {
  _id: string;
  ticketNumber: string;
  status: string;
  purchaseDate: string;
  isCheckedIn: boolean;
  checkInDate?: string;
  hasWon: boolean;
  prizeWon?: string;
  qrCode: string;
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    image: string;
  };
  payment: {
    amount: number;
    status: string;
    paymentMethod: string;
  };
}

export default function MyTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    fetchMyTickets();
  }, []);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/tickets/my-tickets");
      setTickets(response.data.tickets);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event.date);
    const now = new Date();

    if (filter === "upcoming") return eventDate > now;
    if (filter === "past") return eventDate <= now;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your purchased event tickets
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "all", label: `All Tickets (${tickets.length})` },
          {
            value: "upcoming",
            label: `Upcoming (${tickets.filter((t) => new Date(t.event.date) > new Date()).length})`,
          },
          {
            value: "past",
            label: `Past (${tickets.filter((t) => new Date(t.event.date) <= new Date()).length})`,
          },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No tickets found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            You haven't purchased any tickets yet
          </p>
          <Link
            to="/events"
            className="mt-4 inline-block btn-primary"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredTickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}
    </div>
  );
}

function TicketCard({ ticket }: { ticket: Ticket }) {
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    if (showQR && !qrDataUrl) {
      generateQRCode();
    }
  }, [showQR]);

  const generateQRCode = async () => {
    try {
      const url = await QRCode.toDataURL(ticket.qrCode, {
        width: 300,
        margin: 2,
      });
      setQrDataUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const getStatusBadge = () => {
    if (ticket.hasWon) {
      return (
        <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-semibold rounded">
          🎉 WINNER
        </span>
      );
    }
    if (ticket.isCheckedIn) {
      return (
        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded">
          ✓ CHECKED IN
        </span>
      );
    }
    if (ticket.status === "active") {
      return (
        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded">
          ACTIVE
        </span>
      );
    }
    if (ticket.status === "cancelled") {
      return (
        <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-semibold rounded">
          CANCELLED
        </span>
      );
    }
    return null;
  };

  const isPastEvent = new Date(ticket.event.date) < new Date();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex">
        {/* Event Image */}
        <div className="w-32 h-48 bg-gray-200 dark:bg-gray-700 flex-shrink-0">
          {ticket.event.image ? (
            <img
              src={ticket.event.image}
              alt={ticket.event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          )}
        </div>

        {/* Ticket Details */}
        <div className="flex-1 p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {ticket.event.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ticket #{ticket.ticketNumber}
              </p>
            </div>
            {getStatusBadge()}
          </div>

          {/* Winner Badge */}
          {ticket.hasWon && ticket.prizeWon && (
            <div className="mb-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                🎊 Congratulations! You won: {ticket.prizeWon}
              </p>
            </div>
          )}

          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>
                {new Date(ticket.event.date).toLocaleDateString()} 
                {isPastEvent && " (Past)"}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1">{ticket.event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>ETB {ticket.payment.amount}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/my-tickets/${ticket._id}`}
              className="flex-1 text-center px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-all"
            >
              View Details
            </Link>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-all"
            >
              {showQR ? "Hide QR" : "Show QR"}
            </button>
          </div>

          {/* QR Code Display */}
          {showQR && qrDataUrl && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-900 rounded-lg text-center">
              <img src={qrDataUrl} alt="Ticket QR Code" className="mx-auto w-40 h-40" />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Show this QR code at the event entrance
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
