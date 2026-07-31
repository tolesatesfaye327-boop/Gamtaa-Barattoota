import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";

interface CheckInResult {
  success: boolean;
  message: string;
  ticket?: {
    ticketNumber: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    event: {
      title: string;
    };
    checkInDate?: string;
  };
}

export default function QRScanner() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  
  const [manualTicketNumber, setManualTicketNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (eventId) {
      fetchCheckInStats();
    }
  }, [eventId]);

  const fetchCheckInStats = async () => {
    try {
      const response = await apiClient.get(`/checkin/stats/${eventId}`);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTicketNumber.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await apiClient.post("/checkin/manual", {
        ticketNumber: manualTicketNumber.trim(),
      });
      setResult({
        success: true,
        message: response.data.message,
        ticket: response.data.ticket,
      });
      setManualTicketNumber("");
      fetchCheckInStats(); // Refresh stats
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.message || "Check-in failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Event Check-in
          </h1>
          <p className="text-gray-400">
            Scan QR codes or enter ticket numbers manually
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/tickets")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
        >
          Back to Tickets
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Total Tickets
            </h3>
            <p className="text-3xl font-bold text-white">{stats.totalTickets}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Checked In
            </h3>
            <p className="text-3xl font-bold text-green-400">{stats.checkedIn}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 text-center">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Attendance Rate
            </h3>
            <p className="text-3xl font-bold text-blue-400">{stats.attendanceRate}%</p>
          </div>
        </div>
      )}

      {/* QR Scanner Section */}
      <div className="bg-gray-800 rounded-xl p-8 mb-6">
        <h2 className="text-xl font-bold text-white mb-6 text-center">
          QR Code Scanner
        </h2>
        
        <div className="bg-gray-900 rounded-lg p-8 mb-6">
          <div className="aspect-square max-w-sm mx-auto bg-gray-800 rounded-lg flex items-center justify-center border-4 border-dashed border-gray-700">
            <div className="text-center">
              <svg
                className="w-24 h-24 text-gray-600 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              <p className="text-gray-400 text-sm">
                QR Scanner will be activated here
              </p>
              <p className="text-gray-500 text-xs mt-2">
                Use manual check-in below for now
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-gray-400 text-sm">
          📱 Point the camera at the ticket QR code to check-in
        </p>
      </div>

      {/* Manual Check-in */}
      <div className="bg-gray-800 rounded-xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">
          Manual Check-in
        </h2>

        <form onSubmit={handleManualCheckIn} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enter Ticket Number
            </label>
            <input
              type="text"
              value={manualTicketNumber}
              onChange={(e) => setManualTicketNumber(e.target.value)}
              placeholder="EVT-2026-000001"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !manualTicketNumber.trim()}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Checking in...
              </span>
            ) : (
              "Check In"
            )}
          </button>
        </form>
      </div>

      {/* Result Display */}
      {result && (
        <div
          className={`mt-6 rounded-xl p-6 border-2 ${
            result.success
              ? "bg-green-900/20 border-green-500"
              : "bg-red-900/20 border-red-500"
          }`}
        >
          <div className="flex items-start gap-4">
            {result.success ? (
              <svg
                className="w-8 h-8 text-green-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg
                className="w-8 h-8 text-red-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}

            <div className="flex-1">
              <h3
                className={`text-lg font-bold mb-2 ${
                  result.success ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.success ? "Check-in Successful!" : "Check-in Failed"}
              </h3>
              <p className="text-white mb-4">{result.message}</p>

              {result.ticket && (
                <div className="bg-gray-900/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ticket Number:</span>
                    <span className="font-mono text-white font-semibold">
                      {result.ticket.ticketNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Attendee:</span>
                    <span className="text-white">
                      {result.ticket.user.firstName} {result.ticket.user.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{result.ticket.user.email}</span>
                  </div>
                  {result.ticket.checkInDate && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Check-in Time:</span>
                      <span className="text-white">
                        {new Date(result.ticket.checkInDate).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
