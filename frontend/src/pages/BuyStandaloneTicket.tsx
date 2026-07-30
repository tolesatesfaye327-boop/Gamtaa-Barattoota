import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/api";

interface TicketProduct {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  availableQuantity: number;
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
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Failed to load ticket product");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!product) return;

    setPurchasing(true);
    setError("");

    try {
      const response = await apiClient.post(`/ticket-products/${id}/purchase`, {
        quantity,
      });

      // Redirect to payment or success page
      if (response.data.paymentRequired) {
        // Integrate with payment system
        navigate("/payments", { state: { purchaseId: response.data.purchaseId } });
      } else {
        // Success - redirect to my tickets
        navigate("/my-purchased-tickets");
      }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Ticket not found
          </h2>
          <button
            onClick={() => navigate("/tickets")}
            className="text-primary hover:underline"
          >
            Back to tickets
          </button>
        </div>
      </div>
    );
  }

  const totalPrice = product.price * quantity;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate("/tickets")}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-6"
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
        Back to Tickets
      </button>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="grid md:grid-cols-2 gap-8 p-8">
          {/* Left: Product Info */}
          <div>
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl mb-4 overflow-hidden">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-24 h-24 text-primary/50"
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

            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full capitalize mb-3">
              {product.category}
            </span>

            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {product.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {product.description}
            </p>

            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span>
                {product.availableQuantity} ticket
                {product.availableQuantity !== 1 ? "s" : ""} available
              </span>
            </div>
          </div>

          {/* Right: Purchase Form */}
          <div className="flex flex-col">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Purchase Details
              </h2>

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                    disabled={quantity <= 1}
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
                        d="M20 12H4"
                      />
                    </svg>
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.min(
                          product.availableQuantity,
                          Math.max(1, parseInt(e.target.value) || 1)
                        )
                      )
                    }
                    className="w-20 text-center py-2 px-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    min="1"
                    max={product.availableQuantity}
                  />
                  <button
                    onClick={() =>
                      setQuantity(
                        Math.min(product.availableQuantity, quantity + 1)
                      )
                    }
                    className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center"
                    disabled={quantity >= product.availableQuantity}
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
                  </button>
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Price per ticket
                  </span>
                  <span className="font-medium">${product.price.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">
                    Quantity
                  </span>
                  <span className="font-medium">{quantity}</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Purchase Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex gap-2">
                  <svg
                    className="w-5 h-5 text-blue-500 shrink-0 mt-0.5"
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
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-600 dark:text-blue-400">
                      <li>Complete payment</li>
                      <li>Receive digital ticket with QR code</li>
                      <li>Access ticket anytime from "My Tickets"</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handlePurchase}
              disabled={
                purchasing ||
                product.availableQuantity === 0 ||
                quantity > product.availableQuantity
              }
              className="w-full btn-primary py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {purchasing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : product.availableQuantity === 0 ? (
                "Sold Out"
              ) : (
                `Purchase for $${totalPrice.toFixed(2)}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
