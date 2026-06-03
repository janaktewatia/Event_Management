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
  const { events, eventsLoading, updateEvent } = useEventData();
  const [selectedEventId, setSelectedEventId] = useState("");
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

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

  const handleFieldToggle = async (fieldId, key, value) => {
    if (!selectedEvent) return;
    setSaving(true);
    try {
      const updated = selectedEvent.attendeeFields.map((f) =>
        f.fieldId === fieldId ? { ...f, [key]: value } : f
      );
      await updateEvent(selectedEvent.id || selectedEvent._id, { attendeeFields: updated }, selectedEvent);
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
        c.categoryId === categoryId ? { ...c, enabled: value } : c
      );
      await updateEvent(selectedEvent.id || selectedEvent._id, { categories: updated }, selectedEvent);
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

            {/* Field Configuration */}
            <div>
              <div className="small fw-semibold mb-3 d-flex align-items-center gap-2">
                Form Fields Configuration
                {saving && <span className="spinner-border spinner-border-sm text-primary" />}
              </div>

              {(!selectedEvent?.attendeeFields || selectedEvent.attendeeFields.length === 0) ? (
                <div
                  className="rounded-3 p-3 text-muted small text-center"
                  style={{
                    background: "#f8fafc",
                    border: "1px dashed #cbd5e1",
                  }}
                >
                  No fields configured for this event.
                </div>
              ) : (
                <div className="d-flex flex-column gap-2">
                  {selectedEvent.attendeeFields.map((field) => {
                    const badge =
                      FIELD_TYPE_BADGE[field.type] || FIELD_TYPE_BADGE.text;
                    return (
                      <div
                        key={field.fieldId}
                        className="rounded-3 p-3"
                        style={{
                          background: field.enabled ? "#f0fdf4" : "#f8fafc",
                          border: field.enabled ? "1px solid #86efac" : "1px solid #e2e8f0",
                        }}
                      >
                        <div className="d-flex align-items-start justify-content-between mb-2">
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <span className="fw-semibold small">
                                {field.label}
                              </span>
                              <span
                                className="badge rounded-pill"
                                style={{
                                  background: badge.bg,
                                  color: badge.color,
                                  fontSize: 10,
                                }}
                              >
                                {badge.label}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <label className="form-check mb-0">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={field.enabled}
                              onChange={(e) =>
                                handleFieldToggle(field.fieldId, "enabled", e.target.checked)
                              }
                              disabled={saving}
                            />
                            <span className="form-check-label small">Show in form</span>
                          </label>
                          {field.enabled && (
                            <label className="form-check mb-0">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                checked={field.required}
                                onChange={(e) =>
                                  handleFieldToggle(field.fieldId, "required", e.target.checked)
                                }
                                disabled={saving}
                              />
                              <span className="form-check-label small">Required</span>
                            </label>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Category Configuration */}
              {selectedEvent?.categories && selectedEvent.categories.length > 0 && (
                <div className="mt-4">
                  <div className="small fw-semibold mb-3">
                    Category Field
                    {saving && <span className="spinner-border spinner-border-sm text-primary ms-2" />}
                  </div>
                  <div className="d-flex flex-column gap-2">
                    {selectedEvent.categories.map((category) => (
                      <div
                        key={category.categoryId}
                        className="rounded-3 p-3 d-flex align-items-center justify-content-between"
                        style={{
                          background: category.enabled ? "#f0fdf4" : "#f8fafc",
                          border: category.enabled ? "1px solid #86efac" : "1px solid #e2e8f0",
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              borderRadius: 4,
                              background: category.color || "#a855f7",
                              flexShrink: 0,
                            }}
                          />
                          <span className="small fw-semibold">{category.label}</span>
                        </div>
                        <label className="form-check mb-0">
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={category.enabled}
                            onChange={(e) =>
                              handleCategoryToggle(category.categoryId, e.target.checked)
                            }
                            disabled={saving}
                          />
                          <span className="form-check-label small ms-2">Show</span>
                        </label>
                      </div>
                    ))}
                  </div>
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
