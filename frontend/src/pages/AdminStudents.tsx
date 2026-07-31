import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

interface Student {
  _id: string;
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
  userId?: string;
}

const EMPTY_FORM = {
  name: "",
  field: "",
  year: "",
  village: "",
  school: "",
  phone: "",
  email: "",
  telegram: "",
  entry: "",
  role: "Miseensa",
  message: "",
  bio: "",
  image: "",
};

export default function AdminStudents() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Student | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/10 dark:border-gray-700 dark:bg-gray-900/60 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-primary-400 dark:focus:bg-gray-900";
  const labelClass =
    "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";

  useEffect(() => {
    if (user?.role !== "superadmin") {
      navigate("/");
      return;
    }
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await apiClient.get("/students");
      setStudents(response.data);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (student: Student) => {
    setEditing(student);
    setFormData({
      name: student.name,
      field: student.field,
      year: student.year,
      village: student.village,
      school: student.school,
      phone: student.phone,
      email: student.email || "",
      telegram: student.telegram || "",
      entry: student.entry,
      role: student.role,
      message: student.message,
      bio: student.bio,
      image: student.image || "",
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      if (editing) {
        await apiClient.patch(`/students/${editing._id}`, formData);
        setSuccess("Student updated successfully!");
      } else {
        await apiClient.post("/students", formData);
        setSuccess("Student created successfully!");
      }
      setShowForm(false);
      setEditing(null);
      fetchStudents();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to save student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this student?")) return;
    try {
      await apiClient.delete(`/students/${id}`);
      setStudents((prev) => prev.filter((s) => s._id !== id));
      setSuccess("Student deleted.");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to delete student");
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center text-gray-500 dark:text-gray-400 sm:px-6 lg:px-8">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500 dark:border-gray-700 dark:border-t-primary-400" />
        Loading students...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800/80 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-400">
            <span className="h-2 w-2 rounded-full bg-primary-500" />
            Directory
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Student Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Maintain student profiles and association records in one place.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-600/20 transition hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/20"
        >
          <span className="text-lg leading-none">+</span>
          Create Student
        </button>
      </div>

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

      {showForm && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-700 dark:bg-gray-900/30 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-600 dark:text-primary-400">
              Student profile
            </p>
            <h3 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
              {editing ? "Edit Student" : "Create Student"}
            </h3>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-7">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Field of Study</label>
                <input
                  type="text"
                  value={formData.field}
                  onChange={(e) =>
                    setFormData({ ...formData, field: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Year</label>
                <input
                  type="text"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Entry (Batch)</label>
                <input
                  type="text"
                  value={formData.entry}
                  onChange={(e) =>
                    setFormData({ ...formData, entry: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Village</label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={(e) =>
                    setFormData({ ...formData, village: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>School</label>
                <input
                  type="text"
                  value={formData.school}
                  onChange={(e) =>
                    setFormData({ ...formData, school: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Telegram</label>
                <input
                  type="text"
                  value={formData.telegram}
                  onChange={(e) =>
                    setFormData({ ...formData, telegram: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="Hundeeffataa">Hundeeffataa</option>
                  <option value="Walitti Qabaa Duraa">
                    Walitti Qabaa Duraa
                  </option>
                  <option value="Maalaqa">Maalaqa</option>
                  <option value="Walitti Qabaa">Walitti Qabaa</option>
                  <option value="Barreessaa">Barreessaa</option>
                  <option value="Miseensa">Miseensa</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Message</label>
              <textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={3}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                rows={4}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Image URL</label>
              <input
                type="text"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className={inputClass}
              />
            </div>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Update Student"
                    : "Create Student"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditing(null);
                }}
                className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-700 sm:px-6">
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Student directory</h2>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {students.length} {students.length === 1 ? "profile" : "profiles"} registered
            </p>
          </div>
          <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
            Active records
          </span>
        </div>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-gray-50/80 dark:bg-gray-900/30">
            <tr>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Field
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Year
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Village
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Role
              </th>
              <th className="px-6 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700/70">
            {students.map((student) => (
              <tr key={student._id} className="transition hover:bg-gray-50/80 dark:hover:bg-gray-700/30">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-xs font-bold text-white">
                      {student.name?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {student.field}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {student.year}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {student.village}
                </td>
                <td className="px-6 py-4">
                  <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 dark:bg-teal-900/30 dark:text-teal-300">
                    {student.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(student)}
                      className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900/20"
                    >
                      Edit
                    </button>
                    {user?.role === "superadmin" && (
                      <button
                        onClick={() => handleDelete(student._id)}
                        className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900/50 dark:text-red-300 dark:hover:bg-red-900/20"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {students.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="font-semibold text-gray-700 dark:text-gray-200">No students found</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create the first student profile to populate this directory.</p>
          </div>
        )}
      </div>
    </div>
  );
}
