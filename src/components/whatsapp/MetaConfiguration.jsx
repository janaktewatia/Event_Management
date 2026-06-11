import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Alert,
  Spinner,
  Card,
} from "react-bootstrap";
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";

const API_BASE_URL = "http://localhost:5000/api";

const MetaConfiguration = ({ vendor, config, onConfigSaved }) => {
  const [formData, setFormData] = useState({
    meta: {
      accessToken: "",
      phoneId: "",
      wabaId: "",
      phoneNumber: "",
    },
    pinnacle: {
      apiKey: "",
      apiSecret: "",
      apiUrl: "",
    },
    interakt: {
      apiKey: "",
      apiUrl: "",
    },
    ai_sency: {
      apiKey: "",
      apiUrl: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    if (config && config[vendor]) {
      setFormData((prev) => ({
        ...prev,
        [vendor]: config[vendor],
      }));
    }
  }, [config, vendor]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [vendor]: {
        ...prev[vendor],
        [name]: value,
      },
    }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateMetaForm = () => {
    const errors = {};
    const { meta } = formData;

    if (!meta.accessToken || meta.accessToken.trim().length === 0) {
      errors.accessToken = "Access Token is required";
    } else if (meta.accessToken.length < 50) {
      errors.accessToken = "Access Token appears to be incomplete (too short)";
    }

    if (!meta.phoneId || meta.phoneId.trim().length === 0) {
      errors.phoneId = "Phone ID is required";
    } else if (!/^\d+$/.test(meta.phoneId)) {
      errors.phoneId = "Phone ID should contain only numbers";
    }

    if (!meta.wabaId || meta.wabaId.trim().length === 0) {
      errors.wabaId = "WABA ID is required";
    } else if (!/^\d+$/.test(meta.wabaId)) {
      errors.wabaId = "WABA ID should contain only numbers";
    }

    return errors;
  };

  const handleTestConnection = async () => {
    if (vendor !== "meta") {
      setTestResult({
        success: false,
        message: "Test connection only available for Meta",
      });
      return;
    }

    const errors = validateMetaForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setTestResult({
        success: false,
        message: "Please fix validation errors before testing",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/whatsapp/test-connection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: formData.meta.accessToken.trim(),
          wabaId: formData.meta.wabaId.trim(),
        }),
      });

      const data = await response.json();
      setTestResult(data);
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: "Network error", 
        error: err.message 
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (vendor === "meta") {
      const errors = validateMetaForm();
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setTestResult({
          success: false,
          message: "Please fix validation errors",
        });
        return;
      }
    }

    setLoading(true);
    setTestResult(null);

    try {
      const payload = {
        vendor,
        ...formData,
      };

      const response = await fetch(`${API_BASE_URL}/whatsapp/config`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setTestResult({
          success: false,
          message: "Failed to save configuration",
          error: result.error || "Unknown error",
        });
        return;
      }

      setValidationErrors({});
      setTestResult({
        success: true,
        message: "Configuration saved successfully!",
      });
      
      onConfigSaved(result.config);
    } catch (err) {
      setTestResult({ 
        success: false, 
        message: "Error saving configuration", 
        error: err.message 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h3 className="mb-2">Configure {vendor.toUpperCase()}</h3>
          <p className="text-muted">
            Enter your {vendor === "meta" ? "Meta WhatsApp" : vendor} credentials
          </p>
        </Col>
      </Row>

      {testResult && (
        <Row className="mb-4">
          <Col>
            <Alert variant={testResult.success ? "success" : "danger"} className="d-flex gap-2">
              <div className="flex-shrink-0">
                {testResult.success ? (
                  <FaCheckCircle size={24} className="text-success" />
                ) : (
                  <FaExclamationTriangle size={24} className="text-danger" />
                )}
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-2">{testResult.message}</h6>
                {testResult.error && (
                  <p className="mb-2 small">{testResult.error}</p>
                )}
              </div>
            </Alert>
          </Col>
        </Row>
      )}

      <Row>
        <Col lg={8}>
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                {vendor === "meta" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        Access Token <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="accessToken"
                        value={formData.meta.accessToken}
                        onChange={handleInputChange}
                        placeholder="Paste your Meta access token here"
                        isInvalid={!!validationErrors.accessToken}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.accessToken}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Found in Meta Business Suite → Settings → System Users → Generate Token
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        Phone ID <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="phoneId"
                        value={formData.meta.phoneId}
                        onChange={handleInputChange}
                        placeholder="e.g., 1115982578276054"
                        isInvalid={!!validationErrors.phoneId}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.phoneId}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Found in WhatsApp Business → API Setup tab → Phone ID
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        WABA ID <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="wabaId"
                        value={formData.meta.wabaId}
                        onChange={handleInputChange}
                        placeholder="e.g., 981013294562418"
                        isInvalid={!!validationErrors.wabaId}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {validationErrors.wabaId}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        WhatsApp Business Account ID from Meta Business Suite → Settings
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Phone Number (Optional)</Form.Label>
                      <Form.Control
                        type="text"
                        name="phoneNumber"
                        value={formData.meta.phoneNumber}
                        onChange={handleInputChange}
                        placeholder="e.g., +1 555 667 2035 (Meta test number)"
                      />
                      <Form.Text className="text-muted">
                        Your WhatsApp business phone number - for reference only. Can be test numbers from Meta.
                      </Form.Text>
                    </Form.Group>

                    <div className="d-flex gap-2 flex-wrap">
                      <Button
                        variant="outline-primary"
                        onClick={handleTestConnection}
                        disabled={testing || !formData.meta.accessToken || !formData.meta.wabaId}
                      >
                        {testing ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Testing...
                          </>
                        ) : (
                          "Test Connection"
                        )}
                      </Button>
                      <Button
                        variant="success"
                        type="submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Configuration"
                        )}
                      </Button>
                    </div>
                  </>
                )}

                {vendor === "pinnacle" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>API Key</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiKey"
                        value={formData.pinnacle.apiKey}
                        onChange={handleInputChange}
                        placeholder="Enter Pinnacle API Key"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>API Secret</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiSecret"
                        value={formData.pinnacle.apiSecret}
                        onChange={handleInputChange}
                        placeholder="Enter Pinnacle API Secret"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>API URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiUrl"
                        value={formData.pinnacle.apiUrl}
                        onChange={handleInputChange}
                        placeholder="https://api.pinnacle.com"
                      />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Configuration"
                      )}
                    </Button>
                  </>
                )}

                {vendor === "interakt" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>API Key</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiKey"
                        value={formData.interakt.apiKey}
                        onChange={handleInputChange}
                        placeholder="Enter Interakt API Key"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>API URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiUrl"
                        value={formData.interakt.apiUrl}
                        onChange={handleInputChange}
                        placeholder="https://api.interakt.com"
                      />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Configuration"
                      )}
                    </Button>
                  </>
                )}

                {vendor === "ai_sency" && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>API Key</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiKey"
                        value={formData.ai_sency.apiKey}
                        onChange={handleInputChange}
                        placeholder="Enter Ai Sency API Key"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>API URL</Form.Label>
                      <Form.Control
                        type="text"
                        name="apiUrl"
                        value={formData.ai_sency.apiUrl}
                        onChange={handleInputChange}
                        placeholder="https://api.ai-sency.com"
                      />
                    </Form.Group>
                    <Button variant="success" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Configuration"
                      )}
                    </Button>
                  </>
                )}
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="bg-light mb-3">
            <Card.Body>
              <h5 className="mb-3">
                <FaInfoCircle className="me-2" />
                Getting Started
              </h5>
              {vendor === "meta" && (
                <div className="small">
                  <h6>Quick Steps:</h6>
                  <ol className="ps-3 mb-0">
                    <li className="mb-2">Go to <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary">Meta Business Suite</a></li>
                    <li className="mb-2">Select Business Account</li>
                    <li className="mb-2">Navigate to WhatsApp app</li>
                    <li className="mb-2">Copy <strong>Phone ID</strong> and <strong>WABA ID</strong></li>
                    <li className="mb-2">Generate <strong>Access Token</strong> with permissions:
                      <ul className="mt-1">
                        <li>whatsapp_business_messaging</li>
                        <li>whatsapp_business_management</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}
            </Card.Body>
          </Card>

          <Card className="bg-warning bg-opacity-10 border-warning">
            <Card.Body>
              <h6 className="mb-2">
                <FaExclamationTriangle className="me-2 text-warning" />
                Note: Test Numbers
              </h6>
              <p className="small mb-0">
                Meta provides test phone numbers like <strong>+1 555 667 2035</strong>. These are valid for testing and development. You can use them in the Phone Number field.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MetaConfiguration;
