import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  image: string;
  category: string;
  hasTicketing: boolean;
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
  ticketingEnabled: boolean;
  status: string;
}

export default function EventsWithTickets() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "upcoming" | "almost-full">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/events");
      // Only show events with ticketing enabled
      const ticketedEvents = response.data.filter(
        (event: any) => event.hasTicketing === true && event.ticketingEnabled === true
      );
      setEvents(ticketedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    // Search filter
    if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.description.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !event.location.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Category filter
    if (categoryFilter !== "all" && event.category !== categoryFilter) {
      return false;
    }

    // Status filter
    const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
    const soldOutPercentage = (event.ticketsSold / event.ticketsAvailable) * 100;
    
    if (filter === "upcoming") {
      return new Date(event.date) > new Date() && ticketsRemaining > 0;
    }
    if (filter === "almost-full") {
      return soldOutPercentage >= 70 && ticketsRemaining > 0;
    }
    
    return new Date(event.date) > new Date(); // Only show upcoming events
  });

  // Get unique categories
  const categories = Array.from(new Set(events.map(e => e.category)));

  // Calculate stats
  const totalTicketsAvailable = events.reduce((sum, e) => sum + (e.ticketsAvailable - e.ticketsSold), 0);
  const totalEvents = filteredEvents.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-700 rounded w-64" />
            <div className="h-6 bg-gray-700 rounded w-96" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-96 bg-gray-800 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
            Event Tickets
          </h1>
          <p className="text-gray-400 text-lg">
            Purchase tickets for upcoming events and secure your spot
          </p>
          <div className="mt-2 h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-600/20 to-blue-500/10 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-blue-400 font-semibold">Total Events</h3>
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{totalEvents}</p>
          </div>

          <div className="bg-gradient-to-br from-green-600/20 to-green-500/10 border border-green-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-green-400 font-semibold">Tickets Available</h3>
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{totalTicketsAvailable}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-500/10 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-purple-400 font-semibold">Categories</h3>
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{categories.length}</p>
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
              placeholder="Search events by title, description, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "All Events", icon: "M4 6h16M4 10h16M4 14h16M4 18h16" },
              { value: "upcoming", label: "Upcoming", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { value: "almost-full", label: "Almost Full", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
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

          {/* Category Filter */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="text-gray-400 text-sm font-medium whitespace-nowrap">Category:</span>
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                categoryFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all capitalize whitespace-nowrap ${
                  categoryFilter === cat
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700/50 text-gray-300 hover:bg-gray-700"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
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
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              No events found
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery ? "Try adjusting your search or filters" : "Check back later for upcoming ticketed events"}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                  setCategoryFilter("all");
                }}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event._id} event={event} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EventCard({ event, user }: { event: Event; user: any }) {
  const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
  const soldOutPercentage = (event.ticketsSold / event.ticketsAvailable) * 100;
  const isAlmostSoldOut = soldOutPercentage >= 70;
  const isSoldOut = ticketsRemaining <= 0;

  // Format date
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' });
  const day = eventDate.getDate();
  const time = eventDate.toLocaleString('default', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 transition-all group">
      {/* Event Image */}
      <div className="relative h-48 bg-gray-700 overflow-hidden">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
            <svg
              className="w-20 h-20 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Date Badge */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 text-center shadow-lg">
          <div className="text-xs font-semibold text-gray-600 uppercase">{month}</div>
          <div className="text-2xl font-bold text-gray-900">{day}</div>
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          {isSoldOut ? (
            <span className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg shadow-lg">
              SOLD OUT
            </span>
          ) : isAlmostSoldOut ? (
            <span className="px-3 py-1.5 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg animate-pulse">
              HURRY! {ticketsRemaining} LEFT
            </span>
          ) : (
            <span className="px-3 py-1.5 bg-green-500 text-white text-xs font-bold rounded-lg shadow-lg">
              AVAILABLE
            </span>
          )}
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-1 bg-blue-500/20 text-blue-400 text-xs font-semibold rounded-lg border border-blue-500/30">
            {event.category}
          </span>
          <span className="px-2.5 py-1 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-lg border border-purple-500/30">
            Paid Event
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {event.title}
        </h3>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {event.description}
        </p>

        {/* Event Info */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{eventDate.toLocaleDateString()} at {time}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Ticket Info Card */}
        <div className="mb-4 p-4 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-lg">
          <div className="flex justify-between items-center mb-3">
            <div>
              <div className="text-xs text-gray-400 mb-1">Ticket Price</div>
              <div className="text-2xl font-bold text-white">
                {event.ticketPrice} <span className="text-sm text-gray-400">ETB</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 mb-1">Available</div>
              <div className="text-lg font-bold text-blue-400">
                {ticketsRemaining} <span className="text-sm text-gray-500">/ {event.ticketsAvailable}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={`h-2.5 rounded-full transition-all duration-500 ${
                  isSoldOut
                    ? "bg-red-500"
                    : isAlmostSoldOut
                    ? "bg-gradient-to-r from-orange-500 to-red-500"
                    : "bg-gradient-to-r from-green-500 to-blue-500"
                }`}
                style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1.5 text-center">
              {soldOutPercentage.toFixed(0)}% sold
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          {user ? (
            <>
              <Link
                to={`/events/${event._id}/buy-ticket`}
                className={`block w-full text-center py-3 px-4 rounded-lg font-semibold transition-all shadow-lg ${
                  !isSoldOut
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-blue-600/25"
                    : "bg-gray-700 text-gray-500 cursor-not-allowed"
                }`}
                onClick={(e) => isSoldOut && e.preventDefault()}
              >
                {isSoldOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Sold Out
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    Buy Ticket
                  </span>
                )}
              </Link>
              <Link
                to={`/events/${event._id}`}
                className="block w-full text-center py-2.5 px-4 rounded-lg font-medium bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-all border border-gray-600/50"
              >
                View Details →
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                state={{ from: `/events/${event._id}/buy-ticket` }}
                className="block w-full text-center py-3 px-4 rounded-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all shadow-lg shadow-blue-600/25"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Login to Buy Ticket
                </span>
              </Link>
              <Link
                to={`/events/${event._id}`}
                className="block w-full text-center py-2.5 px-4 rounded-lg font-medium bg-gray-700/50 hover:bg-gray-700 text-gray-300 transition-all border border-gray-600/50"
              >
                View Details →
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
