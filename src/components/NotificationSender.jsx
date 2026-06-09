import React, { useState, useEffect } from "react";
import { Modal, Form, Button, Alert, Spinner, Row, Col } from "react-bootstrap";
import communicationService from "../services/communicationService";

const NotificationSender = ({ show, onHide, title = "Send Notification", defaultRecipients = {} }) => {
  const [channels, setChannels] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });

  const [recipients, setRecipients] = useState({
    emails: defaultRecipients.emails || [],
    phoneNumbers: defaultRecipients.phoneNumbers || [],
  });

  const [content, setContent] = useState({
    emailSubject: "",
    message: "",
    emailHtml: "",
  });

  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState(null);
  const [availableChannels, setAvailableChannels] = useState({
    email: false,
    sms: false,
    whatsapp: false,
  });

  useEffect(() => {
    if (show) {
      checkAvailableChannels();
    }
  }, [show]);

  const checkAvailableChannels = async () => {
    setLoading(true);
    try {
      const emailEnabled = await communicationService.isEmailEnabled();
      const smsEnabled = await communicationService.isSMSEnabled();
      const whatsappEnabled = await communicationService.isWhatsAppEnabled();

      setAvailableChannels({
        email: emailEnabled,
        sms: smsEnabled,
        whatsapp: whatsappEnabled,
      });

      if (emailEnabled) setChannels((prev) => ({ ...prev, email: true }));
    } catch (error) {
      setMessage({ type: "danger", text: "Failed to check available channels" });
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = (channel) => {
    setChannels((prev) => ({
      ...prev,
      [channel]: !prev[channel],
    }));
  };

  const handleRecipientChange = (e) => {
    const { name, value } = e.target;
    if (name === "emails") {
      setRecipients((prev) => ({
        ...prev,
        emails: value.split(",").map((e) => e.trim()),
      }));
    } else {
      setRecipients((prev) => ({
        ...prev,
        phoneNumbers: value.split(",").map((p) => p.trim()),
      }));
    }
  };

  const handleContentChange = (e) => {
    const { name, value } = e.target;
    setContent((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const sendNotifications = async () => {
    if (!content.message && !content.emailSubject) {
      setMessage({ type: "warning", text: "Please enter a message" });
      return;
    }

    if (!channels.email && !channels.sms && !channels.whatsapp) {
      setMessage({ type: "warning", text: "Please select at least one channel" });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const results = { success: 0, failed: 0, details: [] };

      // Send Email
      if (channels.email && recipients.emails.length > 0) {
        try {
          if (recipients.emails.length === 1) {
            const result = await communicationService.sendEmail(
              recipients.emails[0],
              content.emailSubject,
              content.emailHtml || content.message,
              content.message
            );

            if (result.success) {
              results.success += 1;
              results.details.push("✓ Email sent successfully");
            } else {
              results.failed += 1;
              results.details.push(`✗ Email failed: ${result.error}`);
            }
          } else {
            const result = await communicationService.sendBulkEmails(
              recipients.emails,
              content.emailSubject,
              content.emailHtml || content.message,
              content.message
            );

            const successCount = result.results.filter((r) => r.success).length;
            results.success += successCount;
            results.failed += result.results.length - successCount;
            results.details.push(`✓ ${successCount}/${result.results.length} emails sent`);
          }
        } catch (error) {
          results.failed += 1;
          results.details.push(`✗ Email error: ${error.message}`);
        }
      }

      // Send SMS
      if (channels.sms && recipients.phoneNumbers.length > 0) {
        try {
          if (recipients.phoneNumbers.length === 1) {
            const result = await communicationService.sendSMS(
              recipients.phoneNumbers[0],
              content.message
            );

            if (result.success) {
              results.success += 1;
              results.details.push("✓ SMS sent successfully");
            } else {
              results.failed += 1;
              results.details.push(`✗ SMS failed: ${result.error}`);
            }
          } else {
            const result = await communicationService.sendBulkSMS(
              recipients.phoneNumbers,
              content.message
            );

            const successCount = result.results.filter((r) => r.success).length;
            results.success += successCount;
            results.failed += result.results.length - successCount;
            results.details.push(`✓ ${successCount}/${result.results.length} SMS sent`);
          }
        } catch (error) {
          results.failed += 1;
          results.details.push(`✗ SMS error: ${error.message}`);
        }
      }

      // Send WhatsApp
      if (channels.whatsapp && recipients.phoneNumbers.length > 0) {
        try {
          if (recipients.phoneNumbers.length === 1) {
            const result = await communicationService.sendWhatsApp(
              recipients.phoneNumbers[0],
              content.message
            );

            if (result.success) {
              results.success += 1;
              results.details.push("✓ WhatsApp sent successfully");
            } else {
              results.failed += 1;
              results.details.push(`✗ WhatsApp failed: ${result.error}`);
            }
          } else {
            const result = await communicationService.sendBulkWhatsApp(
              recipients.phoneNumbers,
              content.message
            );

            const successCount = result.results.filter((r) => r.success).length;
            results.success += successCount;
            results.failed += result.results.length - successCount;
            results.details.push(`✓ ${successCount}/${result.results.length} WhatsApp sent`);
          }
        } catch (error) {
          results.failed += 1;
          results.details.push(`✗ WhatsApp error: ${error.message}`);
        }
      }

      if (results.success > 0) {
        setMessage({
          type: "success",
          text: `✓ ${results.success} notification(s) sent successfully${results.failed > 0 ? `, ${results.failed} failed` : ""}`,
          details: results.details,
        });
      } else {
        setMessage({
          type: "danger",
          text: "Failed to send notifications",
          details: results.details,
        });
      }
    } catch (error) {
      setMessage({
        type: "danger",
        text: `Error: ${error.message}`,
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <div className="d-flex justify-content-center">
            <Spinner animation="border" />
          </div>
        ) : (
          <Form>
            {message && (
              <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
                {message.text}
                {message.details && (
                  <ul className="mb-0 mt-2">
                    {message.details.map((detail, i) => (
                      <li key={i}>{detail}</li>
                    ))}
                  </ul>
                )}
              </Alert>
            )}

            {/* Channel Selection */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Select Channels</Form.Label>
              <Row>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id="emailCheck"
                    label="📧 Email"
                    checked={channels.email}
                    onChange={() => handleChannelChange("email")}
                    disabled={!availableChannels.email}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id="smsCheck"
                    label="📱 SMS"
                    checked={channels.sms}
                    onChange={() => handleChannelChange("sms")}
                    disabled={!availableChannels.sms}
                  />
                </Col>
                <Col md={4}>
                  <Form.Check
                    type="checkbox"
                    id="whatsappCheck"
                    label="💬 WhatsApp"
                    checked={channels.whatsapp}
                    onChange={() => handleChannelChange("whatsapp")}
                    disabled={!availableChannels.whatsapp}
                  />
                </Col>
              </Row>
            </Form.Group>

            {/* Recipients */}
            {channels.email && (
              <Form.Group className="mb-3">
                <Form.Label>Email Recipients</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="emails"
                  value={recipients.emails.join(", ")}
                  onChange={handleRecipientChange}
                  placeholder="user1@example.com, user2@example.com"
                />
                <Form.Text className="text-muted">Separate multiple emails with commas</Form.Text>
              </Form.Group>
            )}

            {(channels.sms || channels.whatsapp) && (
              <Form.Group className="mb-3">
                <Form.Label>Phone Numbers</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="phoneNumbers"
                  value={recipients.phoneNumbers.join(", ")}
                  onChange={handleRecipientChange}
                  placeholder="+1234567890, +0987654321"
                />
                <Form.Text className="text-muted">Separate multiple numbers with commas</Form.Text>
              </Form.Group>
            )}

            {/* Content */}
            {channels.email && (
              <Form.Group className="mb-3">
                <Form.Label>Email Subject</Form.Label>
                <Form.Control
                  type="text"
                  name="emailSubject"
                  value={content.emailSubject}
                  onChange={handleContentChange}
                  placeholder="Event Confirmation"
                />
              </Form.Group>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Message</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="message"
                value={content.message}
                onChange={handleContentChange}
                placeholder="Enter your message here..."
              />
              <Form.Text className="text-muted">
                This message will be used for SMS and WhatsApp
              </Form.Text>
            </Form.Group>

            {channels.email && (
              <Form.Group className="mb-3">
                <Form.Label>Email HTML (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="emailHtml"
                  value={content.emailHtml}
                  onChange={handleContentChange}
                  placeholder="<h2>Your HTML content</h2>"
                />
              </Form.Group>
            )}
          </Form>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={sendNotifications}
          disabled={sending || loading}
        >
          {sending ? <Spinner size="sm" className="me-2" /> : "📤"} Send
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default NotificationSender;
