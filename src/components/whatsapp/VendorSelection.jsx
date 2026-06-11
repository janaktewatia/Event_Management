import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { SiWhatsapp } from "react-icons/si";
import "./whatsapp-styles.css";

const VendorSelection = ({ selectedVendor, onSelectVendor }) => {
  const vendors = [
    {
      id: "meta",
      name: "Meta WhatsApp Business",
      description: "Official WhatsApp Business API from Meta",
      icon: <SiWhatsapp size={40} className="text-success mb-3" />,
      features: ["Official API", "Template Approval", "Full Feature Set"],
    },
    {
      id: "pinnacle",
      name: "Pinnacle",
      description: "Pinnacle WhatsApp Integration",
      icon: <SiWhatsapp size={40} className="text-info mb-3" />,
      features: ["Custom Integration", "Flexible Setup"],
    },
    {
      id: "interakt",
      name: "Interakt",
      description: "Interakt WhatsApp Platform",
      icon: <SiWhatsapp size={40} className="text-warning mb-3" />,
      features: ["Easy Integration", "Support"],
    },
    {
      id: "ai_sency",
      name: "Ai Sency",
      description: "Ai Sency WhatsApp Integration",
      icon: <SiWhatsapp size={40} className="text-primary mb-3" />,
      features: ["AI Features", "Advanced Analytics"],
    },
  ];

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h3 className="mb-3">Select WhatsApp Vendor</h3>
          <p className="text-muted">
            Choose your preferred WhatsApp Business Platform
          </p>
        </Col>
      </Row>

      <Row className="g-4">
        {vendors.map((vendor) => (
          <Col key={vendor.id} md={6} lg={3}>
            <Card
              className={`vendor-card cursor-pointer h-100 ${
                selectedVendor === vendor.id ? "selected" : ""
              }`}
              onClick={() => onSelectVendor(vendor.id)}
            >
              <Card.Body className="text-center">
                {vendor.icon}
                <Card.Title className="mb-2">{vendor.name}</Card.Title>
                <Card.Text className="text-muted small mb-3">
                  {vendor.description}
                </Card.Text>
                <ul className="list-unstyled small mb-3">
                  {vendor.features.map((feature, idx) => (
                    <li key={idx} className="mb-1">
                      ✓ {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={selectedVendor === vendor.id ? "success" : "outline-primary"}
                  size="sm"
                  className="w-100"
                >
                  {selectedVendor === vendor.id ? "Selected" : "Select"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default VendorSelection;
