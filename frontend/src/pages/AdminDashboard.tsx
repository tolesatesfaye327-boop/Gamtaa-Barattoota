import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

interface DashboardStats {
  users: number;
  members: { active: number; inactive: number; total: number };
  events: {
    upcoming: number;
    ongoing: number;
    completed: number;
    total: number;
  };
  documents: number;
  galleries: number;
  payments: { totalRevenue: number; pending: number };
  contacts: { unread: number; total: number };
  opportunities: { active: number; total: number };
}

interface Activity {
  type: string;
  action: string;
  title: string;
  createdAt: string;
}

const ADMIN_ROLES = ["superadmin", "admin"];

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperadmin = user?.role === "superadmin";

  useEffect(() => {
    if (!user?.role || !ADMIN_ROLES.includes(user.role)) {
      navigate("/dashboard");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        apiClient.get("/dashboard/stats"),
        apiClient.get("/dashboard/recent-activity"),
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats
    ? [
        ...(isSuperadmin
          ? [{ label: "Total Users", value: stats.users, color: "bg-blue-500" }]
          : []),
        {
          label: "Active Members",
          value: stats.members.active,
          color: "bg-green-500",
        },
        { label: "Events", value: stats.events.total, color: "bg-purple-500" },
        { label: "Documents", value: stats.documents, color: "bg-indigo-500" },
        {
          label: "Gallery Albums",
          value: stats.galleries,
          color: "bg-pink-500",
        },
        {
          label: "Revenue (GHS)",
          value: stats.payments.totalRevenue,
          color: "bg-orange-500",
        },
      ]
    : [];

  const maxValue = Math.max(...statCards.map((s) => s.value), 1);

  const superadminActions = [
    { label: "Manage Users", path: "/admin/users", color: "bg-blue-500" },
  ];

  const adminActions = [
    { label: "Manage Events", path: "/admin/events", color: "bg-purple-500" },
    { label: "Gallery", path: "/admin/gallery", color: "bg-pink-500" },
    { label: "Documents", path: "/admin/documents", color: "bg-indigo-500" },
    {
      label: "Opportunities",
      path: "/admin/opportunities",
      color: "bg-orange-500",
    },
    { label: "Contact", path: "/admin/contact", color: "bg-red-500" },
  ];

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold text-primary">
          {isSuperadmin ? "Superadmin Dashboard" : "Leader Dashboard"}
        </h1>
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            isSuperadmin
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {user?.role}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-6 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <div className="text-4xl font-bold text-primary mb-2">
              {stat.value}
            </div>
            <div className="text-gray-600 dark:text-gray-300 font-semibold">
              {stat.label}
            </div>
            <div className="mt-3 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className={`${stat.color} rounded-full h-2 transition-all`}
                style={{ width: `${(stat.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {isSuperadmin && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:border dark:border-gray-700">
          <h3 className="text-xl font-bold text-primary mb-4">
            User Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {superadminActions.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.path)}
                className={`${action.color} text-white px-4 py-3 rounded hover:opacity-90 transition text-sm font-semibold`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:border dark:border-gray-700">
        <h3 className="text-xl font-bold text-primary mb-4">
          Content Management
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {adminActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white px-4 py-3 rounded hover:opacity-90 transition text-sm font-semibold`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow dark:border dark:border-gray-700">
        <h3 className="text-xl font-bold text-primary mb-4">Recent Activity</h3>
        {activities.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">
            No recent activity.
          </p>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold uppercase">
                  {activity.type.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">
                    <span className="font-semibold capitalize">
                      {activity.action}
                    </span>{" "}
                    {activity.type}: {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
