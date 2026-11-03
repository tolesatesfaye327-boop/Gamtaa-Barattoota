import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { students as staticStudents } from "../data/students";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

interface StudentItem {
  _id?: string;
  id?: string;
  userId?: string;
  name: string;
  field: string;
  year: string;
  village: string;
  school: string;
  phone: string;
  email?: string;
  telegram?: string;
  entry: string;
  role: string;
  message: string;
  bio: string;
  image?: string;
}

export default function StudentProfiles() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [allowEveryoneToEdit, setAllowEveryoneToEdit] = useState(false);

  const isSuperAdmin = user?.role === "superadmin";
  const isAuthenticated = !!user;

  useEffect(() => {
    loadStudents();
    loadSettings();
  }, []);

  // Reload settings when page becomes visible (for when returning from settings page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        loadSettings();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const loadStudents = async () => {
    try {
      const response = await apiClient.get("/students");
      const apiData: StudentItem[] = response.data;
      if (apiData && apiData.length > 0) {
        // Merge: API data overrides static data by _id or id match.
        // Remaining static students are appended.
        const merged: StudentItem[] = staticStudents.map((s) => ({
          ...s,
          entry: (s as any).entry || "",
          bio: (s as any).bio || "",
        }));
        for (const apiStudent of apiData) {
          const a = apiStudent as any;
          // Try matching by _id, id, or identity (name + phone)
          const idx = merged.findIndex(
            (s) =>
              (s._id && s._id === a._id) ||
              (s.id && s.id === a.id) ||
              (s.name === a.name && s.phone === a.phone),
          );
          if (idx !== -1) {
            // Override: replace static entry with the DB record
            merged[idx] = { ...merged[idx], ...a };
          } else {
            merged.push(a);
          }
        }
        setStudents(merged);
      } else {
        setStudents(staticStudents);
      }
    } catch {
      // Fall back to static data
      setStudents(staticStudents);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await apiClient.get("/settings");
      const settings = response.data;
      const editPermission = settings.allowEveryoneToEditStudentProfiles || false;
      console.log("🔧 Settings loaded - Allow everyone to edit:", editPermission);
      setAllowEveryoneToEdit(editPermission);
    } catch (error) {
      console.error("⚠️ Failed to load settings:", error);
      // If settings fail to load, default to false (restricted)
      setAllowEveryoneToEdit(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete ${name}'s profile? This cannot be undone.`)) {
      return;
    }

    try {
      await apiClient.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id && s.id !== id));
      setSuccess(`${name}'s profile deleted successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete student");
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleEdit = (id: string) => {
    navigate(`/students/${id}`);
  };
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 dark:from-teal-900 dark:via-cyan-950 dark:to-gray-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6 px-6 py-2 rounded-full bg-white/10 border border-white/20 text-white/80 text-sm font-medium tracking-wide">
            Barattoota Ada'a Bargaa
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight">
            BARATTOOTAN
          </h1>
          <p className="text-lg sm:text-xl text-teal-200 max-w-3xl mx-auto leading-relaxed">
            Barattootan wal yaa barru — eenyummaa, seenaa fi dhaamsa isaanii
          </p>
        </div>
      </div>

      <section className="px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/30 text-red-700 dark:text-red-300 px-5 py-4 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="mb-6 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/30 text-green-700 dark:text-green-300 px-5 py-4 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/50 p-6 sm:p-8 mb-12">
            <div className="flex items-start gap-4">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                  />
                </svg>
              </span>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
                <strong className="text-gray-900 dark:text-white">
                  Hubachiisa:
                </strong>{" "}
                Yeroo daataa barattootaa kana akkasittiin keenyu dhaloonni gara
                boodaa dhufan eenyummaa barattoota asitti baratanii darbanii fi
                asitti barachaa jiranii maal akka hojjatan, maal barachaa akka
                turan, tokkummaa akkamii akka qabaachaa turan, eessaa akka
                dhufan walii walii isaanii akka baran gochuuf daataa kana
                keenye.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading students...</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((s, idx) => (
                <div
                  key={s._id || s.id || idx}
                  className="bg-white dark:bg-gray-800 rounded-b-2xl rounded-tr-2xl shadow-lg dark:shadow-gray-900/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1.5 hover:scale-[1.02] group"
                >
                  <div className="absolute bottom-0 left-0 h-0.5 bg-teal-500 w-0 group-hover:w-full transition-all duration-300 ease-out z-10"></div>
                  <div className="flex">
                    {s.image ? (
                      <div className="w-[120px] shrink-0 overflow-hidden">
                        <img
                          src={s.image}
                          alt={s.name}
                          className="w-full h-[120px] object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      </div>
                    ) : (
                      <div className="w-[120px] h-[120px] shrink-0 bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                        <span className="text-2xl font-bold text-white">
                          {s.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 p-3 min-w-0">
                      <div className="flex items-start justify-between mb-0.5">
                        <div className="min-w-0 flex-1">
                          <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {s.name}
                          </h2>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {s.field} · {s.year}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                          <span className="text-[10px] font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/50 px-2 py-0.5 rounded-full">
                            {s.role}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">
                            {s.village}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                            {s.school}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                        {s.phone}
                      </p>
                      {s.email && (
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">
                          {s.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-3 pb-3 border-t border-gray-100 dark:border-gray-700 pt-2 mx-3">
                    <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-5">
                      {s.message}
                    </p>
                  </div>
                  <div className="px-3 pb-3">
                    {isSuperAdmin ? (
                      // SuperAdmin always sees all 3 buttons
                      <div className="flex gap-2">
                        <Link
                          to={`/students/${s._id || s.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(s._id || s.id || "")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s._id || s.id || "", s.name)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    ) : allowEveryoneToEdit && isAuthenticated ? (
                      // Permission enabled: Authenticated users see View and Edit
                      <div className="flex gap-2">
                        <Link
                          to={`/students/${s._id || s.id}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                          View
                        </Link>
                        <button
                          onClick={() => handleEdit(s._id || s.id || "")}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                          </svg>
                          Edit Profile
                        </button>
                      </div>
                    ) : (
                      // Default: Everyone sees only View button
                      <Link
                        to={`/students/${s._id || s.id}`}
                        className="inline-flex items-center justify-center w-full gap-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg transition-colors"
                      >
                        View Detail
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                          />
                        </svg>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
