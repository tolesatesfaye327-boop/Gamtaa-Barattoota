import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Layout from "./components/Layout";
import PublicLanding from "./pages/PublicLanding";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminUsers from "./pages/SuperAdminUsers";
import LeaderDashboard from "./pages/LeaderDashboard";
import Members from "./pages/Members";
import Events from "./pages/Events";
import Waaee from "./pages/Waaee";
import Leadership from "./pages/Leadership";
import GalleryPage from "./pages/GalleryPage";
import Contact from "./pages/Contact";
import FAQs from "./pages/FAQs";
import Galata from "./pages/Galata";
import Ergaa from "./pages/Ergaa";
import Koreewwan from "./pages/Koreewwan";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import EventDetail from "./pages/EventDetail";
import MemberDetail from "./pages/MemberDetail";
import { PrivacyPolicy, TermsOfService } from "./pages/LegalPages";
import Profile from "./pages/Profile";
import MyEvents from "./pages/MyEvents";
import Documents from "./pages/Documents";
import Opportunities from "./pages/Opportunities";
import Resources from "./pages/Resources";
import Notifications from "./pages/Notifications";
import AdminEvents from "./pages/AdminEvents";
import AdminGallery from "./pages/AdminGallery";
import AdminContact from "./pages/AdminContact";
import AdminStudents from "./pages/AdminStudents";
import AdminLeadership from "./pages/AdminLeadership";
import EventsWithTickets from "./pages/EventsWithTickets";
import BuyTicket from "./pages/BuyTicket";
import MyTickets from "./pages/MyTickets";
import TicketDetails from "./pages/TicketDetails";
import AdminTickets from "./pages/AdminTickets";
import QRScanner from "./pages/QRScanner";
import AdminTicketProducts from "./pages/AdminTicketProducts";
import Tickets from "./pages/Tickets";
import BuyStandaloneTicket from "./pages/BuyStandaloneTicket";
import WinnerPage from "./pages/WinnerPage";
import AdminPayments from "./pages/AdminPayments";
import MyPayments from "./pages/MyPayments";
import AdminLuckyDraw from "./pages/AdminLuckyDraw";
import AdminPaymentSettings from "./pages/AdminPaymentSettings";
import Developers from "./pages/Developers";

const ADMIN_ROLES = ["superadmin", "admin"];

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  if (!token || !user?.role || !ADMIN_ROLES.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function SuperAdminRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  if (!token || user?.role !== "superadmin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AdminRouteSingle({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore();
  if (!token || user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppRoutes />
    </Router>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<Layout />}>
        {/* Public core */}
        <Route path="/" element={<PublicLanding />} />
        <Route path="/waaee" element={<Waaee />} />
        <Route path="/about" element={<Navigate to="/waaee" replace />} />
        <Route path="/service" element={<Navigate to="/waaee" replace />} />

        {/* Standalone Ticket System - Must come BEFORE /events/:id */}
        <Route path="/tickets" element={<Tickets />} />
        <Route
          path="/tickets/:id/buy"
          element={
            <PrivateRoute>
              <BuyStandaloneTicket />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-purchased-tickets"
          element={<Navigate to="/my-tickets" replace />}
        />

        {/* Event-Based Ticket Routes - Must come BEFORE /events/:id */}
        <Route path="/events-tickets" element={<EventsWithTickets />} />
        <Route path="/winners" element={<WinnerPage />} />
        <Route
          path="/events/:eventId/buy-ticket"
          element={
            <PrivateRoute>
              <BuyTicket />
            </PrivateRoute>
          }
        />

        {/* Event Routes */}
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetail />} />

        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/leadership" element={<Leadership />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/galata" element={<Galata />} />
        <Route path="/ergaa" element={<Ergaa />} />
        <Route path="/koreewwan" element={<Koreewwan />} />
        <Route path="/developers" element={<Developers />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />

        {/* My Tickets Routes */}
        <Route
          path="/my-tickets"
          element={
            <PrivateRoute>
              <MyTickets />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-payments"
          element={
            <PrivateRoute>
              <MyPayments />
            </PrivateRoute>
          }
        />

        <Route
          path="/my-tickets/:ticketId"
          element={
            <PrivateRoute>
              <TicketDetails />
            </PrivateRoute>
          }
        />

        {/* Member-only */}
        <Route
          path="/members"
          element={
            <PrivateRoute>
              <Members />
            </PrivateRoute>
          }
        />
        <Route
          path="/members/:id"
          element={
            <PrivateRoute>
              <MemberDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/students"
          element={
            <PrivateRoute>
              <Students />
            </PrivateRoute>
          }
        />
        <Route
          path="/students/:id"
          element={
            <PrivateRoute>
              <StudentDetail />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-events"
          element={
            <PrivateRoute>
              <MyEvents />
            </PrivateRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <Documents />
            </PrivateRoute>
          }
        />
        <Route
          path="/opportunities"
          element={
            <PrivateRoute>
              <Opportunities />
            </PrivateRoute>
          }
        />
        <Route
          path="/resources"
          element={
            <PrivateRoute>
              <Resources />
            </PrivateRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <PrivateRoute>
              <Notifications />
            </PrivateRoute>
          }
        />

        {/* Superadmin */}
        <Route
          path="/superadmin/dashboard"
          element={
            <SuperAdminRoute>
              <SuperAdminDashboard />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/superadmin/users"
          element={
            <SuperAdminRoute>
              <SuperAdminUsers />
            </SuperAdminRoute>
          }
        />

        {/* Admin dashboard */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRouteSingle>
              <LeaderDashboard />
            </AdminRouteSingle>
          }
        />

        {/* Content management */}
        <Route
          path="/admin/events"
          element={
            <AdminRoute>
              <AdminEvents />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tickets"
          element={
            <AdminRoute>
              <AdminTickets />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/payments"
          element={
            <AdminRoute>
              <AdminPayments />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/payment-settings"
          element={
            <AdminRoute>
              <AdminPaymentSettings />
            </AdminRoute>
          }
        />

        <Route
          path="/admin/ticket-products"
          element={
            <AdminRoute>
              <AdminTicketProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/tickets/:eventId/scan"
          element={
            <AdminRoute>
              <QRScanner />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/ticket-products/:ticketProductId/draw"
          element={
            <AdminRoute>
              <AdminLuckyDraw />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/gallery"
          element={
            <AdminRoute>
              <AdminGallery />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/contact"
          element={
            <AdminRoute>
              <AdminContact />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <SuperAdminRoute>
              <AdminStudents />
            </SuperAdminRoute>
          }
        />
        <Route
          path="/admin/leadership"
          element={
            <AdminRoute>
              <AdminLeadership />
            </AdminRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
