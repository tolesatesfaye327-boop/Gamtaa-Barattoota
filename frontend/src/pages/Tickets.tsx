import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import apiClient from "../services/api";
import LuckyDrawWheel from "../components/LuckyDrawWheel";

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

interface LiveDraw {
  event: { _id: string; title: string; luckyDrawVisible: boolean };
  tickets: { ticketNumber: string }[];
  isDrawing: boolean;
  currentPrize: string;
  selectedTicket: string;
}

const categories = [
  { value: "all", label: "All tickets" },
  { value: "membership", label: "Membership" },
  { value: "service", label: "Services" },
  { value: "merchandise", label: "Merchandise" },
  { value: "donation", label: "Donations" },
  { value: "other", label: "Other" },
];

const categoryStyles: Record<string, string> = {
  membership: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
  service: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  merchandise: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
  donation: "bg-rose-500/10 text-rose-700 dark:text-rose-300",
  other: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
};

export default function Tickets() {
  const [products, setProducts] = useState<TicketProduct[]>([]);
  const [liveDraws, setLiveDraws] = useState<LiveDraw[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [productsResponse, drawsResponse] = await Promise.all([
          apiClient.get("/ticket-products"),
          apiClient.get("/standalone-draw/live"),
        ]);
        setProducts(productsResponse.data);
        setLiveDraws(drawsResponse.data.draws || []);
      } catch {
        setError("We could not load the ticket catalog. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
    const refresh = window.setInterval(async () => {
      try {
        const response = await apiClient.get("/standalone-draw/live");
        setLiveDraws(response.data.draws || []);
      } catch {
        // Keep the last live draw state when a refresh is temporarily unavailable.
      }
    }, 1000);
    return () => window.clearInterval(refresh);
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.isActive &&
      (selectedCategory === "all" || product.category === selectedCategory),
  );
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="animate-pulse space-y-6">
          <div className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {liveDraws.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="relative mb-6 overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-8 text-white shadow-2xl shadow-slate-300/40 dark:shadow-black/30 sm:px-10 sm:py-10">
            <div className="absolute -right-24 -top-40 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
            <div className="absolute -bottom-48 left-1/3 h-96 w-96 rounded-full bg-primary-600/20 blur-3xl" />
            <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Live experience</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Lucky draw spinner</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">Watch an active draw unfold in real time. Every eligible ticket has an equal chance to be selected.</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-300"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Live now</span>
            </div>
          </div>
          <div className="grid gap-6">
            {liveDraws.map((draw) => (
              <article key={draw.event._id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-black/20 sm:p-8 lg:p-10">
                <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-14">
                  <div className="order-2 lg:order-1">
                    <LuckyDrawWheel
                      tickets={draw.tickets.map((ticket) => ticket.ticketNumber)}
                      autoSpin={draw.isDrawing}
                      showButton={false}
                      targetTicket={draw.selectedTicket}
                    />
                  </div>
                  <div className="order-1 lg:order-2 lg:border-l lg:border-slate-200 lg:pl-8 lg:dark:border-white/10">
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">Public draw</span>
                    <h3 className="mt-3 text-2xl font-black leading-tight text-slate-950 dark:text-white">{draw.event.title}</h3>
                    <div className="mt-6 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"><svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v18m9-9H3" /></svg></span>
                      <div><p className="text-2xl font-black text-slate-950 dark:text-white">{draw.tickets.length}</p><p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Eligible tickets</p></div>
                    </div>
                    <p className="mt-5 text-sm leading-6 text-slate-500 dark:text-slate-400">The wheel selects from every eligible ticket in this live draw.</p>
                    {draw.isDrawing && (
                      <p className="mt-5 rounded-xl bg-amber-500/10 px-3 py-2.5 text-sm font-semibold leading-5 text-amber-600 dark:text-amber-300">
                        Spinning live{draw.currentPrize ? ` for ${draw.currentPrize}` : ""}.
                      </p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">Browse catalog</span>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">Choose your ticket</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Transparent pricing, real-time availability, and no unnecessary steps.</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400"><span className="font-semibold text-slate-900 dark:text-white">{filteredProducts.length}</span> offers</div>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button key={category.value} type="button" onClick={() => setSelectedCategory(category.value)} className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${selectedCategory === category.value ? "bg-slate-950 text-white shadow-lg dark:bg-white dark:text-slate-950" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"}`}>
              {category.label}
            </button>
          ))}
        </div>

        {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{error}</div>}
        {filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-slate-900"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl dark:bg-white/10">🎫</div><h3 className="mt-5 text-lg font-bold text-slate-950 dark:text-white">No tickets in this category</h3><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Try another category or check back soon.</p></div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredProducts.map((product) => <TicketCard key={product._id} product={product} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function TicketCard({ product }: { product: TicketProduct }) {
  const remaining = Math.max(product.availableQuantity - product.soldQuantity, 0);
  const soldPercent = product.availableQuantity > 0 ? Math.min((product.soldQuantity / product.availableQuantity) * 100, 100) : 0;
  const categoryClass = categoryStyles[product.category] || categoryStyles.other;

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/70 dark:border-white/10 dark:bg-slate-900 dark:hover:shadow-black/30">
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-sky-900 via-slate-800 to-indigo-950">
        {product.image ? <img src={product.image} alt={product.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><span className="text-6xl opacity-30">🎫</span></div>}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
        <span className={`absolute left-4 top-4 rounded-full px-3 py-1.5 text-xs font-bold capitalize backdrop-blur ${categoryClass}`}>{product.category}</span>
        <span className="absolute bottom-4 left-4 text-xs font-semibold text-white/80">GBAABW official offer</span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-black text-slate-950 dark:text-white">{product.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{product.description}</p>
        <div className="mt-5 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price</p><p className="mt-1 text-2xl font-black text-slate-950 dark:text-white">Br {product.price.toLocaleString()}</p></div><p className={`text-right text-xs font-bold ${remaining > 0 ? "text-emerald-600 dark:text-emerald-300" : "text-red-500"}`}>{remaining > 0 ? `${remaining} remaining` : "Sold out"}</p></div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-indigo-500" style={{ width: `${soldPercent}%` }} /></div>
        <Link to={`/tickets/${product._id}/buy`} onClick={(event) => { if (remaining === 0) event.preventDefault(); }} className={`mt-6 flex items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-bold transition ${remaining > 0 ? "bg-slate-950 text-white hover:bg-sky-700 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-100" : "cursor-not-allowed bg-slate-100 text-slate-400 dark:bg-white/10"}`}>{remaining > 0 ? "Continue to purchase" : "Currently unavailable"}<span aria-hidden="true">{remaining > 0 ? "→" : ""}</span></Link>
      </div>
    </article>
  );
}
