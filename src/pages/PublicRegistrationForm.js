import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchForm, fetchPublicEvent, publicRegister } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const SYSTEM_FIELD_IDS = ["name", "email", "mobile"];

const PublicRegistrationForm = () => {
  const { eventId, formId } = useParams();

  const [event, setEvent] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const loadPublicForm = async () => {
      setLoading(true);
      setError("");
      try {
        if (formId) {
          const fetchedForm = await fetchForm(formId);
          setForm(fetchedForm);
          const data = await fetchPublicEvent(fetchedForm.eventId);
          setEvent(data);
          const init = {};
          (fetchedForm.fields || [])
            .filter((f) => f.enabled !== false)
            .forEach((f) => {
              init[f.fieldId] = f.type === "multiple-choice" ? [] : "";
            });
          const enabledCategories = (data.categories || []).filter(
            (c) =>
              c.enabled &&
              (fetchedForm.selectedCategories || []).includes(
                c.categoryId || c.id || c._id,
              ),
          );
          if (enabledCategories.length > 0) {
            init.category = "";
          }
          setFormData(init);
        } else {
          const data = await fetchPublicEvent(eventId);
          setEvent(data);
          const init = {};
          (data.attendeeFields || [])
            .filter((f) => f.enabled)
            .forEach((f) => {
              init[f.fieldId] = f.type === "multiple-choice" ? [] : "";
            });
          const enabledCategories = (data.categories || []).filter(
            (c) => c.enabled,
          );
          if (enabledCategories.length > 0) {
            init.category = "";
          }
          setFormData(init);
        }
      } catch (err) {
        setError(
          "This registration form is unavailable or the event does not exist.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadPublicForm();
  }, [eventId, formId]);

  const enabledFields = event
    ? formId
      ? (form?.fields || []).filter((f) => f.enabled !== false)
      : (event.attendeeFields || []).filter((f) => f.enabled)
    : [];

  const enabledCategories = event
    ? (event.categories || [])
        .filter((c) => c.enabled)
        .filter((category) =>
          formId
            ? (form?.selectedCategories || []).includes(
                category.categoryId || category.id || category._id,
              )
            : true,
        )
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

    // Validate category if required
    if (enabledCategories.length > 0 && !formData.category) {
      setSubmitError("Please select a category.");
      return;
    }

    // Map fieldId back to Attendee model keys for system fields
    const payload = {};
    if (enabledCategories.length > 0) {
      payload.category = formData.category;
    }
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

    // Handle form field input types (from form designer)
    if (field.inputType === "dropdown") {
      const options = (field.options || "").split(",").map(opt => opt.trim()).filter(Boolean);
      return (
        <select
          className="form-select"
          style={{
            borderRadius: 10,
            borderColor: "#e2e8f0",
            padding: "12px 16px",
          }}
          value={val}
          onChange={(e) => handleChange(field.fieldId, e.target.value)}
          required={field.required}
        >
          <option value="">— Select an option —</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.inputType === "textarea") {
      return (
        <textarea
          className="form-control"
          style={{
            borderRadius: 10,
            borderColor: "#e2e8f0",
            padding: "12px 16px",
          }}
          value={val}
          onChange={(e) => handleChange(field.fieldId, e.target.value)}
          required={field.required}
          rows={4}
        />
      );
    }

    if (field.inputType === "checkbox") {
      return (
        <label className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={val === true || val === "true"}
            onChange={(e) => handleChange(field.fieldId, e.target.checked)}
          />
          <span className="form-check-label">{field.label}</span>
        </label>
      );
    }

    if (field.type === "choice") {
      return (
        <select
          className="form-select"
          style={{
            borderRadius: 10,
            borderColor: "#e2e8f0",
            padding: "12px 16px",
          }}
          value={val}
          onChange={(e) => handleChange(field.fieldId, e.target.value)}
          required={field.required}
        >
          <option value="">— Select an option —</option>
          {(field.options || []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "multiple-choice") {
      const checked = formData[field.fieldId] || [];
      return (
        <div className="d-flex flex-column gap-2">
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
          style={{
            borderRadius: 10,
            borderColor: "#e2e8f0",
            padding: "12px 16px",
          }}
          value={val}
          onChange={(e) => handleChange(field.fieldId, e.target.value)}
          required={field.required}
        />
      );
    }

    const inputType = field.inputType || "text";
    const finalType = inputType === "email" || field.fieldId === "email" ? "email"
                    : inputType === "number" || field.fieldId === "mobile" ? "number"
                    : "text";

    return (
      <input
        type={finalType}
        className="form-control"
        style={{
          borderRadius: 10,
          borderColor: "#e2e8f0",
          padding: "12px 16px",
        }}
        value={val}
        onChange={(e) => handleChange(field.fieldId, e.target.value)}
        required={field.required}
        placeholder={field.placeholder || field.label}
      />
    );
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <div className="container" style={{ maxWidth: 560 }}>
          <div
            className="card border-0"
            style={{
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            }}
          >
            <div className="card-body p-5 text-center">
              <i
                className="bi bi-exclamation-circle text-danger mb-3"
                style={{ fontSize: 48, display: "block" }}
              />
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8fafc",
        }}
      >
        <div className="container" style={{ maxWidth: 560 }}>
          <div
            className="card border-0"
            style={{
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
            }}
          >
            <div className="card-body p-5 text-center">
              <div className="mb-4">
                <i
                  className="bi bi-check-circle text-success"
                  style={{ fontSize: 64, display: "block" }}
                />
              </div>
              <h4 className="fw-bold mb-2">Registration Successful!</h4>
              <p className="text-muted mb-4">
                Thank you for registering for{" "}
                <strong>{event?.eventName}</strong>. We look forward to seeing
                you!
              </p>
              <button
                className="btn btn-lg"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                }}
                onClick={() => {
                  setSubmitted(false);
                  const init = {};
                  enabledFields.forEach((f) => {
                    init[f.fieldId] = f.type === "multiple-choice" ? [] : "";
                  });
                  if (enabledCategories.length > 0) {
                    init.category = "";
                  }
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
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
          padding: "3rem 1.5rem",
          color: "white",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: "0.5rem" }}>
            Event Management · Registration
          </div>
          <h1
            style={{ fontSize: 32, fontWeight: "bold", marginBottom: "0.5rem" }}
          >
            {event?.eventName}
          </h1>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              fontSize: 14,
              opacity: 0.95,
            }}
          >
            {event?.startDate && (
              <div>
                <i className="bi bi-calendar-event me-2" />
                {new Date(event.startDate).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
            )}
            {event?.venue && (
              <div>
                <i className="bi bi-geo-alt me-2" />
                {event.venue}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Container */}
      <div
        className="container"
        style={{
          maxWidth: 520,
          marginTop: "-2rem",
          marginBottom: "3rem",
          position: "relative",
          zIndex: 10,
        }}
      >
        <div
          className="card border-0"
          style={{
            borderRadius: 16,
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          }}
        >
          <div className="card-body p-5">
            <form onSubmit={handleSubmit} noValidate>
              {/* Category Field */}
              {enabledCategories.length > 0 && (
                <div className="mb-4">
                  <label
                    className="form-label fw-semibold mb-2"
                    style={{ fontSize: 14 }}
                  >
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    style={{
                      borderRadius: 10,
                      borderColor: "#e2e8f0",
                      padding: "12px 16px",
                    }}
                    value={formData.category || ""}
                    onChange={(e) => handleChange("category", e.target.value)}
                    required
                  >
                    <option value="">— Select a category —</option>
                    {enabledCategories.map((cat) => (
                      <option key={cat.categoryId} value={cat.label}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: 2,
                            background: cat.color || "#a855f7",
                            marginRight: 8,
                            verticalAlign: "middle",
                          }}
                        />
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Fields */}
              {enabledFields.map((field, idx) => (
                <div className="mb-4" key={field.fieldId}>
                  <label
                    className="form-label fw-semibold mb-2"
                    style={{ fontSize: 14 }}
                  >
                    <span style={{ color: "#7c3aed", fontWeight: 700, marginRight: "6px" }}>
                      {idx + 1}.
                    </span>
                    {field.label}
                    {field.required && (
                      <span className="text-danger ms-1">*</span>
                    )}
                  </label>
                  {renderField(field)}
                </div>
              ))}

              {/* Error Message */}
              {submitError && (
                <div
                  className="alert alert-danger py-3 mb-4"
                  style={{ borderRadius: 10 }}
                >
                  <i className="bi bi-exclamation-circle me-2" />
                  {submitError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-lg w-100"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 10,
                  fontWeight: 600,
                  padding: "14px 24px",
                  transition: "all 0.3s ease",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.8 : 1,
                  transform: submitting ? "scale(0.99)" : "scale(1)",
                }}
                disabled={submitting}
                onMouseEnter={(e) => {
                  if (!submitting)
                    e.target.style.boxShadow =
                      "0 10px 30px rgba(124, 58, 237, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.boxShadow = "none";
                }}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Register Now
                    <i className="bi bi-arrow-right ms-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center mt-4"
          style={{ fontSize: 12, color: "#94a3b8" }}
        >
          <i className="bi bi-shield-check me-1" style={{ color: "#a855f7" }} />
          Powered by Event Management
        </div>
      </div>
    </div>
  );
};

export default PublicRegistrationForm;
