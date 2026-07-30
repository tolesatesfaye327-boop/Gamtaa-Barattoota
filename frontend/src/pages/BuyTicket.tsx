import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import apiClient from "../services/api";
import { useAuthStore } from "../store/authStore";

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate: string;
  location: string;
  image: string;
  ticketPrice: number;
  ticketsAvailable: number;
  ticketsSold: number;
}

export default function BuyTicket() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"telebirr" | "cbebirr" | "bank">("telebirr");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error("Error fetching event:", error);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setError("");
    setPurchasing(true);

    try {
      // Step 1: Create payment
      const paymentResponse = await apiClient.post("/payments", {
        amount: event.ticketPrice,
        paymentMethod,
        phoneNumber: paymentMethod !== "bank" ? phoneNumber : undefined,
        purpose: "ticket",
        description: `Ticket for ${event.title}`,
        metadata: {
          eventId: event._id,
          eventTitle: event.title,
        },
      });

      const payment = paymentResponse.data.payment;

      // Step 2: Purchase ticket with payment
      const ticketResponse = await apiClient.post("/tickets/purchase", {
        eventId: event._id,
        paymentId: payment._id,
      });

      // Success! Redirect to ticket details
      const ticket = ticketResponse.data.ticket;
      navigate(`/my-tickets/${ticket._id}`, {
        state: { newPurchase: true },
      });
    } catch (error: any) {
      console.error("Error purchasing ticket:", error);
      setError(
        error.response?.data?.message ||
          "Failed to purchase ticket. Please try again."
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Event not found
          </h2>
          <button
            onClick={() => navigate("/events")}
            className="text-primary-600 hover:underline"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  const ticketsRemaining = event.ticketsAvailable - event.ticketsSold;
  const isSoldOut = ticketsRemaining <= 0;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 mb-6"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Event Details */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            {/* Event Image */}
            <div className="h-64 bg-gray-200 dark:bg-gray-700">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {event.title}
              </h1>

              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{new Date(event.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                </div>

                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Ticket Price</span>
                  <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                    ETB {event.ticketPrice}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Tickets Remaining</span>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {ticketsRemaining} / {event.ticketsAvailable}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Purchase Form */}
        <div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Purchase Ticket
            </h2>

            {isSoldOut ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Sold Out
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Sorry, all tickets for this event have been sold.
                </p>
                <button
                  onClick={() => navigate("/events")}
                  className="btn-primary"
                >
                  Browse Other Events
                </button>
              </div>
            ) : (
              <form onSubmit={handlePurchase} className="space-y-6">
                {/* Buyer Info */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Buyer Information
                  </label>
                  <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white font-medium">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "telebirr", label: "TeleBirr" },
                      { value: "cbebirr", label: "CBEBirr" },
                      { value: "bank", label: "Bank" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value as any)}
                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          paymentMethod === method.value
                            ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                            : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Phone Number (for mobile payments) */}
                {paymentMethod !== "bank" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="09xxxxxxxx"
                      required
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Order Summary */}
                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Order Summary
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Ticket Price</span>
                      <span className="text-gray-900 dark:text-white">ETB {event.ticketPrice}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Service Fee</span>
                      <span className="text-gray-900 dark:text-white">ETB 0</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="text-base font-bold text-gray-900 dark:text-white">Total</span>
                        <span className="text-xl font-bold text-primary-600 dark:text-primary-400">
                          ETB {event.ticketPrice}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={purchasing}
                  className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Complete Purchase"
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  By purchasing, you agree to our terms and conditions. Your ticket will be generated immediately after payment confirmation.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
