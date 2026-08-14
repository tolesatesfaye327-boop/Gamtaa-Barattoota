import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

export default function MyStudentProfile() {
  const { user } = useAuthStore();
  const [student, setStudent] = useState<StudentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<StudentItem>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadMyProfile();
  }, []);

  const loadMyProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.get("/students/me");
      const data = response.data;
      if (data && data._id) {
        setStudent(data);
      } else {
        setStudent(null);
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 404) {
        // No student profile exists yet — user can create one
        setStudent(null);
      } else {
        setError("Failed to load your student profile");
      }
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setFormData({
      ...EMPTY_FORM,
      name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setEditing(true);
    setError(null);
    setSuccess(null);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      // Show local preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return formData.image || null;
    setUploadingImage(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("image", imageFile);
      const response = await apiClient.post(
        "/students/upload-image",
        formDataObj,
      );
      return response.data.url;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Failed to upload image");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Upload image first if a file was selected
      const uploadedUrl = await uploadImage();
      if (imageFile && !uploadedUrl) {
        // Image upload failed
        setSaving(false);
        return;
      }
      const finalFormData = {
        ...formData,
        image: uploadedUrl || formData.image || "",
      };

      if (student && student._id) {
        // Update existing student profile
        const response = await apiClient.patch(
          `/students/${student._id}`,
          finalFormData,
        );
        setStudent(response.data.student || { ...student, ...finalFormData });
        setSuccess("Student profile updated successfully!");
      } else {
        // Create new student profile
        const response = await apiClient.post("/students", finalFormData);
        setStudent(response.data.student);
        setSuccess("Student profile created successfully!");
      }
      setImageFile(null);
      setEditing(false);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          data?: { message?: string; student?: StudentItem };
        };
      };
      // Handle duplicate profile (409) — show message and load existing profile for update
      if (error.response?.status === 409 && error.response.data?.student) {
        setStudent(error.response.data.student);
        setError(
          error.response.data.message ||
            "You already have a student profile with this name. If you want, you can update it.",
        );
        setEditing(false);
      } else {
        setError(
          error.response?.data?.message || "Failed to save student profile",
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50";
  const labelClass =
    "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            Loading your student profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-cyan-900 dark:from-teal-900 dark:via-cyan-950 dark:to-gray-900 py-16 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/students"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors mb-6 group"
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            My Student Profile
          </h1>
          <p className="mt-2 text-teal-200 text-sm sm:text-base">
            View, create, and update your student information
          </p>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-16">
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

        {/* No profile yet — prompt to create */}
        {!student && !editing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-8 sm:p-12 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center mb-6">
              <svg
                className="w-10 h-10 text-white"
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
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              You don't have a student profile yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-8">
              Create your student profile to be part of the Barattoota Ada'a
              Bargaa directory. Share your field of study, village, school, and
              a message with the community.
            </p>
            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg transition-colors"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Create My Student Profile
            </button>
          </div>
        )}

        {/* Edit / Create form */}
        {editing && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/50 p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              {student
                ? "Edit My Student Profile"
                : "Create My Student Profile"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Field of Study <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="field"
                    value={formData.field}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Entry (Batch) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="entry"
                    value={formData.entry}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Village <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="village"
                    value={formData.village}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    School <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Telegram</label>
                  <input
                    type="text"
                    name="telegram"
                    value={formData.telegram || ""}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
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
                <div>
                  <label className={labelClass}>Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-teal-600 file:text-white file:text-sm file:font-medium hover:file:bg-teal-700"
                  />
                  {formData.image && (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-14 h-14 rounded-full object-cover border-2 border-teal-500/30"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {imageFile ? imageFile.name : "Current profile image"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className={labelClass}>
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={3}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>
                  Bio <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className={inputClass}
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
                  {saving
                    ? "Saving..."
                    : student
                      ? "Save Changes"
                      : "Create Profile"}
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
        )}

        {/* View profile */}
        {student && !editing && (
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
                <Link
                  to={`/students/${student._id}`}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 text-sm font-medium rounded-lg transition-colors hover:bg-teal-50 dark:hover:bg-teal-900/20"
                >
                  View Public Profile
                </Link>
              </div>

              <div className="flex-1 p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Qorannoo
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.field}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Ganda
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.village}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-500 uppercase tracking-wider">
                      Mana Barumsaa
                    </p>
                    <p className="text-gray-900 dark:text-gray-200 text-sm font-medium">
                      {student.school}
                    </p>
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

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Seenaa Isaanii
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                    {student.bio}
                  </p>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
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
        )}
      </section>
    </div>
  );
}
