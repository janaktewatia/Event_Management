import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner, Alert } from "react-bootstrap";
import { apiUrl } from "../config";

const SendCommunicationModal = ({
  show,
  onHide,
  eventId,
  attendees = [],
  onSuccess,
  initialType = null,
}) => {
  const [communicationType, setCommunicationType] = useState(initialType);
  const [template, setTemplate] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [alertMessage, setAlertMessage] = useState(null);
  const [selectedCount, setSelectedCount] = useState(attendees.length);

  useEffect(() => {
    if (show) {
      setCommunicationType(initialType);
    }
  }, [show, initialType]);

  const templates = {
    email: [
      { label: "Event Confirmation", value: "eventConfirmation" },
      { label: "Event Reminder", value: "eventReminder" },
      { label: "Attendance Confirmation", value: "attendanceConfirmation" },
      { label: "Custom", value: "custom" },
    ],
    sms: [
      { label: "Event Confirmation", value: "eventConfirmation" },
      { label: "Event Reminder", value: "eventReminder" },
      { label: "Attendance Confirmation", value: "attendanceConfirmation" },
      { label: "Custom", value: "custom" },
    ],
    whatsapp: [
      { label: "Event Confirmation", value: "eventConfirmation" },
      { label: "Event Reminder", value: "eventReminder" },
      { label: "Attendance Confirmation", value: "attendanceConfirmation" },
      { label: "Custom", value: "custom" },
    ],
  };

  const handleCommunicationTypeSelect = (type) => {
    setCommunicationType(type);
    setTemplate("");
    setMessage("");
    setSubject("");
    setAlertMessage(null);
  };

  const handleSend = async () => {
    if (!message || (communicationType === "email" && !subject)) {
      setAlertMessage({ type: "warning", text: "Please fill in all required fields" });
      return;
    }

    setSending(true);
    try {
      // Prepare recipient data
      const recipients = attendees
        .filter((a) => {
          if (communicationType === "email") return a.email;
          if (communicationType === "sms" || communicationType === "whatsapp") return a.phoneNumber || a.phone;
          return true;
        })
        .map((attendee) => ({
          name: attendee.firstName || attendee.name || "Attendee",
          email: attendee.email,
          phoneNumber: attendee.phoneNumber || attendee.phone,
        }));

      if (recipients.length === 0) {
        setAlertMessage({
          type: "warning",
          text: `No attendees with valid ${communicationType === "email" ? "email addresses" : "phone numbers"} found.`,
        });
        setSending(false);
        return;
      }

      // Prepare payload based on communication type
      let payload = {};

      if (communicationType === "email") {
        payload = {
          recipients: recipients.map((r) => r.email),
          subject,
          html: message,
          text: message,
        };
      } else if (communicationType === "sms") {
        payload = {
          phoneNumbers: recipients.map((r) => r.phoneNumber),
          message,
        };
      } else if (communicationType === "whatsapp") {
        payload = {
          phoneNumbers: recipients.map((r) => `whatsapp:${r.phoneNumber}`),
          message,
        };
      }

      // Send communication (use bulk endpoint)
      const response = await fetch(`${apiUrl}/communications/${communicationType}/bulk`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Log to history
        try {
          await fetch(`${apiUrl}/communication-history/log`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              type: communicationType,
              template,
              subject,
              message,
              recipients,
              status: "sent",
            }),
          });
        } catch (error) {
          console.warn("Failed to log communication history:", error);
        }

        setAlertMessage({
          type: "success",
          text: `✓ ${communicationType.toUpperCase()} sent to ${recipients.length} recipient${recipients.length !== 1 ? "s" : ""}!`,
        });
        setTimeout(() => {
          handleClose();
          onSuccess?.();
        }, 1500);
      } else {
        setAlertMessage({ type: "danger", text: data.error || "Failed to send communication" });
      }
    } catch (error) {
      setAlertMessage({ type: "danger", text: error.message });
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setCommunicationType(null);
    setTemplate("");
    setMessage("");
    setSubject("");
    setAlertMessage(null);
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Send Communication to Attendees</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Step 1: Select Communication Type */}
        {!communicationType ? (
          <div>
            <h5 className="mb-3">Select Communication Type</h5>
            <div className="d-grid gap-2">
              <Button
                variant="outline-primary"
                size="lg"
                onClick={() => handleCommunicationTypeSelect("email")}
                className="text-start"
              >
                <span className="me-2">📧</span> Email
                <small className="d-block text-muted">Send email to all attendees</small>
              </Button>
              <Button
                variant="outline-primary"
                size="lg"
                onClick={() => handleCommunicationTypeSelect("sms")}
                className="text-start"
              >
                <span className="me-2">📱</span> SMS
                <small className="d-block text-muted">Send SMS to all attendees</small>
              </Button>
              <Button
                variant="outline-primary"
                size="lg"
                onClick={() => handleCommunicationTypeSelect("whatsapp")}
                className="text-start"
              >
                <span className="me-2">💬</span> WhatsApp
                <small className="d-block text-muted">Send WhatsApp message to all attendees</small>
              </Button>
            </div>
            <div className="mt-3 p-3 bg-light rounded">
              <small>
                <strong>Total Recipients:</strong> {selectedCount} attendees
              </small>
            </div>
          </div>
        ) : (
          <div>
            {alertMessage && (
              <Alert variant={alertMessage.type} dismissible onClose={() => setAlertMessage(null)}>
                {alertMessage.text}
              </Alert>
            )}

            <div className="d-flex align-items-center mb-3">
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => handleCommunicationTypeSelect(null)}
              >
                ← Back
              </Button>
              <h5 className="mb-0 ms-3">
                {communicationType === "email" && "📧 Send Email"}
                {communicationType === "sms" && "📱 Send SMS"}
                {communicationType === "whatsapp" && "💬 Send WhatsApp"}
              </h5>
            </div>

            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Select Template (Optional)</Form.Label>
                <Form.Select value={template} onChange={(e) => setTemplate(e.target.value)}>
                  <option value="">Custom Message</option>
                  {templates[communicationType]?.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {communicationType === "email" && (
                <Form.Group className="mb-3">
                  <Form.Label>Subject *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter email subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Message *</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  placeholder={`Enter your ${communicationType} message here...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <small className="text-muted">
                  Character count: {message.length}
                  {communicationType === "sms" && ` (Recommended: 160 chars)`}
                </small>
              </Form.Group>

              <div className="p-3 bg-light rounded mb-3">
                <small>
                  <strong>Recipients:</strong> {selectedCount} attendees will receive this message
                </small>
              </div>
            </Form>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        {communicationType && (
          <>
            <Button variant="outline-secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSend} disabled={sending}>
              {sending ? <Spinner size="sm" className="me-2" /> : "📤"} Send to {selectedCount} Attendees
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SendCommunicationModal;
