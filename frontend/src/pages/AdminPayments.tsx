import { useEffect, useState } from "react";
import apiClient from "../services/api";

interface PaymentRow {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  paymentChannel: string;
  paymentMethod: string;
  associationAccount: string;
  payerName: string;
  phoneNumber: string;
  transactionId: string;
  receiptUrl: string;
  notes: string;
  reviewNotes?: string;
  relatedType: string;
  quantity: number;
  createdAt: string;
  reviewedAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  member?: { fullName?: string; email?: string; phone?: string };
  relatedEvent?: { title?: string; date?: string; ticketPrice?: number };
  relatedTicketProduct?: { title?: string; price?: number; category?: string };
  reviewedBy?: { firstName?: string; lastName?: string };
  issuedTicket?: { ticketNumber?: string; _id?: string };
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  rejected: "bg-red-500/15 text-red-300 border-red-500/40",
  failed: "bg-red-500/15 text-red-300 border-red-500/40",
  refunded: "bg-gray-500/15 text-gray-300 border-gray-500/40",
};

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "pending" | "all" | "completed" | "rejected"
  >("pending");
  const [selected, setSelected] = useState<PaymentRow | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [acting, setActing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [stats, setStats] = useState<{
    pendingCount?: number;
    pendingTotal?: number;
  }>({});

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [listRes, statsRes] = await Promise.all([
        filter === "pending"
          ? apiClient.get("/payments/pending")
          : apiClient.get("/payments", {
              params: filter === "all" ? {} : { status: filter },
            }),
        apiClient.get("/payments/stats").catch(() => ({ data: {} })),
      ]);
      setPayments(Array.isArray(listRes.data) ? listRes.data : []);
      setStats(statsRes.data || {});
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [filter]);

  const openReview = (p: PaymentRow) => {
    setSelected(p);
    setReviewNotes("");
    setSuccess("");
    setError("");
  };

  const handleApprove = async () => {
    if (!selected) return;
    setActing(true);
    setError("");
    try {
      const res = await apiClient.post(`/payments/${selected._id}/approve`, {
        reviewNotes,
      });
      setSuccess(
        res.data.ticketNumber
          ? `Approved. Ticket issued: ${res.data.ticketNumber}`
          : res.data.message || "Payment approved",
      );
      setSelected(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    if (!reviewNotes.trim()) {
      setError("Please enter a rejection reason for the user");
      return;
    }
    setActing(true);
    setError("");
    try {
      await apiClient.post(`/payments/${selected._id}/reject`, {
        reviewNotes,
      });
      setSuccess("Payment rejected. User was notified.");
      setSelected(null);
      await load();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject");
    } finally {
      setActing(false);
    }
  };

  const purposeLabel = (p: PaymentRow) => {
    if (p.relatedType === "event_ticket")
      return p.relatedEvent?.title || "Event ticket";
    if (p.relatedType === "ticket_product")
      return p.relatedTicketProduct?.title || "Ticket product";
    return p.notes || "Payment";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Auditor — Payment Approvals
          </h1>
          <p className="text-gray-400">
            Review payment screenshots. Approving issues the user's ticket
            number automatically.
          </p>
          {typeof stats.pendingCount === "number" && (
            <p className="mt-2 text-sm text-amber-300">
              {stats.pendingCount} pending ·{" "}
              {(stats.pendingTotal || 0).toLocaleString()} ETB awaiting review
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {(
            [
              ["pending", "Pending"],
              ["completed", "Approved"],
              ["rejected", "Rejected"],
              ["all", "All"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-emerald-900/30 border border-emerald-500/40 text-emerald-300 text-sm">
            {success}
          </div>
        )}
        {error && !selected && (
          <div className="mb-4 p-4 rounded-lg bg-red-900/30 border border-red-500/40 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/40 rounded-xl border border-gray-700">
            <p className="text-gray-400">No payments in this filter</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => openReview(p)}
                className="w-full text-left p-4 sm:p-5 rounded-xl bg-gray-800/50 border border-gray-700/60 hover:border-blue-500/40 transition-colors"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="font-semibold text-white">
                        {p.payerName ||
                          p.user?.firstName ||
                          p.member?.fullName ||
                          "Payer"}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full border ${statusStyles[p.status] || statusStyles.pending}`}
                      >
                        {p.status}
                      </span>
                      <span className="text-xs text-gray-500 uppercase">
                        {p.paymentChannel || p.paymentMethod}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{purposeLabel(p)}</p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      Ref: {p.transactionId}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-blue-300">
                      {p.amount.toLocaleString()} {p.currency || "ETB"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                    {p.issuedTicket?.ticketNumber && (
                      <p className="text-xs text-emerald-400 mt-1 font-mono">
                        Ticket: {p.issuedTicket.ticketNumber}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-2xl bg-gray-900 border border-gray-700 shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-700 bg-gray-900/95">
              <h2 className="text-lg font-bold text-white">Review payment</h2>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="text-gray-400 hover:text-white text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-5">
              {selected.receiptUrl ? (
                <div className="rounded-xl overflow-hidden border border-gray-700 bg-black/40">
                  {/\.pdf($|\?)/i.test(selected.receiptUrl) ? (
                    <a
                      href={selected.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block p-8 text-center text-blue-400 hover:underline"
                    >
                      Open PDF receipt
                    </a>
                  ) : (
                    <a
                      href={selected.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <img
                        src={selected.receiptUrl}
                        alt="Payment screenshot"
                        className="w-full max-h-[420px] object-contain"
                      />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-red-400 text-sm">No screenshot uploaded</p>
              )}

              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <Info
                  label="Amount"
                  value={`${selected.amount} ${selected.currency || "ETB"}`}
                />
                <Info
                  label="Channel"
                  value={selected.paymentChannel || selected.paymentMethod}
                />
                <Info label="Payer name" value={selected.payerName} />
                <Info label="Phone" value={selected.phoneNumber || "—"} />
                <Info
                  label="Transaction ref"
                  value={selected.transactionId}
                  mono
                />
                <Info
                  label="Association account"
                  value={selected.associationAccount || "—"}
                  mono
                />
                <Info label="Purpose" value={purposeLabel(selected)} />
                <Info
                  label="User email"
                  value={selected.user?.email || selected.member?.email || "—"}
                />
                <Info label="Status" value={selected.status} />
                <Info
                  label="Submitted"
                  value={new Date(selected.createdAt).toLocaleString()}
                />
              </div>

              {selected.notes && (
                <div className="text-sm">
                  <p className="text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-300 bg-gray-800/60 rounded-lg p-3">
                    {selected.notes}
                  </p>
                </div>
              )}

              {selected.status === "pending" && (
                <>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Auditor notes (required for reject)
                    </label>
                    <textarea
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      rows={3}
                      placeholder="Optional note on approve · required reason on reject"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>

                  {error && <p className="text-sm text-red-400">{error}</p>}

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={acting}
                      onClick={handleReject}
                      className="flex-1 py-3 rounded-lg bg-red-600/90 hover:bg-red-600 text-white font-semibold disabled:opacity-50"
                    >
                      {acting ? "Working..." : "Reject"}
                    </button>
                    <button
                      type="button"
                      disabled={acting}
                      onClick={handleApprove}
                      className="flex-1 py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold disabled:opacity-50"
                    >
                      {acting ? "Issuing ticket..." : "Approve & issue ticket"}
                    </button>
                  </div>
                </>
              )}

              {selected.status !== "pending" &&
                selected.issuedTicket?.ticketNumber && (
                  <div className="p-4 rounded-lg bg-emerald-900/20 border border-emerald-500/30 text-emerald-300">
                    Ticket issued:{" "}
                    <span className="font-mono font-bold">
                      {selected.issuedTicket.ticketNumber}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className={`text-white break-all ${mono ? "font-mono text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}
