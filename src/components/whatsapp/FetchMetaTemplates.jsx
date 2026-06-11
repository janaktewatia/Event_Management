import React, { useState } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  Alert,
  Spinner,
  Badge,
  ListGroup,
} from "react-bootstrap";
import { FaSync, FaCog } from "react-icons/fa";
import TemplateConfigModal from "./TemplateConfigModal";

const API_BASE_URL = "http://localhost:5000/api";

const FetchMetaTemplates = ({ config }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const handleFetchTemplates = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/templates/fetch-meta`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Failed to fetch templates");
      }

      setTemplates(data.templates || []);
      setMessage({
        type: "success",
        text: `Fetched ${data.templates?.length || 0} templates from Meta`,
      });
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureTemplate = (template) => {
    setSelectedTemplate(template);
    setShowConfigModal(true);
  };

  const handleSaveTemplate = async (configData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...selectedTemplate,
          ...configData,
          vendor: "meta",
        }),
      });

      if (!response.ok) throw new Error("Failed to save template");

      setMessage({
        type: "success",
        text: "Template configured and saved!",
      });
      setShowConfigModal(false);
    } catch (err) {
      setMessage({
        type: "danger",
        text: err.message,
      });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      APPROVED: "success",
      PENDING_REVIEW: "warning",
      REJECTED: "danger",
      DISABLED: "secondary",
      PENDING_DELETION: "dark",
    };
    return colors[status] || "secondary";
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h3 className="mb-2">Fetch Meta WhatsApp Templates</h3>
          <p className="text-muted">
            Import and configure templates from your Meta WhatsApp Business Account
          </p>
        </Col>
        <Col className="text-end">
          <Button
            variant="primary"
            onClick={handleFetchTemplates}
            disabled={loading}
            size="lg"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Fetching...
              </>
            ) : (
              <>
                <FaSync className="me-2" />
                Fetch Templates from Meta
              </>
            )}
          </Button>
        </Col>
      </Row>

      {message && (
        <Row className="mb-4">
          <Col>
            <Alert variant={message.type} dismissible>
              {message.text}
            </Alert>
          </Col>
        </Row>
      )}

      {templates.length === 0 ? (
        <Row>
          <Col className="text-center py-5">
            <p className="text-muted mb-3">
              No templates fetched yet. Click the button above to fetch your Meta WhatsApp
              templates.
            </p>
          </Col>
        </Row>
      ) : (
        <Row className="g-4">
          {templates.map((template, index) => (
            <Col key={index} md={6} lg={4}>
              <Card className="h-100 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="mb-0 flex-grow-1">
                      {template.templateName}
                    </Card.Title>
                    <Badge bg={getStatusColor(template.metaStatus)}>
                      {template.metaStatus}
                    </Badge>
                  </div>

                  <Card.Text className="text-muted small mb-3">
                    {template.category}
                  </Card.Text>

                  <div className="mb-3">
                    <h6 className="small mb-2">Message Preview:</h6>
                    <div className="bg-light p-2 rounded small" style={{ minHeight: "80px" }}>
                      {template.bodyText}
                    </div>
                  </div>

                  <ListGroup variant="flush" className="mb-3">
                    <ListGroup.Item className="px-0 py-1">
                      <small>
                        <strong>Header Type:</strong> {template.headerType}
                      </small>
                    </ListGroup.Item>
                    <ListGroup.Item className="px-0 py-1">
                      <small>
                        <strong>Language:</strong> {template.language}
                      </small>
                    </ListGroup.Item>
                  </ListGroup>

                  <Button
                    variant="primary"
                    className="w-100"
                    onClick={() => handleConfigureTemplate(template)}
                  >
                    <FaCog className="me-2" />
                    Configure & Save
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {selectedTemplate && (
        <TemplateConfigModal
          show={showConfigModal}
          template={selectedTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setShowConfigModal(false)}
        />
      )}
    </Container>
  );
};

export default FetchMetaTemplates;
