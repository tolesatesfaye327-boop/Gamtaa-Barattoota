import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";

interface Event {
  _id: string;
  title: string;
  date: string;
  location: string;
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
  hasTicketing: boolean;
}

interface TicketStats {
  event: {
    title: string;
    ticketPrice: number;
    ticketsAvailable: number;
    ticketsSold: number;
  };
  stats: {
    totalTickets: number;
    activeTickets: number;
    usedTickets: number;
    cancelledTickets: number;
    availableTickets: number;
    soldPercentage: string;
  };
  revenue: {
    totalRevenue: number;
    expectedRevenue: number;
    perTicket: number;
  };
}

export default function AdminTickets() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      const ticketedEvents = response.data.filter((e: Event) => e.hasTicketing);
      setEvents(ticketedEvents);
      
      if (ticketedEvents.length > 0) {
        setSelectedEvent(ticketedEvents[0]._id);
        fetchStats(ticketedEvents[0]._id);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async (eventId: string) => {
    try {
      setStatsLoading(true);
      const response = await apiClient.get(`/events/${eventId}/ticket-stats`);
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleEventChange = (eventId: string) => {
    setSelectedEvent(eventId);
    fetchStats(eventId);
  };

  const exportTickets = async () => {
    if (!selectedEvent) return;
    try {
      const response = await apiClient.post(
        `/events/${selectedEvent}/export-tickets`,
        { format: "json" }
      );
      
      // Download JSON file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `tickets-${Date.now()}.json`;
      link.click();
    } catch (error) {
      console.error("Error exporting tickets:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center py-12 bg-gray-800 rounded-xl">
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
          <h3 className="mt-2 text-sm font-medium text-white">
            No ticketed events found
          </h3>
          <p className="mt-1 text-sm text-gray-400">
            Create an event with ticketing enabled to manage tickets
          </p>
          <Link
            to="/admin/events"
            className="mt-4 inline-block btn-primary"
          >
            Create Ticketed Event
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Ticket Management
        </h1>
        <p className="text-gray-400">
          Manage tickets, view sales statistics, and track revenue
        </p>
      </div>

      {/* Event Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Event
        </label>
        <select
          value={selectedEvent || ""}
          onChange={(e) => handleEventChange(e.target.value)}
          className="w-full max-w-md px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
        >
          {events.map((event) => (
            <option key={event._id} value={event._id}>
              {event.title} - {new Date(event.date).toLocaleDateString()}
            </option>
          ))}
        </select>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : stats ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Tickets"
              value={stats.stats.totalTickets}
              icon="ticket"
              color="blue"
            />
            <StatCard
              title="Active Tickets"
              value={stats.stats.activeTickets}
              icon="check"
              color="green"
            />
            <StatCard
              title="Used/Checked In"
              value={stats.stats.usedTickets}
              icon="check-circle"
              color="purple"
            />
            <StatCard
              title="Total Revenue"
              value={`ETB ${stats.revenue.totalRevenue.toLocaleString()}`}
              icon="cash"
              color="emerald"
            />
          </div>

          {/* Sales Progress */}
          <div className="bg-gray-800 rounded-xl p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">
                Sales Progress
              </h3>
              <span className="text-2xl font-bold text-primary-400">
                {stats.stats.soldPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all"
                style={{ width: `${stats.stats.soldPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>
                {stats.event.ticketsSold} sold of {stats.event.ticketsAvailable}
              </span>
              <span>{stats.stats.availableTickets} remaining</span>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Ticket Price
              </h3>
              <p className="text-2xl font-bold text-white">
                ETB {stats.revenue.perTicket}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Expected Revenue
              </h3>
              <p className="text-2xl font-bold text-white">
                ETB {stats.revenue.expectedRevenue.toLocaleString()}
              </p>
            </div>
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-sm font-medium text-gray-400 mb-2">
                Actual Revenue
              </h3>
              <p className="text-2xl font-bold text-emerald-400">
                ETB {stats.revenue.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/admin/tickets/${selectedEvent}/scan`}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR Scanner
            </Link>

            <button
              onClick={exportTickets}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Data
            </button>
          </div>

          {/* Recent Sales */}
          {stats.recentSales && stats.recentSales.length > 0 && (
            <div className="mt-8 bg-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Recent Sales
              </h3>
              <div className="space-y-3">
                {stats.recentSales.map((sale: any) => (
                  <div
                    key={sale._id}
                    className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-white">
                        {sale.user?.firstName} {sale.user?.lastName}
                      </p>
                      <p className="text-sm text-gray-400">{sale.ticketNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-emerald-400">
                        ETB {sale.payment?.amount}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-400",
    green: "bg-green-500/20 text-green-400",
    purple: "bg-purple-500/20 text-purple-400",
    emerald: "bg-emerald-500/20 text-emerald-400",
  };

  const icons: Record<string, JSX.Element> = {
    ticket: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    ),
    check: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M5 13l4 4L19 7"
      />
    ),
    "check-circle": (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    cash: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
      />
    ),
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icons[icon]}
          </svg>
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-400 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
