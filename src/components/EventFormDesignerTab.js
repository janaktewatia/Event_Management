import React, { useState } from "react";
import { FiCopy, FiExternalLink, FiCode } from "react-icons/fi";
import { useEventData } from "../context/EventDataContext";

const FIELD_TYPE_BADGE = {
  text: { label: "Text", bg: "#eff6ff", color: "#3b82f6" },
  date: { label: "Date", bg: "#f0fdf4", color: "#10b981" },
  choice: { label: "Choice", bg: "#fffbeb", color: "#f59e0b" },
  "multiple-choice": { label: "Multi", bg: "#faf5ff", color: "#a855f7" },
};

const EventFormDesignerTab = () => {
  const { events, eventsLoading, updateEvent } = useEventData();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [copied, setCopied] = useState(false);
  const [apiCopied, setApiCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  const selectedEvent = events.find(
    (e) => e.id === selectedEventId || e._id === selectedEventId,
  );

  // Generate slug from event name
  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_-]/g, "");
  };

  const shareLink = selectedEventId
    ? `${window.location.origin}/register/${selectedEventId}`
    : "";

  const slugLink = selectedEvent
    ? `${window.location.origin}/event/${generateSlug(selectedEvent.eventName)}`
    : "";

  const handleCopy = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const getApiEndpoint = () => {
    const apiUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
    return `${apiUrl}/public/event/${selectedEventId}`;
  };

  const getCurlCommand = () => {
    return `curl -X GET "${getApiEndpoint()}" -H "Content-Type: application/json"`;
  };

  const handleCopyApi = () => {
    navigator.clipboard.writeText(getCurlCommand()).then(() => {
      setApiCopied(true);
      setTimeout(() => setApiCopied(false), 2000);
    });
  };

  const handleFieldToggle = async (fieldId, key, value) => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      const updated = selectedEvent.attendeeFields.map((f) =>
        f.fieldId === fieldId ? { ...f, [key]: value } : f,
      );
      await updateEvent(
        selectedEvent.id || selectedEvent._id,
        { attendeeFields: updated },
        selectedEvent,
      );
    } catch (err) {
      console.error("Error updating field:", err);
    }
    setSaving(false);
  };

  const handleCategoryToggle = async (categoryId, value) => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      const updated = selectedEvent.categories.map((c) =>
        c.categoryId === categoryId ? { ...c, enabled: value } : c,
      );
      await updateEvent(
        selectedEvent.id || selectedEvent._id,
        { categories: updated },
        selectedEvent,
      );
    } catch (err) {
      console.error("Error updating category:", err);
    }
    setSaving(false);
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body p-3">
        <h5 className="fw-semibold mb-1">Event Form Designer</h5>
        <div className="small text-muted mb-3">
          Select an event and configure which fields appear in the public
          registration form.
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
                Public Registration Links
              </div>

              {/* Event ID Link */}
              <div className="mb-3">
                <label className="form-label small mb-1" style={{ color: "#166534" }}>
                  By Event ID
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    readOnly
                    value={shareLink}
                    className="form-control form-control-sm font-monospace"
                    style={{ background: "#fff", fontSize: 11 }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success flex-shrink-0"
                    onClick={handleCopy}
                    title="Copy link"
                  >
                    <FiCopy size={14} className="me-1" />
                    {copied ? "✓" : ""}
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
              </div>

              {/* Slug Link */}
              <div>
                <label className="form-label small mb-1" style={{ color: "#166534" }}>
                  By Event Name (Slug) ✨
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    readOnly
                    value={slugLink}
                    className="form-control form-control-sm font-monospace"
                    style={{ background: "#fff", fontSize: 11 }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-success flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(slugLink);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    title="Copy link"
                  >
                    <FiCopy size={14} className="me-1" />
                    {copied ? "✓" : ""}
                  </button>
                  <a
                    href={slugLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-outline-secondary flex-shrink-0"
                    title="Open in new tab"
                  >
                    <FiExternalLink size={14} />
                  </a>
                </div>
              </div>

              <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                Share either link with attendees. No login required. Slug-based URL is cleaner and easier to remember!
              </div>
            </div>

            {/* API Endpoint Section */}
            <div
              className="rounded-3 p-3 mb-4"
              style={{ background: "#f3e8ff", border: "1px solid #d8b4fe" }}
            >
              <div
                className="small fw-semibold mb-2"
                style={{ color: "#6b21a8" }}
              >
                <FiCode size={14} className="me-1" style={{ display: "inline" }} />
                API Endpoint (for Developers)
              </div>
              <div className="mb-2">
                <label className="form-label small mb-1" style={{ color: "#6b21a8" }}>
                  Endpoint URL
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    readOnly
                    value={getApiEndpoint()}
                    className="form-control form-control-sm font-monospace"
                    style={{ background: "#fff", fontSize: 11 }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(getApiEndpoint());
                      setApiCopied(true);
                      setTimeout(() => setApiCopied(false), 2000);
                    }}
                    title="Copy endpoint"
                  >
                    <FiCopy size={14} />
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label small mb-1" style={{ color: "#6b21a8" }}>
                  cURL Command
                </label>
                <div className="d-flex align-items-center gap-2">
                  <input
                    readOnly
                    value={getCurlCommand()}
                    className="form-control form-control-sm font-monospace"
                    style={{ background: "#fff", fontSize: 10 }}
                    onFocus={(e) => e.target.select()}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary flex-shrink-0"
                    onClick={handleCopyApi}
                    title="Copy curl command"
                  >
                    <FiCopy size={14} className="me-1" />
                    {apiCopied ? "✓" : ""}
                  </button>
                </div>
              </div>
              <div className="text-muted mt-2" style={{ fontSize: 11 }}>
                Use this endpoint to programmatically access form data. Perfect for integrations!
              </div>
            </div>

            {/* Consolidated Field Selection */}
            <div>
              <div className="small fw-semibold mb-3 d-flex align-items-center gap-2">
                Form Fields Configuration
                {saving && (
                  <span className="spinner-border spinner-border-sm text-primary" />
                )}
              </div>

              {/* Attendee Fields */}
              {selectedEvent?.attendeeFields &&
                selectedEvent.attendeeFields.length > 0 && (
                  <div className="mb-4">
                    <div
                      className="small text-muted mb-2"
                      style={{ fontSize: 11 }}
                    >
                      ATTENDEE INFORMATION
                    </div>
                    <div className="d-flex flex-column gap-2">
                      {selectedEvent.attendeeFields.map((field) => {
                        const badge =
                          FIELD_TYPE_BADGE[field.type] || FIELD_TYPE_BADGE.text;
                        return (
                          <div
                            key={field.fieldId}
                            className="d-flex align-items-center justify-content-between p-3 rounded-3"
                            style={{
                              background: field.enabled ? "#f0fdf4" : "#f8fafc",
                              border: field.enabled
                                ? "1px solid #d1fae5"
                                : "1px solid #e2e8f0",
                            }}
                          >
                            <div className="d-flex align-items-center gap-2 flex-grow-1">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={field.enabled}
                                onChange={(e) =>
                                  handleFieldToggle(
                                    field.fieldId,
                                    "enabled",
                                    e.target.checked,
                                  )
                                }
                                disabled={saving}
                                style={{
                                  cursor: "pointer",
                                  width: 18,
                                  height: 18,
                                }}
                              />
                              <label
                                style={{
                                  cursor: "pointer",
                                  marginBottom: 0,
                                  flex: 1,
                                }}
                              >
                                <span className="fw-semibold small">
                                  {field.label}
                                </span>
                                <span
                                  className="ms-2 badge rounded-pill"
                                  style={{
                                    background: badge.bg,
                                    color: badge.color,
                                    fontSize: 10,
                                  }}
                                >
                                  {badge.label}
                                </span>
                                {field.required && (
                                  <span
                                    className="text-danger ms-2"
                                    style={{ fontSize: 12 }}
                                  >
                                    Required
                                  </span>
                                )}
                              </label>
                            </div>
                            {field.enabled && (
                              <label
                                className="form-check mb-0 ms-2"
                                style={{ cursor: "pointer" }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={field.required}
                                  onChange={(e) =>
                                    handleFieldToggle(
                                      field.fieldId,
                                      "required",
                                      e.target.checked,
                                    )
                                  }
                                  disabled={saving}
                                />
                                <span className="form-check-label small ms-1">
                                  Make Required
                                </span>
                              </label>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              {/* Categories */}
              {selectedEvent?.categories &&
                selectedEvent.categories.length > 0 && (
                  <div>
                    <div
                      className="small text-muted mb-2"
                      style={{ fontSize: 11 }}
                    >
                      CATEGORY FIELD
                    </div>
                    <div className="d-flex flex-column gap-2">
                      <div
                        className="d-flex align-items-center justify-content-between p-3 rounded-3"
                        style={{
                          background: selectedEvent.categories.some(
                            (c) => c.enabled,
                          )
                            ? "#f0fdf4"
                            : "#f8fafc",
                          border: selectedEvent.categories.some(
                            (c) => c.enabled,
                          )
                            ? "1px solid #d1fae5"
                            : "1px solid #e2e8f0",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2 flex-grow-1">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={selectedEvent.categories.some(
                              (c) => c.enabled,
                            )}
                            onChange={(e) => {
                              selectedEvent.categories.forEach((cat) => {
                                handleCategoryToggle(
                                  cat.categoryId,
                                  e.target.checked,
                                );
                              });
                            }}
                            disabled={saving}
                            style={{ cursor: "pointer", width: 18, height: 18 }}
                          />
                          <label style={{ cursor: "pointer", marginBottom: 0 }}>
                            <span className="fw-semibold small">
                              Show Category Dropdown
                            </span>
                            <span
                              className="ms-2 badge rounded-pill"
                              style={{
                                background: "#faf5ff",
                                color: "#a855f7",
                                fontSize: 10,
                              }}
                            >
                              Choice
                            </span>
                            <div
                              style={{ fontSize: 11, marginTop: 4 }}
                              className="text-muted"
                            >
                              {
                                selectedEvent.categories.filter(
                                  (c) => c.enabled,
                                ).length
                              }{" "}
                              of {selectedEvent.categories.length} categories
                              enabled
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Category List */}
                      {selectedEvent.categories.length > 0 && (
                        <div
                          className="rounded-3 p-3"
                          style={{
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            marginTop: 4,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 11,
                              color: "#94a3b8",
                              marginBottom: 8,
                            }}
                          >
                            Available Categories:
                          </div>
                          <div className="d-flex flex-column gap-2">
                            {selectedEvent.categories.map((category) => (
                              <label
                                key={category.categoryId}
                                className="d-flex align-items-center gap-2 mb-0"
                                style={{ cursor: "pointer" }}
                              >
                                <input
                                  type="checkbox"
                                  className="form-check-input"
                                  checked={category.enabled}
                                  onChange={(e) =>
                                    handleCategoryToggle(
                                      category.categoryId,
                                      e.target.checked,
                                    )
                                  }
                                  disabled={saving}
                                />
                                <div
                                  style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 2,
                                    background: category.color || "#a855f7",
                                    flexShrink: 0,
                                  }}
                                />
                                <span style={{ fontSize: 12 }}>
                                  {category.label}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {(!selectedEvent?.attendeeFields ||
                selectedEvent.attendeeFields.length === 0) &&
                (!selectedEvent?.categories ||
                  selectedEvent.categories.length === 0) && (
                  <div
                    className="rounded-3 p-3 text-muted small text-center"
                    style={{
                      background: "#f8fafc",
                      border: "1px dashed #cbd5e1",
                    }}
                  >
                    No fields configured for this event.
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
