import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav, Tab, Alert } from "react-bootstrap";
import VendorSelection from "../components/whatsapp/VendorSelection";
import MetaConfiguration from "../components/whatsapp/MetaConfiguration";
import TemplateManager from "../components/whatsapp/TemplateManager";
import FetchMetaTemplates from "../components/whatsapp/FetchMetaTemplates";
import "./WhatsAppIntegration.css";

const WhatsAppIntegration = () => {
  const [activeTab, setActiveTab] = useState("vendor-selection");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [config, setConfig] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch("/api/whatsapp/config");
      const data = await response.json();
      if (data._id) {
        setConfig(data);
        setSelectedVendor(data.vendor);
      }
    } catch (err) {
      console.error("Error fetching config:", err);
    }
  };

  const handleVendorSelect = (vendor) => {
    setSelectedVendor(vendor);
    setActiveTab("configuration");
  };

  const handleConfigSaved = (newConfig) => {
    setConfig(newConfig);
    setMessage({
      type: "success",
      text: "Configuration saved successfully!",
    });
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <Container fluid className="whatsapp-integration-page py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-2">WhatsApp Integration</h1>
          <p className="text-muted">
            Configure WhatsApp vendor and manage message templates
          </p>
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
          <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
            <Nav variant="pills" className="mb-4">
              <Nav.Item>
                <Nav.Link eventKey="vendor-selection">
                  1. Select Vendor
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="configuration" disabled={!selectedVendor}>
                  2. Configure
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="templates" disabled={!config}>
                  3. Templates
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="fetch-templates" disabled={!config || selectedVendor !== "meta"}>
                  4. Fetch from Meta
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content>
              <Tab.Pane eventKey="vendor-selection">
                <VendorSelection
                  selectedVendor={selectedVendor}
                  onSelectVendor={handleVendorSelect}
                />
              </Tab.Pane>

              <Tab.Pane eventKey="configuration">
                {selectedVendor && (
                  <MetaConfiguration
                    vendor={selectedVendor}
                    config={config}
                    onConfigSaved={handleConfigSaved}
                  />
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="templates">
                {config && (
                  <TemplateManager
                    config={config}
                    vendor={selectedVendor}
                  />
                )}
              </Tab.Pane>

              <Tab.Pane eventKey="fetch-templates">
                {config && selectedVendor === "meta" && (
                  <FetchMetaTemplates config={config} />
                )}
              </Tab.Pane>
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default WhatsAppIntegration;
