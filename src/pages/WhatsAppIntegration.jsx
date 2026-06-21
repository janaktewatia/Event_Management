import React, { useState } from "react";
import { Container, Row, Col, Alert } from "react-bootstrap";
import VendorSelection from "../components/whatsapp/VendorSelection";
import "./WhatsAppIntegration.css";

const WhatsAppIntegration = () => {
  const [message, setMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConfigSaved = (newConfig) => {
    setMessage({
      type: "success",
      text: "Configuration saved successfully!",
    });
    setTimeout(() => setMessage(null), 3000);

    // Refresh vendor list by updating key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Container fluid className="whatsapp-integration-page py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">WhatsApp Integration</h1>
          <p className="text-muted">Manage your configured WhatsApp</p>
        </Col>
      </Row>

      {message && (
        <Row className="mb-4">
          <Col>
            <Alert variant={message.type}>{message.text}</Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col>
          <VendorSelection key={refreshKey} onConfigSaved={handleConfigSaved} />
        </Col>
      </Row>
    </Container>
  );
};

export default WhatsAppIntegration;
