import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/api";
import QRCode from "qrcode";

interface PurchasedTicket {
  _id: string;
  ticketNumber: string;
  ticketProduct: {
    _id: string;
    title: string;
    category: string;
    price: number;
  };
  quantity: number;
  totalAmount: number;
  qrCode: string;
  status: string;
  purchaseDate: string;
}

export default function MyPurchasedTickets() {
  const { token } = useAuthStore();
  const [tickets, setTickets] = useState<PurchasedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<PurchasedTicket | null>(
    null
  );
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token]);

  const fetchTickets = async () => {
    try {
      const response = await apiClient.get("/ticket-products/my/purchases");
      // Backend returns { tickets: [], count: number }
      const data = response.data;
      setTickets(Array.isArray(data) ? data : data.tickets || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const showQRCode = async (ticket: PurchasedTicket) => {
    setSelectedTicket(ticket);
    try {
      const url = await QRCode.toDataURL(ticket.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeUrl || !selectedTicket) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `ticket-${selectedTicket.ticketNumber}.png`;
    link.click();
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      used: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400",
      expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.active}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          My Purchased Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and manage your purchased tickets
        </p>
      </div>

      {/* Tickets List */}
      {tickets.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No tickets yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Purchase your first ticket to get started
          </p>
          <Link to="/tickets" className="btn-primary inline-block">
            Browse Tickets
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket._id}
              className="glass-card rounded-xl p-6 hover:shadow-lg transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Ticket Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                    />
                  </svg>
                </div>

                {/* Ticket Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {ticket.ticketProduct.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ticket #{ticket.ticketNumber}
                      </p>
                    </div>
                    {getStatusBadge(ticket.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                        />
                      </svg>
                      <span className="capitalize">{ticket.ticketProduct.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      <span>Quantity: {ticket.quantity}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>
                        {new Date(ticket.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-semibold text-primary">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>${ticket.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={() => showQRCode(ticket)}
                  className="btn-primary whitespace-nowrap"
                >
                  View QR Code
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {selectedTicket && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTicket(null)}
        >
          <div
            className="glass-card rounded-2xl max-w-md w-full p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedTicket.ticketProduct.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Ticket #{selectedTicket.ticketNumber}
              </p>

              {/* QR Code */}
              <div className="bg-white p-6 rounded-xl mb-6 inline-block">
                {qrCodeUrl && (
                  <img
                    src={qrCodeUrl}
                    alt="QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                )}
              </div>

              {/* Status */}
              <div className="mb-6">{getStatusBadge(selectedTicket.status)}</div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={downloadQRCode}
                  className="flex-1 btn-primary"
                >
                  Download QR
                </button>
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
