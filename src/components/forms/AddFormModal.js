import React, { useState } from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import { useEventData } from "../../context/EventDataContext";
import { useForm } from "../../context/FormContext";
import { useAuth } from "../../context/AuthContext";

const AddFormModal = ({ onClose, onFormCreated }) => {
  const { events, categories } = useEventData();
  const { createForm, setCurrentForm } = useForm();
  const { user } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    formName: "",
    eventId: "",
    selectedFields: [],
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedFields, setSelectedFields] = useState([]);

  // Filter to show only active events (current date within event date range)
  const today = new Date().toISOString().slice(0, 10);
  const activeEvents = events.filter(
    (e) => e.startDate <= today && e.endDate >= today,
  );

  const selectedEvent = activeEvents.find(
    (e) => e.id === formData.eventId || e._id === formData.eventId,
  );

  // Get ONLY fields that exist in the selected event
  const eventFields = selectedEvent?.attendeeFields?.filter(field =>
    field && (field.fieldName || field.label)
  ) || [];

  // Get event categories from global context
  const eventCategories = categories.filter(
    (cat) => cat.active !== false
  );

  // Map field names to proper types
  const getFieldType = (fieldName) => {
    const nameMap = {
      "Mobile Number": "number",
      "Email": "text",
      "Organization": "text",
      "Name": "text",
      "Phone": "number",
    };
    return nameMap[fieldName] || "text";
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.formName.trim()) newErrors.formName = "Form name is required";
    if (!formData.eventId) newErrors.eventId = "Event selection is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleCreateForm = async () => {
    setLoading(true);
    setCreateError("");
    try {
      // Get only the selected fields
      const formFields = selectedFields.map((idx) => eventFields[idx]);

      const newForm = await createForm({
        formName: formData.formName,
        eventId: formData.eventId,
        eventName: selectedEvent?.eventName || "",
        description: "",
        createdBy: user?.name || "System",
        fields: formFields.length > 0 ? formFields : eventFields,
        selectedCategories: selectedCategories,
      });

      setCurrentForm(newForm);
      onFormCreated && onFormCreated(newForm);
      setSelectedCategories([]);
      setSelectedFields([]);

      // Close modal will be handled by parent since we're transitioning to editor
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error) {
      setCreateError("Failed to create form: " + error.message);
      alert("Failed to create form: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal d-block"
      style={{
        background: "rgba(0,0,0,0.5)",
        zIndex: 1050,
      }}
    >
      <div className="modal-dialog modal-lg" style={{ maxWidth: "600px" }}>
        <div className="modal-content border-0 shadow-lg">
          {/* Header */}
          <div className="modal-header border-0 pb-0 pt-4">
            <div>
              <h5 className="modal-title fw-bold mb-1">
                <i className="bi bi-form-check me-2" style={{ color: "#a855f7" }} />
                Create New Form
              </h5>
              <p className="text-muted small mb-0">
                {step === 1 ? "Configure your form" : "Review and create"}
              </p>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ minHeight: "400px", paddingTop: "2rem" }}>
            {step === 1 ? (
              <div>
                {/* Form Name */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-2">
                    <i className="bi bi-card-text" style={{ color: "#a855f7" }} />
                    Form Name
                  </label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${
                      errors.formName ? "is-invalid" : ""
                    }`}
                    placeholder="e.g., Registration Form"
                    value={formData.formName}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        formName: e.target.value,
                      }));
                      if (errors.formName) {
                        setErrors((prev) => ({
                          ...prev,
                          formName: "",
                        }));
                      }
                    }}
                  />
                  {errors.formName && (
                    <div className="invalid-feedback d-block">
                      {errors.formName}
                    </div>
                  )}
                </div>

                {/* Choose Event */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-event" style={{ color: "#a855f7" }} />
                    Choose Event
                  </label>
                  <select
                    className={`form-select form-select-lg ${
                      errors.eventId ? "is-invalid" : ""
                    }`}
                    value={formData.eventId}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        eventId: e.target.value,
                      }));
                      if (errors.eventId) {
                        setErrors((prev) => ({
                          ...prev,
                          eventId: "",
                        }));
                      }
                      setSelectedFields([]);
                    }}
                  >
                    <option value="">Select an event...</option>
                    {activeEvents.map((event) => (
                      <option
                        key={event.id || event._id}
                        value={event.id || event._id}
                      >
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                  {errors.eventId && (
                    <div className="invalid-feedback d-block">
                      {errors.eventId}
                    </div>
                  )}
                </div>

                {selectedEvent && (
                  <div>
                    {/* Categories Section */}
                    {eventCategories.length > 0 && (
                      <div className="mb-4">
                        <label className="form-label small fw-semibold d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-tag" style={{ color: "#a855f7" }} />
                          Categories
                          <span className="badge bg-light text-dark ms-auto">{eventCategories.length}</span>
                        </label>
                        <div
                          className="border rounded-3 p-3"
                          style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
                        >
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                            {eventCategories.map((category) => (
                              <div
                                key={category.id || category._id}
                                className="form-check"
                                style={{
                                  padding: "8px 10px",
                                  borderRadius: "6px",
                                  background: selectedCategories.includes(category.id || category._id) ? "#f3e8ff" : "transparent",
                                  border: selectedCategories.includes(category.id || category._id) ? "1px solid #a855f7" : "1px solid transparent",
                                }}
                              >
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`category-${category.id || category._id}`}
                                  checked={selectedCategories.includes(
                                    category.id || category._id,
                                  )}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCategories((prev) => [
                                        ...prev,
                                        category.id || category._id,
                                      ]);
                                    } else {
                                      setSelectedCategories((prev) =>
                                        prev.filter(
                                          (c) =>
                                            c !== (category.id || category._id),
                                        ),
                                      );
                                    }
                                  }}
                                />
                                <label
                                  className="form-check-label ms-2"
                                  htmlFor={`category-${category.id || category._id}`}
                                  style={{ cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
                                >
                                  {category.label || category.categoryName || category.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fields Section */}
                    {eventFields.length > 0 ? (
                      <div className="mb-2">
                        <label className="form-label small fw-semibold d-flex align-items-center gap-2 mb-3">
                          <i className="bi bi-list-check" style={{ color: "#a855f7" }} />
                          Available Fields
                          <span className="badge bg-light text-dark ms-auto">{eventFields.length}</span>
                        </label>
                        <div
                          className="border rounded-3 p-3"
                          style={{ backgroundColor: "#f8fafc", borderColor: "#e2e8f0" }}
                        >
                          {eventFields.map((field, idx) => (
                            <div
                              key={idx}
                              className="form-check mb-3"
                              style={{
                                padding: "10px",
                                borderRadius: "6px",
                                background: selectedFields.includes(idx) ? "#f3e8ff" : "transparent",
                                border: selectedFields.includes(idx) ? "1px solid #a855f7" : "1px solid transparent",
                              }}
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`field-${idx}`}
                                checked={selectedFields.includes(idx)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedFields((prev) => [...prev, idx]);
                                  } else {
                                    setSelectedFields((prev) =>
                                      prev.filter((f) => f !== idx)
                                    );
                                  }
                                }}
                              />
                              <label
                                className="form-check-label ms-2"
                                htmlFor={`field-${idx}`}
                                style={{ cursor: "pointer", fontSize: "13px", fontWeight: "500" }}
                              >
                                {field.fieldName || field.label}
                                <span
                                  className="ms-2 badge"
                                  style={{
                                    background: "#dbeafe",
                                    color: "#1e40af",
                                    fontSize: "10px",
                                    fontWeight: "600",
                                  }}
                                >
                                  {getFieldType(field.fieldName || field.label)}
                                </span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      selectedEvent && (
                        <div
                          className="alert alert-info border-0 rounded-3 mb-0"
                          style={{ backgroundColor: "#dbeafe", color: "#1e40af" }}
                        >
                          <i className="bi bi-info-circle me-2" />
                          No fields available for this event
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <h6 className="fw-semibold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-clipboard-check" style={{ color: "#10b981" }} />
                    Review Form Configuration
                  </h6>
                  <div className="p-4 border rounded-3" style={{ backgroundColor: "#f0fdf4", borderColor: "#86efac" }}>
                    {/* Form Name */}
                    <div className="mb-3">
                      <div className="text-muted small fw-semibold">Form Name</div>
                      <div className="fw-bold text-dark">{formData.formName}</div>
                    </div>

                    {/* Event */}
                    <div className="mb-3">
                      <div className="text-muted small fw-semibold">Event</div>
                      <div className="fw-bold text-dark">{selectedEvent?.eventName}</div>
                    </div>

                    {/* Selected Fields */}
                    <div className="mb-3">
                      <div className="text-muted small fw-semibold mb-2">Fields ({selectedFields.length})</div>
                      <div>
                        {selectedFields.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {selectedFields.map((idx) => (
                              <span
                                key={idx}
                                className="badge rounded-pill"
                                style={{
                                  background: "#dcfce7",
                                  color: "#166534",
                                  fontSize: "11px",
                                  fontWeight: "600",
                                  padding: "6px 10px",
                                }}
                              >
                                {eventFields[idx]?.fieldName || eventFields[idx]?.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted small">No fields selected</span>
                        )}
                      </div>
                    </div>

                    {/* Categories */}
                    <div>
                      <div className="text-muted small fw-semibold mb-2">Categories ({selectedCategories.length})</div>
                      <div>
                        {selectedCategories.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                            {selectedCategories.map((catId) => {
                              const cat = eventCategories.find(
                                (c) => c.id === catId || c._id === catId
                              );
                              return (
                                <span
                                  key={catId}
                                  className="badge rounded-pill"
                                  style={{
                                    background: "#f3e8ff",
                                    color: "#7e22ce",
                                    fontSize: "11px",
                                    fontWeight: "600",
                                    padding: "6px 10px",
                                  }}
                                >
                                  {cat?.label || cat?.categoryName || cat?.name || "Unknown"}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-muted small">No categories selected</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="alert border-0 rounded-3 mb-0"
                  style={{ backgroundColor: "#dbeafe", color: "#1e40af", borderColor: "#7dd3fc" }}
                >
                  <i className="bi bi-lightbulb me-2" />
                  <small>
                    Click "Create Form" to proceed to the form editor where you can design the layout and customize field properties.
                  </small>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top-0 pt-3 pb-4 px-4">
            {createError && (
              <div className="alert alert-danger w-100 mb-3" style={{ fontSize: "12px" }}>
                <i className="bi bi-exclamation-circle me-2" />
                {createError}
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <button
                type="button"
                className="btn btn-outline-secondary flex-grow-1"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              {step === 1 ? (
                <button
                  type="button"
                  className="btn btn-primary flex-grow-1"
                  onClick={handleNext}
                  disabled={loading || !formData.eventId}
                  style={{
                    opacity: !formData.eventId ? 0.5 : 1,
                  }}
                >
                  Next <i className="bi bi-arrow-right ms-2" style={{ fontSize: "12px" }} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success flex-grow-1"
                  onClick={handleCreateForm}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-plus-circle me-1" />
                      Create Form
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFormModal;
