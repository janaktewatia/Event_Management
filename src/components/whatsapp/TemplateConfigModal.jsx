import React, { useState } from "react";
import {
  Modal,
  Form,
  Button,
  Row,
  Col,
  ListGroup,
  Card,
} from "react-bootstrap";
import { FaPlus, FaTrash } from "react-icons/fa";

const TemplateConfigModal = ({ show, template, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    variables: [],
    mediaUrl: "",
    customVariables: [],
  });

  const [newVar, setNewVar] = useState({ name: "", position: "body", type: "text" });

  const handleAddVariable = () => {
    if (newVar.name) {
      setFormData((prev) => ({
        ...prev,
        customVariables: [...prev.customVariables, newVar],
      }));
      setNewVar({ name: "", position: "body", type: "text" });
    }
  };

  const handleRemoveVariable = (index) => {
    setFormData((prev) => ({
      ...prev,
      customVariables: prev.customVariables.filter((_, i) => i !== index),
    }));
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          mediaUrl: event.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const extractVariables = (text) => {
    const regex = /\{\{(\w+)\}\}/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push(match[1]);
    }
    return [...new Set(matches)];
  };

  const bodyVariables = extractVariables(template.bodyText || "");

  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Configure Template: {template.templateName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Card className="mb-4 bg-light">
            <Card.Body>
              <h6>Template Preview</h6>
              <div className="bg-white p-3 rounded border">
                {template.headerType !== "TEXT" && (
                  <div className="mb-2">
                    <small className="text-muted">[Media: {template.headerType}]</small>
                  </div>
                )}
                <p className="mb-2">{template.bodyText}</p>
                {template.footerText && (
                  <p className="small text-muted">{template.footerText}</p>
                )}
              </div>
            </Card.Body>
          </Card>

          {template.headerType !== "TEXT" && (
            <Form.Group className="mb-4">
              <Form.Label>Upload Media</Form.Label>
              <Form.Control
                type="file"
                onChange={handleMediaUpload}
              />
              {formData.mediaUrl && (
                <div className="mt-2">
                  <small className="text-success">✓ Media uploaded</small>
                </div>
              )}
            </Form.Group>
          )}

          {bodyVariables.length > 0 && (
            <div className="mb-4 p-3 bg-info bg-opacity-10 rounded">
              <h6 className="mb-2">Variables detected in message body:</h6>
              <ul className="mb-0 ps-3">
                {bodyVariables.map((variable) => (
                  <li key={variable}>{variable}</li>
                ))}
              </ul>
            </div>
          )}

          <Form.Group className="mb-4">
            <Form.Label className="mb-3">Add Custom Variables</Form.Label>
            <Card className="bg-light mb-3">
              <Card.Body>
                <Row className="g-2">
                  <Col md={4}>
                    <Form.Control
                      type="text"
                      placeholder="Variable name"
                      value={newVar.name}
                      onChange={(e) =>
                        setNewVar((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                    />
                  </Col>
                  <Col md={4}>
                    <Form.Select
                      value={newVar.position}
                      onChange={(e) =>
                        setNewVar((prev) => ({
                          ...prev,
                          position: e.target.value,
                        }))
                      }
                    >
                      <option value="header">Header</option>
                      <option value="body">Body</option>
                      <option value="footer">Footer</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <Button variant="primary" onClick={handleAddVariable} className="w-100">
                      <FaPlus className="me-2" />
                      Add
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {formData.customVariables.length > 0 && (
              <ListGroup>
                {formData.customVariables.map((variable, index) => (
                  <ListGroup.Item
                    key={index}
                    className="d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>{variable.name}</strong>
                      <br />
                      <small className="text-muted">Position: {variable.position}</small>
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
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleSubmit}>
          Save Configuration
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default TemplateConfigModal;
