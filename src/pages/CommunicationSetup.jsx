import React, { useState, useEffect } from "react";
import { Container, Button, Modal, Form, Alert, Spinner, Badge } from "react-bootstrap";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";
import { BiCheckCircle, BiXCircle } from "react-icons/bi";
import { apiUrl } from "../config";
import "./CommunicationSetup.css";

const CommunicationSetup = () => {
  const [activeTab, setActiveTab] = useState("email");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState(null);

  const [integrations, setIntegrations] = useState({
    email: [],
    sms: [],
    whatsapp: [],
  });

  const [formData, setFormData] = useState({
    provider: "",
    enabled: false,
    sendgridApiKey: "",
    fromEmail: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: "",
    twilioWhatsappNumber: "",
  });

  const [testResults, setTestResults] = useState(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch(`${apiUrl}/integrations/all`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to load integrations" });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      provider: activeTab === "email" ? "sendgrid" : "twilio",
      enabled: false,
      sendgridApiKey: "",
      fromEmail: "",
      twilioAccountSid: "",
      twilioAuthToken: "",
      twilioPhoneNumber: "",
      twilioWhatsappNumber: "",
    });
    setEditingId(null);
    setTestResults(null);
  };

  const handleAddClick = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEditClick = (item) => {
    setFormData(item);
    setEditingId(item._id);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setMessage(null);
    setTimeout(resetForm, 200);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      const endpoint =
        activeTab === "email"
          ? "/test-email"
          : activeTab === "sms"
            ? "/test-sms"
            : "/test-whatsapp";

      const response = await fetch(`${apiUrl}/integrations${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setTestResults({ success: true });
        setMessage({ type: "success", text: "✓ Connection successful!" });
      } else {
        setTestResults({ success: false, error: data.error });
        setMessage({
          type: "danger",
          text: `✗ ${data.error || "Connection failed"}`,
        });
      }
    } catch (error) {
      setTestResults({ success: false, error: error.message });
      setMessage({ type: "danger", text: `✗ ${error.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const endpoint = editingId
        ? `/integrations/${editingId}`
        : `/integrations/${activeTab}`;
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: activeTab }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: "success", text: "Saved successfully!" });
        setTimeout(() => {
          handleCloseModal();
          fetchIntegrations();
        }, 1500);
      } else {
        setMessage({ type: "danger", text: data.error || "Failed to save" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this integration?"
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/integrations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Deleted successfully!" });
        fetchIntegrations();
      } else {
        setMessage({ type: "danger", text: "Failed to delete" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: error.message });
    }
  };

  const getTabLabel = (type) => {
    switch (type) {
      case "email":
        return "Email";
      case "sms":
        return "SMS";
      case "whatsapp":
        return "WhatsApp";
      default:
        return type;
    }
  };

  const getStatusColor = (enabled) => (enabled ? "success" : "secondary");
  const getStatusText = (enabled) => (enabled ? "Active" : "Inactive");

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  const currentData = integrations[activeTab] || [];

  return (
    <Container className="communication-setup py-4">
      <div className="setup-header mb-4">
        <h1 className="fw-bold mb-2">Communication Setup</h1>
        <p className="text-muted">Configure email, SMS, and WhatsApp integrations</p>
      </div>

      {message && (
        <Alert
          variant={message.type}
          dismissible
          onClose={() => setMessage(null)}
          className="mb-4"
        >
          {message.text}
        </Alert>
      )}

      {/* Tabs */}
      <div className="mb-4">
        <ul className="nav nav-tabs" role="tablist">
          {["email", "sms", "whatsapp"].map((type) => (
            <li className="nav-item" key={type} role="presentation">
              <button
                className={`nav-link ${activeTab === type ? "active" : ""}`}
                onClick={() => setActiveTab(type)}
                role="tab"
                aria-selected={activeTab === type}
              >
                {getTabLabel(type)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Button */}
      <div className="mb-3">
        <Button
          variant="primary"
          size="sm"
          onClick={handleAddClick}
          className="d-flex align-items-center gap-2"
        >
          <FiPlus size={18} />
          Add {getTabLabel(activeTab)} Integration
        </Button>
      </div>

      {/* Table */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Provider</th>
                  <th>Configuration</th>
                  <th>Status</th>
                  <th>Connection</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-5 text-muted">
                      No {getTabLabel(activeTab).toLowerCase()} integrations configured.
                      Click <strong>Add</strong> to create one.
                    </td>
                  </tr>
                ) : (
                  currentData.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="fw-semibold">{item.provider}</div>
                      </td>
                      <td>
                        <div className="small">
                          {activeTab === "email" && (
                            <>
                              <div>{item.fromEmail || "Not configured"}</div>
                            </>
                          )}
                          {activeTab === "sms" && (
                            <>
                              <div>{item.twilioPhoneNumber || "Not configured"}</div>
                            </>
                          )}
                          {activeTab === "whatsapp" && (
                            <>
                              <div>{item.twilioWhatsappNumber || "Not configured"}</div>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <Badge bg={getStatusColor(item.enabled)}>
                          {getStatusText(item.enabled)}
                        </Badge>
                      </td>
                      <td>
                        {item.enabled ? (
                          <div className="d-flex align-items-center gap-2">
                            {item.lastTestStatus === "success" ? (
                              <>
                                <BiCheckCircle className="text-success" size={18} />
                                <span className="small text-muted">Connected</span>
                              </>
                            ) : item.lastTestStatus === "failed" ? (
                              <>
                                <BiXCircle className="text-danger" size={18} />
                                <span className="small text-muted">Failed</span>
                              </>
                            ) : (
                              <span className="small text-muted">⚠️ Untested</span>
                            )}
                          </div>
                        ) : (
                          <span className="small text-muted">—</span>
                        )}
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleEditClick(item)}
                            className="d-flex align-items-center gap-1"
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDelete(item._id)}
                            className="d-flex align-items-center gap-1"
                          >
                            <FiTrash2 size={14} />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingId
              ? `Edit ${getTabLabel(activeTab)} Integration`
              : `Add ${getTabLabel(activeTab)} Integration`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {message && (
            <Alert
              variant={message.type}
              dismissible
              onClose={() => setMessage(null)}
            >
              {message.text}
            </Alert>
          )}

          <Form>
            {activeTab === "email" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Provider</Form.Label>
                  <Form.Select
                    name="provider"
                    value={formData.provider}
                    onChange={handleInputChange}
                  >
                    <option value="sendgrid">SendGrid</option>
                    <option value="zoho">Zoho Mail</option>
                  </Form.Select>
                </Form.Group>

                {formData.provider === "sendgrid" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>SendGrid API Key</Form.Label>
                      <Form.Control
                        type="password"
                        name="sendgridApiKey"
                        value={formData.sendgridApiKey}
                        onChange={handleInputChange}
                        placeholder="SG.xxxxxxxxxxxxxx"
                      />
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Label>From Email Address</Form.Label>
                      <Form.Control
                        type="email"
                        name="fromEmail"
                        value={formData.fromEmail}
                        onChange={handleInputChange}
                        placeholder="noreply@yourdomain.com"
                      />
                    </Form.Group>
                  </>
                )}
              </>
            )}

            {activeTab === "sms" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Twilio Account SID</Form.Label>
                  <Form.Control
                    type="text"
                    name="twilioAccountSid"
                    value={formData.twilioAccountSid}
                    onChange={handleInputChange}
                    placeholder="ACxxxxxxxxxxxxx"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Twilio Auth Token</Form.Label>
                  <Form.Control
                    type="password"
                    name="twilioAuthToken"
                    value={formData.twilioAuthToken}
                    onChange={handleInputChange}
                    placeholder="Your auth token"
                  />
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label>Twilio Phone Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="twilioPhoneNumber"
                    value={formData.twilioPhoneNumber}
                    onChange={handleInputChange}
                    placeholder="+1234567890"
                  />
                </Form.Group>
              </>
            )}

            {activeTab === "whatsapp" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Twilio Account SID</Form.Label>
                  <Form.Control
                    type="text"
                    name="twilioAccountSid"
                    value={formData.twilioAccountSid}
                    onChange={handleInputChange}
                    placeholder="ACxxxxxxxxxxxxx"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Twilio Auth Token</Form.Label>
                  <Form.Control
                    type="password"
                    name="twilioAuthToken"
                    value={formData.twilioAuthToken}
                    onChange={handleInputChange}
                    placeholder="Your auth token"
                  />
                </Form.Group>

                <Form.Group className="mb-0">
                  <Form.Label>Twilio WhatsApp Number</Form.Label>
                  <Form.Control
                    type="tel"
                    name="twilioWhatsappNumber"
                    value={formData.twilioWhatsappNumber}
                    onChange={handleInputChange}
                    placeholder="whatsapp:+1234567890"
                  />
                </Form.Group>
              </>
            )}

            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="enabledCheckbox"
                name="enabled"
                checked={formData.enabled}
                onChange={handleInputChange}
              />
              <label className="form-check-label" htmlFor="enabledCheckbox">
                Enable this integration
              </label>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button
            variant="outline-primary"
            onClick={handleTestConnection}
            disabled={testing || !formData.enabled}
            className="d-flex align-items-center gap-2"
          >
            {testing ? <Spinner size="sm" /> : <>⚡ Test</>}
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            className="d-flex align-items-center gap-2"
          >
            {saving ? <Spinner size="sm" /> : <>✓ Save</>}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CommunicationSetup;
