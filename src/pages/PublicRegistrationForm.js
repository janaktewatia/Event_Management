import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchPublicEvent, publicRegister } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const SYSTEM_FIELD_IDS = ["name", "email", "mobile"];

const PublicRegistrationForm = () => {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchPublicEvent(eventId)
      .then((data) => {
        setEvent(data);
        const init = {};
        (data.attendeeFields || [])
          .filter((f) => f.enabled)
          .forEach((f) => {
            init[f.fieldId] = f.type === "multiple-choice" ? [] : "";
          });
        setFormData(init);
        setLoading(false);
      })
      .catch(() => {
        setError("This registration form is unavailable or the event does not exist.");
        setLoading(false);
      });
  }, [eventId]);

  const enabledFields = event
    ? (event.attendeeFields || []).filter((f) => f.enabled)
    : [];

  const handleChange = (fieldId, value) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleCheckboxToggle = (fieldId, option) => {
    setFormData((prev) => {
      const current = prev[fieldId] || [];
      return {
        ...prev,
        [fieldId]: current.includes(option)
          ? current.filter((o) => o !== option)
          : [...current, option],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    // Validate required fields
    for (const field of enabledFields) {
      if (!field.required) continue;
      const val = formData[field.fieldId];
      if (!val || (Array.isArray(val) && val.length === 0)) {
        setSubmitError(`"${field.label}" is required.`);
        return;
      }
    }

    // Map fieldId back to Attendee model keys for system fields
    const payload = {};
    enabledFields.forEach((f) => {
      const val = formData[f.fieldId];
      if (f.fieldId === "mobile") {
        payload.phone = val;
      } else if (SYSTEM_FIELD_IDS.includes(f.fieldId)) {
        payload[f.fieldId] = val;
      } else {
        payload[f.fieldId] = Array.isArray(val) ? val.join(", ") : val;
      }
    });

    setSubmitting(true);
    try {
      await publicRegister(eventId, payload);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const val = formData[field.fieldId] ?? "";

    if (field.type === "choice") {
      return (
        <select
          className="form-select"
          value={val}
          onChange={(e) => handleChange(field.fieldId, e.target.value)}
          required={field.required}
        >
          <option value="">— Select —</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

    if (field.type === "multiple-choice") {
      const checked = formData[field.fieldId] || [];
      return (
        <div className="d-flex flex-column gap-1">
          {(field.options || []).map((opt) => (
            <label key={opt} className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                checked={checked.includes(opt)}
                onChange={() => handleCheckboxToggle(field.fieldId, opt)}
              />
              <span className="form-check-label">{opt}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field.type === "date") {
      return (
        <input
          type="date"
          className="form-control"
          value={val}
          onChange={(e) => handleChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      );
    }

    return (
      <input
        type={field.fieldId === "email" ? "email" : "text"}
        className="form-control"
        value={val}
        onChange={(e) => handleChange(field.fieldId, e.target.value)}
        required={field.required}
        placeholder={field.label}
      />
    );
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7fb" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted">Loading registration form...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7fb" }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card border-0 shadow-sm border-start border-danger" style={{ borderLeftWidth: "4px" }}>
            <div className="card-body p-4 text-center">
              <i className="bi bi-exclamation-circle text-danger mb-3" style={{ fontSize: 40, display: "block" }} />
              <h4 className="fw-bold mb-2">Registration Unavailable</h4>
              <p className="text-muted mb-0">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f7fb" }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <div className="card border-0 shadow-sm border-start border-success" style={{ borderLeftWidth: "4px" }}>
            <div className="card-body p-4 text-center">
              <i className="bi bi-check-circle text-success mb-3" style={{ fontSize: 40, display: "block" }} />
              <h4 className="fw-bold mb-2">Registration Successful!</h4>
              <p className="text-muted mb-4">
                Thank you for registering for <strong>{event?.eventName}</strong>. We look forward to seeing you!
              </p>
              <button
                className="btn btn-primary"
                style={{ background: "#A855F7", borderColor: "#A855F7" }}
                onClick={() => {
                  setSubmitted(false);
                  const init = {};
                  enabledFields.forEach((f) => {
                    init[f.fieldId] = f.type === "multiple-choice" ? [] : "";
                  });
                  setFormData(init);
                  setSubmitError("");
                }}
              >
                Register Another Person
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f7fb" }}>
      <div style={{ background: "#A855F7", padding: "1rem" }}>
        <h1 className="text-white mb-0 fs-5 fw-bold">Event Registration</h1>
      </div>
      <div className="container" style={{ maxWidth: 560, paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="card border-0 shadow-sm">
          <div className="card-body p-4">
            <h2 className="fw-bold mb-1" style={{ fontSize: 20 }}>
              {event?.eventName}
            </h2>
            {event?.venue && <small className="text-muted d-block mb-3">{event.venue}</small>}
            <hr />
            <form onSubmit={handleSubmit} noValidate>
              {enabledFields.map((field) => (
                <div className="mb-3" key={field.fieldId}>
                  <label className="form-label fw-semibold">
                    {field.label}
                    {field.required && <span className="text-danger ms-1">*</span>}
                  </label>
                  {renderField(field)}
                </div>
              ))}
              {submitError && (
                <div className="alert alert-danger py-2 mb-3">{submitError}</div>
              )}
              <button
                type="submit"
                className="btn btn-primary w-100"
                style={{ background: "#A855F7", borderColor: "#A855F7" }}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Register"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicRegistrationForm;
