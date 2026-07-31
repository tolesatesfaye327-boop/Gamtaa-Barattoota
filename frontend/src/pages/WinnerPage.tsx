import { useState, useEffect, useRef } from "react";
import apiClient from "../services/api";
import LuckyDrawWheel from "../components/LuckyDrawWheel";

interface Winner {
  _id: string;
  ticket: {
    ticketNumber: string;
  };
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    image?: string;
  };
  prize: string;
  prizeCategory: string;
  drawDate: string;
  drawRound: number;
  claimed: boolean;
}

interface EventItem {
  _id: string;
  title: string;
  date: string;
  location: string;
  image?: string;
}

interface LiveDraw {
  event: EventItem & { luckyDrawVisible: boolean };
  tickets: { ticketNumber: string }[];
  winners: Winner[];
  isDrawing: boolean;
  currentPrize: string;
  selectedTicket: string;
}

const PRIZE_CATEGORIES = [
  { value: "all", label: "All Prizes", emoji: "✨" },
  { value: "grand", label: "Grand Prize", emoji: "🏆", badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  { value: "first", label: "First Prize", emoji: "🥇", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  { value: "second", label: "Second Prize", emoji: "🥈", badge: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  { value: "third", label: "Third Prize", emoji: "🥉", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  { value: "consolation", label: "Consolation", emoji: "🎁", badge: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
];

export default function WinnerPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveDraws, setLiveDraws] = useState<LiveDraw[]>([]);

  useEffect(() => {
    fetchWinnersData();
  }, [selectedEvent, selectedCategory]);

  useEffect(() => {
    const fetchLiveDraws = async () => {
      try {
        const response = await apiClient.get("/standalone-draw/live");
        setLiveDraws(response.data.draws || []);
      } catch (error) {
        console.error("Error fetching live draws:", error);
      }
    };

    fetchLiveDraws();
    const refreshTimer = window.setInterval(fetchLiveDraws, 1000);
    return () => {
      window.clearInterval(refreshTimer);
    };
  }, []);

  const fetchWinnersData = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (selectedEvent !== "all") params.eventId = selectedEvent;
      if (selectedCategory !== "all") params.prizeCategory = selectedCategory;

      const response = await apiClient.get("/standalone-draw/all-winners", { params });
      setWinners(response.data.winners || []);
      if (response.data.events) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error("Error fetching winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredWinners = winners.filter((w) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const ticketNum = w.ticket?.ticketNumber?.toLowerCase() || "";
    const fullName = `${w.user?.firstName || ""} ${w.user?.lastName || ""}`.toLowerCase();
    const prizeName = w.prize?.toLowerCase() || "";
    const eventTitle = w.event?.title?.toLowerCase() || "";
    return (
      ticketNum.includes(query) ||
      fullName.includes(query) ||
      prizeName.includes(query) ||
      eventTitle.includes(query)
    );
  });

  const grandWinnersCount = winners.filter((w) => w.prizeCategory === "grand").length;
  const totalEventsWithDraws = events.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900/60 via-blue-900/40 to-gray-900 border-b border-gray-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-400 text-sm font-semibold animate-pulse">
              <span>🎉</span>
              <span>Official Event Lucky Draw Results</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight">
              Lucky Draw <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-orange-500 bg-clip-text text-transparent">Winners</span>
            </h1>
            <p className="text-gray-300 text-lg sm:text-xl leading-relaxed">
              Congratulations to all lucky draw winners! View verified winning tickets, prize details, and event announcements.
            </p>
          </div>
        </div>
      </div>

      {liveDraws.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {liveDraws.map((draw) => {
            return (
              <section key={draw.event._id} className="relative overflow-hidden rounded-2xl border border-yellow-500/40 bg-gradient-to-br from-purple-950 via-gray-900 to-orange-950 p-6 sm:p-10 shadow-2xl">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#facc15_1px,transparent_1px)] [background-size:18px_18px]" />
                <div className="relative text-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-bold text-emerald-300 border border-emerald-400/30">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE LUCKY DRAW
                  </span>
                  <h2 className="mt-4 text-3xl sm:text-4xl font-black text-white">{draw.event.title}</h2>
                  <p className="mt-2 text-yellow-200">Paid tickets are spinning now. Good luck!</p>
                   <LuckyDrawWheel
                     tickets={draw.tickets.map((ticket) => ticket.ticketNumber)}
                     autoSpin={draw.isDrawing}
                     showButton={false}
                     targetTicket={draw.selectedTicket}
                   />
                   {draw.isDrawing && (
                     <p className="mt-4 text-sm font-semibold text-amber-200">
                       The wheel is spinning live{draw.currentPrize ? ` for ${draw.currentPrize}` : ""}.
                     </p>
                   )}
                  {draw.winners.length > 0 && (
                    <p className="mt-6 text-lg font-bold text-white">🏆 Winners have been announced below.</p>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Total Winners</span>
              <span className="text-2xl">🎁</span>
            </div>
            <p className="text-3xl font-bold text-white">{winners.length}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-600/20 to-amber-500/10 border border-yellow-500/30 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-400 font-medium">Grand Prizes</span>
              <span className="text-2xl">🏆</span>
            </div>
            <p className="text-3xl font-bold text-white">{grandWinnersCount}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Events with Draws</span>
              <span className="text-2xl">🎪</span>
            </div>
            <p className="text-3xl font-bold text-white">{totalEventsWithDraws}</p>
          </div>

          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400 font-medium">Verified Tickets</span>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-3xl font-bold text-green-400">100% Verified</p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Input */}
            <div className="md:col-span-1">
              <label className="block text-xs font-medium text-gray-400 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ticket #, winner name, prize..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <svg className="w-4 h-4 text-gray-500 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Event Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Event</label>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Events</option>
                {events.map((evt) => (
                  <option key={evt._id} value={evt._id}>
                    {evt.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Filter by Prize Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {PRIZE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.emoji} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Winners Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
          </div>
        ) : filteredWinners.length === 0 ? (
          <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-12 text-center">
            <span className="text-6xl mb-4 block">🎁</span>
            <h3 className="text-xl font-bold text-white mb-2">No Winners Found</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              {searchQuery || selectedEvent !== "all" || selectedCategory !== "all"
                ? "No winners matched your search or filters. Try adjusting them."
                : "No lucky draw winners have been drawn yet. Check back soon!"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWinners.map((winner) => (
              <WinnerCard key={winner._id} winner={winner} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LuckySpinWheel({ tickets }: { tickets: string[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const size = 600;
  const colors = ["#0c3f77", "#ff4b26", "#f5b400", "#10bfa3"];
  const wheelTickets = tickets;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!context || wheelTickets.length === 0) return;

    const radius = size / 2;
    const arc = (2 * Math.PI) / wheelTickets.length;
    context.clearRect(0, 0, size, size);

    wheelTickets.forEach((ticket, index) => {
      const start = -Math.PI / 2 + index * arc;
      const end = start + arc;
      context.beginPath();
      context.moveTo(radius, radius);
      context.arc(radius, radius, radius - 10, start, end);
      context.fillStyle = colors[index % colors.length];
      context.fill();
      context.strokeStyle = "rgba(255,255,255,.35)";
      context.lineWidth = 2;
      context.stroke();

      context.save();
      context.translate(radius, radius);
      context.rotate(start + arc / 2);
      context.textAlign = "right";
      context.fillStyle = "white";
      context.font = `bold ${wheelTickets.length > 18 ? 17 : 24}px Arial`;
      context.fillText(ticket, radius - 38, 7);
      context.restore();
    });
  }, [wheelTickets.join("|")]);

  const spin = () => {
    if (spinning || wheelTickets.length < 2) return;
    const winnerIndex = Math.floor(Math.random() * wheelTickets.length);
    const arcDegrees = 360 / wheelTickets.length;
    const segmentCenter = -90 + (winnerIndex + 0.5) * arcDegrees;
    const remainder = ((-90 - segmentCenter - rotation) % 360 + 360) % 360;
    const finalRotation = rotation + 360 * 8 + remainder;

    setSpinning(true);
    setSelectedTicket(null);
    setRotation(finalRotation);
    window.setTimeout(() => {
      setSelectedTicket(wheelTickets[winnerIndex]);
      setSpinning(false);
    }, 6000);
  };

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="relative w-full max-w-[560px] aspect-square">
        <div className="absolute left-1/2 top-[-10px] z-20 -translate-x-1/2 border-l-[20px] border-r-[20px] border-t-[44px] border-l-transparent border-r-transparent border-t-yellow-400 drop-shadow-lg" />
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="h-full w-full rounded-full bg-white shadow-[0_10px_25px_rgba(0,0,0,.45)] transition-transform duration-[6000ms] ease-[cubic-bezier(.17,.67,.22,1)]"
          style={{ transform: `rotate(${rotation}deg)` }}
        />
        <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-yellow-500 bg-white text-2xl shadow-xl">
          🎫
        </div>
      </div>
      <button
        type="button"
        onClick={spin}
        disabled={spinning || wheelTickets.length < 2}
        className="mt-7 h-12 w-44 rounded-lg bg-blue-600 text-lg font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-500"
      >
        {spinning ? "SPINNING..." : "SPIN"}
      </button>
      {selectedTicket && (
        <div className="mt-5 rounded-xl border border-yellow-400/50 bg-yellow-400/15 px-6 py-3 text-center text-lg font-bold text-yellow-200">
          🎉 Selected ticket: <span className="font-mono text-white">{selectedTicket}</span>
        </div>
      )}
      <p className="mt-3 text-sm text-gray-300">
        {wheelTickets.length} paid tickets are eligible
      </p>
    </div>
  );
}

function WinnerCard({ winner }: { winner: Winner }) {
  const categoryConfig = PRIZE_CATEGORIES.find((c) => c.value === winner.prizeCategory) || {
    label: winner.prizeCategory,
    emoji: "🎁",
    badge: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  };

  const drawDateObj = new Date(winner.drawDate);

  return (
    <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl overflow-hidden hover:border-yellow-500/50 transition-all duration-300 group flex flex-col justify-between">
      <div>
        {/* Event Header Banner */}
        <div className="p-4 bg-gradient-to-r from-gray-800 via-gray-700/50 to-gray-800 border-b border-gray-700/40 flex items-center justify-between">
          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${categoryConfig.badge}`}>
            <span>{categoryConfig.emoji}</span>
            <span>{categoryConfig.label.toUpperCase()}</span>
          </span>
          <span className="font-mono text-xs text-yellow-400 font-semibold bg-yellow-900/30 border border-yellow-500/30 px-2.5 py-1 rounded-md">
            #{winner.ticket?.ticketNumber || "EVT-TICKET"}
          </span>
        </div>

        {/* Main Content */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
              {winner.prize}
            </h3>
            <p className="text-sm text-gray-400 mt-1">
              Event: <span className="text-white font-medium">{winner.event?.title}</span>
            </p>
          </div>

          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/30 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Winner Name</span>
              <span className="text-white font-semibold">
                {winner.user?.firstName} {winner.user?.lastName}
              </span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Draw Date</span>
              <span className="text-gray-300 text-xs">
                {drawDateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
            {winner.event?.location && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">Venue</span>
                <span className="text-gray-300 text-xs line-clamp-1">{winner.event.location}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Badge */}
      <div className="px-5 py-3 bg-gray-900/40 border-t border-gray-800 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1 text-green-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Verified Lucky Draw
        </span>
        {winner.claimed ? (
          <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded border border-green-500/30 font-medium">
            Claimed
          </span>
        ) : (
          <span className="px-2 py-0.5 bg-yellow-900/30 text-yellow-400 rounded border border-yellow-500/30 font-medium">
            Official Winner
          </span>
        )}
      </div>
    </div>
  );
}
