// src/App.jsx
import React, { useEffect, useState } from "react";
import { FiMenu } from "react-icons/fi";
import Sidebar from "./components/common/Sidebar";
import { QRProvider } from "./context/QRContext";
import { HistoryProvider } from "./context/HistoryContext";
import QRGeneratorPage from "./pages/QRGeneratorPage";
import ImportQRPage from "./pages/ImportQRPage";
import ToastNotification from "./components/common/ToastNotification";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/custom.css";

function App() {
  const [activePage, setActivePage] = useState("generate");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", isMobileMenuOpen);

    return () => {
      document.body.classList.remove("mobile-menu-open");
    };
  }, [isMobileMenuOpen]);

  const handleNavigate = (page) => {
    setActivePage(page);
    setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    if (activePage === "import") {
      return <ImportQRPage />;
    }

    return <QRGeneratorPage />;
  };

  const pageTitle =
    activePage === "import" ? "Bulk QR Codes" : "QR Code Generator";

  return (
    <QRProvider>
      <HistoryProvider>
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

            <div>
              <p className="mobile-topbar__eyebrow">KnowVato</p>
              <h1 className="mobile-topbar__title">{pageTitle}</h1>
            </div>
          </div>

          <div
            className={`mobile-nav-overlay ${isMobileMenuOpen ? "show" : ""}`}
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <Sidebar
            activePage={activePage}
            setActivePage={handleNavigate}
            isMobileMenuOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />

          <main className="main-content">{renderContent()}</main>

          <ToastNotification />
        </div>
      </HistoryProvider>
    </QRProvider>
  );
}

export default App;
