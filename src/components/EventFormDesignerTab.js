import React, { useState } from "react";
import { FiCopy, FiExternalLink } from "react-icons/fi";
import { useEventData } from "../context/EventDataContext";

const FIELD_TYPE_BADGE = {
  text: { label: "Text", bg: "#eff6ff", color: "#3b82f6" },
  date: { label: "Date", bg: "#f0fdf4", color: "#10b981" },
  choice: { label: "Choice", bg: "#fffbeb", color: "#f59e0b" },
  "multiple-choice": { label: "Multi", bg: "#faf5ff", color: "#a855f7" },
};

const EventFormDesignerTab = () => {
  const { events, eventsLoading } = useEventData();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [copied, setCopied] = useState(false);

  const selectedEvent = events.find(
    (e) => e.id === selectedEventId || e._id === selectedEventId
  );
  const enabledFields = selectedEvent
    ? (selectedEvent.attendeeFields || []).filter((f) => f.enabled)
    : [];

  const shareLink = selectedEventId
    ? `${window.location.origin}/register/${selectedEventId}`
    : "";

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-3">
        <h5 className="fw-semibold mb-1">Event Form Designer</h5>
        <div className="small text-muted mb-3">
          Select an event to preview its registration form and generate a public share link.
        </div>

        {/* Event Selector */}
        <div className="mb-4" style={{ maxWidth: 400 }}>
          <label className="form-label small fw-semibold mb-1">
            Select Event
          </label>
          {eventsLoading ? (
            <div className="text-muted small">Loading events...</div>
          ) : (
            <select
              className="form-select form-select-sm"
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setCopied(false);
              }}
            >
              <option value="">— Choose an event —</option>
              {events.map((ev) => (
                <option key={ev.id || ev._id} value={ev.id || ev._id}>
                  {ev.eventName}
                </option>
              ))}
            </select>
          )}
        </div>

        {selectedEvent && (
          <>
            {/* Share Link Section */}
            <div
              className="rounded-3 p-3 mb-4"
              style={{ background: "#f0fdf4", border: "1px solid #86efac" }}
            >
              <div
                className="small fw-semibold mb-2"
                style={{ color: "#166534" }}
              >
                Public Registration Link
              </div>
              <div className="d-flex align-items-center gap-2">
                <input
                  readOnly
                  value={shareLink}
                  className="form-control form-control-sm font-monospace"
                  style={{ background: "#fff", fontSize: 12 }}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="btn btn-sm btn-outline-success flex-shrink-0"
                  onClick={handleCopy}
                  title="Copy link"
                >
                  <FiCopy size={14} className="me-1" />
                  {copied ? "Copied!" : "Copy"}
                </button>
                <a
                  href={shareLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary flex-shrink-0"
                  title="Open in new tab"
                >
                  <FiExternalLink size={14} />
                </a>
              </div>
              <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                Share this link with attendees. No login required.
              </div>
            </div>

            {/* Field Preview */}
            <div>
              <div className="small fw-semibold mb-2">
                Form Fields Preview
                <span
                  className="ms-2 badge rounded-pill"
                  style={{
                    background: "#ede9fe",
                    color: "#7e22ce",
                    fontSize: 10,
                  }}
                >
                  {enabledFields.length} field
                  {enabledFields.length !== 1 ? "s" : ""}
                </span>
              </div>

              {enabledFields.length === 0 ? (
                <div
                  className="rounded-3 p-3 text-muted small text-center"
                  style={{
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  No fields are enabled for this event. Enable fields in the
                  event settings.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {enabledFields.map((field) => {
                    const badge =
                      FIELD_TYPE_BADGE[field.type] || FIELD_TYPE_BADGE.text;
                    return (
                      <div
                        key={field.fieldId}
                        className="d-flex align-items-start gap-3 rounded-3 p-3"
                        style={{
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-semibold small">
                              {field.label}
                            </span>
                            {field.required && (
                              <span
                                className="text-danger"
                                style={{ fontSize: 12 }}
                              >
                                *
                              </span>
                            )}
                            <span
                              className="badge rounded-pill ms-auto"
                              style={{
                                background: badge.bg,
                                color: badge.color,
                                fontSize: 10,
                              }}
                            >
                              {badge.label}
                            </span>
                          </div>
                          {/* Simulated input */}
                          {field.type === "choice" && (
                            <select
                              className="form-select form-select-sm"
                              disabled
                            >
                              <option>— Select —</option>
                              {(field.options || []).map((o) => (
                                <option key={o}>{o}</option>
                              ))}
                            </select>
                          )}
                          {field.type === "multiple-choice" && (
                            <div className="d-flex flex-wrap gap-2">
                              {(field.options || []).map((o) => (
                                <label key={o} className="form-check mb-0">
                                  <input
                                    type="checkbox"
                                    className="form-check-input"
                                    disabled
                                  />
                                  <span className="form-check-label small ms-1">
                                    {o}
                                  </span>
                                </label>
                              ))}
                            </div>
                          )}
                          {(field.type === "text" ||
                            field.type === "date") && (
                            <input
                              type={
                                field.type === "date" ? "date" : "text"
                              }
                              className="form-control form-control-sm"
                              placeholder={field.label}
                              disabled
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventFormDesignerTab;
