import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";

interface TicketProduct {
  _id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  availableQuantity: number;
  soldQuantity: number;
  image?: string;
  isActive: boolean;
}

export default function Tickets() {
  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { value: "all", label: "All Tickets" },
    { value: "membership", label: "Memberships" },
    { value: "service", label: "Services" },
    { value: "merchandise", label: "Merchandise" },
    { value: "donation", label: "Donations" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get("/ticket-products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching ticket products:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.isActive &&
      (selectedCategory === "all" || product.category === selectedCategory)
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Tickets
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse and purchase tickets for memberships, services, and more
        </p>
      </div>

      {/* Category Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === cat.value
                ? "bg-primary text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
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
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            No tickets available
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Check back later for available tickets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product._id}
              className="glass-card rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group"
            >
              {/* Image */}
              <div className="aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 relative overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-primary/50"
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
                {/* Category Badge */}
                <div className="absolute top-3 right-3">
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-xs font-medium text-gray-700 dark:text-gray-300 rounded-full capitalize">
                    {product.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                  {product.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                  {product.description}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <svg
                      className="w-4 h-4 text-gray-400"
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
                    <span className="text-gray-600 dark:text-gray-400">
                      {product.availableQuantity > 0
                        ? `${product.availableQuantity} available`
                        : "Sold out"}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    ${product.price.toFixed(2)}
                  </div>
                </div>

                {/* Action Button */}
                <Link
                  to={`/tickets/${product._id}/buy`}
                  className={`block w-full text-center py-3 rounded-lg font-medium transition-all ${
                    product.availableQuantity > 0
                      ? "bg-primary text-white hover:opacity-90"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={(e) => {
                    if (product.availableQuantity === 0) e.preventDefault();
                  }}
                >
                  {product.availableQuantity > 0 ? "Buy Now" : "Sold Out"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
