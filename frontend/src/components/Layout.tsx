import { useState, useEffect, useRef } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import apiClient from "../services/api";
import Footer from "./Footer";

const ABOUT_LINKS = [
  { to: "/waaee", label: "Waa'ee Keenya" },
  { to: "/leadership", label: "Leadership" },
  { to: "/koreewwan", label: "Committees" },
  { to: "/galata", label: "Thanksgiving" },
  { to: "/ergaa", label: "Brief Message" },
  { to: "/yaadannoo", label: "Memorial" },
  { to: "/faqs", label: "FAQs" },
];

const EXPLORE_LINKS = [
  { to: "/events", label: "Events" },
  { to: "/tickets", label: "Tickets" },
  { to: "/winners", label: "Lucky Draw Winners" },
  { to: "/gallery", label: "Gallery" },
  { to: "/students", label: "Students" },
  { to: "/contact", label: "Contact" },
];

const COMMUNITY_LINKS = [
  { to: "/members", label: "Members" },
  { to: "/resources", label: "Learning Resources" },
];

function NavLinkButton({
  to,
  label,
  active,
  onNavigate,
}: {
  to: string;
  label: string;
  active: boolean;
  onNavigate: (to: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onNavigate(to)}
      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
        active
          ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-semibold"
          : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
      }`}
    >
      {label}
    </button>
  );
}

function DropdownMenu({
  label,
  active,
  items,
  onNavigate,
}: {
  label: string;
  active: boolean;
  items: { to: string; label: string }[];
  onNavigate: (to: string) => void;
}) {
  const location = useLocation();
  return (
    <div className="relative group">
      <button
        type="button"
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
          active
            ? "text-primary-600 dark:text-primary-400"
            : "text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
        }`}
      >
        {label}
        <svg
          className="w-4 h-4 transition-transform group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div className="absolute left-0 top-full mt-2 w-52 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 glass-card rounded-xl py-2 z-50 transform origin-top scale-95 group-hover:scale-100">
        {items.map((item) => (
          <button
            key={item.to}
            type="button"
            onClick={() => onNavigate(item.to)}
            className={`block w-full text-left px-4 py-2 text-sm transition-all duration-200 ${
              location.pathname === item.to
                ? "text-primary-600 bg-primary-50 dark:text-primary-400 dark:bg-primary-900/20 font-semibold"
                : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, token, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("darkMode");
      if (stored !== null) return stored === "true";
      return true;
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (user && token) {
      apiClient
        .get("/notifications/unread-count")
        .then((res) => setUnreadCount(res.data.unreadCount || 0))
        .catch(() => {});
      apiClient
        .get("/auth/me")
        .then((res) => {
          if (res.data.role !== user.role) {
            apiClient.post("/auth/refresh-token").then((refreshRes) => {
              localStorage.setItem("token", refreshRes.data.token);
              localStorage.setItem(
                "user",
                JSON.stringify(refreshRes.data.user),
              );
              window.location.reload();
            });
          }
        })
        .catch(() => {});
    }
  }, [user, token]);

  // Close drawer when route changes (phone navigation)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const go = (to: string) => navigate(to);

  const isActive = (to: string) =>
    to === "/"
      ? location.pathname === "/"
      : location.pathname === to || location.pathname.startsWith(`${to}/`);

  const dashboardPath =
    user?.role === "superadmin"
      ? "/superadmin/dashboard"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";

  const manageItems = [
    { to: dashboardPath, label: "Dashboard" },
    { to: "/admin/events", label: "Event Management" },
    { to: "/admin/payments", label: "Payment Approvals" },
    { to: "/admin/ticket-products", label: "Ticket Products" },
    { to: "/admin/gallery", label: "Gallery Management" },
    { to: "/admin/leadership", label: "Leadership Management" },
    { to: "/admin/contact", label: "Contact Messages" },
    ...(user?.role === "superadmin"
      ? [
          { to: "/superadmin/users", label: "User Management" },
          { to: "/admin/students", label: "Students Management" },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-bg selection:bg-primary-500/30">
      <nav className="glass-nav fixed top-0 left-0 right-0 z-40 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            <div className="flex items-center gap-2 min-w-0">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="xl:hidden touch-target p-2 sm:p-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              <Link to="/" className="flex items-center gap-2 shrink-0">
                <img
                  src="/asset/Picture1.png"
                  alt="GBAABW logo"
                  className="h-8 w-auto sm:h-10 rounded-full"
                />
                <span className="hidden md:inline text-sm font-bold text-gray-900 dark:text-white tracking-tight">
                  GBAABW
                </span>
              </Link>

              {/* Desktop: Home · About ▾ · Explore ▾ (+ member groups) */}
              <div className="hidden xl:flex items-center gap-0.5 ml-2">
                <NavLinkButton
                  to="/"
                  label="Home"
                  active={isActive("/")}
                  onNavigate={go}
                />
                <DropdownMenu
                  label="About"
                  active={ABOUT_LINKS.some((l) => isActive(l.to))}
                  items={ABOUT_LINKS}
                  onNavigate={go}
                />
                <DropdownMenu
                  label="Explore"
                  active={EXPLORE_LINKS.some((l) => isActive(l.to))}
                  items={EXPLORE_LINKS}
                  onNavigate={go}
                />

                {user && (
                  <>
                    <DropdownMenu
                      label="Community"
                      active={COMMUNITY_LINKS.some((l) => isActive(l.to))}
                      items={[
                        ...COMMUNITY_LINKS,
                      ]}
                      onNavigate={go}
                    />
                  </>
                )}

                {(user?.role === "superadmin" || user?.role === "admin") && (
                  <DropdownMenu
                    label="Manage"
                    active={
                      location.pathname.startsWith("/admin") ||
                      location.pathname.startsWith("/superadmin") ||
                      isActive("/dashboard")
                    }
                    items={manageItems}
                    onNavigate={go}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 sm:p-2 rounded-md text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                )}
              </button>

              {user ? (
                <UserDropdown
                  user={user}
                  unreadCount={unreadCount}
                  logout={logout}
                />
              ) : (
                <>
                  <Link
                    to="/login"
                    className="hidden sm:inline text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile drawer must NOT live inside glass-nav — backdrop-filter
            creates a containing block that clips fixed children to the bar height */}
      </nav>

      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60] xl:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <MobileMenu
            user={user}
            logout={logout}
            closeMenu={() => setMobileMenuOpen(false)}
          />
        </>
      )}

      <main className="flex-1 w-full pt-14 sm:pt-16 pb-20 xl:pb-0">
        <Outlet />
      </main>

      <Footer />

      {/* Phone bottom bar — thumb-reach primary destinations */}
      <nav
        className="xl:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200/80 dark:border-white/10 bg-white/95 dark:bg-dark-bg/95 backdrop-blur-lg safe-bottom"
        aria-label="Primary mobile"
      >
        <div className="grid grid-cols-5 h-16">
          {[
            {
              to: "/",
              label: "Home",
              icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
            },
            {
              to: "/events",
              label: "Events",
              icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
            },
            {
              to: "/waaee",
              label: "About",
              icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
            },
          ].map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
                  active
                    ? "text-primary-600 dark:text-primary-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={active ? 2.25 : 1.75}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d={item.icon}
                  />
                </svg>
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium ${
              mobileMenuOpen
                ? "text-primary-600 dark:text-primary-400"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            More
          </button>
        </div>
      </nav>
    </div>
  );
}

function useClickOutside<T extends HTMLElement>(handler: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        handler();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [handler]);
  return ref;
}

function UserDropdown({
  user,
  unreadCount,
  logout,
}: {
  user: { firstName: string; lastName: string; role: string };
  unreadCount: number;
  logout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const dashboardPath =
    user.role === "superadmin"
      ? "/superadmin/dashboard"
      : user.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors rounded-md"
      >
        <span className="hidden xl:inline">
          {user.firstName} {user.lastName}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <Link
            to={dashboardPath}
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Dashboard
          </Link>
          <Link
            to="/my-tickets"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            My Tickets
          </Link>
          <Link
            to="/my-payments"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            My Payments
          </Link>
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Profile
          </Link>

          <Link
            to="/my-events"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            My Events
          </Link>
          <Link
            to="/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Notifications
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </Link>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              logout();
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function MobileMenu({
  user,
  logout,
  closeMenu,
}: {
  user: { firstName: string; lastName: string; role: string } | null;
  logout: () => void;
  closeMenu: () => void;
}) {
  const location = useLocation();

  const dashboardPath =
    user?.role === "superadmin"
      ? "/superadmin/dashboard"
      : user?.role === "admin"
        ? "/admin/dashboard"
        : "/dashboard";

  const linkClass = (path: string) =>
    `flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors ${
      location.pathname === path ||
      (path !== "/" && location.pathname.startsWith(path))
        ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 font-medium"
        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
    }`;

  const sectionHeadingClass =
    "px-3 pt-4 pb-0.5 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest";

  return (
    <div className="fixed inset-y-0 left-0 w-[min(280px,85vw)] z-[70] xl:hidden bg-white dark:bg-gray-800 shadow-2xl flex flex-col border-r border-gray-200 dark:border-gray-700 safe-bottom animate-slide-in-left">
      <div className="flex items-center justify-between px-4 h-14 sm:h-16 border-b border-gray-200/50 dark:border-gray-700/50 shrink-0">
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <img
            src="/asset/Picture1.png"
            alt="GBAABW"
            className="h-7 w-7 rounded-full"
          />
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            GBAABW
          </span>
        </Link>
        <button
          type="button"
          onClick={closeMenu}
          className="touch-target p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close menu"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain py-2 px-3 space-y-0.5">
        <p className={sectionHeadingClass}>Home</p>
        <Link to="/" onClick={closeMenu} className={linkClass("/")}>
          Home
        </Link>

        <p className={sectionHeadingClass}>About</p>
        {ABOUT_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={linkClass(link.to)}
          >
            {link.label}
          </Link>
        ))}

        <p className={sectionHeadingClass}>Explore</p>
        {EXPLORE_LINKS.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            onClick={closeMenu}
            className={linkClass(link.to)}
          >
            {link.label}
          </Link>
        ))}

        {user && (
          <>
            <p className={sectionHeadingClass}>Account</p>
            <div className="px-3 py-2 flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-bold shrink-0">
                {user.firstName?.[0] ?? ""}
                {user.lastName?.[0] ?? ""}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 capitalize">
                  {user.role}
                </p>
              </div>
            </div>
            <Link
              to="/my-tickets"
              onClick={closeMenu}
              className={linkClass("/my-tickets")}
            >
              My Tickets
            </Link>
            <Link
              to="/my-payments"
              onClick={closeMenu}
              className={linkClass("/my-payments")}
            >
              My Payments
            </Link>
            <Link
              to="/profile"
              onClick={closeMenu}
              className={linkClass("/profile")}
            >
              Profile
            </Link>

            <Link
              to="/my-events"
              onClick={closeMenu}
              className={linkClass("/my-events")}
            >
              My Events
            </Link>
            <Link
              to="/notifications"
              onClick={closeMenu}
              className={linkClass("/notifications")}
            >
              Notifications
            </Link>

            <p className={sectionHeadingClass}>Community</p>
            <Link
              to="/members"
              onClick={closeMenu}
              className={linkClass("/members")}
            >
              Members
            </Link>
            <Link
              to="/resources"
              onClick={closeMenu}
              className={linkClass("/resources")}
            >
              Learning Resources
            </Link>
          </>
        )}

        {(user?.role === "superadmin" || user?.role === "admin") && (
          <>
            <p className={sectionHeadingClass}>Manage</p>
            <Link
              to={dashboardPath}
              onClick={closeMenu}
              className={linkClass(dashboardPath)}
            >
              Dashboard
            </Link>
            <Link
              to="/admin/events"
              onClick={closeMenu}
              className={linkClass("/admin/events")}
            >
              Event Management
            </Link>
            <Link
              to="/admin/payments"
              onClick={closeMenu}
              className={linkClass("/admin/payments")}
            >
              Payment Approvals
            </Link>
            <Link
              to="/admin/ticket-products"
              onClick={closeMenu}
              className={linkClass("/admin/ticket-products")}
            >
              Ticket Products
            </Link>

            <Link
              to="/admin/gallery"
              onClick={closeMenu}
              className={linkClass("/admin/gallery")}
            >
              Gallery Management
            </Link>
            <Link
              to="/admin/leadership"
              onClick={closeMenu}
              className={linkClass("/admin/leadership")}
            >
              Leadership Management
            </Link>
            <Link
              to="/admin/contact"
              onClick={closeMenu}
              className={linkClass("/admin/contact")}
            >
              Contact Messages
            </Link>
            {user.role === "superadmin" && (
              <Link
                to="/superadmin/users"
                onClick={closeMenu}
                className={linkClass("/superadmin/users")}
              >
                User Management
              </Link>
            )}
          </>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 p-3 shrink-0">
        {user ? (
          <button
            onClick={() => {
              closeMenu();
              logout();
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
          >
            Logout
          </button>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Link
              to="/login"
              onClick={closeMenu}
              className="w-full text-center px-3 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              onClick={closeMenu}
              className="w-full text-center px-3 py-2 text-xs font-semibold text-white bg-primary hover:opacity-90 rounded-lg transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
