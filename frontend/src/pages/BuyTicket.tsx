import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";
import PaymentForm, { PaymentFormValues } from "../components/PaymentForm";
import { submitTicketPayment } from "../utils/submitPayment";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  image: string;
  category: string;
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
  ticketingEnabled: boolean;
  hasTicketing?: boolean;
}

export default function BuyTicket() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: Review, 2: Payment

  useEffect(() => {
    if (!user) {
      navigate("/login", { state: { from: `/events/${eventId}/buy-ticket` } });
      return;
    }
    fetchEvent();
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/${eventId}`);
      const eventData = response.data;

      if (!eventData.hasTicketing || !eventData.ticketingEnabled) {
        setError("Ticketing is not enabled for this event");
        return;
      }

      setEvent(eventData);
    } catch (err: any) {
      console.error("Error fetching event:", err);
      setError(err.response?.data?.message || "Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToPayment = () => {
    if (!event) return;

    const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
    if (ticketsRemaining <= 0) {
      setError("Sorry, tickets are sold out");
      return;
    }

    setError("");
    setStep(2);
  };

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    if (!event) return;

    setError("");
    setPurchasing(true);

    try {
      const eventCheck = await apiClient.get(`/events/${eventId}`);
      const currentEvent = eventCheck.data;
      const ticketsRemaining =
        currentEvent.ticketsAvailable - currentEvent.ticketsSold;

      if (ticketsRemaining <= 0) {
        setError("Sorry, tickets just sold out. Please try another event.");
        setPurchasing(false);
        return;
      }

      // Submit screenshot + details → PENDING until auditor approves
      // Ticket number is issued only after approval
      const data = await submitTicketPayment({
        values,
        amount: event.ticketPrice,
        currency: "ETB",
        purpose: "ticket",
        description: `Ticket for ${event.title}`,
        relatedType: "event_ticket",
        relatedEvent: event._id,
        quantity: 1,
        metadata: {
          eventId: event._id,
          eventTitle: event.title,
          buyerName: `${user?.firstName} ${user?.lastName}`,
          buyerEmail: user?.email,
        },
      });

      navigate("/my-payments", {
        state: {
          submitted: true,
          message:
            data.message ||
            "Payment screenshot sent to the auditor. Your ticket number will appear after approval.",
          paymentId: data.payment?._id,
        },
      });
    } catch (err: any) {
      console.error("Error submitting payment:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to submit payment. Please try again.";
      setError(errorMessage);

      if (
        errorMessage.toLowerCase().includes("pending") ||
        errorMessage.toLowerCase().includes("already")
      ) {
        setTimeout(() => navigate("/my-payments"), 2000);
      }
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg
            className="w-20 h-20 text-red-500 mx-auto mb-4"
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
          <h2 className="text-2xl font-bold text-white mb-2">
            Unable to Load Event
          </h2>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/events-tickets"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Browse Events
          </Link>
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
  const isSoldOut = ticketsRemaining <= 0;
  const isAlmostSoldOut = ticketsRemaining > 0 && ticketsRemaining <= 10;
  const defaultPayerName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${step >= 1 ? "text-blue-400" : "text-gray-600"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
              >
                1
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Review Event
              </span>
            </div>
            <div
              className={`h-0.5 w-16 ${step >= 2 ? "bg-blue-600" : "bg-gray-700"}`}
            />
            <div
              className={`flex items-center gap-2 ${step >= 2 ? "text-blue-400" : "text-gray-600"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 2 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
              >
                2
              </div>
              <span className="text-sm font-medium hidden sm:inline">
                Payment
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Event Summary - Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden sticky top-8">
              <div className="relative h-48 bg-gray-700">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-600/20 to-purple-600/20">
                    <svg
                      className="w-16 h-16 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
                {isSoldOut && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="px-6 py-3 bg-red-500 text-white text-lg font-bold rounded-lg">
                      SOLD OUT
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {event.title}
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3 text-gray-400">
                    <svg
                      className="w-5 h-5 mt-0.5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <div className="text-white font-medium">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-sm">
                        {new Date(event.date).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-400">
                    <svg
                      className="w-5 h-5 mt-0.5 text-green-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-white">{event.location}</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">
                      Tickets Available
                    </span>
                    <span
                      className={`text-lg font-bold ${isAlmostSoldOut ? "text-orange-400" : "text-green-400"}`}
                    >
                      {ticketsRemaining} / {event.ticketsAvailable}
                    </span>
                  </div>
                  {isAlmostSoldOut && (
                    <div className="text-xs text-orange-400 font-medium animate-pulse">
                      ⚠ Only {ticketsRemaining} tickets left!
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Ticket Price</span>
                    <span className="text-2xl font-bold text-white">
                      {event.ticketPrice} ETB
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Service Fee</span>
                    <span className="text-green-400">FREE</span>
                  </div>
                  <div className="border-t border-gray-600/50 mt-3 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold">Total</span>
                      <span className="text-3xl font-bold text-blue-400">
                        {event.ticketPrice} ETB
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {step === 1 ? (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-white">
                    Review Event Details
                  </h1>
                  <Link
                    to={`/events/${event._id}`}
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    <svg
                      className="w-4 h-4"
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
                    Full Details
                  </Link>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    About This Event
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {event.description}
                  </p>
                </div>

                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Buyer Information
                  </h3>
                  <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {user?.firstName} {user?.lastName}
                        </div>
                        <div className="text-sm text-gray-400">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                    Payment & ticket info
                  </h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>
                      • Pay via TeleBirr, M-Pesa, CBE Birr, or bank transfer to
                      the association account
                    </li>
                    <li>
                      • Upload a screenshot of your payment for the auditor
                    </li>
                    <li>
                      • Ticket number is issued only after auditor approval
                    </li>
                    <li>• Present your QR code at the event entrance</li>
                    <li>• Tickets are non-refundable</li>
                  </ul>
                </div>

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

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleContinueToPayment}
                    disabled={isSoldOut}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all font-semibold shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSoldOut ? "Sold Out" : "Continue to Payment"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 sm:p-8">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Pay to Association Account
                </h1>
                <p className="text-gray-400 text-sm mb-6">
                  Choose TeleBirr, M-Pesa, CBE Birr, or bank transfer. Send the
                  money to the auditor / association account shown, then submit
                  your transaction reference.
                </p>

                <PaymentForm
                  amount={event.ticketPrice}
                  currency="ETB"
                  purposeLabel={`Ticket — ${event.title}`}
                  defaultPayerName={defaultPayerName}
                  submitting={purchasing}
                  error={error}
                  onBack={() => {
                    setError("");
                    setStep(1);
                  }}
                  onSubmit={handlePaymentSubmit}
                  submitLabel="Submit screenshot to auditor"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
