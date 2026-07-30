import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
    description: string;
    date: string;
    endDate: string;
    location: string;
    image: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  payment: {
    amount: number;
    status: string;
    paymentMethod: string;
    transactionId?: string;
  };
}

export default function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const newPurchase = location.state?.newPurchase;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [showSuccessMessage, setShowSuccessMessage] = useState(newPurchase);

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  useEffect(() => {
    if (ticket) {
      generateQRCode();
    }
  }, [ticket]);

  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/tickets/${ticketId}`);
      setTicket(response.data.ticket);
    } catch (error) {
      console.error("Error fetching ticket:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!ticket) return;
    try {
      const url = await QRCode.toDataURL(ticket.qrCode, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
      setQrDataUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const downloadTicketPDF = () => {
    // In a real app, you'd generate a proper PDF on the backend
    // For now, we'll open a print dialog
    window.print();
  };

  const downloadQRCode = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.download = `ticket-${ticket?.ticketNumber}-qr.png`;
    link.href = qrDataUrl;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ticket not found
          </h2>
          <button
            onClick={() => navigate("/my-tickets")}
            className="text-primary-600 hover:underline"
          >
            Back to My Tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-green-800 dark:text-green-300">
                Purchase Successful!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-400">
                Your ticket has been generated. Save this page or download the PDF.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate("/my-tickets")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6 print:hidden"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to My Tickets
      </button>

      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .print\\:hidden, nav, footer, header { display: none !important; }
          .print-card { box-shadow: none !important; border: 2px solid #e5e7eb !important; page-break-inside: avoid; margin: 0 auto; }
        }
      `}</style>

      {/* Digital Ticket */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6 print-card">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Event Ticket</h1>
              <p className="text-primary-100">GBAABW Association</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-100">Ticket Number</p>
              <p className="text-xl font-bold">{ticket.ticketNumber}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex gap-2 flex-wrap">
            {ticket.hasWon && (
              <span className="px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full">
                🎉 WINNER: {ticket.prizeWon}
              </span>
            )}
            {ticket.isCheckedIn && (
              <span className="px-3 py-1 bg-green-400 text-green-900 text-xs font-bold rounded-full">
                ✓ CHECKED IN
              </span>
            )}
            {ticket.status === "active" && !ticket.isCheckedIn && (
              <span className="px-3 py-1 bg-white text-primary-600 text-xs font-bold rounded-full">
                VALID
              </span>
            )}
          </div>
        </div>

        <div className="p-6">
          {/* Event Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {ticket.event.title}
              </h2>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Event Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(ticket.event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Venue</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.event.location}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Attendee</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {ticket.user.firstName} {ticket.user.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {ticket.user.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Purchase Date</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(ticket.purchaseDate).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Payment Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      ticket.payment.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                    }`}>
                      {ticket.payment.status.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ETB {ticket.payment.amount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-md">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Ticket QR Code"
                    className="w-64 h-64"
                  />
                ) : (
                  <div className="w-64 h-64 bg-gray-100 dark:bg-gray-700 animate-pulse rounded"></div>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-3 max-w-xs">
                Show this QR code at the event entrance for check-in
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap print:hidden">
            <button
              onClick={downloadTicketPDF}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>

            <button
              onClick={downloadQRCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Download QR Code
            </button>
          </div>

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Important Information
            </h3>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Present this ticket (digital or printed) at the event entrance</li>
              <li>• This ticket is non-transferable and valid for one person only</li>
              <li>• QR code will be scanned once for entry</li>
              <li>• Keep this ticket safe until after the event</li>
              {ticket.hasWon && <li>• Contact event organizers to claim your prize</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 print:hidden">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          About This Event
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {ticket.event.description}
        </p>
        <button
          onClick={() => navigate(`/events/${ticket.event._id}`)}
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-sm"
        >
          View Full Event Details →
        </button>
      </div>
    </div>
  );
}
