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
}

export default function EventsWithTickets() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "ticketed" | "free">("all");
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
        (event: any) => event.hasTicketing === true
      );
      setEvents(ticketedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    // All events here already have ticketing
    if (filter === "ticketed") return event.ticketPrice < 500; // Regular price
    if (filter === "free") return event.ticketPrice >= 500; // Premium events
    return true; // All
  });

  const upcomingEvents = filteredEvents.filter(
    (e) => new Date(e.date) > new Date()
  );

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
          Ticketed Events
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Purchase tickets for paid events. For free events, visit the Events page.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[
          { value: "all", label: "All Ticketed Events" },
          { value: "ticketed", label: "Regular Price" },
          { value: "free", label: "Premium Events" },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
              filter === tab.value
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Events Grid */}
      {upcomingEvents.length === 0 ? (
        <div className="text-center py-12">
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
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No events found
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Check back later for upcoming events
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard key={event._id} event={event} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({ event, user }: { event: Event; user: any }) {
  const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
  const soldOutPercentage = (event.ticketsSold / event.ticketsAvailable) * 100;
  const isAlmostSoldOut = soldOutPercentage > 80;
  const isSoldOut = ticketsRemaining <= 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Event Image */}
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg
              className="w-16 h-16 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Badge for ticketing */}
        {event.hasTicketing && (
          <div className="absolute top-3 right-3">
            {isSoldOut ? (
              <span className="px-3 py-1 bg-red-500 text-white text-xs font-semibold rounded-full">
                SOLD OUT
              </span>
            ) : isAlmostSoldOut ? (
              <span className="px-3 py-1 bg-orange-500 text-white text-xs font-semibold rounded-full">
                ALMOST FULL
              </span>
            ) : (
              <span className="px-3 py-1 bg-green-500 text-white text-xs font-semibold rounded-full">
                TICKETS AVAILABLE
              </span>
            )}
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium rounded">
            {event.category}
          </span>
          {event.hasTicketing && (
            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium rounded">
              Paid Event
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {event.description}
        </p>

        {/* Date & Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="line-clamp-1">{event.location}</span>
          </div>
        </div>

        {/* Ticketing Info */}
        {event.hasTicketing && event.ticketingEnabled && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ETB {event.ticketPrice}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {ticketsRemaining} / {event.ticketsAvailable} left
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isSoldOut
                    ? "bg-red-500"
                    : isAlmostSoldOut
                    ? "bg-orange-500"
                    : "bg-green-500"
                }`}
                style={{ width: `${Math.min(soldOutPercentage, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        {user ? (
          <Link
            to={`/events/${event._id}/buy-ticket`}
            className={`block w-full text-center py-2.5 px-4 rounded-lg font-medium transition-all ${
              event.hasTicketing && !isSoldOut
                ? "bg-primary-600 hover:bg-primary-700 text-white"
                : event.hasTicketing && isSoldOut
                ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {event.hasTicketing
              ? isSoldOut
                ? "Sold Out"
                : "Buy Ticket"
              : "Register for Free"}
          </Link>
        ) : (
          <Link
            to="/login"
            state={{ from: `/events/${event._id}` }}
            className="block w-full text-center py-2.5 px-4 rounded-lg font-medium bg-gray-600 hover:bg-gray-700 text-white transition-all"
          >
            Login to Register
          </Link>
        )}

        {/* View Details Link */}
        <Link
          to={`/events/${event._id}`}
          className="block text-center text-sm text-primary-600 dark:text-primary-400 hover:underline mt-2"
        >
          View Details →
        </Link>
      </div>
    </div>
  );
}
