import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";
import { students as staticStudents } from "../data/students";

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

const EMPTY_FORM: StudentItem = {
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

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/** Checks if a string looks like a MongoDB ObjectId (24 hex chars) */
function isObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<StudentItem>(EMPTY_FORM);
  const [allowEveryoneToEdit, setAllowEveryoneToEdit] = useState(false);

  useEffect(() => {
    loadStudent();
    loadSettings();
  }, [id]);

  const loadSettings = async () => {
    try {
      const response = await apiClient.get("/settings");
      const settings = response.data;
      setAllowEveryoneToEdit(settings.allowEveryoneToEditStudentProfiles || false);
    } catch (error) {
      console.error("Failed to load settings:", error);
      setAllowEveryoneToEdit(false);
    }
  };

  const loadStudent = async () => {
    setLoading(true);
    setError(null);

    // If the id is a static slug (not a MongoDB ObjectId), load from static data
    if (id && !isObjectId(id)) {
      const staticStudent = staticStudents.find((s) => s.id === id);
      setStudent(staticStudent ? (staticStudent as StudentItem) : null);
      setLoading(false);
      return;
    }

    // Otherwise try loading from the API
    try {
      const response = await apiClient.get(`/students/${id}`);
      const data = response.data;
      if (data && data._id) {
        setStudent(data);
      } else {
        setStudent(null);
      }
    } catch {
      // Fallback to static data
      const staticStudent = staticStudents.find((s) => s.id === id);
      setStudent(staticStudent ? (staticStudent as StudentItem) : null);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user can edit this student
  const canEditStudent = (): boolean => {
    if (!user || !student) return false;
    // Superadmin can edit any
    if (user.role === "superadmin") return true;
    // Admin can edit any
    if (user.role === "admin") return true;
    // If global setting allows everyone to edit, any authenticated user can edit
    if (allowEveryoneToEdit) return true;
    // Identity-based check: match name + email + phone
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const studentName = student.name.toLowerCase();
    const nameMatch =
      studentName.includes(fullName) || fullName.includes(studentName);
    const emailMatch =
      student.email?.toLowerCase() === user.email?.toLowerCase();
    const phoneMatch = student.phone === user.phone;
    if (emailMatch && nameMatch && phoneMatch) return true;
    return false;
  };
  const openEdit = () => {
    if (!student) return;
    setFormData({
      name: student.name || "",
      field: student.field || "",
      year: student.year || "",
      village: student.village || "",
      school: student.school || "",
      phone: student.phone || "",
      email: student.email || "",
      telegram: student.telegram || "",
      entry: student.entry || "",
      role: student.role || "Miseensa",
      message: student.message || "",
      bio: student.bio || "",
      image: student.image || "",
    });
    setEditing(true);
    setError(null);
    setSuccess(null);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const isFromDb = student._id && isObjectId(student._id);
      let updatedStudentData;

      if (isFromDb) {
        // DB-backed student — PATCH to update
        const response = await apiClient.patch(
          `/students/${student._id}`,
          formData,
        );
        updatedStudentData = response.data.student || {
          ...student,
          ...formData,
        };
      } else {
        // Static data student — POST to create a new DB record, then PATCH to set userId
        const createResponse = await apiClient.post("/students", formData);
        const newStudent = createResponse.data.student;
        updatedStudentData = { ...newStudent, ...formData };
      }

      setStudent(updatedStudentData);
      setSuccess("Profile updated successfully!");
      setEditing(false);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(
        error.response?.data?.message || "Failed to update student profile",
      );
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading student...
          </p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-600 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-400 text-lg">Barataan kun hin argamne</p>
          <Link
            to="/students"
            className="inline-block mt-4 text-teal-400 hover:text-teal-300 underline"
          >
            Gara Barattootaatti deebi'i
          </Link>
        </div>
      </div>
    );
  }

  // Edit Mode
  if (editing) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 dark:from-teal-900 dark:via-cyan-950 dark:to-gray-900 py-24 overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/students"
              className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
            >
              <svg
                className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Gara Barattootaatti deebi'i
            </Link>
            <h1 className="text-4xl font-bold text-white">
              Editing: {student.name}
            </h1>
          </div>
        </div>

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-6 sm:p-8">
            {error && (
              <div className="mb-6 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-500/30 text-red-700 dark:text-red-400 px-5 py-4 rounded-xl flex items-center gap-3">
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
            {success && (
              <div className="mb-6 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/30 text-green-700 dark:text-green-400 px-5 py-4 rounded-xl flex items-center gap-3">
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Field of Study <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Entry (Batch) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="entry"
                    value={formData.entry}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Village <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    School <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Telegram
                  </label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                    required
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2.5 rounded-lg transition disabled:opacity-50 font-medium flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2.5 rounded-lg transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    );
  }

  // View Mode
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 dark:from-teal-900 dark:via-cyan-950 dark:to-gray-900 py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-8 group"
          >
            <svg
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Gara Barattootaatti deebi'i
          </Link>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-16">
        {success && (
          <div className="mb-6 bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-500/30 text-green-700 dark:text-green-400 px-5 py-4 rounded-xl flex items-center gap-3">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{success}</span>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-80 p-8 flex flex-col items-center bg-gradient-to-b from-teal-50 to-white dark:from-teal-900/30 dark:to-gray-800 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
              {student.image ? (
                <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-teal-500/20 mb-4 shadow-lg">
                  <img
                    src={student.image}
                    alt={student.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-36 h-36 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center ring-4 ring-teal-500/20 mb-4 shadow-lg">
                  <span className="text-5xl font-bold text-white select-none">
                    {getInitials(student.name)}
                  </span>
                </div>
              )}
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
                {student.name}
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-full bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 text-xs font-medium">
                  {student.role}
                </span>
                <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium">
                  Batch {student.entry}
                </span>
              </div>

              {/* Edit button for authorized users */}
              {canEditStudent() && (
                <button
                  onClick={openEdit}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  Edit Profile
                </button>
              )}
            </div>

            <div className="flex-1 p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-900/50 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-teal-600 dark:text-teal-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Qorannoo
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.field}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-purple-600 dark:text-purple-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Ganda
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.village}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.627 48.627 0 0 1 12 20.904a48.627 48.627 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.57 50.57 0 0 0-2.658-.813A59.905 59.905 0 0 1 12 3.493a59.902 59.902 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Mana Barumsaa
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.school}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4 text-amber-600 dark:text-amber-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Waggaa
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.year}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-600 dark:text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
                    />
                  </svg>
                  Seenaa Isaanii
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {student.bio}
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-teal-600 dark:text-teal-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                  </svg>
                  Dhaamsa Isaanii
                </h3>
                <p className="text-gray-600 dark:text-gray-400 italic leading-relaxed border-l-4 border-teal-500 pl-4">
                  "{student.message}"
                </p>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Bilbilaa
                    </p>
                    <a
                      href={`tel:${student.phone}`}
                      className="text-teal-600 dark:text-teal-400 hover:underline text-sm font-medium"
                    >
                      {student.phone}
                    </a>
                  </div>
                  {student.email && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Email
                      </p>
                      <a
                        href={`mailto:${student.email}`}
                        className="text-teal-600 dark:text-teal-400 hover:underline text-sm font-medium break-all"
                      >
                        {student.email}
                      </a>
                    </div>
                  )}
                  {student.telegram && (
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                        Telegram
                      </p>
                      <span className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                        {student.telegram}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
