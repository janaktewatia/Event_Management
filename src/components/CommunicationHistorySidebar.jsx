import React, { useState, useEffect } from "react";
import { Modal, Table, Button, Spinner, Badge, Offcanvas } from "react-bootstrap";
import { apiUrl } from "../config";
import * as XLSX from "xlsx";

const CommunicationHistorySidebar = ({ eventId, show, onHide }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    if (show && eventId) {
      fetchHistory();
    }
  }, [show, eventId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/communication-history/event/${eventId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (item) => {
    setDetailsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/communication-history/details/${item._id}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedHistory(data);
        setShowDetails(true);
      }
    } catch (error) {
      console.error("Failed to fetch details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleExportToExcel = async (item) => {
    try {
      const response = await fetch(`${apiUrl}/communication-history/export/${item._id}`);
      if (response.ok) {
        const data = await response.json();

        const worksheet = XLSX.utils.json_to_sheet(data.recipients);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Recipients");

        const filename = `${data.communicationType}_${new Date(data.sentAt).toLocaleDateString()}.xlsx`;
        XLSX.writeFile(workbook, filename);
      }
    } catch (error) {
      console.error("Failed to export:", error);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "email":
        return "📧";
      case "sms":
        return "📱";
      case "whatsapp":
        return "💬";
      default:
        return "📤";
    }
  };

  const getStatusBadge = (count, total) => {
    if (count === total) return <Badge bg="success">✓ All Sent</Badge>;
    if (count === 0) return <Badge bg="danger">✗ Failed</Badge>;
    return <Badge bg="warning">⚠ Partial</Badge>;
  };

  return (
    <>
      <Offcanvas show={show} onHide={onHide} placement="end" style={{ width: "450px" }}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Communication History</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p>No communications yet</p>
            </div>
          ) : (
            <div className="communication-history-list">
              {history.map((item) => (
                <div key={item._id} className="history-item mb-3 p-3 border rounded">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        {getTypeIcon(item.type)} {item.type.toUpperCase()}
                        {item.template && <span className="ms-2 small text-muted">({item.template})</span>}
                      </h6>
                      <small className="text-muted d-block">
                        {new Date(item.sentAt).toLocaleDateString()} {new Date(item.sentAt).toLocaleTimeString()}
                      </small>
                    </div>
                    {getStatusBadge(item.successCount, item.recipientCount)}
                  </div>

                  <div className="mb-2">
                    <small className="d-block text-muted">
                      Recipients: <strong>{item.recipientCount}</strong>
                    </small>
                    <small className="d-block text-success">Sent: {item.successCount}</small>
                    {item.failureCount > 0 && <small className="d-block text-danger">Failed: {item.failureCount}</small>}
                  </div>

                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => handleViewDetails(item)}
                      className="flex-grow-1"
                    >
                      View ({item.recipientCount})
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-success"
                      onClick={() => handleExportToExcel(item)}
                      title="Export to Excel"
                    >
                      📊
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Details Modal */}
      <Modal show={showDetails} onHide={() => setShowDetails(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedHistory && `${getTypeIcon(selectedHistory.type)} ${selectedHistory.type.toUpperCase()} Details`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {detailsLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : selectedHistory ? (
            <>
              <div className="mb-3">
                <h6>Summary</h6>
                <Table borderless size="sm">
                  <tbody>
                    <tr>
                      <td>Sent At:</td>
                      <td>
                        {new Date(selectedHistory.sentAt).toLocaleDateString()} {new Date(selectedHistory.sentAt).toLocaleTimeString()}
                      </td>
                    </tr>
                    <tr>
                      <td>Total Recipients:</td>
                      <td>{selectedHistory.recipientCount}</td>
                    </tr>
                    <tr>
                      <td>Successful:</td>
                      <td className="text-success">{selectedHistory.successCount}</td>
                    </tr>
                    <tr>
                      <td>Failed:</td>
                      <td className="text-danger">{selectedHistory.failureCount}</td>
                    </tr>
                    {selectedHistory.template && (
                      <tr>
                        <td>Template:</td>
                        <td>{selectedHistory.template}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              <div className="mb-3">
                <h6>Recipients</h6>
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table striped bordered size="sm">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Contact</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedHistory.recipients.map((recipient, index) => (
                        <tr key={index}>
                          <td>{recipient.name}</td>
                          <td>{recipient.email || recipient.phone}</td>
                          <td>
                            {recipient.status === "sent" ? (
                              <Badge bg="success">✓ Sent</Badge>
                            ) : (
                              <Badge bg="danger">✗ Failed</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </div>
            </>
          ) : null}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-success" onClick={() => selectedHistory && handleExportToExcel(selectedHistory)}>
            📊 Export to Excel
          </Button>
          <Button variant="secondary" onClick={() => setShowDetails(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CommunicationHistorySidebar;
