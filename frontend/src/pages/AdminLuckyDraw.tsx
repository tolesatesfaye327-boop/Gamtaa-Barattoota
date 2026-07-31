import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import apiClient from "../services/api";
import LuckyDrawWheel from "../components/LuckyDrawWheel";

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

interface EligibleTicket {
  ticketNumber: string;
  user: {
    firstName: string;
    lastName: string;
  };
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
  const { ticketProductId } = useParams();
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
  const [publicVisible, setPublicVisible] = useState(false);
  const [updatingVisibility, setUpdatingVisibility] = useState(false);
  const [eligibleTickets, setEligibleTickets] = useState<EligibleTicket[]>([]);

  // Animation states
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentDrawingPrize, setCurrentDrawingPrize] = useState("");
  const [spinningTickets, setSpinningTickets] = useState<string[]>([]);
  const [drawnWinners, setDrawnWinners] = useState<Winner[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    fetchEventInfo();
    fetchWinners();
    fetchStats();
    fetchVisibility();
    fetchEligibleTickets();
  }, [ticketProductId]);

  const fetchVisibility = async () => {
    try {
      const response = await apiClient.get(`/ticket-products/${ticketProductId}`);
      setPublicVisible(Boolean(response.data.luckyDrawVisible));
    } catch (error) {
      setPublicVisible(false);
    }
  };

  const togglePublicVisibility = async () => {
    try {
      setUpdatingVisibility(true);
      const response = await apiClient.patch(`/standalone-draw/visibility/${ticketProductId}`, {
        visible: !publicVisible,
      });
      setPublicVisible(response.data.event.luckyDrawVisible);
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update public visibility");
    } finally {
      setUpdatingVisibility(false);
    }
  };

  const fetchEventInfo = async () => {
    try {
      const response = await apiClient.get(`/ticket-products/${ticketProductId}`);
      setEventTitle(response.data.title);
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const fetchWinners = async () => {
    try {
      const response = await apiClient.get(`/standalone-draw/winners/${ticketProductId}`);
      setWinners(response.data.winners);
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(`/standalone-draw/stats/${ticketProductId}`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const fetchEligibleTickets = async () => {
    try {
      const response = await apiClient.get(`/standalone-draw/live/${ticketProductId}`);
      setEligibleTickets(response.data.tickets || []);
    } catch (error) {
      setEligibleTickets([]);
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
      setIsDrawing(true);
      setDrawnWinners([]);

      // Get eligible tickets for animation
      const eligibleRes = await apiClient.get(`/standalone-draw/live/${ticketProductId}`);
      const eligibleTickets = eligibleRes.data.tickets || [];

      // Simulate drawing animation for each prize
      for (let prizeIndex = 0; prizeIndex < prizes.length; prizeIndex++) {
        const prize = prizes[prizeIndex];
        setCurrentDrawingPrize(`${prize.prize} (${prize.category})`);

        for (let count = 0; count < prize.count; count++) {
          // Show spinning tickets animation
          setSpinningTickets(
            eligibleTickets
              .sort(() => 0.5 - Math.random())
              .slice(0, 10)
              .map((t: any) => t.ticketNumber)
          );

          // Wait for dramatic effect
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
      }

      // Actually conduct the draw on backend
      const response = await apiClient.post("/standalone-draw/conduct", {
        ticketProductId,
        prizes,
        allowDuplicateWins,
      });

      // Show confetti!
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      // Show results
      setDrawnWinners(response.data.winners);
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
      setIsDrawing(false);
      setCurrentDrawingPrize("");
      setSpinningTickets([]);
    }
  };

  const notifyWinners = async () => {
    try {
      await apiClient.post(`/standalone-draw/notify-winners/${ticketProductId}`);
      alert("Winners notified successfully!");
      fetchWinners();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to notify winners");
    }
  };

  const markClaimed = async (winnerId: string) => {
    try {
      await apiClient.patch(`/standalone-draw/claim/${winnerId}`, {
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
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 rounded-full mb-4 shadow-lg">
          <span className="text-3xl animate-spin-slow">🎰</span>
          <span className="text-white font-black text-sm uppercase tracking-wider">Lucky Draw System</span>
          <span className="text-3xl animate-bounce">🏆</span>
        </div>
        <h1 className="text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
          {eventTitle}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          🎊 Conduct amazing lucky draws and celebrate winners! 🎉
        </p>
        <button
          type="button"
          onClick={togglePublicVisibility}
          disabled={updatingVisibility}
          className={`mt-4 px-5 py-2 rounded-full font-semibold text-sm transition-colors ${
            publicVisible
              ? "bg-emerald-600 text-white hover:bg-emerald-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          }`}
        >
          {publicVisible ? "● Student spinner is ON" : "○ Student spinner is OFF"}
        </button>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>

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

      {/* Admin spinner preview and draw information */}
      <section className="mb-8 grid gap-6 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900 lg:grid-cols-[minmax(0,1fr)_280px] lg:p-8">
        <div>
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Admin spinner</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950 dark:text-white">Preview and spin the wheel</h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Use this wheel to preview the eligible ticket pool. The configured prizes are awarded only when you press Start Lucky Draw below.
              </p>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-300">
              {eligibleTickets.length} eligible tickets
            </span>
          </div>
          <LuckyDrawWheel
            tickets={eligibleTickets.map((ticket) => ticket.ticketNumber)}
            onSpin={conductDraw}
          />
        </div>
        <div className="flex flex-col justify-center rounded-2xl bg-slate-50 p-5 dark:bg-white/[0.04]">
          <p className="text-sm font-bold text-slate-950 dark:text-white">Draw checklist</p>
          <ol className="mt-4 space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">1</span><span>Set each prize name and winner count.</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">2</span><span>Confirm the eligible ticket count.</span></li>
            <li className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-white dark:text-slate-950">3</span><span>Press Start Lucky Draw to publish the live rotation.</span></li>
          </ol>
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 text-xs leading-5 text-slate-500 dark:border-white/10 dark:bg-slate-950/40 dark:text-slate-400">
            Public visibility: <strong className={publicVisible ? "text-emerald-600 dark:text-emerald-300" : "text-slate-700 dark:text-slate-200"}>{publicVisible ? "ON" : "OFF"}</strong>
          </div>
        </div>
      </section>

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
              disabled={conducting || isDrawing}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white font-black text-lg rounded-xl transition-all disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105 disabled:scale-100"
            >
              {conducting || isDrawing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span className="animate-pulse">🎰 DRAWING WINNERS... 🎰</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  🎲 START LUCKY DRAW 🎲
                </span>
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
          winners={drawnWinners.slice(0, 10)}
          onClose={() => setShowResults(false)}
        />
      )}

      {/* Drawing Animation Overlay */}
      {isDrawing && (
        <DrawingAnimation
          currentPrize={currentDrawingPrize}
          spinningTickets={spinningTickets}
        />
      )}

      {/* Confetti Animation */}
      {showConfetti && <ConfettiAnimation />}
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
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fadeIn">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div className="fixed inset-0 transition-opacity bg-black bg-opacity-75 backdrop-blur-sm" onClick={onClose} />

        <div className="relative bg-gradient-to-br from-yellow-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full p-8 border-4 border-yellow-400 dark:border-yellow-600 animate-scaleIn">
          {/* Celebration Header */}
          <div className="text-center mb-8">
            <div className="mb-4 animate-bounce">
              <span className="text-8xl">🎉</span>
              <span className="text-8xl">🏆</span>
              <span className="text-8xl">🎊</span>
            </div>
            <h2 className="text-4xl font-black bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent mb-3">
              CONGRATULATIONS!
            </h2>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
              Lucky Draw Winners Announced!
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              {winners.length} winners have been selected
            </p>
          </div>

          {/* Winners List with Animation */}
          <div className="space-y-4 max-h-96 overflow-y-auto mb-8 px-2">
            {winners.map((winner, index) => (
              <div
                key={winner._id}
                className="p-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 border-yellow-300 dark:border-yellow-700 hover:scale-105 transition-transform animate-slideInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-black text-white">
                        #{index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Winner Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                        {winner.user.firstName} {winner.user.lastName}
                      </p>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-bold rounded">
                        {winner.prizeCategory.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      🎫 {winner.ticket.ticketNumber}
                    </p>
                  </div>

                  {/* Prize */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                      Prize
                    </p>
                    <p className="text-base font-bold text-yellow-600 dark:text-yellow-400">
                      {winner.prize}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 hover:from-yellow-600 hover:via-orange-600 hover:to-red-600 text-white font-black text-lg rounded-xl transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
          >
            ✨ AMAZING! Close ✨
          </button>
        </div>
      </div>
    </div>
  );
}

// Drawing Animation Component
function DrawingAnimation({
  currentPrize,
  spinningTickets,
}: {
  currentPrize: string;
  spinningTickets: string[];
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-md">
      <div className="text-center px-4">
        {/* Prize Being Drawn */}
        <div className="mb-12 animate-pulse">
          <p className="text-yellow-400 text-2xl font-bold mb-3">
            🎰 DRAWING NOW 🎰
          </p>
          <h2 className="text-5xl font-black text-white mb-2 animate-bounce">
            {currentPrize}
          </h2>
          <div className="flex justify-center gap-2 mt-6">
            <div className="w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-3 h-3 bg-red-400 rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Spinning Tickets */}
         <div className="mx-auto max-w-xl rounded-3xl bg-white/10 p-5 backdrop-blur-sm">
           <p className="mb-5 text-lg font-semibold text-gray-300">
             🎫 Spinning Through Tickets... 🎫
           </p>
           <LuckyDrawWheel tickets={spinningTickets} autoSpin showButton={false} />
         </div>

        {/* Loading Message */}
        <p className="text-white text-xl mt-12 animate-pulse font-semibold">
          ✨ Selecting winners... Please wait! ✨
        </p>
      </div>

      <style>{`
        @keyframes ticketSpin {
          0%, 100% { transform: rotateY(0deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.1); }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideInUp {
          animation: slideInUp 0.6s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

// Confetti Animation Component
function ConfettiAnimation() {
  const confettiCount = 50;
  const confettiPieces = Array.from({ length: confettiCount }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 3,
    duration: 3 + Math.random() * 2,
    color: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#00CED1', '#9370DB'][Math.floor(Math.random() * 6)],
  }));

  return (
    <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
      {confettiPieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute w-3 h-3 opacity-80"
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animation: `confettiFall ${piece.duration}s linear ${piece.delay}s`,
            animationFillMode: 'forwards',
            transform: 'translateY(-10px)',
          }}
        />
      ))}
      <style>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
