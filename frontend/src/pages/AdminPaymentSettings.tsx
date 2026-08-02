import { useState, useEffect } from "react";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

interface PaymentAccount {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  branch?: string;
  payerNameInstruction?: string;
  instructions: string[];
  requiresPhone: boolean;
  enabled: boolean;
  accent: string;
  iconPath: string;
}

interface PaymentSettings {
  _id: string;
  accounts: PaymentAccount[];
  lastUpdatedBy?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  updatedAt: string;
}

const ICON_PATHS: Record<string, string> = {
  telebirr: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z",
  mpesa: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  cbebirr: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z",
  bank_transfer: "M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z",
};

export default function AdminPaymentSettings() {
  const { user } = useAuthStore();
  const [settings, setSettings] = useState<PaymentSettings | null>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/payment-settings/admin");
      setSettings(response.data.settings);
      setAccounts(response.data.settings.accounts);
    } catch (err: any) {
      console.error("Error fetching payment settings:", err);
      setError(err.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (
    index: number,
    field: keyof PaymentAccount,
    value: any
  ) => {
    const updated = [...accounts];
    updated[index] = { ...updated[index], [field]: value };
    setAccounts(updated);
    setError("");
    setSuccess("");
  };

  const handleInstructionChange = (
    accountIndex: number,
    instructionIndex: number,
    value: string
  ) => {
    const updated = [...accounts];
    updated[accountIndex].instructions[instructionIndex] = value;
    setAccounts(updated);
    setError("");
    setSuccess("");
  };

  const addInstruction = (accountIndex: number) => {
    const updated = [...accounts];
    updated[accountIndex].instructions.push("");
    setAccounts(updated);
  };

  const removeInstruction = (accountIndex: number, instructionIndex: number) => {
    const updated = [...accounts];
    updated[accountIndex].instructions.splice(instructionIndex, 1);
    setAccounts(updated);
  };

  const handleSave = async () => {
    try {
      // Validate
      for (const account of accounts) {
        if (!account.accountName.trim()) {
          setError(`Account name is required for ${account.label}`);
          return;
        }
        if (!account.accountNumber.trim()) {
          setError(`Account number is required for ${account.label}`);
          return;
        }
        if (account.instructions.filter((i) => i.trim()).length === 0) {
          setError(`At least one instruction is required for ${account.label}`);
          return;
        }
      }

      setSaving(true);
      setError("");
      const response = await apiClient.put("/payment-settings/admin", {
        accounts,
      });

      setSettings(response.data.settings);
      setSuccess("Payment settings saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error saving payment settings:", err);
      setError(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (
      !confirm(
        "Are you sure you want to reset to default payment settings? This will overwrite all current settings."
      )
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      const response = await apiClient.post("/payment-settings/admin/reset");
      setSettings(response.data.settings);
      setAccounts(response.data.settings.accounts);
      setSuccess("Payment settings reset to defaults!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.error("Error resetting payment settings:", err);
      setError(err.response?.data?.message || "Failed to reset settings");
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading payment settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Payment Account Settings
              </h1>
              <p className="text-gray-400">
                Configure association payment accounts for TeleBirr, M-Pesa, CBE
                Birr, and Bank Transfer
              </p>
            </div>
            {user?.role === "superadmin" && (
              <button
                onClick={handleReset}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                Reset to Defaults
              </button>
            )}
          </div>

          {settings?.lastUpdatedBy && (
            <div className="text-sm text-gray-500">
              Last updated by {settings.lastUpdatedBy.firstName}{" "}
              {settings.lastUpdatedBy.lastName} on{" "}
              {new Date(settings.updatedAt).toLocaleString()}
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-900/30 border border-green-500/50 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-3">
            <svg
              className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="mb-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            How this works
          </h4>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>
              • Configure your association's payment accounts below (TeleBirr,
              M-Pesa, CBE Birr, Bank)
            </li>
            <li>
              • Users will see these account details when buying tickets or making
              payments
            </li>
            <li>
              • Users will copy your account numbers and send money manually
            </li>
            <li>
              • Users upload payment screenshot for admin approval
            </li>
            <li>
              • Toggle "Enabled" to show/hide each payment method from users
            </li>
          </ul>
        </div>

        {/* Payment Accounts */}
        <div className="space-y-6">
          {accounts.map((account, accountIndex) => (
            <div
              key={account.id}
              className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-gray-800/80 border-b border-gray-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={account.iconPath}
                    />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {account.label}
                    </h3>
                    <p className="text-xs text-gray-500">{account.description}</p>
                  </div>
                </div>

                {/* Enable/Disable Toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-sm text-gray-400">
                    {account.enabled ? "Enabled" : "Disabled"}
                  </span>
                  <input
                    type="checkbox"
                    checked={account.enabled}
                    onChange={(e) =>
                      handleAccountChange(accountIndex, "enabled", e.target.checked)
                    }
                    className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
                  />
                </label>
              </div>

              {/* Form */}
              <div className="p-6 space-y-4">
                {/* Account Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Holder Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={account.accountName}
                    onChange={(e) =>
                      handleAccountChange(accountIndex, "accountName", e.target.value)
                    }
                    placeholder="e.g., Gamtaa Barattoota Ada'aa Bargaa"
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {account.id === "bank_transfer"
                      ? "Bank Account Number"
                      : `${account.label} Phone Number`}{" "}
                    <span className="text-red-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={account.accountNumber}
                      onChange={(e) =>
                        handleAccountChange(
                          accountIndex,
                          "accountNumber",
                          e.target.value
                        )
                      }
                      placeholder={
                        account.id === "bank_transfer"
                          ? "e.g., 1000123456789"
                          : "e.g., 0912345678"
                      }
                      className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => handleCopy(account.accountNumber)}
                      className="px-4 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
                      title="Copy account number"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                {/* Bank-specific fields */}
                {account.id === "bank_transfer" && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Bank Name
                        </label>
                        <input
                          type="text"
                          value={account.bankName || ""}
                          onChange={(e) =>
                            handleAccountChange(
                              accountIndex,
                              "bankName",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Commercial Bank of Ethiopia"
                          className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Branch Name
                        </label>
                        <input
                          type="text"
                          value={account.branch || ""}
                          onChange={(e) =>
                            handleAccountChange(accountIndex, "branch", e.target.value)
                          }
                          placeholder="e.g., Haramaya Branch"
                          className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Payer Name Instruction */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name to Use When Paying (Optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    If users should enter a specific name when making the transfer, specify it here. Otherwise, they'll use their own name.
                  </p>
                  <input
                    type="text"
                    value={account.payerNameInstruction || ""}
                    onChange={(e) =>
                      handleAccountChange(
                        accountIndex,
                        "payerNameInstruction",
                        e.target.value
                      )
                    }
                    placeholder="e.g., 'GBAABW Event Tickets' or leave empty for user's own name"
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                {/* Instructions */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Instructions <span className="text-red-400">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Step-by-step guide shown to users when paying
                  </p>
                  <div className="space-y-2">
                    {account.instructions.map((instruction, instructionIndex) => (
                      <div key={instructionIndex} className="flex gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-700 text-gray-400 text-xs flex items-center justify-center mt-2">
                          {instructionIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) =>
                            handleInstructionChange(
                              accountIndex,
                              instructionIndex,
                              e.target.value
                            )
                          }
                          placeholder={`Step ${instructionIndex + 1}`}
                          className="flex-1 px-4 py-2.5 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        {account.instructions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeInstruction(accountIndex, instructionIndex)
                            }
                            className="px-3 py-2.5 bg-red-900/30 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors"
                            title="Remove instruction"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addInstruction(accountIndex)}
                      className="w-full py-2 border-2 border-dashed border-gray-600 hover:border-gray-500 rounded-lg text-gray-400 hover:text-gray-300 text-sm transition-colors"
                    >
                      + Add Step
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "💾 Save Payment Settings"
            )}
          </button>
        </div>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Users will see these account details when purchasing tickets. Make sure
          all information is accurate.
        </p>
      </div>
    </div>
  );
}
