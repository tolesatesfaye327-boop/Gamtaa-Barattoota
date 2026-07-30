import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/api";
import PaymentForm, { PaymentFormValues } from "../components/PaymentForm";
import { submitTicketPayment } from "../utils/submitPayment";

interface TicketProduct {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  availableQuantity: number;
  soldQuantity?: number;
  image?: string;
}

export default function BuyStandaloneTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const [product, setProduct] = useState<TicketProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [step, setStep] = useState<1 | 2>(1); // 1: quantity, 2: payment

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: `/tickets/${id}/buy` } });
      return;
    }
    fetchProduct();
  }, [id, token]);

  const fetchProduct = async () => {
    try {
      const response = await apiClient.get(`/ticket-products/${id}`);
      setProduct(response.data);
    } catch (err) {
      console.error("Error fetching product:", err);
      setError("Failed to load ticket product");
    } finally {
      setLoading(false);
    }
  };

  const remaining =
    product != null
      ? product.availableQuantity - (product.soldQuantity || 0)
      : 0;

  const totalPrice = product ? product.price * quantity : 0;
  const defaultPayerName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");

  const handleContinueToPayment = () => {
    if (!product) return;
    if (remaining <= 0) {
      setError("Sorry, this ticket is sold out");
      return;
    }
    if (quantity < 1 || quantity > remaining) {
      setError(`Please choose a quantity between 1 and ${remaining}`);
      return;
    }
    setError("");
    setStep(2);
  };

  const handlePaymentSubmit = async (values: PaymentFormValues) => {
    if (!product) return;

    setPurchasing(true);
    setError("");

    try {
      // Screenshot → auditor → ticket number after approval
      const data = await submitTicketPayment({
        values,
        amount: totalPrice,
        currency: "ETB",
        purpose: "ticket_product",
        description: `${product.title} (x${quantity})`,
        relatedType: "ticket_product",
        relatedTicketProduct: product._id,
        quantity,
        metadata: {
          ticketProductId: product._id,
          quantity,
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
      setError(
        err.response?.data?.message ||
          "Failed to submit payment. Please try again.",
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ticket not found
          </h2>
          <button
            onClick={() => navigate("/tickets")}
            className="text-blue-400 hover:underline"
          >
            Back to tickets
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <button
          onClick={() => (step === 2 ? setStep(1) : navigate("/tickets"))}
          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 mb-6"
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          {step === 2 ? "Back to quantity" : "Back to Tickets"}
        </button>

        {/* Steps */}
        <div className="mb-8 flex items-center justify-center gap-4">
          <div
            className={`flex items-center gap-2 ${step >= 1 ? "text-blue-400" : "text-gray-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${step >= 1 ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-400"}`}
            >
              1
            </div>
            <span className="text-sm font-medium hidden sm:inline">
              Quantity
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

        <div className="grid md:grid-cols-5 gap-8">
          {/* Product summary */}
          <div className="md:col-span-2">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden sticky top-8">
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-500/20 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-blue-400/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div className="p-5">
                <span className="inline-block px-3 py-1 bg-blue-500/10 text-blue-300 text-xs font-medium rounded-full capitalize mb-3">
                  {product.category}
                </span>
                <h1 className="text-xl font-bold text-white mb-2">
                  {product.title}
                </h1>
                <p className="text-sm text-gray-400 mb-4 line-clamp-4">
                  {product.description}
                </p>
                <div className="p-3 rounded-lg bg-gray-900/50 border border-gray-700/50 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unit price</span>
                    <span className="text-white font-medium">
                      {product.price.toLocaleString()} ETB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white font-medium">{quantity}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-700 pt-2">
                    <span className="text-white font-semibold">Total</span>
                    <span className="text-xl font-bold text-blue-400">
                      {totalPrice.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  {remaining} ticket{remaining !== 1 ? "s" : ""} available
                </p>
              </div>
            </div>
          </div>

          {/* Main panel */}
          <div className="md:col-span-3">
            <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6 sm:p-8">
              {step === 1 ? (
                <>
                  <h2 className="text-2xl font-bold text-white mb-6">
                    Choose quantity
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Quantity
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white disabled:opacity-40"
                        disabled={quantity <= 1}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.min(
                              Math.max(remaining, 1),
                              Math.max(1, parseInt(e.target.value) || 1),
                            ),
                          )
                        }
                        className="w-20 text-center py-2 px-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                        min={1}
                        max={Math.max(remaining, 1)}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity(
                            Math.min(Math.max(remaining, 1), quantity + 1),
                          )
                        }
                        className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-white disabled:opacity-40"
                        disabled={quantity >= remaining}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-200 font-medium mb-1">
                      What happens next?
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm text-blue-300/90">
                      <li>
                        Pay via TeleBirr, M-Pesa, CBE Birr, or bank transfer
                      </li>
                      <li>Upload payment screenshot for the auditor</li>
                      <li>Ticket number is issued after auditor approval</li>
                    </ul>
                  </div>

                  {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-4">
                      <p className="text-red-400 text-sm">{error}</p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleContinueToPayment}
                    disabled={remaining === 0}
                    className="w-full py-4 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {remaining === 0
                      ? "Sold Out"
                      : `Continue to Payment · ${totalPrice.toLocaleString()} ETB`}
                  </button>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Pay to Association Account
                  </h2>
                  <p className="text-gray-400 text-sm mb-6">
                    Send money to the auditor / association account, then enter
                    your transaction reference below.
                  </p>

                  <PaymentForm
                    amount={totalPrice}
                    currency="ETB"
                    purposeLabel={`${product.title} × ${quantity}`}
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
                </>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-gray-500">
              Need help?{" "}
              <Link to="/contact" className="text-blue-400 hover:underline">
                Contact the association
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
