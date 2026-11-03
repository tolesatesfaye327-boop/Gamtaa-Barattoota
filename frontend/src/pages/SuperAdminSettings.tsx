import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

export default function SuperAdminSettings() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [allowEveryoneToEdit, setAllowEveryoneToEdit] = useState(false);

  useEffect(() => {
    if (user?.role !== "superadmin") {
      navigate("/");
      return;
    }
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get("/settings");
      const settings = response.data;
      setAllowEveryoneToEdit(settings.allowEveryoneToEditStudentProfiles || false);
    } catch (err: unknown) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async () => {
    const newValue = !allowEveryoneToEdit;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await apiClient.put("/settings/allowEveryoneToEditStudentProfiles", {
        value: newValue,
        description: "Allow everyone to edit all student profiles",
      });

      setAllowEveryoneToEdit(newValue);
      setSuccess(
        newValue
          ? "✓ Everyone can now edit all student profiles!"
          : "✓ Users can only edit their own profiles now."
      );

      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to update setting");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 dark:border-gray-700 dark:border-t-primary-400" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 sm:p-7">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            System Configuration
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            SuperAdmin Settings
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Control global permissions and system behavior
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <span className="font-bold">!</span>
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <span className="font-bold">✓</span>
          {success}
        </div>
      )}

      {/* Student Profile Permissions */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-700 dark:bg-gray-900/30 sm:px-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
            Student Profiles
          </p>
          <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            Edit Permissions
          </h3>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <svg
                  className="w-6 h-6 text-primary-600 dark:text-primary-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Allow Everyone to Edit All Profiles
                </h4>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                When enabled, <strong>all authenticated users</strong> can edit any student profile, not just their own.
                This is useful for collaborative profile management.
              </p>
              <div className="mt-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="text-sm text-amber-800 dark:text-amber-200">
                    <p className="font-semibold mb-1">When ENABLED:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Everyone sees "Edit" button on all student cards</li>
                      <li>Any user can update any student profile</li>
                      <li>Useful for collaborative directory management</li>
                    </ul>
                    <p className="font-semibold mt-3 mb-1">When DISABLED:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Users can only edit their own profile</li>
                      <li>SuperAdmin can always edit any profile</li>
                      <li>More secure and controlled</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Toggle Switch */}
            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleToggle}
                disabled={saving}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors focus:outline-none focus:ring-4 focus:ring-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${
                  allowEveryoneToEdit
                    ? "bg-emerald-600 dark:bg-emerald-500"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
                aria-pressed={allowEveryoneToEdit}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    allowEveryoneToEdit ? "translate-x-9" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-semibold ${
                  allowEveryoneToEdit
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {allowEveryoneToEdit ? "ON" : "OFF"}
              </span>
              {saving && (
                <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
          </div>

          {/* Current Status */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700 dark:text-gray-300">
                Current Status:
              </span>
              {allowEveryoneToEdit ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Everyone can edit all profiles
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Users can only edit their own profiles
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* More Settings Can Be Added Here */}
      <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-8 text-center">
        <svg
          className="w-12 h-12 mx-auto text-gray-400 dark:text-gray-600 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          More settings will be added here in future updates
        </p>
      </div>
    </div>
  );
}
