import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface DashboardStats {
  events: { upcoming: number; ongoing: number; completed: number; total: number };
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

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  subject: string;
  status: string;
  createdAt: string;
}

const PIE_COLORS = ["#22C55E", "#EF4444", "#F97316", "#3B82F6", "#A855F7"];

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  if (h < 22) return "Good Evening";
  return "Good Night";
};

const formatDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = () => {
  return new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

function StatCard({
  label,
  value,
  icon,
  gradient,
  subtitle,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-lg ${gradient}`}
    >
      <div className="absolute top-3 right-3 opacity-20">{icon}</div>
      <div className="relative z-10">
        <p className="text-sm font-medium opacity-80">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs mt-1 opacity-70">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const base = "w-9 h-9 rounded-full flex items-center justify-center shrink-0";
  switch (type) {
    case "event":
      return (
        <div className={`${base} bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case "contact":
      return (
        <div className={`${base} bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      );
    case "payment":
      return (
        <div className={`${base} bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${base} bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
}

export default function LeaderDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [recentContacts, setRecentContacts] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [time, setTime] = useState(formatTime());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/dashboard");
      return;
    }
    fetchData();
    const timer = setInterval(() => setTime(formatTime()), 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes, contactsRes] = await Promise.all([
        apiClient.get("/dashboard/stats"),
        apiClient.get("/dashboard/recent-activity"),
        apiClient.get("/contact"),
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
      setRecentContacts(contactsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const barData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Events", count: stats.events.total, fill: "#A855F7" },
      { name: "Galleries", count: stats.galleries, fill: "#EC4899" },
    ];
  }, [stats]);

  const pieData = useMemo(() => {
    if (!stats) return [];
    return [
      { name: "Upcoming Events", value: stats.events.upcoming, color: PIE_COLORS[0] },
      { name: "Ongoing Events", value: stats.events.ongoing, color: PIE_COLORS[1] },
      { name: "Completed Events", value: stats.events.completed, color: PIE_COLORS[2] },
    ];
  }, [stats]);

  const statCards = useMemo(() => {
    if (!stats) return [];
    return [
      {
        label: "Upcoming Events",
        value: stats.events.upcoming,
        gradient: "bg-gradient-to-br from-purple-500 to-purple-700",
        subtitle: `${stats.events.ongoing} ongoing`,
        icon: (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: "Documents",
        value: stats.documents,
        gradient: "bg-gradient-to-br from-indigo-500 to-indigo-700",
        icon: (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: "Gallery Albums",
        value: stats.galleries,
        gradient: "bg-gradient-to-br from-pink-500 to-pink-700",
        icon: (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        label: "Unread Messages",
        value: stats.contacts.unread,
        gradient: "bg-gradient-to-br from-red-500 to-red-700",
        subtitle: `${stats.contacts.total} total`,
        icon: (
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
    ];
  }, [stats]);

  const quickActions = [
    {
      label: "Manage Events",
      path: "/admin/events",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-purple-600 to-purple-700",
    },
    {
      label: "Gallery",
      path: "/admin/gallery",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-pink-600 to-pink-700",
    },
    {
      label: "Contact Messages",
      path: "/admin/contact",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-rose-600 to-rose-700",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user?.firstName || "Admin"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDate()} &middot; {time}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1.5 rounded-full text-xs font-bold uppercase bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25">
            Admin
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              gradient={stat.gradient}
              icon={stat.icon}
              subtitle={stat.subtitle}
            />
          ))}
        </div>
      )}

      {/* Charts Row */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Content Overview</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">Managed entities across the platform</p>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                    cursor={{ fill: "rgba(0,0,0,0.05)" }}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={48}>
                    {barData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">Event Status</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Breakdown of events</p>
            <div className="h-64 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Activity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest platform actions</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{activities.length} items</span>
          </div>
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400 dark:text-gray-500">
              <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm">No recent activity</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[17px] top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-700 rounded-full" />
              <div className="space-y-0">
                {activities.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-3 py-2.5 relative">
                    <ActivityIcon type={activity.type} />
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        <span className="font-semibold capitalize">{activity.action}</span>{" "}
                        <span className="text-xs font-medium text-gray-400 uppercase">{activity.type}</span>
                        <span className="block truncate text-gray-600 dark:text-gray-400 text-xs mt-0.5">
                          {activity.title}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {new Date(activity.createdAt).toLocaleDateString()} &middot;{" "}
                        {new Date(activity.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="mb-5">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Quick Actions</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Navigate to management sections</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-white text-sm font-medium bg-gradient-to-r ${action.color} hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200`}
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Contacts Table */}
      {recentContacts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Contact Messages</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest inquiries from visitors</p>
            </div>
            <button
              onClick={() => navigate("/admin/contact")}
              className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <th className="text-left pb-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                  <th className="text-left pb-3 font-semibold text-gray-700 dark:text-gray-300 hidden sm:table-cell">Subject</th>
                  <th className="text-left pb-3 font-semibold text-gray-700 dark:text-gray-300 hidden md:table-cell">Date</th>
                  <th className="text-right pb-3 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentContacts.slice(0, 5).map((contact) => (
                  <tr
                    key={contact._id}
                    className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-3">
                      <p className="font-medium text-gray-900 dark:text-white">{contact.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</p>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400 hidden sm:table-cell max-w-[200px] truncate">
                      {contact.subject}
                    </td>
                    <td className="py-3 text-gray-500 dark:text-gray-400 hidden md:table-cell text-xs">
                      {new Date(contact.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                          contact.status === "new"
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                            : contact.status === "read"
                            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                            : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {contact.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
