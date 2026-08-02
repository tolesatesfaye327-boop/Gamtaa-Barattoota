import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";

export type PaymentMethodId =
  | "telebirr"
  | "mpesa"
  | "cbebirr"
  | "bank_transfer";

interface PaymentAccount {
  id: PaymentMethodId;
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

export interface PaymentFormValues {
  paymentMethod: PaymentMethodId;
  phoneNumber: string;
  transactionReference: string;
  payerName: string;
  notes: string;
  /** Required payment screenshot / slip file */
  receiptFile: File;
}

interface PaymentFormProps {
  amount: number;
  currency?: string;
  purposeLabel?: string;
  defaultPayerName?: string;
  submitting?: boolean;
  error?: string;
  onBack?: () => void;
  onSubmit: (values: PaymentFormValues) => void | Promise<void>;
  submitLabel?: string;
}

function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-colors"
    >
      {copied ? (
        <>
          <svg
            className="w-3.5 h-3.5 text-green-400"
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
          Copied
        </>
      ) : (
        <>
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}

const accentRing: Record<string, string> = {
  emerald: "border-emerald-500 bg-emerald-500/10",
  green: "border-green-500 bg-green-500/10",
  blue: "border-blue-500 bg-blue-500/10",
  purple: "border-purple-500 bg-purple-500/10",
};

const accentText: Record<string, string> = {
  emerald: "text-emerald-400",
  green: "text-green-400",
  blue: "text-blue-400",
  purple: "text-purple-400",
};

export default function PaymentForm({
  amount,
  currency = "ETB",
  purposeLabel = "Ticket payment",
  defaultPayerName = "",
  submitting = false,
  error = "",
  onBack,
  onSubmit,
  submitLabel,
}: PaymentFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [accounts, setAccounts] = useState<PaymentAccount[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethodId>("telebirr");
  const [notes, setNotes] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string>("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [localError, setLocalError] = useState("");

  // Fetch payment accounts from API
  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoadingAccounts(true);
        const response = await apiClient.get("/payment-settings");
        const fetchedAccounts = response.data.accounts || [];
        
        if (fetchedAccounts.length > 0) {
          setAccounts(fetchedAccounts);
          // Set first enabled account as default
          const firstEnabled = fetchedAccounts.find((acc: PaymentAccount) => acc.enabled);
          if (firstEnabled) {
            setPaymentMethod(firstEnabled.id);
          }
        } else {
          // Fallback to default accounts if none configured
          setAccounts([]);
          setLocalError("Payment accounts not configured. Please contact admin.");
        }
      } catch (err) {
        console.error("Error fetching payment accounts:", err);
        setLocalError("Failed to load payment methods. Please try again.");
      } finally {
        setLoadingAccounts(false);
      }
    };

    fetchAccounts();
  }, []);

  const account = accounts.find((acc) => acc.id === paymentMethod);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxBytes = 8 * 1024 * 1024;
    if (file.size > maxBytes) {
      setLocalError("Screenshot must be under 8MB");
      return;
    }

    const okType = /image\/(jpeg|jpg|png|webp|gif)|application\/pdf/i.test(
      file.type,
    );
    if (!okType) {
      setLocalError("Please upload an image (JPG, PNG, WEBP) or PDF");
      return;
    }

    setLocalError("");
    setReceiptFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setReceiptPreview(url);
    } else {
      setReceiptPreview("");
    }
  };

  const clearReceipt = () => {
    setReceiptFile(null);
    if (receiptPreview) URL.revokeObjectURL(receiptPreview);
    setReceiptPreview("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!account) {
      setLocalError("Please select a valid payment method");
      return;
    }

    if (!agreeTerms) {
      setLocalError("Please agree to the terms and conditions");
      return;
    }

    if (!receiptFile) {
      setLocalError(
        "Please upload a screenshot of your payment confirmation for the auditor",
      );
      return;
    }

    await onSubmit({
      paymentMethod,
      phoneNumber: "",
      transactionReference: "",
      payerName: defaultPayerName,
      notes: notes.trim(),
      receiptFile,
    });
  };

  const displayError = localError || error;

  // Show loading state while fetching accounts
  if (loadingAccounts) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading payment methods...</p>
        </div>
      </div>
    );
  }

  // Show error if no accounts available
  if (accounts.length === 0) {
    return (
      <div className="p-6 bg-red-900/30 border border-red-500/50 rounded-lg text-center">
        <svg
          className="w-12 h-12 text-red-400 mx-auto mb-3"
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
        <p className="text-red-400 font-medium mb-2">Payment Methods Not Available</p>
        <p className="text-gray-400 text-sm">
          Payment accounts have not been configured yet. Please contact the administrator.
        </p>
        {onBack && (
          <button
            onClick={onBack}
            className="mt-4 px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
          >
            Go Back
          </button>
        )}
      </div>
    );
  }

  if (!account) {
    return (
      <div className="p-6 bg-red-900/30 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400">Selected payment method not available</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Amount banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-gray-400">{purposeLabel}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Pay exactly this amount, then upload your screenshot for the
              auditor
            </p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-white">
              {amount.toLocaleString()}
            </span>
            <span className="ml-1 text-lg font-semibold text-blue-300">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-100/90">
        <p className="font-semibold text-amber-300 mb-2">
          How ticket issue works
        </p>
        <ol className="list-decimal list-inside space-y-1 text-amber-100/80">
          <li>Send money to the association account below</li>
          <li>Upload a clear screenshot of the payment confirmation</li>
          <li>Auditor reviews and approves your payment</li>
          <li>System issues your ticket number automatically after approval</li>
        </ol>
      </div>

      {/* Method selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Payment Method
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {accounts.map((method) => {
            const selected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => {
                  setPaymentMethod(method.id);
                  setLocalError("");
                }}
                className={`p-3 sm:p-4 rounded-xl border-2 transition-all text-center ${
                  selected
                    ? accentRing[method.accent] ||
                      "border-blue-500 bg-blue-500/10"
                    : "border-gray-600 hover:border-gray-500 bg-gray-800/40"
                }`}
              >
                <svg
                  className={`w-7 h-7 mx-auto mb-2 ${
                    selected
                      ? accentText[method.accent] || "text-blue-400"
                      : "text-gray-500"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={method.iconPath}
                  />
                </svg>
                <div
                  className={`text-sm font-semibold ${
                    selected
                      ? accentText[method.accent] || "text-blue-400"
                      : "text-gray-400"
                  }`}
                >
                  {method.shortLabel}
                </div>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-500">{account.description}</p>
      </div>

      {/* Association account box */}
      <div className="rounded-xl border border-amber-500/40 bg-amber-500/5 overflow-hidden">
        <div className="px-4 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-center gap-2">
          <svg
            className="w-5 h-5 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h4 className="font-semibold text-amber-300">
            Association Account — {account.label}
          </h4>
        </div>

        <div className="p-4 space-y-3">
          {account.bankName && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-gray-400">Bank</span>
              <span className="text-white font-medium">{account.bankName}</span>
            </div>
          )}
          {account.branch && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-gray-400">Branch</span>
              <span className="text-white font-medium">{account.branch}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
            <span className="text-gray-400">Account Name</span>
            <span className="text-white font-medium text-right">
              {account.accountName}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-700/80">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {account.id === "bank_transfer"
                    ? "Account Number"
                    : `${account.label} Number`}
                </p>
                <p className="text-xl sm:text-2xl font-mono font-bold tracking-wide text-white">
                  {account.accountNumber}
                </p>
              </div>
              <CopyButton text={account.accountNumber} label="Copy number" />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gray-900/40 border border-gray-700/50">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Amount to send</p>
                <p className="text-lg font-bold text-blue-300">
                  {amount.toLocaleString()} {currency}
                </p>
              </div>
              <CopyButton text={String(amount)} label="Copy amount" />
            </div>
          </div>

          <ol className="mt-2 space-y-1.5 text-sm text-gray-300 list-decimal list-inside">
            {account.instructions.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>
      </div>

      {/* Screenshot upload — required for auditor */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Payment screenshot for auditor <span className="text-red-400">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-3">
          Upload a clear photo of your TeleBirr / M-Pesa / bank SMS or app
          confirmation. The auditor will use this to approve your ticket.
        </p>

        {!receiptFile ? (
          <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-gray-600 hover:border-blue-500/60 rounded-xl cursor-pointer bg-gray-800/40 hover:bg-gray-800/70 transition-colors p-6">
            <svg
              className="w-10 h-10 text-gray-500 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium text-blue-400">
              Tap to upload screenshot
            </span>
            <span className="text-xs text-gray-500 mt-1">
              JPG, PNG, WEBP or PDF · max 8MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="rounded-xl border border-gray-600 bg-gray-800/50 overflow-hidden">
            {receiptPreview ? (
              <img
                src={receiptPreview}
                alt="Payment screenshot preview"
                className="w-full max-h-64 object-contain bg-black/40"
              />
            ) : (
              <div className="p-6 flex items-center gap-3 text-gray-300">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <div>
                  <p className="font-medium text-white">{receiptFile.name}</p>
                  <p className="text-xs text-gray-500">PDF receipt attached</p>
                </div>
              </div>
            )}
            <div className="p-3 flex items-center justify-between gap-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 truncate">
                {receiptFile.name} · {(receiptFile.size / 1024).toFixed(0)} KB
              </p>
              <button
                type="button"
                onClick={clearReceipt}
                className="text-sm text-red-400 hover:text-red-300 font-medium shrink-0"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payer details */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-white">
          Upload your payment proof
        </h4>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Notes for auditor (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any extra detail for the auditor..."
            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 resize-none"
          />
        </div>
      </div>

      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          id="payment-terms"
          checked={agreeTerms}
          onChange={(e) => setAgreeTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
        />
        <label htmlFor="payment-terms" className="text-sm text-gray-400">
          I confirm I transferred{" "}
          <strong className="text-white">
            {amount.toLocaleString()} {currency}
          </strong>{" "}
          to the association account and the screenshot is genuine. I understand
          my{" "}
          <strong className="text-white">
            ticket number is issued only after
          </strong>{" "}
          the auditor approves. I agree to the{" "}
          <Link
            to="/terms-of-service"
            className="text-blue-400 hover:underline"
          >
            terms and conditions
          </Link>
          .
        </label>
      </div>

      {displayError && (
        <div className="p-4 bg-red-900/30 border border-red-500/50 rounded-lg flex items-start gap-3">
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
          <p className="text-red-400 text-sm">{displayError}</p>
        </div>
      )}

      <div className="flex gap-4 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={submitting || !agreeTerms}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
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
              Sending to auditor...
            </span>
          ) : (
            submitLabel || "Submit payment proof to auditor"
          )}
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        🔒 Ticket number is generated only after the association auditor
        approves your screenshot. Track status under My Payments.
      </p>
    </form>
  );
}
