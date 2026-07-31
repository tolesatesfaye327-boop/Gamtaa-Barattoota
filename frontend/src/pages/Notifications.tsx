import { useState, useEffect } from "react";
import apiClient from "../services/api";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.get("/notifications");
      setNotifications(response.data);
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Beeksisota fudhachuu hin dandeenye"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err: any) {
      console.error("Failed to mark as read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch("/notifications/read-all");
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err: any) {
      console.error("Failed to mark all as read", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Beeksisa kana haquu?")) return;
    try {
      await apiClient.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err: any) {
      console.error("Failed to delete notification", err);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "info":
        return "ℹ️";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "event":
        return "📅";
      case "message":
        return "✉️";
      default:
        return "🔔";
    }
  };

  const timeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
    if (diff < 60) return "amma";
    if (diff < 3600) return `${Math.floor(diff / 60)}dak. dura`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}sa'at. dura`;
    return `${Math.floor(diff / 86400)}guyy. dura`;
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const getTypeClass = (type: string) => {
    switch (type?.toLowerCase()) {
      case "success":
        return "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300";
      case "warning":
        return "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300";
      case "error":
        return "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-300";
      case "event":
        return "bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300";
      case "message":
        return "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300";
      default:
        return "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300";
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-gray-500 dark:text-gray-400 sm:px-6">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 dark:border-gray-700 dark:border-t-primary-400" />
        Beeksisota fe&apos;aa jira...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <span className="font-bold">!</span>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-12 sm:px-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 sm:p-7">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
              <span className="h-2 w-2 rounded-full bg-primary-500" />
              Account updates
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Beeksisota
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Odeeffannoo fi haala hojii kee hordofi.
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 px-4 py-3 dark:bg-gray-900/50">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">Unread</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{unreadCount}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="mt-5 inline-flex items-center rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
          >
            Hunda kan dubbifame gochuu ({unreadCount})
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-gray-700 dark:bg-gray-800/60">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl dark:bg-gray-700">🔔</div>
          <p className="mt-4 font-semibold text-gray-800 dark:text-white">Beeksi hin jiru.</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Yeroo ammaa beeksisni haaraan hin jiru.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => !notification.isRead && handleMarkRead(notification._id)}
              className={`group flex cursor-pointer items-start gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 sm:p-5 ${
                !notification.isRead
                  ? "border-primary-200 dark:border-primary-900/60"
                  : "border-gray-200 opacity-80 dark:border-gray-700"
              }`}
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl ${getTypeClass(notification.type)}`}>
                {getTypeIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3
                    className={`font-semibold ${
                      !notification.isRead
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-600 dark:text-gray-300"
                    }`}
                  >
                    {notification.title}
                  </h3>
                  <span className="ml-4 whitespace-nowrap text-xs text-gray-400 dark:text-gray-500">
                    {timeAgo(notification.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {notification.message}
                </p>
                {!notification.isRead && <span className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400"><span className="h-1.5 w-1.5 rounded-full bg-primary-500" /> Haaraa</span>}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification._id);
                }}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                title="Haqi"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
