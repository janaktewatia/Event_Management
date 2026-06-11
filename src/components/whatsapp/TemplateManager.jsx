import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Alert,
  Badge,
} from "react-bootstrap";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import TemplateForm from "./TemplateForm";

const API_BASE_URL = "http://localhost:5000/api";

const TemplateManager = ({ config, vendor }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, [vendor]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/whatsapp/templates?vendor=${vendor}`);
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/templates/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete template");

      setTemplates((prev) => prev.filter((t) => t._id !== id));
      setMessage({ type: "success", text: "Template deleted successfully!" });
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setShowForm(true);
  };

  const handleNew = () => {
    setSelectedTemplate(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedTemplate(null);
  };

  const handleFormSave = async (formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          vendor,
          templateId: selectedTemplate?._id,
        }),
      });

      if (!response.ok) throw new Error("Failed to save template");

      const saved = await response.json();
      if (selectedTemplate) {
        setTemplates((prev) =>
          prev.map((t) => (t._id === saved.template._id ? saved.template : t))
        );
      } else {
        setTemplates((prev) => [saved.template, ...prev]);
      }

      setMessage({ type: "success", text: "Template saved successfully!" });
      handleFormClose();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: "danger", text: err.message });
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      APPROVED: "success",
      PENDING_REVIEW: "warning",
      REJECTED: "danger",
      DISABLED: "secondary",
      PENDING_DELETION: "dark",
    };
    return <Badge bg={variants[status] || "secondary"}>{status}</Badge>;
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h3 className="mb-2">WhatsApp Templates</h3>
          <p className="text-muted">Create and manage your WhatsApp message templates</p>
        </Col>
        <Col className="text-end">
          <Button variant="success" onClick={handleNew}>
            <FaPlus className="me-2" />
            Create Template
          </Button>
        </Col>
      </Row>

      {message && (
        <Row className="mb-4">
          <Col>
            <Alert variant={message.type}>{message.text}</Alert>
          </Col>
        </Row>
      )}

      {loading ? (
        <Row>
          <Col className="text-center py-5">
            <p>Loading templates...</p>
          </Col>
        </Row>
      ) : templates.length === 0 ? (
        <Row>
          <Col className="text-center py-5">
            <p className="text-muted mb-3">No templates yet. Create one to get started!</p>
            <Button variant="success" onClick={handleNew}>
              <FaPlus className="me-2" />
              Create First Template
            </Button>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Template Name</th>
                    <th>Category</th>
                    <th>Header Type</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((template) => (
                    <tr key={template._id}>
                      <td>
                        <strong>{template.templateName}</strong>
                      </td>
                      <td>
                        <Badge bg={template.category === "UTILITY" ? "info" : "warning"}>
                          {template.category}
                        </Badge>
                      </td>
                      <td>{template.headerType}</td>
                      <td>{getStatusBadge(template.metaStatus)}</td>
                      <td className="small">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <Button
                          variant="primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEdit(template)}
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(template._id)}
                        >
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Col>
        </Row>
      )}

      <Modal show={showForm} onHide={handleFormClose} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedTemplate ? "Edit Template" : "Create New Template"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <TemplateForm
            template={selectedTemplate}
            onSave={handleFormSave}
            onCancel={handleFormClose}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TemplateManager;
