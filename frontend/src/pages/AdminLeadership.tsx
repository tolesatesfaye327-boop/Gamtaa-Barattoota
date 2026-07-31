import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import apiClient from "../services/api";

interface Member {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  membershipNumber: string;
  membershipStatus: "active" | "inactive" | "suspended";
  department: string;
  designation: string;
  bio: string;
  profileImage: string;
  isPublic: boolean;
  tenureYear?: number;
  tenureStartYear?: number;
  tenureEndYear?: number;
  isCurrent: boolean;
}

const LEADERSHIP_DESIGNATIONS = [
  "president",
  "vice_president",
  "secretary",
  "treasurer",
  "moderator",
  "director",
  "lead",
];

export default function AdminLeadership() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
    bio: "",
    profileImage: "",
    isPublic: true,
    tenureStartYear: new Date().getFullYear(),
    tenureEndYear: undefined as number | undefined,
    isCurrent: true,
  });

  useEffect(() => {
    if (user?.role !== "superadmin" && user?.role !== "admin") {
      navigate("/");
      return;
    }
    fetchMembers();
  }, [user, navigate]);

  const fetchMembers = async () => {
    try {
      // Fetch all members including non-public ones (admin endpoint)
      const response = await apiClient.get("/members/all");
      const allMembers: Member[] = response.data;
      
      // Filter for leadership roles
      const leaders = allMembers.filter((m) => {
        const role = (m.designation || "").toLowerCase().trim();
        const isLeader = LEADERSHIP_DESIGNATIONS.some((designation) =>
          role.includes(designation.toLowerCase())
        );
        return isLeader;
      });
      
      setMembers(leaders);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to fetch members";
      setError(msg);
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingMember) {
        await apiClient.patch(`/members/${editingMember._id}`, formData);
      } else {
        await apiClient.post("/members", formData);
      }
      setShowModal(false);
      resetForm();
      fetchMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Operation failed";
      setError(msg);
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      department: member.department || "",
      designation: member.designation || "",
      bio: member.bio || "",
      profileImage: member.profileImage || "",
      isPublic: member.isPublic,
      tenureStartYear: member.tenureStartYear || new Date().getFullYear(),
      tenureEndYear: member.tenureEndYear,
      isCurrent: member.isCurrent || false,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this member?")) return;

    try {
      await apiClient.delete(`/members/${id}`);
      fetchMembers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete";
      setError(msg);
    }
  };

  const resetForm = () => {
    setEditingMember(null);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      department: "",
      designation: "",
      bio: "",
      profileImage: "",
      isPublic: true,
      tenureStartYear: new Date().getFullYear(),
      tenureEndYear: undefined,
      isCurrent: true,
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Leadership Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage leadership team members and their information
            </p>
          </div>
          <button
            onClick={handleOpenModal}
            className="btn-primary flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
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
            Add Leader
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-blue-800 dark:text-blue-300">
              <p className="font-semibold mb-1">How to add leadership members:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Click "Add Leader" button above</li>
                <li>Fill in all required fields (marked with *)</li>
                <li>Use leadership designations like: <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">President</span>, <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Vice President</span>, <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Secretary</span>, <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Treasurer</span>, <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Director</span>, or titles ending in <span className="font-mono bg-blue-100 dark:bg-blue-900/40 px-1 rounded">Lead</span></li>
                <li>Set the tenure period (e.g., 2015-2018 for historical, or current year for active)</li>
                <li>Check "Current leadership" for active leaders</li>
                <li>Make sure "Make profile public" is checked</li>
                <li>On the public leadership page, leaders will be grouped by year in collapsible sections</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Designation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tenure Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {members.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-gray-500 dark:text-gray-400"
                    >
                      No leadership members found. Add your first leader.
                    </td>
                  </tr>
                ) : (
                  members.map((member) => (
                    <tr
                      key={member._id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {member.profileImage ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={member.profileImage}
                                alt={member.fullName}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-semibold">
                                {member.fullName
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.fullName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {member.designation}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {member.tenureStartYear && (
                            <>
                              {member.tenureStartYear}
                              {member.tenureEndYear
                                ? ` - ${member.tenureEndYear}`
                                : " - Present"}
                            </>
                          )}
                          {!member.tenureStartYear && "—"}
                        </div>
                        {member.isCurrent && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                            Current
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {member.department || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            member.isPublic
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {member.isPublic ? "Public" : "Private"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-primary hover:text-primary-700 dark:text-primary-400 mr-4"
                        >
                          Edit
                        </button>
                        {user?.role === "superadmin" && (
                          <button
                            onClick={() => handleDelete(member._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {editingMember ? "Edit Leader" : "Add Leader"}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Designation *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., President, Vice President"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Executive, Finance"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Profile Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.profileImage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        profileImage: e.target.value,
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Tenure Period
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Start Year *
                      </label>
                      <input
                        type="number"
                        required
                        min="2000"
                        max="2100"
                        placeholder="e.g., 2015"
                        value={formData.tenureStartYear}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tenureStartYear: parseInt(e.target.value) || new Date().getFullYear(),
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        End Year
                      </label>
                      <input
                        type="number"
                        min="2000"
                        max="2100"
                        placeholder="Leave empty for current"
                        value={formData.tenureEndYear || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tenureEndYear: e.target.value ? parseInt(e.target.value) : undefined,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Leave empty if currently in position
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center">
                    <input
                      type="checkbox"
                      id="isCurrent"
                      checked={formData.isCurrent}
                      onChange={(e) =>
                        setFormData({ ...formData, isCurrent: e.target.checked })
                      }
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label
                      htmlFor="isCurrent"
                      className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                      Current leadership (shown prominently)
                    </label>
                  </div>
                </div>

                <div className="flex items-center pt-4">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={formData.isPublic}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublic: e.target.checked })
                    }
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isPublic"
                    className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                  >
                    Make profile public
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    {editingMember ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
