import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/api";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface Ticket {
  _id: string;
  ticketNumber: string;
  status: string;
  purchaseDate: string;
  event?: {
    _id: string;
    title: string;
    date: string;
    location: string;
    image?: string;
  };
  payment?: { amount: number; status: string; paymentMethod?: string };
}

interface EventReg {
  _id: string;
  title: string;
  date: string;
  location: string;
  category?: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                       */
/* ------------------------------------------------------------------ */
function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "TBA";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusTone(status: string) {
  const s = status?.toLowerCase() || "";
  if (["active", "completed", "approved", "paid"].includes(s))
    return "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30";
  if (["pending"].includes(s))
    return "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30";
  if (["used"].includes(s))
    return "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-500/30";
  if (["cancelled", "failed", "rejected"].includes(s))
    return "bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30";
  return "bg-gray-100 text-gray-600 ring-gray-200 dark:bg-gray-500/10 dark:text-gray-300 dark:ring-gray-500/30";
}

/* ------------------------------------------------------------------ */
/* Icons                                                               */
/* ------------------------------------------------------------------ */
const Icon = {
  ticket: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
      />
    </svg>
  ),
  event: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  ),
  bell: (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Stat card                                                           */
/* ------------------------------------------------------------------ */
function StatCard({
  label,
  value,
  sub,
  to,
  icon,
  accent,
}: {
  label: string;
  value: number | string;
  sub?: string;
  to: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <Link
      to={to}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-gray-700 dark:bg-dark-card"
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accent}`} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {label}
          </p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {sub && (
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {sub}
            </p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-110 ${accent}`}
        >
          {icon}
        </div>
      </div>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Main dashboard                                                      */
/* ------------------------------------------------------------------ */
export default function Dashboard() {
  const { user } = useAuthStore();

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<EventReg[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAll() {
      try {
        const [tRes, eRes, nRes] = await Promise.allSettled([
          apiClient.get("/tickets/my-tickets"),
          apiClient.get("/events/my-registrations"),
          apiClient.get("/notifications"),
        ]);

        if (!active) return;

        if (tRes.status === "fulfilled")
          setTickets(tRes.value.data.tickets || []);
        if (eRes.status === "fulfilled") setEvents(eRes.value.data || []);
        if (nRes.status === "fulfilled")
          setNotifications(nRes.value.data || []);
      } catch {
        /* individual requests already handled via allSettled */
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAll();
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const activeTickets = tickets.filter((t) => t.status === "active").length;
    const unread = notifications.filter((n) => !n.isRead).length;

    const upcomingEvents = events
      .filter((e) => new Date(e.date).getTime() >= Date.now())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      activeTickets,
      unread,
      upcomingEvents,
    };
  }, [tickets, events, notifications]);

  const recentNotifications = notifications.slice(0, 4);
  const recentTickets = tickets.slice(0, 4);
  const initials = `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`;
  const roleLabel = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "Member";
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <div className="relative mt-6 overflow-hidden rounded-3xl bg-gradient-to-br from-primary-700 via-secondary-700 to-violet-800 p-6 text-white shadow-xl sm:p-10">
        {/* Decorative blobs + grid pattern */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:22px_22px]" />
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-20 right-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
          <div className="absolute right-1/3 top-10 h-40 w-40 rounded-full bg-fuchsia-400/20 blur-3xl" />
        </div>

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: greeting + personality */}
          <div className="flex flex-col gap-5">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-white/85 ring-1 ring-white/20 backdrop-blur">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              {roleLabel} Member
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/25 to-white/5 text-2xl font-bold ring-1 ring-white/30 backdrop-blur sm:h-20 sm:w-20 sm:text-3xl">
                {initials || "👤"}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold sm:text-3xl lg:text-4xl">
                  Welcome back, {user?.firstName || "Member"}!
                </h1>
                <p className="mt-1.5 text-sm text-primary-100 sm:text-base">
                  Stay connected, discover events, and be part of the community.
                </p>
              </div>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium ring-1 ring-white/20 backdrop-blur">
                📅 {todayLabel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium ring-1 ring-white/20 backdrop-blur">
                🎟️ {tickets.length} ticket{tickets.length === 1 ? "" : "s"}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 font-medium ring-1 ring-white/20 backdrop-blur">
                📌 {events.length} registration{events.length === 1 ? "" : "s"}
              </span>
              {stats.unread > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1.5 font-medium text-amber-100 ring-1 ring-amber-300/30 backdrop-blur">
                  🔔 {stats.unread} unread
                </span>
              )}
            </div>
          </div>

          {/* Right: next-up highlight */}
          <div className="lg:w-80 lg:shrink-0">
            {stats.upcomingEvents[0] ? (
              <Link
                to={`/events/${stats.upcomingEvents[0]._id}`}
                className="group block rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Next Up
                </p>
                <p className="mt-2 line-clamp-1 font-display text-lg font-bold">
                  {stats.upcomingEvents[0].title}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-primary-100">
                    {formatDate(stats.upcomingEvents[0].date)}
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-white transition group-hover:translate-x-0.5">
                    View event →
                  </span>
                </div>
              </Link>
            ) : (
              <Link
                to="/events"
                className="group block rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur transition hover:bg-white/15"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">
                  Discover
                </p>
                <p className="mt-2 font-display text-lg font-bold">
                  Explore what's happening
                </p>
                <p className="mt-1 text-sm text-primary-100">
                  Browse upcoming events and grab your tickets.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white transition group-hover:translate-x-0.5">
                  Browse events →
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Loading skeleton                                                    */}
      {/* ------------------------------------------------------------------ */}
      {loading ? (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-2xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
            />
          ))}
        </div>
      ) : (
        <>
          {/* ------------------------------------------------------------------ */}
          {/* Stats                                                              */}
          {/* ------------------------------------------------------------------ */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Active Tickets"
              value={stats.activeTickets}
              sub={
                tickets.length ? `${tickets.length} total` : "No tickets yet"
              }
              to="/my-tickets"
              icon={Icon.ticket}
              accent="bg-gradient-to-r from-primary-500 to-secondary-500"
            />
            <StatCard
              label="Events Registered"
              value={events.length}
              sub={
                stats.upcomingEvents.length
                  ? `${stats.upcomingEvents.length} upcoming`
                  : "No registrations"
              }
              to="/my-events"
              icon={Icon.event}
              accent="bg-gradient-to-r from-amber-500 to-orange-500"
            />
            <StatCard
              label="Notifications"
              value={stats.unread}
              sub={
                notifications.length
                  ? `${notifications.length} total`
                  : "All caught up"
              }
              to="/notifications"
              icon={Icon.bell}
              accent="bg-gradient-to-r from-violet-500 to-fuchsia-500"
            />
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* Main grid: Upcoming events + Recent tickets                        */}
          {/* ------------------------------------------------------------------ */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upcoming events */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-dark-card sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                  Upcoming Events
                </h2>
                <Link
                  to="/my-events"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  View all →
                </Link>
              </div>

              {stats.upcomingEvents.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-600">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-800">
                    📅
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    No upcoming registrations
                  </p>
                  <Link
                    to="/events"
                    className="mt-2 inline-block text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Explore events
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {stats.upcomingEvents.slice(0, 3).map((e) => (
                    <li
                      key={e._id}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-3 transition hover:border-primary-200 hover:bg-primary-50/50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary-500/40 dark:hover:bg-primary-900/20"
                    >
                      <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-primary-600 text-white">
                        <span className="text-[10px] font-bold uppercase leading-none">
                          {new Date(e.date).toLocaleDateString(undefined, {
                            month: "short",
                          })}
                        </span>
                        <span className="text-lg font-bold leading-tight">
                          {new Date(e.date).getDate()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {e.title}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {e.location || "Location TBA"}
                        </p>
                      </div>
                      <Link
                        to={`/events/${e._id}`}
                        className="ml-auto shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-primary-600 transition hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
                      >
                        View
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recent tickets */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-dark-card sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                  Recent Tickets
                </h2>
                <Link
                  to="/my-tickets"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  View all →
                </Link>
              </div>

              {recentTickets.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-600">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-800">
                    🎟️
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    No tickets purchased yet
                  </p>
                  <Link
                    to="/tickets"
                    className="mt-2 inline-block text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                  >
                    Get your first ticket
                  </Link>
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {recentTickets.map((t) => (
                    <li
                      key={t._id}
                      className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-3 transition hover:border-primary-200 hover:bg-primary-50/50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary-500/40 dark:hover:bg-primary-900/20"
                    >
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-secondary-600 text-white">
                        {Icon.ticket}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900 dark:text-white">
                          {t.event?.title || t.ticketNumber}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {t.ticketNumber} · {formatDate(t.event?.date)}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ring-1 ${statusTone(t.status)}`}
                      >
                        {t.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* Bottom grid: Quick actions + Notifications                         */}
          {/* ------------------------------------------------------------------ */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Quick actions */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-dark-card sm:p-6">
              <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                Quick Actions
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { to: "/profile", label: "My Profile", icon: "👤" },
                  { to: "/my-events", label: "My Events", icon: "📅" },
                  { to: "/notifications", label: "Notifications", icon: "🔔" },
                  { to: "/members", label: "Members", icon: "👥" },
                  { to: "/documents", label: "Documents", icon: "📄" },
                  { to: "/tickets", label: "Get Tickets", icon: "🎟️" },
                ].map((a) => (
                  <Link
                    key={a.to}
                    to={a.to}
                    className="group flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/60 px-3 py-3 transition hover:-translate-y-0.5 hover:border-primary-200 hover:bg-primary-50/60 hover:shadow-md dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-primary-500/40 dark:hover:bg-primary-900/20"
                  >
                    <span className="text-xl">{a.icon}</span>
                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {a.label}
                    </span>
                  </Link>
                ))}
              </div>
            </section>

            {/* Notifications */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-dark-card sm:p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                  Notifications
                </h2>
                <Link
                  to="/notifications"
                  className="text-sm font-semibold text-primary-600 hover:text-primary-500 dark:text-primary-400"
                >
                  View all →
                </Link>
              </div>

              {recentNotifications.length === 0 ? (
                <div className="mt-6 rounded-xl border border-dashed border-gray-300 px-4 py-10 text-center dark:border-gray-600">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-800">
                    🔕
                  </div>
                  <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    You're all caught up
                  </p>
                </div>
              ) : (
                <ul className="mt-4 divide-y divide-gray-100 dark:divide-gray-700">
                  {recentNotifications.map((n) => (
                    <li key={n._id} className="flex gap-3 py-3">
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.isRead
                            ? "bg-gray-300 dark:bg-gray-600"
                            : "bg-primary-500"
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {n.title}
                        </p>
                        <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                          {n.message}
                        </p>
                        <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}
