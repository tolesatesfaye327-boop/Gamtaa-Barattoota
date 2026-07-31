import { useState, useEffect } from "react";
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
}

const tabLabels: Record<string, string> = {
  upcoming: "Kan Dhufu",
  past: "Kan Darbe",
  all: "Hunda",
};

export default function MyEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "all">(
    "upcoming"
  );

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await apiClient.get("/events/my-registrations");
      setEvents(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Taateewwan kee fudhachuu hin dandeenye"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId: string) => {
    if (!window.confirm("Dhugumaan galmeessa haquu barbaaddaa?")) return;
    try {
      await apiClient.post(`/events/${eventId}/unregister`);
      setEvents((prev) => prev.filter((e) => e._id !== eventId));
    } catch (err: any) {
      setError(err.response?.data?.message || "Galmeessa haquu hin dandeenye");
    }
  };

  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.date);
    const now = new Date();
    if (activeTab === "upcoming") return eventDate >= now;
    if (activeTab === "past") return eventDate < now;
    return true;
  });

  const statusClass = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "ongoing":
        return "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
      case "completed":
        return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
      default:
        return "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 text-center text-gray-500 dark:text-gray-400 sm:px-6">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 dark:border-gray-700 dark:border-t-primary-400" />
        Taateewwan kee fe&apos;aa jira...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <span className="font-bold">!</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-12 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              My activity
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Taateewwan Koo
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sagantaawwan ati irratti galmoofte hunda ilaali.
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Registered</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{events.length}</p>
          </div>
        </div>
      </div>

      <div className="flex w-full gap-2 overflow-x-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 sm:w-fit">
        {(["upcoming", "past", "all"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? "bg-primary-600 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            }`}
          >
            {tab === "upcoming" ? "Kan Dhufu" : tab === "past" ? "Kan Darbe" : "Hunda"}
          </button>
        ))}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-700">📅</div>
          <p className="mt-4 font-semibold text-gray-800 dark:text-white">Taateewwan hin argamne</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Taateewwan {activeTab === "all" ? "" : tabLabels[activeTab] || activeTab} keessatti galmooftu hin jiru.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <div
              key={event._id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-gray-700 sm:flex-row sm:items-start sm:justify-between sm:p-6">
                <div>
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary-500" />
                    {event.category}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
                    {event.title}
                  </h3>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusClass(event.status)}`}
                >
                  {event.status}
                </span>
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
                <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-900/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Guyyaa</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 p-3.5 dark:bg-gray-900/40">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Bakka</p>
                  <p className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">{event.location}</p>
                </div>

                <div className="flex justify-end sm:col-span-2">
                  <button
                    onClick={() => handleUnregister(event._id)}
                    className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                  >
                    Galmeessa Haqi
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
