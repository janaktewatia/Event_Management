import React, { useState } from "react";
import { FiX, FiChevronRight } from "react-icons/fi";
import { useEventData } from "../../context/EventDataContext";
import { useForm } from "../../context/FormContext";
import { useAuth } from "../../context/AuthContext";

const AddFormModal = ({ onClose, onFormCreated }) => {
  const { events } = useEventData();
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

  // Filter to show only active events (current date within event date range)
  const today = new Date().toISOString().slice(0, 10);
  const activeEvents = events.filter(
    (e) => e.startDate <= today && e.endDate >= today,
  );

  const selectedEvent = activeEvents.find(
    (e) => e.id === formData.eventId || e._id === formData.eventId,
  );
  const eventFields = selectedEvent?.attendeeFields || [];

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
      const newForm = await createForm({
        formName: formData.formName,
        eventId: formData.eventId,
        eventName: selectedEvent?.eventName || "",
        description: "",
        createdBy: user?.name || "System",
        fields: eventFields,
        selectedCategories: selectedCategories,
      });

      setCurrentForm(newForm);
      onFormCreated && onFormCreated(newForm);
      setSelectedCategories([]);

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
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          {/* Header */}
          <div className="modal-header border-bottom">
            <h5 className="modal-title fw-bold">Create New Form</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          {/* Body */}
          <div className="modal-body" style={{ minHeight: "300px" }}>
            {step === 1 ? (
              <div>
                <div className="mb-4">
                  <label className="form-label fw-semibold">Form Name</label>
                  <input
                    type="text"
                    className={`form-control ${
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

                <div className="mb-4">
                  <label className="form-label fw-semibold">Choose Event</label>
                  <select
                    className={`form-select ${
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
                    {selectedEvent.categories &&
                      selectedEvent.categories.length > 0 && (
                        <div className="mb-4">
                          <label className="form-label fw-semibold">
                            Categories
                          </label>
                          <div
                            className="p-3 border rounded"
                            style={{ backgroundColor: "#f8f9fa" }}
                          >
                            {selectedEvent.categories.map((category) => (
                              <div
                                key={category.id || category._id}
                                className="form-check mb-2"
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
                                  className="form-check-label"
                                  htmlFor={`category-${category.id || category._id}`}
                                >
                                  {category.categoryName || category.name}
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    {eventFields.length > 0 && (
                      <div className="alert alert-info small mb-0">
                        <div className="fw-semibold mb-2">
                          Available Fields:
                        </div>
                        <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {eventFields.map((field, idx) => (
                            <div key={idx} className="mb-1">
                              • {field.fieldName || field.label}
                              {field.type && (
                                <span className="ms-1 badge bg-light text-dark">
                                  {field.type}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="mb-3">
                  <h6 className="fw-semibold mb-2">Form Summary</h6>
                  <div className="p-3 bg-light rounded">
                    <div className="mb-2">
                      <span className="text-muted">Form Name:</span>
                      <div className="fw-semibold">{formData.formName}</div>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted">Event:</span>
                      <div className="fw-semibold">
                        {selectedEvent?.eventName}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted">Fields:</span>
                      <div className="fw-semibold">
                        {eventFields.length} field(s) available
                      </div>
                    </div>
                  </div>
                </div>
                <div className="alert alert-info small">
                  Click "Create Form" to proceed to the form editor where you
                  can design the layout and customize field properties.
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="modal-footer border-top">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            {step === 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNext}
                disabled={loading}
              >
                Next <FiChevronRight className="ms-1" />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleCreateForm}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Creating...
                  </>
                ) : (
                  "Create Form"
                )}
              </button>
            )}
          </div>
          {createError && (
            <div className="alert alert-danger m-3 mb-0 py-2 px-3 small">
              {createError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFormModal;
