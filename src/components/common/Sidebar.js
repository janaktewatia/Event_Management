// src/components/common/Sidebar.jsx
import React from "react";
import { BiUpload } from "react-icons/bi";
import { AiOutlineQrcode } from "react-icons/ai";
import { FiX } from "react-icons/fi";

const Sidebar = ({ activePage, setActivePage, isMobileMenuOpen, onClose }) => {
  return (
    <aside
      className={`sidebar d-flex flex-column p-3 bg-white ${isMobileMenuOpen ? "show" : ""}`}
    >
      <div className="sidebar__header mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">QR Generator</h4>
          <p className="small text-muted mb-0">Create and manage QR codes</p>
        </div>

        <button
          type="button"
          className="sidebar__close d-md-none"
          onClick={onClose}
          aria-label="Close navigation"
        >
          <FiX size={20} />
        </button>
      </div>

      <button
        type="button"
        className={`nav-link btn btn-ghost text-start text-dark w-100 mb-2 ${activePage === "generate" ? "active" : ""}`}
        onClick={() => setActivePage("generate")}
      >
        <AiOutlineQrcode className="fs-5 me-2" />
        Generate QR Code
      </button>

      <button
        type="button"
        className={`nav-link btn btn-ghost text-start text-dark w-100 mb-2 ${activePage === "import" ? "active" : ""}`}
        onClick={() => setActivePage("import")}
      >
        <BiUpload className="fs-5 me-2" />
        Bulk QR Codes
      </button>

      <div className="mt-auto pt-3">
        <small className="text-muted">Powered by KnowVato</small>
      </div>
    </aside>
  );
};

export default Sidebar;
