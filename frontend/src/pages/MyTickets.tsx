import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
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
  luckyDrawEligible: boolean;
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    image: string;
    category: string;
  };
  payment: {
    amount: number;
    status: string;
    paymentMethod: string;
  };
}

export default function MyTickets() {
  const location = useLocation();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "winners">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchMyTickets();
    
    // Check for success message from purchase
    if (location.state?.newPurchase) {
      setSuccessMessage(location.state?.message || "Ticket purchased successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [location]);

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

    // Search filter
    if (searchQuery && !ticket.event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !ticket.event.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filter === "upcoming") return eventDate > now && ticket.status === "active";
    if (filter === "past") return eventDate <= now;
    if (filter === "winners") return ticket.hasWon;
    return true;
  });

  // Calculate stats
  const totalTickets = tickets.length;
  const upcomingTickets = tickets.filter(t => new Date(t.event.date) > new Date() && t.status === "active").length;
  const winnersCount = tickets.filter(t => t.hasWon).length;
  const checkedInCount = tickets.filter(t => t.isCheckedIn).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-900/30 border border-green-500/50 text-green-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-fade-in">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{successMessage}</span>
          </div>
        )}

        {/* Header */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            My Tickets
          </h1>
          <p className="text-gray-400 text-lg">
            View and manage your purchased event tickets
          </p>
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-400 font-semibold text-sm">Total</h3>
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{totalTickets}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-400 font-semibold text-sm">Upcoming</h3>
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{upcomingTickets}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-500/10 border border-yellow-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-yellow-400 font-semibold text-sm">Winners</h3>
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{winnersCount}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-400 font-semibold text-sm">Used</h3>
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{checkedInCount}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by event name, ticket number, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: `All (${totalTickets})`, icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { value: "upcoming", label: `Upcoming (${upcomingTickets})`, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: "past", label: `Past (${tickets.filter(t => new Date(t.event.date) <= new Date()).length})`, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: "winners", label: `Winners (${winnersCount})`, icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === tab.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        {filteredTickets.length === 0 ? (
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-12 text-center">
            <svg
              className="mx-auto h-16 w-16 text-gray-600 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchQuery ? "No tickets found" : "No tickets yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery 
                ? "Try adjusting your search or filters"
                : "You haven't purchased any tickets yet"}
            </p>
            {searchQuery ? (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/tickets"
                className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg shadow-blue-600/25"
              >
                Browse Events
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTickets.map((ticket) => (
              <TicketCard key={ticket._id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
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
        width: 400,
        margin: 2,
        color: {
          dark: "#1f2937",
          light: "#ffffff",
        },
      });
      setQrDataUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const getStatusBadge = () => {
    if (ticket.hasWon) {
      return (
        <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 text-xs font-bold rounded-lg border border-yellow-500/30 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          WINNER
        </span>
      );
    }
    if (ticket.isCheckedIn) {
      return (
        <span className="px-3 py-1.5 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/30">
          ✓ CHECKED IN
        </span>
      );
    }
    if (ticket.status === "active") {
      return (
        <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 text-xs font-bold rounded-lg border border-blue-500/30">
          ACTIVE
        </span>
      );
    }
    if (ticket.status === "cancelled") {
      return (
        <span className="px-3 py-1.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-lg border border-red-500/30">
          CANCELLED
        </span>
      );
    }
    return null;
  };

  const isPastEvent = new Date(ticket.event.date) < new Date();
  const eventDate = new Date(ticket.event.date);

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all group">
      <div className="relative">
        {/* Event Image */}
        <div className="relative h-40 bg-gray-700 overflow-hidden">
          {ticket.event.image ? (
            <img
              src={ticket.event.image}
              alt={ticket.event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
              <svg className="w-16 h-16 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          )}
          {isPastEvent && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-gray-900/80 backdrop-blur-sm text-gray-400 text-xs font-medium rounded">
              Past Event
            </div>
          )}
          <div className="absolute top-2 right-2">
            {getStatusBadge()}
          </div>
        </div>

        {/* Ticket Details */}
        <div className="p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
              {ticket.event.title}
            </h3>
            <p className="text-sm text-gray-500 font-mono">
              #{ticket.ticketNumber}
            </p>
          </div>

          {/* Winner Badge */}
          {ticket.hasWon && ticket.prizeWon && (
            <div className="mb-4 p-3 bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border border-yellow-500/50 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <div>
                  <p className="text-sm font-bold text-yellow-400">Congratulations!</p>
                  <p className="text-xs text-yellow-300">You won: {ticket.prizeWon}</p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white">{eventDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="line-clamp-1 text-white">{ticket.event.location}</span>
            </div>

            <div className="flex items-center gap-2.5 text-sm text-gray-400">
              <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="text-white font-semibold">{ticket.payment.amount} ETB</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              to={`/tickets/${ticket._id}`}
              className="flex-1 text-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-lg transition-all shadow-lg shadow-blue-600/25"
            >
              View Details
            </Link>
            <button
              onClick={() => setShowQR(!showQR)}
              className="px-4 py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-sm font-semibold rounded-lg transition-all border border-gray-600/50"
            >
              {showQR ? "Hide QR" : "Show QR"}
            </button>
          </div>

          {/* QR Code Display */}
          {showQR && (
            <div className="mt-4 p-4 bg-white rounded-lg text-center animate-fade-in">
              {qrDataUrl ? (
                <>
                  <img src={qrDataUrl} alt="Ticket QR Code" className="mx-auto w-48 h-48 mb-3" />
                  <p className="text-xs text-gray-600 font-medium mb-2">
                    Show this QR code at the event entrance
                  </p>
                  <button
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = qrDataUrl;
                      link.download = `ticket-${ticket.ticketNumber}.png`;
                      link.click();
                    }}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Download QR Code
                  </button>
                </>
              ) : (
                <div className="py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
