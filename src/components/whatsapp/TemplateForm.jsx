import React, { useState, useEffect } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  ListGroup,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";

const TemplateForm = ({ template, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    templateName: "",
    category: "UTILITY",
    language: "en",
    headerType: "TEXT",
    headerContent: { text: "", mediaUrl: "", mediaType: "" },
    bodyText: "",
    footerText: "",
    buttons: [],
    variables: [],
  });

  const [newVariable, setNewVariable] = useState({ name: "", type: "text", position: "body" });
  const [newButton, setNewButton] = useState({
    type: "QUICK_REPLY",
    buttonText: "",
    actionType: "CALL",
    actionValue: "",
    isDynamic: false,
  });

  useEffect(() => {
    if (template) {
      setFormData(template);
    }
  }, [template]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleHeaderContentChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      headerContent: { ...prev.headerContent, [name]: value },
    }));
  };

  const handleAddVariable = () => {
    if (newVariable.name) {
      setFormData((prev) => ({
        ...prev,
        variables: [...prev.variables, { ...newVariable, sampleValue: "" }],
      }));
      setNewVariable({ name: "", type: "text", position: "body" });
    }
  };

  const handleRemoveVariable = (index) => {
    setFormData((prev) => ({
      ...prev,
      variables: prev.variables.filter((_, i) => i !== index),
    }));
  };

  const handleAddButton = () => {
    if (newButton.buttonText) {
      setFormData((prev) => ({
        ...prev,
        buttons: [...prev.buttons, newButton],
      }));
      setNewButton({
        type: "QUICK_REPLY",
        buttonText: "",
        actionType: "CALL",
        actionValue: "",
        isDynamic: false,
      });
    }
  };

  const handleRemoveButton = (index) => {
    setFormData((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== index),
    }));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          headerContent: {
            ...prev.headerContent,
            mediaUrl: event.target.result,
            mediaType: formData.headerType,
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Tabs defaultActiveKey="basic" className="mb-4">
        <Tab eventKey="basic" title="Basic Info">
          <div className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Template Name</Form.Label>
              <Form.Control
                type="text"
                name="templateName"
                value={formData.templateName}
                onChange={handleInputChange}
                placeholder="e.g., Order Confirmation"
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Language</Form.Label>
                  <Form.Control
                    type="text"
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                    placeholder="en"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>
        </Tab>

        <Tab eventKey="header" title="Message Header">
          <div className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Header Type</Form.Label>
              <Form.Select
                name="headerType"
                value={formData.headerType}
                onChange={handleInputChange}
              >
                <option value="TEXT">Text</option>
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="DOCUMENT">Document</option>
              </Form.Select>
            </Form.Group>

            {formData.headerType === "TEXT" ? (
              <Form.Group className="mb-3">
                <Form.Label>Header Text</Form.Label>
                <Form.Control
                  type="text"
                  name="text"
                  value={formData.headerContent.text}
                  onChange={handleHeaderContentChange}
                  placeholder="Enter header text"
                />
              </Form.Group>
            ) : (
              <Form.Group className="mb-3">
                <Form.Label>Upload Media</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleMediaUpload}
                />
                {formData.headerContent.mediaUrl && (
                  <div className="mt-2">
                    <small className="text-success">✓ Media uploaded</small>
                  </div>
                )}
              </Form.Group>
            )}
          </div>
        </Tab>

        <Tab eventKey="body" title="Message Body">
          <div className="p-3">
            <Form.Group className="mb-3">
              <Form.Label>Body Text</Form.Label>
              <Form.Control
                as="textarea"
                name="bodyText"
                value={formData.bodyText}
                onChange={handleInputChange}
                rows={4}
                placeholder="Enter message body. Use {{variable}} for dynamic content"
                required
              />
              <Form.Text className="text-muted">
                Use double curly braces like this: &#123;&#123;firstName&#125;&#125; for variables
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Footer Text (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="footerText"
                value={formData.footerText}
                onChange={handleInputChange}
                placeholder="Optional footer text"
              />
            </Form.Group>
          </div>
        </Tab>

        <Tab eventKey="variables" title="Variables">
          <div className="p-3">
            <Card className="mb-4 bg-light">
              <Card.Body>
                <h6 className="mb-3">Add Variables</h6>
                <Row>
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Variable name"
                      value={newVariable.name}
                      onChange={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={newVariable.type}
                      onChange={(e) =>
                        setNewVariable((prev) => ({
                          ...prev,
                          type: e.target.value,
                        }))
                      }
                    >
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Button
                      variant="primary"
                      onClick={handleAddVariable}
                      className="w-100"
                    >
                      <FaPlus className="me-2" />
                      Add
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {formData.variables.length > 0 && (
              <ListGroup>
                {formData.variables.map((variable, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{variable.name}</strong>
                      <br />
                      <small className="text-muted">{variable.type}</small>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveVariable(index)}
                    >
                      <FaTrash />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Tab>

        <Tab eventKey="buttons" title="Buttons">
          <div className="p-3">
            <Card className="mb-4 bg-light">
              <Card.Body>
                <h6 className="mb-3">Add Button</h6>
                <Form.Group className="mb-3">
                  <Form.Label>Button Text</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Call Now"
                    value={newButton.buttonText}
                    onChange={(e) =>
                      setNewButton((prev) => ({
                        ...prev,
                        buttonText: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Action Type</Form.Label>
                  <Form.Select
                    value={newButton.actionType}
                    onChange={(e) =>
                      setNewButton((prev) => ({
                        ...prev,
                        actionType: e.target.value,
                      }))
                    }
                  >
                    <option value="CALL">Call (Phone Number)</option>
                    <option value="WEBSITE">Website URL</option>
                    <option value="QUICK_REPLY">Quick Reply</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Action Value</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter value..."
                    value={newButton.actionValue}
                    onChange={(e) =>
                      setNewButton((prev) => ({
                        ...prev,
                        actionValue: e.target.value,
                      }))
                    }
                  />
                </Form.Group>

                {newButton.actionType === "WEBSITE" && (
                  <Form.Check
                    type="checkbox"
                    label="Dynamic URL (use variables)"
                    checked={newButton.isDynamic}
                    onChange={(e) =>
                      setNewButton((prev) => ({
                        ...prev,
                        isDynamic: e.target.checked,
                      }))
                    }
                  />
                )}

                <Button
                  variant="primary"
                  onClick={handleAddButton}
                  className="w-100 mt-3"
                >
                  <FaPlus className="me-2" />
                  Add Button
                </Button>
              </Card.Body>
            </Card>

            {formData.buttons.length > 0 && (
              <ListGroup>
                {formData.buttons.map((button, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{button.buttonText}</strong>
                      <br />
                      <small className="text-muted">
                        {button.actionType}: {button.actionValue}
                      </small>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveButton(index)}
                    >
                      <FaTrash />
                    </Button>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </Tab>
      </Tabs>

      <div className="d-flex gap-2 justify-content-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="success" type="submit">
          Save Template
        </Button>
      </div>
    </Form>
  );
};

export default TemplateForm;
