import React, { useState, useEffect } from "react";
import { Container, Tabs, Tab, Table, Button, Modal, Form, Alert, Spinner } from "react-bootstrap";
import { apiUrl } from "../config";
import "./CommunicationTemplatesPage.css";

const CommunicationTemplatesPage = () => {
  const [templates, setTemplates] = useState({ email: [], sms: [], whatsapp: [] });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("email");
  const [formData, setFormData] = useState({ name: "", subject: "", content: "", description: "" });
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/communication-templates`);
      if (response.ok) {
        const data = await response.json();
        const grouped = { email: [], sms: [], whatsapp: [] };
        data.forEach((template) => {
          grouped[template.type].push(template);
        });
        setTemplates(grouped);
      }
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to load templates" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        name: template.name,
        subject: template.subject || "",
        content: template.content,
        description: template.description || "",
      });
    } else {
      setEditingTemplate(null);
      setFormData({ name: "", subject: "", content: "", description: "" });
    }
    setShowModal(true);
    setMessage(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTemplate(null);
    setFormData({ name: "", subject: "", content: "", description: "" });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveTemplate = async () => {
    if (!formData.name || !formData.content) {
      setMessage({ type: "warning", text: "Name and content are required" });
      return;
    }

    setSaving(true);
    try {
      const method = editingTemplate ? "PUT" : "POST";
      const url = editingTemplate
        ? `${apiUrl}/communication-templates/${editingTemplate._id}`
        : `${apiUrl}/communication-templates`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          type: activeTab,
        }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: editingTemplate ? "Template updated successfully!" : "Template created successfully!",
        });
        setTimeout(() => {
          fetchTemplates();
          handleCloseModal();
        }, 1000);
      } else {
        setMessage({ type: "danger", text: "Failed to save template" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`${apiUrl}/communication-templates/${templateId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Template deleted successfully!" });
        fetchTemplates();
      } else {
        setMessage({ type: "danger", text: "Failed to delete template" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: error.message });
    }
  };

  const handleDuplicateTemplate = async (templateId) => {
    try {
      const response = await fetch(`${apiUrl}/communication-templates/${templateId}/duplicate`, {
        method: "POST",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Template duplicated successfully!" });
        fetchTemplates();
      } else {
        setMessage({ type: "danger", text: "Failed to duplicate template" });
      }
    } catch (error) {
      setMessage({ type: "danger", text: error.message });
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="communication-templates-container mt-4 mb-4">
      <div className="templates-header mb-4">
        <h1>Communication Templates</h1>
        <p className="text-muted">Create and manage email, SMS, and WhatsApp templates</p>
        <Button variant="primary" onClick={() => handleOpenModal()} className="mt-2">
          ➕ Create New Template
        </Button>
      </div>

      {message && (
        <Alert variant={message.type} dismissible onClose={() => setMessage(null)} className="mb-3">
          {message.text}
        </Alert>
      )}

      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
        <Tab eventKey="email" title="📧 Email Templates">
          <TemplatesTable
            templates={templates.email}
            type="email"
            onEdit={handleOpenModal}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            onCreateNew={() => handleOpenModal()}
          />
        </Tab>
        <Tab eventKey="sms" title="📱 SMS Templates">
          <TemplatesTable
            templates={templates.sms}
            type="sms"
            onEdit={handleOpenModal}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            onCreateNew={() => handleOpenModal()}
          />
        </Tab>
        <Tab eventKey="whatsapp" title="💬 WhatsApp Templates">
          <TemplatesTable
            templates={templates.whatsapp}
            type="whatsapp"
            onEdit={handleOpenModal}
            onDelete={handleDeleteTemplate}
            onDuplicate={handleDuplicateTemplate}
            onCreateNew={() => handleOpenModal()}
          />
        </Tab>
      </Tabs>

      {/* Create/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editingTemplate ? "Edit Template" : "Create New Template"} - {activeTab.toUpperCase()}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Template Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Event Confirmation"
              />
            </Form.Group>

            {activeTab === "email" && (
              <Form.Group className="mb-3">
                <Form.Label>Email Subject *</Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Welcome to our event"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Content *</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="Enter your template content..."
              />
              {activeTab === "sms" && (
                <small className="text-muted">Character count: {formData.content.length} (SMS limit: 160)</small>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Add a description for this template"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveTemplate} disabled={saving}>
            {saving ? <Spinner size="sm" className="me-2" /> : "💾"} Save Template
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

const TemplatesTable = ({ templates, type, onEdit, onDelete, onDuplicate, onCreateNew }) => {
  if (templates.length === 0) {
    return (
      <div className="text-center py-5">
        <p className="text-muted">No templates created yet</p>
        <Button variant="primary" size="sm" onClick={onCreateNew}>
          ➕ Create your first template
        </Button>
      </div>
    );
  }

  return (
    <div className="templates-table mt-3">
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Template Name</th>
            <th>Description</th>
            {type === "email" && <th>Subject</th>}
            <th>Preview</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => (
            <tr key={template._id}>
              <td>
                <strong>{template.name}</strong>
              </td>
              <td>
                <small>{template.description || "-"}</small>
              </td>
              {type === "email" && (
                <td>
                  <small>{template.subject || "-"}</small>
                </td>
              )}
              <td>
                <small className="text-muted text-truncate d-block" style={{ maxWidth: "200px" }}>
                  {template.content.substring(0, 50)}...
                </small>
              </td>
              <td>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={() => onEdit(template)}
                  className="me-2"
                  title="Edit"
                >
                  ✏️
                </Button>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => onDuplicate(template._id)}
                  className="me-2"
                  title="Duplicate"
                >
                  📋
                </Button>
                <Button
                  size="sm"
                  variant="outline-danger"
                  onClick={() => onDelete(template._id)}
                  title="Delete"
                >
                  🗑️
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CommunicationTemplatesPage;
