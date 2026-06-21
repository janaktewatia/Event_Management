import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Modal,
  Spinner,
  Alert,
} from "react-bootstrap";
import { FiEdit2, FiEye, FiPlus } from "react-icons/fi";
import "./whatsapp-styles.css";

const VendorSelection = ({ onConfigSaved }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState(null);
  const [integrationLogs, setIntegrationLogs] = useState([]);

  const vendorDetails = {
    meta: { name: "Meta WhatsApp Business", color: "success" },
    pinnacle: { name: "Pinnacle", color: "info" },
    interakt: { name: "Interakt", color: "warning" },
    ai_sency: { name: "AI Sency", color: "primary" },
  };

  useEffect(() => {
    fetchAllVendors();
  }, []);

  const fetchAllVendors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/whatsapp/configs");
      if (!response.ok) throw new Error("Failed to fetch vendors");
      const data = await response.json();
      setVendors(data || []);
    } catch (err) {
      console.error("Error fetching vendors:", err);
      // Silently handle error - show empty state instead
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getStatusBadge = (vendor) => {
    if (!vendor)
      return <span className="badge bg-secondary">Not Configured</span>;
    return (
      <span className={`badge bg-${vendor.isActive ? "success" : "warning"}`}>
        {vendor.isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const handleShowLogs = (vendor) => {
    setSelectedLogs(vendor);
    // Simulate logs - in a real app, fetch from backend
    const logs = [
      {
        id: 1,
        timestamp: vendor.createdAt,
        action: "Configuration Created",
        status: "success",
      },
      {
        id: 2,
        timestamp: vendor.updatedAt,
        action: "Configuration Updated",
        status: "success",
      },
      {
        id: 3,
        timestamp: new Date().toISOString(),
        action: "Last Accessed",
        status: "success",
      },
    ];
    setIntegrationLogs(logs);
    setShowLogsModal(true);
  };

  const handleEditVendor = (vendor) => {
    // Edit functionality - can be expanded later
    console.log("Edit vendor:", vendor);
  };

  const handleAddNew = () => {
    // Open modal or navigate to add configuration
    // Removed - configuration is now available
  };

  if (loading) {
    return (
      <Container fluid>
        <Row className="mb-4">
          <Col>
            <h3 className="mb-3">WhatsApp Vendors</h3>
          </Col>
        </Row>
        <div className="text-center py-5">
          <Spinner animation="border" className="mb-3" />
          <p>Loading vendors...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">WhatsApp</h3>
              <p className="text-muted mb-0">Manage your configured WhatsApp</p>
            </div>
          </div>
        </Col>
      </Row>

      {vendors.length === 0 ? (
        <Row>
          <Col>
            <div className="text-center py-5">
              <div className="text-muted mb-3">
                No integrations configured yet
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleAddNew}
              >
                <FiPlus className="me-2" /> Add Configuration
              </Button>
            </div>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Status</th>
                    <th>Integration Date & Time</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td className="fw-semibold">
                        {vendorDetails[vendor.vendor]?.name ||
                          vendor.vendorName}
                      </td>
                      <td>{getStatusBadge(vendor)}</td>
                      <td>
                        <small>{formatDateTime(vendor.createdAt)}</small>
                      </td>
                      <td>
                        <small className="text-muted">
                          {formatDateTime(vendor.updatedAt)}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            title="Edit configuration"
                            onClick={() => handleEditVendor(vendor)}
                          >
                            <FiEdit2 size={16} />
                          </Button>
                          <Button
                            variant="outline-info"
                            size="sm"
                            title="View integration logs"
                            onClick={() => handleShowLogs(vendor)}
                          >
                            <FiEye size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Col>
        </Row>
      )}

      {/* Logs Modal */}
      <Modal
        show={showLogsModal}
        onHide={() => setShowLogsModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Integration Logs -{" "}
            {selectedLogs && vendorDetails[selectedLogs.vendor]?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead className="table-light">
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {integrationLogs.map((log) => (
                  <tr key={log.id}>
                    <td>
                      <small>{formatDateTime(log.timestamp)}</small>
                    </td>
                    <td>{log.action}</td>
                    <td>
                      <span
                        className={`badge bg-${log.status === "success" ? "success" : "danger"}`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowLogsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default VendorSelection;
