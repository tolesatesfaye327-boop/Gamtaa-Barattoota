import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
    phone?: string;
  };
  prize: string;
  prizeCategory: string;
  drawDate: string;
  notified: boolean;
}

const PRIZE_CATEGORIES = [
  { value: "grand", label: "Grand Prize", color: "yellow", emoji: "🏆" },
  { value: "first", label: "First Prize", color: "blue", emoji: "🥇" },
  { value: "second", label: "Second Prize", color: "purple", emoji: "🥈" },
  { value: "third", label: "Third Prize", color: "emerald", emoji: "🥉" },
  { value: "consolation", label: "Consolation", color: "gray", emoji: "🎁" },
];

export default function LuckyDraw() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [prizes, setPrizes] = useState<Prize[]>([
    { category: "grand", prize: "", count: 1 },
  ]);
  const [conducting, setConducting] = useState(false);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [showWinners, setShowWinners] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [allowDuplicates, setAllowDuplicates] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchDrawStats();
      fetchWinners();
    }
  }, [eventId]);

  const fetchDrawStats = async () => {
    try {
      const response = await apiClient.get(`/draw/stats/${eventId}`);
      setStats(response.data.stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchWinners = async () => {
    try {
      const response = await apiClient.get(`/draw/winners/${eventId}`);
      setWinners(response.data.winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
    }
  };

  const addPrize = () => {
    setPrizes([
      ...prizes,
      { category: "consolation", prize: "", count: 1 },
    ]);
  };

  const removePrize = (index: number) => {
    setPrizes(prizes.filter((_, i) => i !== index));
  };

  const updatePrize = (index: number, field: keyof Prize, value: any) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], [field]: value };
    setPrizes(updated);
  };

  const handleConductDraw = async () => {
    // Validate
    const invalidPrizes = prizes.filter((p) => !p.prize.trim() || p.count < 1);
    if (invalidPrizes.length > 0) {
      alert("Please fill in all prize details with valid values");
      return;
    }

    if (!window.confirm(`Are you sure you want to conduct the lucky draw with ${prizes.reduce((sum, p) => sum + p.count, 0)} prizes?`)) {
      return;
    }

    setConducting(true);
    try {
      const response = await apiClient.post("/draw/conduct", {
        eventId,
        prizes,
        allowDuplicateWins: allowDuplicates,
      });

      setWinners(response.data.winners);
      setShowWinners(true);
      fetchDrawStats();
      
      alert(`Lucky draw completed! ${response.data.totalWinners} winners selected.`);
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to conduct lucky draw");
    } finally {
      setConducting(false);
    }
  };

  const handleNotifyWinners = async () => {
    if (!window.confirm("Notify all unnotified winners?")) return;

    try {
      const response = await apiClient.post(`/draw/notify-winners/${eventId}`);
      alert(response.data.message);
      fetchWinners();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to notify winners");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Lucky Draw
          </h1>
          <p className="text-gray-400">
            Conduct lucky draw and manage winners
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/tickets")}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
        >
          Back to Tickets
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Total Tickets
            </h3>
            <p className="text-2xl font-bold text-white">{stats.totalTickets}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Eligible for Draw
            </h3>
            <p className="text-2xl font-bold text-blue-400">{stats.eligibleTickets}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Total Winners
            </h3>
            <p className="text-2xl font-bold text-yellow-400">{stats.totalWinners}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-sm font-medium text-gray-400 mb-2">
              Prizes Claimed
            </h3>
            <p className="text-2xl font-bold text-green-400">{stats.claimedPrizes}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Conduct Draw */}
        <div>
          <div className="bg-gray-800 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold text-white mb-6">
              Configure Prizes
            </h2>

            <div className="space-y-4 mb-6">
              {prizes.map((prize, index) => (
                <div
                  key={index}
                  className="bg-gray-700/50 rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-white">
                      Prize {index + 1}
                    </h3>
                    {prizes.length > 1 && (
                      <button
                        onClick={() => removePrize(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={prize.category}
                      onChange={(e) =>
                        updatePrize(index, "category", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    >
                      {PRIZE_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.emoji} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Prize Name
                    </label>
                    <input
                      type="text"
                      value={prize.prize}
                      onChange={(e) =>
                        updatePrize(index, "prize", e.target.value)
                      }
                      placeholder="e.g., iPhone 15 Pro Max"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-300 mb-1">
                      Number of Winners
                    </label>
                    <input
                      type="number"
                      value={prize.count}
                      onChange={(e) =>
                        updatePrize(index, "count", parseInt(e.target.value))
                      }
                      min={1}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addPrize}
              className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all mb-4"
            >
              + Add Another Prize
            </button>

            <div className="flex items-center gap-2 mb-6">
              <input
                type="checkbox"
                id="allowDuplicates"
                checked={allowDuplicates}
                onChange={(e) => setAllowDuplicates(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-700"
              />
              <label htmlFor="allowDuplicates" className="text-sm text-gray-300">
                Allow same ticket to win multiple prizes
              </label>
            </div>

            <button
              onClick={handleConductDraw}
              disabled={conducting}
              className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold text-lg rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {conducting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Drawing...
                </span>
              ) : (
                "🎲 Start Lucky Draw"
              )}
            </button>
          </div>
        </div>

        {/* Right: Winners List */}
        <div>
          <div className="bg-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Winners</h2>
              {winners.length > 0 && (
                <button
                  onClick={handleNotifyWinners}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all"
                >
                  Notify Winners
                </button>
              )}
            </div>

            {winners.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <p className="text-gray-400">No winners yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Configure prizes and start the lucky draw
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {winners.map((winner) => {
                  const category = PRIZE_CATEGORIES.find(
                    (c) => c.value === winner.prizeCategory
                  );
                  return (
                    <div
                      key={winner._id}
                      className="bg-gray-700/50 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="text-2xl mr-2">{category?.emoji}</span>
                          <span className="font-semibold text-white">
                            {winner.user.firstName} {winner.user.lastName}
                          </span>
                        </div>
                        {winner.notified && (
                          <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">
                            Notified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mb-1">
                        Ticket: {winner.ticket.ticketNumber}
                      </p>
                      <p className="text-sm font-medium text-yellow-400">
                        {winner.prize}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {category?.label} • {new Date(winner.drawDate).toLocaleDateString()}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
