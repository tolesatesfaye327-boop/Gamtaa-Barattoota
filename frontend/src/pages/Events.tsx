import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/api";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  category: string;
  status: string;
  attendees: string[];
  maxAttendees: number;
  organizer: { firstName: string; lastName: string } | string;
}

const tabLabels: Record<string, string> = {
  all: "Hunda",
  upcoming: "Dhufu",
  ongoing: "Adeemsa",
  completed: "Xumurame",
};

const statusColors: Record<string, string> = {
  upcoming: "bg-green-500/20 text-green-400 border-green-500/30",
  ongoing: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  completed: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

const categoryColors: Record<string, string> = {
  conference: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  workshop: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  social: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  meeting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  seminar: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  webinar: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
  training: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
};

function SkeletonCard() {
  return (
    <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden animate-pulse">
      <div className="p-6 space-y-4">
        <div className="h-5 bg-gray-700 rounded w-1/4" />
        <div className="h-7 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-700 rounded w-2/3" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-700 rounded-full w-20" />
          <div className="h-6 bg-gray-700 rounded-full w-16" />
        </div>
      </div>
    </div>
  );
}

export default function Events() {
  const { user, token } = useAuthStore();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [registeringId, setRegisteringId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await apiClient.get("/events");
        // Filter out ticketed events - only show free events
        const freeEvents = response.data.filter((event: any) => !event.hasTicketing);
        setEvents(freeEvents);
      } catch (err: unknown) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(
          error.response?.data?.message || "Taateewwan fudhachuu hin dandeenye",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const isRegistered = (event: Event) =>
    user &&
    (event.attendees as string[])?.some((a) =>
      typeof a === "object" ? (a as any)._id === user._id : a === user._id,
    );

  const handleRegisterToggle = async (event: Event) => {
    if (!token || !user) return;
    setRegisteringId(event._id);
    try {
      if (isRegistered(event)) {
        const res = await apiClient.post(`/events/${event._id}/unregister`);
        setEvents((prev) =>
          prev.map((e) =>
            e._id === event._id
              ? { ...e, attendees: res.data.event.attendees }
              : e,
          ),
        );
      } else {
        const res = await apiClient.post(`/events/${event._id}/register`);
        setEvents((prev) =>
          prev.map((e) =>
            e._id === event._id
              ? { ...e, attendees: res.data.event.attendees }
              : e,
          ),
        );
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Registration failed");
      setTimeout(() => setError(null), 3000);
    } finally {
      setRegisteringId(null);
    }
  };

  const filtered = events.filter((event) => {
    const matchesTab = activeTab === "all" || event.status === activeTab;
    const matchesSearch = event.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
            Taateewwan
          </h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">
            Taateewwan gamtaa keenyaa hunda argii fi galmee
          </p>
          <div className="mt-2 h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
        </div>
        <Link
          to={token ? "/my-events" : "/login"}
          state={token ? undefined : { from: "/my-events" }}
          className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2.5 min-h-[44px] bg-blue-600/10 border border-blue-500/30 text-blue-400 rounded-lg hover:bg-blue-600/20 transition-all text-sm font-medium"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {token ? "Ta'oota Koo" : "Login for My Events"}
        </Link>
      </div>

      {/* Tabs & Search — edge-scroll tabs on phone */}
      <div className="flex flex-col gap-3 sm:gap-4">
        <div className="-mx-3 px-3 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-none">
          <div className="flex gap-1 bg-gray-800/60 rounded-lg p-1 border border-gray-700/50 w-max min-w-full sm:min-w-0 sm:w-auto">
            {["all", "upcoming", "ongoing", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 min-h-[44px] rounded-md text-xs sm:text-sm font-medium capitalize transition-all whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                }`}
              >
                {tabLabels[tab] || tab}
              </button>
            ))}
          </div>
        </div>

        <div className="relative w-full">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="search"
            inputMode="search"
            enterKeyHint="search"
            placeholder="Taateewwan barbaadi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-4 py-3 min-h-[48px] bg-gray-800/60 border border-gray-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 w-full text-base"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/30 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 animate-fadeIn">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <svg
            className="w-16 h-16 mb-4 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-lg font-medium">Taateewwan hin argamne</p>
          <p className="text-sm text-gray-600 mt-1">
            Barbaaduu fi geengoo kee fooyyessi
          </p>
        </div>
      )}

      {/* Event Cards */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => {
            const catColor =
              categoryColors[event.category?.toLowerCase()] ||
              "bg-gray-500/20 text-gray-400 border-gray-500/30";
            const statColor =
              statusColors[event.status] ||
              "bg-gray-500/20 text-gray-400 border-gray-500/30";
            const registered = isRegistered(event);
            const isFull =
              event.maxAttendees > 0 &&
              (event.attendees as string[]).length >= event.maxAttendees;
            const attendeeCount = (event.attendees as string[])?.length || 0;
            const isPast =
              event.status === "completed" || event.status === "cancelled";

            return (
              <div
                key={event._id}
                className="group bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Status Bar */}
                <div
                  className={`h-1.5 w-full ${
                    event.status === "upcoming"
                      ? "bg-green-500"
                      : event.status === "ongoing"
                        ? "bg-yellow-500"
                        : event.status === "completed"
                          ? "bg-gray-600"
                          : "bg-red-500"
                  }`}
                />

                <div className="p-6 space-y-4">
                  {/* Category & Status Badges */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${catColor}`}
                      >
                        {event.category}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${statColor}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    {token && (
                      <span
                        className={`text-xs font-medium ${
                          registered
                            ? "text-green-400"
                            : isFull
                              ? "text-red-400"
                              : "text-gray-500"
                        }`}
                      >
                        {registered ? "● Galmaa'e" : isFull ? "● Guutuu" : ""}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <Link to={`/events/${event._id}`}>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                      {event.title}
                    </h3>
                  </Link>

                  {/* Description */}
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                    {event.description}
                  </p>

                  {/* Date & Location */}
                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1.5">
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
                      {new Date(event.date).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1.5">
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
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {event.location}
                    </span>
                  </div>

                  {/* Attendees Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-gray-400">
                        <span className="font-semibold text-gray-300">
                          {attendeeCount}
                        </span>
                        {event.maxAttendees ? (
                          <>
                            {" "}
                            /{" "}
                            <span className="font-semibold text-gray-300">
                              {event.maxAttendees}
                            </span>
                          </>
                        ) : null}{" "}
                        hirmaataa
                      </span>
                      {event.maxAttendees > 0 && (
                        <span className="text-xs text-gray-500">
                          {Math.round(
                            (attendeeCount / event.maxAttendees) * 100,
                          )}
                          %
                        </span>
                      )}
                    </div>
                    {event.maxAttendees > 0 && (
                      <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            attendeeCount >= event.maxAttendees
                              ? "bg-red-500"
                              : attendeeCount > event.maxAttendees * 0.8
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                          }`}
                          style={{
                            width: `${Math.min((attendeeCount / event.maxAttendees) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Register Button */}
                  {token && !isPast && (
                    <button
                      onClick={() => handleRegisterToggle(event)}
                      disabled={
                        registeringId === event._id || (!registered && isFull)
                      }
                      className={`w-full py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                        registered
                          ? "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                          : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25"
                      }`}
                    >
                      {registeringId === event._id ? (
                        <>
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                          Processing...
                        </>
                      ) : registered ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Unregister
                        </>
                      ) : isFull ? (
                        "Event is Full"
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Register Now
                        </>
                      )}
                    </button>
                  )}

                  {!token && (
                    <div className="space-y-2">
                      <Link
                        to="/login"
                        state={{ from: `/events/${event._id}` }}
                        className="block w-full py-2.5 rounded-lg font-semibold text-sm text-center text-blue-400 border border-blue-500/30 hover:bg-blue-500/10 transition-all"
                      >
                        Login to register
                      </Link>
                      <p className="text-center text-xs text-gray-500">
                        No account?{" "}
                        <Link
                          to="/register"
                          className="text-blue-400 hover:underline"
                        >
                          Register
                        </Link>
                      </p>
                    </div>
                  )}

                  {/* View Details link */}
                  <Link
                    to={`/events/${event._id}`}
                    className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
