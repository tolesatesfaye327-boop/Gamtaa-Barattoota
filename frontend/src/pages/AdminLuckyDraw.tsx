import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/api";

interface Prize {
  category: "grand" | "first" | "second" | "third" | "consolation";
  prize: string;
  count: number;
}

interface Winner {
  _id: string;
  ticket: {
    ticketNumber: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  prize: string;
  prizeCategory: string;
  drawDate: string;
  notified: boolean;
  claimed: boolean;
}

interface DrawStats {
  stats: {
    totalTickets: number;
    eligibleTickets: number;
    totalWinners: number;
    claimedPrizes: number;
    notifiedWinners: number;
    unclaimedPrizes: number;
  };
  winnersByCategory: { _id: string; count: number }[];
}

export default function AdminLuckyDraw() {
  const { eventId } = useParams();
  const [eventTitle, setEventTitle] = useState("");
  const [prizes, setPrizes] = useState<Prize[]>([
    { category: "grand", prize: "", count: 1 },
  ]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [stats, setStats] = useState<DrawStats | null>(null);
  const [conducting, setConducting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const [allowDuplicateWins, setAllowDuplicateWins] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEventInfo();
    fetchWinners();
    fetchStats();
  }, [eventId]);

  const fetchEventInfo = async () => {
    try {
      const response = await apiClient.get(`/events/${eventId}`);
      setEventTitle(response.data.title);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const fetchWinners = async () => {
    try {
      const response = await apiClient.get(`/draw/winners/${eventId}`);
      setWinners(response.data.winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(`/draw/stats/${eventId}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const addPrize = () => {
    setPrizes([...prizes, { category: "consolation", prize: "", count: 1 }]);
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const conductDraw = async () => {
    // Validate prizes
    for (const prize of prizes) {
      if (!prize.prize.trim()) {
        setError("Please fill in all prize names");
        return;
      }
      if (prize.count < 1) {
        setError("Prize count must be at least 1");
        return;
      }
    }

    try {
      setConducting(true);
      setError("");

      const response = await apiClient.post("/draw/conduct", {
        eventId,
        prizes,
        allowDuplicateWins,
      });

      // Show results
      setWinners(response.data.winners);
      setShowResults(true);
      fetchStats();

      // Reset form
      setPrizes([{ category: "grand", prize: "", count: 1 }]);
    } catch (error: any) {
      console.error("Error conducting draw:", error);
      setError(error.response?.data?.message || "Failed to conduct lucky draw");
    } finally {
      setConducting(false);
    }
  };

  const notifyWinners = async () => {
    try {
      await apiClient.post(`/draw/notify-winners/${eventId}`);
      alert("Winners notified successfully!");
      fetchWinners();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to notify winners");
    }
  };

  const markClaimed = async (winnerId: string) => {
    try {
      await apiClient.patch(`/draw/claim/${winnerId}`, {
        notes: "Prize claimed",
      });
      fetchWinners();
      fetchStats();
    } catch (error) {
      console.error("Error marking prize as claimed:", error);
    }
  };

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
          Lucky Draw - {eventTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Conduct lucky draw and manage winners
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard title="Total Tickets" value={stats.stats.totalTickets} icon="🎫" />
          <StatCard title="Eligible" value={stats.stats.eligibleTickets} icon="✅" />
          <StatCard title="Winners" value={stats.stats.totalWinners} icon="🏆" />
          <StatCard title="Notified" value={stats.stats.notifiedWinners} icon="📧" />
          <StatCard title="Claimed" value={stats.stats.claimedPrizes} icon="✨" />
          <StatCard title="Unclaimed" value={stats.stats.unclaimedPrizes} icon="⏳" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Conduct Draw Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Conduct New Draw
          </h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {prizes.map((prize, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prize {index + 1}
                  </span>
                  {prizes.length > 1 && (
                    <button
                      onClick={() => removePrize(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={prize.category}
                      onChange={(e) => updatePrize(index, "category", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    >
                      <option value="grand">Grand Prize</option>
                      <option value="first">First Prize</option>
                      <option value="second">Second Prize</option>
                      <option value="third">Third Prize</option>
                      <option value="consolation">Consolation</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Count
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={prize.count}
                      onChange={(e) => updatePrize(index, "count", parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Prize Name
                  </label>
                  <input
                    type="text"
                    value={prize.prize}
                    onChange={(e) => updatePrize(index, "prize", e.target.value)}
                    placeholder="e.g., iPhone 15 Pro Max"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={addPrize}
              className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-primary-500 hover:text-primary-600 transition-all"
            >
              + Add Another Prize
            </button>

            {/* Options */}
            <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
              <input
                type="checkbox"
                id="allowDuplicates"
                checked={allowDuplicateWins}
                onChange={(e) => setAllowDuplicateWins(e.target.checked)}
                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
              />
              <label
                htmlFor="allowDuplicates"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                Allow same ticket to win multiple prizes
              </label>
            </div>

            {/* Conduct Button */}
            <button
              onClick={conductDraw}
              disabled={conducting}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
            >
              {conducting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Conducting Draw...
                </span>
              ) : (
                "🎰 Start Lucky Draw"
              )}
            </button>
          </div>
        </div>

        {/* Winners List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Winners ({winners.length})
            </h2>
            {winners.length > 0 && (
              <button
                onClick={notifyWinners}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
              >
                📧 Notify All Winners
              </button>
            )}
          </div>

          {winners.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">🎁</span>
              <p className="text-gray-600 dark:text-gray-400">No winners yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Conduct a lucky draw to select winners
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {winners.map((winner) => (
                <WinnerCard
                  key={winner._id}
                  winner={winner}
                  onMarkClaimed={markClaimed}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Modal */}
      {showResults && (
        <ResultsModal
          winners={winners.slice(0, 10)}
          onClose={() => setShowResults(false)}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function WinnerCard({
  winner,
  onMarkClaimed,
}: {
  winner: Winner;
  onMarkClaimed: (winnerId: string) => void;
}) {
  const categoryColors = {
    grand: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    first: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    second: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    third: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    consolation: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  };

  return (
    <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[winner.prizeCategory as keyof typeof categoryColors]}`}>
              {winner.prizeCategory.toUpperCase()}
            </span>
            {winner.claimed && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                CLAIMED
              </span>
            )}
            {winner.notified && (
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                NOTIFIED
              </span>
            )}
          </div>
          <p className="font-semibold text-gray-900 dark:text-white">{winner.prize}</p>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Ticket:</span>{" "}
          <span className="font-mono">{winner.ticket.ticketNumber}</span>
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Winner:</span> {winner.user.firstName} {winner.user.lastName}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Contact:</span> {winner.user.phone || winner.user.email}
        </p>
      </div>

      {!winner.claimed && (
        <button
          onClick={() => onMarkClaimed(winner._id)}
          className="mt-3 w-full py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-all"
        >
          Mark as Claimed
        </button>
      )}
    </div>
  );
}

function ResultsModal({
  winners,
  onClose,
}: {
  winners: Winner[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full p-8">
          <div className="text-center mb-6">
            <span className="text-6xl mb-4 block animate-bounce">🎉</span>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Congratulations to the Winners!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Lucky draw completed successfully
            </p>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
            {winners.map((winner, index) => (
              <div key={winner._id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    #{index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {winner.user.firstName} {winner.user.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Ticket: {winner.ticket.ticketNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-primary-600 dark:text-primary-400">
                      {winner.prize}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {winner.prizeCategory}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
