import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./components/common/Sidebar";
import { QRProvider } from "./context/QRContext";
import { HistoryProvider } from "./context/HistoryContext";
import { EventDataProvider } from "./context/EventDataContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import QRGeneratorPage from "./pages/QRGeneratorPage";
import ImportQRPage from "./pages/ImportQRPage";
import CreateEventPage from "./pages/CreateEventPage";
import EventAttendeesPage from "./pages/EventAttendeesPage";
import EventPassPage from "./pages/EventPassPage";
import AttendanceRecordsPage from "./pages/AttendanceRecordsPage";
import ScanPage from "./pages/ScanPage";
import PassDesignerPage from "./pages/PassDesignerPageV2";
import RegistrantsPage from "./pages/RegistrantsPage";
import SetupPage from "./pages/SetupPage";
import ActivityLogPage from "./pages/ActivityLogPage";
import PublicRegistrationForm from "./pages/PublicRegistrationForm";
import ToastNotification from "./components/common/ToastNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./styles/custom.css";

const PATH_TITLES = {
  "/dashboard": "Dashboard",
  "/": "QR Code Generator",
  "/bulk-qr": "Bulk QR Codes",
  "/events": "Create Event",
  "/registrants": "Registrants",
  "/attendees": "Attendee Data",
  "/scan": "Scan Pass",
  "/setup": "Setup",
};

const getPageTitle = (pathname) => {
  if (pathname.endsWith("/generatepass")) return "Generate Pass";
  if (pathname.endsWith("/upload")) return "Upload Data";
  if (pathname.endsWith("/attendees") && pathname !== "/attendees")
    return "Attendance Records";
  return PATH_TITLES[pathname] || "Event Management";
};

const defaultPage = (permissions = []) => {
  if (!permissions.length) return "/dashboard";
  if (permissions.includes("reports.dashboard")) return "/dashboard";
  if (permissions.includes("events.view")) return "/events";
  if (permissions.includes("scan.access")) return "/scan";
  if (permissions.includes("pass.generate")) return "/";
  if (permissions.includes("setup.access")) return "/setup";
  return "/scan";
};

const DefaultRedirect = () => {
  const { user } = useAuth();
  return <Navigate to={defaultPage(user?.permissions)} replace />;
};

const Guard = ({ permission, children }) => {
  const { user } = useAuth();
  const allowed =
    !permission ||
    !user?.permissions?.length ||
    user.permissions.includes(permission);
  return allowed ? (
    children
  ) : (
    <Navigate to={defaultPage(user?.permissions)} replace />
  );
};

const AppShell = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", isMobileMenuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [isMobileMenuOpen]);

  return (
    <div className="app-shell">
      <div className="mobile-topbar">
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="Open navigation menu"
        >
          <FiMenu size={20} />
        </button>
        <div className="flex-grow-1">
          <p className="mobile-topbar__eyebrow">Event Management</p>
          <h1 className="mobile-topbar__title">
            {getPageTitle(location.pathname)}
          </h1>
        </div>
      </div>

      <div
        className={`mobile-nav-overlay ${isMobileMenuOpen ? "show" : ""}`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="main-content">
        <Routes>
          <Route
            path="/dashboard"
            element={
              <Guard permission="reports.dashboard">
                <DashboardPage />
              </Guard>
            }
          />
          <Route
            path="/"
            element={
              <Guard permission="pass.generate">
                <QRGeneratorPage />
              </Guard>
            }
          />
          <Route
            path="/bulk-qr"
            element={
              <Guard permission="pass.generate">
                <ImportQRPage />
              </Guard>
            }
          />
          <Route
            path="/events"
            element={
              <Guard permission="events.view">
                <CreateEventPage />
              </Guard>
            }
          />
          <Route
            path="/events/:eventId/upload"
            element={
              <Guard permission="attendees.view">
                <EventAttendeesPage />
              </Guard>
            }
          />
          <Route
            path="/events/:eventId/upload/generatepass"
            element={
              <Guard permission="pass.design">
                <PassDesignerPage />
              </Guard>
            }
          />
          <Route
            path="/registrants"
            element={
              <Guard permission="attendees.view">
                <RegistrantsPage />
              </Guard>
            }
          />
          <Route
            path="/events/:eventId/attendees"
            element={
              <Guard permission="reports.attendance">
                <AttendanceRecordsPage />
              </Guard>
            }
          />
          <Route
            path="/event-pass"
            element={
              <Guard permission="pass.generate">
                <EventPassPage />
              </Guard>
            }
          />
          <Route
            path="/attendees"
            element={
              <Guard permission="reports.attendance">
                <AttendanceRecordsPage />
              </Guard>
            }
          />
          <Route
            path="/setup"
            element={
              <Guard permission="setup.access">
                <SetupPage />
              </Guard>
            }
          />
          <Route
            path="/scan"
            element={
              <Guard permission="scan.access">
                <ScanPage />
              </Guard>
            }
          />
          <Route
            path="/events/:eventId/logs"
            element={
              <Guard permission="reports.activity">
                <ActivityLogPage />
              </Guard>
            }
          />
          <Route path="*" element={<DefaultRedirect />} />
        </Routes>
      </main>

      <ToastNotification />
    </div>
  );
};

const AuthGate = () => {
  const { user } = useAuth();
  if (!user) return <LoginPage />;
  return <AppShell />;
};

function App() {
  return (
    <AuthProvider>
      <QRProvider>
        <HistoryProvider>
          <EventDataProvider>
            <BrowserRouter>
              <Routes>
                <Route
                  path="/register/:eventId"
                  element={<PublicRegistrationForm />}
                />
                <Route path="/*" element={<AuthGate />} />
              </Routes>
            </BrowserRouter>
          </EventDataProvider>
        </HistoryProvider>
      </QRProvider>
    </AuthProvider>
  );
}

export default App;
