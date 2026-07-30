import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import apiClient from "../services/api";

interface PaymentItem {
  _id: string;
  amount: number;
  currency: string;
  status: string;
  paymentChannel: string;
  transactionId: string;
  receiptUrl: string;
  reviewNotes?: string;
  relatedType: string;
  createdAt: string;
  reviewedAt?: string;
  relatedEvent?: { _id?: string; title?: string; date?: string };
  relatedTicketProduct?: { _id?: string; title?: string };
  issuedTicket?: { _id?: string; ticketNumber?: string };
}

const statusStyles: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-300 border-amber-500/40",
  completed: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  rejected: "bg-red-500/15 text-red-300 border-red-500/40",
  failed: "bg-red-500/15 text-red-300 border-red-500/40",
  refunded: "bg-gray-500/15 text-gray-300 border-gray-500/40",
};

export default function MyPayments() {
  const location = useLocation();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState("");

  useEffect(() => {
    if (location.state?.submitted || location.state?.message) {
      setBanner(
        location.state.message ||
          "Payment screenshot submitted. Waiting for auditor approval.",
      );
      window.history.replaceState({}, document.title);
    }
    load();
  }, [location]);

  const load = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get("/payments/my");
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const titleOf = (p: PaymentItem) => {
    if (p.relatedEvent?.title) return p.relatedEvent.title;
    if (p.relatedTicketProduct?.title) return p.relatedTicketProduct.title;
    return "Payment";
  };

  const ticketLink = (p: PaymentItem) => {
    if (!p.issuedTicket?._id) return "/my-tickets";
    if (p.relatedType === "event_ticket") {
      return `/my-tickets/${p.issuedTicket._id}`;
    }
    return "/my-tickets";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Payments</h1>
          <p className="text-gray-400">
            Track payment screenshots sent to the auditor. Your ticket number
            appears here after approval.
          </p>
        </div>

        {banner && (
          <div className="mb-6 p-4 rounded-xl bg-blue-900/30 border border-blue-500/40 text-blue-200 text-sm">
            {banner}
          </div>
        )}

        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm text-amber-100/90">
          <p className="font-semibold text-amber-300 mb-1">Status guide</p>
          <ul className="space-y-1 text-amber-100/80">
            <li>
              <strong>Pending</strong> — auditor is reviewing your screenshot
            </li>
            <li>
              <strong>Completed</strong> — approved; ticket number issued
            </li>
            <li>
              <strong>Rejected</strong> — submit a new payment with a clearer
              screenshot
            </li>
          </ul>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 bg-gray-800/40 rounded-xl border border-gray-700">
            <p className="text-gray-400 mb-4">No payments yet</p>
            <Link
              to="/events-tickets"
              className="text-blue-400 hover:underline"
            >
              Browse ticketed events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((p) => (
              <div
                key={p._id}
                className="p-5 rounded-xl bg-gray-800/50 border border-gray-700/60"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-semibold text-white">{titleOf(p)}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(p.createdAt).toLocaleString()} ·{" "}
                      {(p.paymentChannel || "").toUpperCase()}
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full border capitalize ${statusStyles[p.status] || statusStyles.pending}`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="text-blue-300 font-bold text-lg">
                      {p.amount.toLocaleString()} {p.currency || "ETB"}
                    </p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">
                      Ref: {p.transactionId}
                    </p>
                  </div>
                  {p.receiptUrl && (
                    <a
                      href={p.receiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-400 hover:underline"
                    >
                      View screenshot
                    </a>
                  )}
                </div>

                {p.status === "pending" && (
                  <p className="mt-3 text-sm text-amber-300/90">
                    Waiting for auditor approval. You will get a notification
                    when your ticket number is ready.
                  </p>
                )}

                {p.status === "completed" && p.issuedTicket?.ticketNumber && (
                  <div className="mt-3 p-3 rounded-lg bg-emerald-900/25 border border-emerald-500/30">
                    <p className="text-emerald-300 text-sm mb-1">
                      Ticket issued
                    </p>
                    <p className="text-white font-mono text-lg font-bold">
                      {p.issuedTicket.ticketNumber}
                    </p>
                    <Link
                      to={ticketLink(p)}
                      className="inline-block mt-2 text-sm text-blue-400 hover:underline"
                    >
                      Open my ticket →
                    </Link>
                  </div>
                )}

                {p.status === "rejected" && (
                  <div className="mt-3 p-3 rounded-lg bg-red-900/25 border border-red-500/30 text-sm text-red-200">
                    <p className="font-medium mb-1">Payment rejected</p>
                    <p className="text-red-300/90">
                      {p.reviewNotes ||
                        "Please submit again with a clear screenshot."}
                    </p>
                    <Link
                      to="/events-tickets"
                      className="inline-block mt-2 text-blue-400 hover:underline"
                    >
                      Try again →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-4 justify-center text-sm">
          <Link to="/my-tickets" className="text-blue-400 hover:underline">
            My Tickets
          </Link>
          <Link to="/events-tickets" className="text-blue-400 hover:underline">
            Buy event ticket
          </Link>
          <Link to="/tickets" className="text-blue-400 hover:underline">
            Other tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
