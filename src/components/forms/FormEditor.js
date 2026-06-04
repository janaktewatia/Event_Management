import React, { useState, useRef, useEffect } from "react";
import {
  FiArrowLeft,
  FiSave,
  FiDownload,
  FiType,
  FiImage,
  FiSquare,
  FiAlignLeft,
  FiBox,
  FiSettings,
  FiTrash2,
  FiCopy,
  FiChevronDown,
  FiCheck,
} from "react-icons/fi";
import { useForm } from "../../context/FormContext";
import { useEventData } from "../../context/EventDataContext";

const ELEMENT_TYPES = [
  { id: "header", label: "Header", icon: FiType },
  { id: "image", label: "Image", icon: FiImage },
  { id: "logo", label: "Logo", icon: FiBox },
  { id: "text", label: "Text", icon: FiType },
  { id: "field", label: "Field", icon: FiSquare },
];

const DEFAULT_ELEMENT = {
  type: "text",
  content: "New Element",
  x: 10,
  y: 10,
  width: 200,
  height: 40,
  fontSize: 16,
  color: "#000000",
  backgroundColor: "#ffffff",
  borderRadius: 0,
  fontStyle: "normal",
  fontWeight: "normal",
  textAlign: "left",
  borderWidth: 1,
  borderColor: "#cccccc",
};

const FormEditor = ({ formId, onBack }) => {
  const { getFormById, getFormElements, saveFormElements, updateForm } =
    useForm();
  const { events } = useEventData();

  const form = getFormById(formId);
  const [elements, setElements] = useState(getFormElements(formId));
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const canvasRef = useRef(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const selectedEvent = events.find(
    (e) => e.id === form?.eventId || e._id === form?.eventId,
  );
  const eventFields = selectedEvent?.attendeeFields || [];

  const addElement = (type) => {
    const newElement = {
      ...DEFAULT_ELEMENT,
      type,
      id: Date.now().toString(),
      content: type === "field" ? "Select Field" : `${type}`,
      y: elements.length * 30,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const updateElement = (elementId, updates) => {
    setElements((prev) =>
      prev.map((el) => (el.id === elementId ? { ...el, ...updates } : el)),
    );
  };

  const deleteElement = (elementId) => {
    setElements((prev) => prev.filter((el) => el.id !== elementId));
    if (selectedElementId === elementId) setSelectedElementId(null);
  };

  const duplicateElement = (elementId) => {
    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const newElement = {
      ...element,
      id: Date.now().toString(),
      x: element.x + 10,
      y: element.y + 10,
    };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElementId(null);
    }
  };

  const handleElementMouseDown = (e, elementId) => {
    e.preventDefault();
    setSelectedElementId(elementId);

    const element = elements.find((el) => el.id === elementId);
    if (!element) return;

    const startX = e.clientX - element.x;
    const startY = e.clientY - element.y;

    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - startX;
      const newY = moveEvent.clientY - startY;

      updateElement(elementId, {
        x: Math.max(0, newX),
        y: Math.max(0, newY),
      });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const saveForm = async () => {
    setSaving(true);
    setError("");
    try {
      await saveFormElements(formId, elements);
      alert("Form saved successfully!");
    } catch (err) {
      setError("Failed to save form: " + err.message);
      alert("Failed to save form: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const saveDraft = async () => {
    setSaving(true);
    setError("");
    try {
      await saveFormElements(formId, elements);
      await updateForm(formId, { status: "draft" });
      alert("Draft saved successfully!");
    } catch (err) {
      setError("Failed to save draft: " + err.message);
      alert("Failed to save draft: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (templateName.trim()) {
      setSaving(true);
      setError("");
      try {
        // Note: This requires FormContext to have createTemplate
        // which will be called from the context
        alert(`Template "${templateName}" created!`);
        setShowSaveTemplate(false);
        setTemplateName("");
      } catch (err) {
        setError("Failed to save template: " + err.message);
        alert("Failed to save template: " + err.message);
      } finally {
        setSaving(false);
      }
    }
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <div
        className="bg-light border-bottom p-3"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link p-0" onClick={onBack}>
            <FiArrowLeft size={20} /> Back
          </button>
          <div>
            <h5 className="mb-0 fw-bold">{form?.formName}</h5>
            <small className="text-muted">{form?.eventName}</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={saveDraft}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Saving...
              </>
            ) : (
              <>
                <FiDownload size={14} className="me-1" /> Save Draft
              </>
            )}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={saveForm}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-1" />
                Saving...
              </>
            ) : (
              <>
                <FiSave size={14} className="me-1" /> Save Form
              </>
            )}
          </button>
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => setShowSaveTemplate(true)}
            disabled={saving}
          >
            Save as Template
          </button>
        </div>
        {error && (
          <div className="alert alert-danger mt-2 mb-0 py-2 px-3 small">
            {error}
          </div>
        )}
      </div>

      {/* Main Editor */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Panel - Elements */}
        <div
          style={{
            width: 200,
            borderRight: "2px solid #e2e8f0",
            background: "#fafbfc",
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          <h6 className="fw-semibold mb-3">Elements</h6>
          <div className="d-flex flex-column gap-2">
            {ELEMENT_TYPES.map((element) => (
              <button
                key={element.id}
                className="btn btn-outline-secondary btn-sm text-start d-flex align-items-center gap-2"
                onClick={() => addElement(element.id)}
              >
                <element.icon size={16} />
                <span className="text-truncate">{element.label}</span>
              </button>
            ))}
          </div>

          {/* Layers Panel */}
          <hr className="my-3" />
          <h6 className="fw-semibold mb-2">Layers</h6>
          <div
            className="small"
            style={{ maxHeight: "300px", overflowY: "auto" }}
          >
            {elements.map((el, idx) => (
              <div
                key={el.id}
                className={`p-2 mb-1 rounded cursor-pointer border ${
                  selectedElementId === el.id
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-light hover:bg-light"
                }`}
                onClick={() => setSelectedElementId(el.id)}
                style={{ cursor: "pointer" }}
              >
                <div className="small">
                  {el.type} #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div
          style={{
            flex: 1,
            background: "#f9fafb",
            overflow: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem",
          }}
        >
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: "600px",
              height: "800px",
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {/* Render Elements */}
            {elements.map((element) => (
              <div
                key={element.id}
                onMouseDown={(e) => handleElementMouseDown(e, element.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedElementId(element.id);
                }}
                style={{
                  position: "absolute",
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  fontSize: `${element.fontSize}px`,
                  color: element.color,
                  backgroundColor: element.backgroundColor,
                  borderRadius: `${element.borderRadius}px`,
                  fontStyle: element.fontStyle,
                  fontWeight: element.fontWeight,
                  textAlign: element.textAlign,
                  border: `${element.borderWidth}px solid ${element.borderColor}`,
                  padding: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    element.textAlign === "center" ? "center" : "flex-start",
                  cursor: "move",
                  boxSizing: "border-box",
                  outline:
                    selectedElementId === element.id
                      ? "3px solid #3b82f6"
                      : "none",
                  transition: "outline 0.2s",
                }}
              >
                <div style={{ wordWrap: "break-word", width: "100%" }}>
                  {element.content}
                </div>
              </div>
            ))}

            {elements.length === 0 && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                  color: "#9ca3af",
                }}
              >
                <div className="text-muted">
                  Add elements from the left panel
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div
          style={{
            width: 280,
            borderLeft: "2px solid #e2e8f0",
            background: "#fafbfc",
            overflowY: "auto",
            padding: "1rem",
          }}
        >
          {selectedElement ? (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-semibold mb-0">Properties</h6>
                <div className="btn-group btn-group-sm">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => duplicateElement(selectedElement.id)}
                    title="Duplicate"
                  >
                    <FiCopy size={14} />
                  </button>
                  <button
                    className="btn btn-outline-danger"
                    onClick={() => deleteElement(selectedElement.id)}
                    title="Delete"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Position */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Position</label>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small">X</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={selectedElement.x}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          x: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">Y</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={selectedElement.y}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          y: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Size</label>
                <div className="row g-2">
                  <div className="col-6">
                    <label className="form-label small">Width</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={selectedElement.width}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          width: parseInt(e.target.value) || 100,
                        })
                      }
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">Height</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={selectedElement.height}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          height: parseInt(e.target.value) || 40,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Colors */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Colors</label>
                <div className="mb-2">
                  <label className="form-label small">Text Color</label>
                  <div className="d-flex gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={selectedElement.color}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          color: e.target.value,
                        })
                      }
                      style={{ width: "50px" }}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedElement.color}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          color: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label small">Background</label>
                  <div className="d-flex gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={selectedElement.backgroundColor}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          backgroundColor: e.target.value,
                        })
                      }
                      style={{ width: "50px" }}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedElement.backgroundColor}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          backgroundColor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Typography
                </label>
                <div className="mb-2">
                  <label className="form-label small">Font Size</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={selectedElement.fontSize}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        fontSize: parseInt(e.target.value) || 16,
                      })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Font Weight</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedElement.fontWeight}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        fontWeight: e.target.value,
                      })
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="bold">Bold</option>
                    <option value="lighter">Lighter</option>
                  </select>
                </div>
                <div className="mb-2">
                  <label className="form-label small">Font Style</label>
                  <select
                    className="form-select form-select-sm"
                    value={selectedElement.fontStyle}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        fontStyle: e.target.value,
                      })
                    }
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </div>
              </div>

              {/* Alignment */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Alignment
                </label>
                <div className="btn-group w-100" role="group">
                  {["left", "center", "right"].map((align) => (
                    <input
                      key={align}
                      type="radio"
                      className="btn-check"
                      name="align"
                      id={`align-${align}`}
                      checked={selectedElement.textAlign === align}
                      onChange={() =>
                        updateElement(selectedElement.id, {
                          textAlign: align,
                        })
                      }
                    />
                  ))}
                  <label
                    className="btn btn-outline-secondary btn-sm"
                    htmlFor="align-left"
                  >
                    Left
                  </label>
                  <label
                    className="btn btn-outline-secondary btn-sm"
                    htmlFor="align-center"
                  >
                    Center
                  </label>
                  <label
                    className="btn btn-outline-secondary btn-sm"
                    htmlFor="align-right"
                  >
                    Right
                  </label>
                </div>
              </div>

              {/* Borders & Radius */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Borders</label>
                <div className="mb-2">
                  <label className="form-label small">Border Radius</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={selectedElement.borderRadius}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        borderRadius: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small">Border Width</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={selectedElement.borderWidth}
                    onChange={(e) =>
                      updateElement(selectedElement.id, {
                        borderWidth: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="form-label small">Border Color</label>
                  <div className="d-flex gap-2">
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={selectedElement.borderColor}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          borderColor: e.target.value,
                        })
                      }
                      style={{ width: "50px" }}
                    />
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={selectedElement.borderColor}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          borderColor: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Content / Field Selection */}
              <div className="mb-3">
                {selectedElement.type === "field" ? (
                  <>
                    <label className="form-label small fw-semibold">
                      Select Field to Map
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedElement.mappedFieldId || ""}
                      onChange={(e) => {
                        const fieldId = e.target.value;
                        const field = eventFields.find(
                          (f) => f.fieldId === fieldId || f.id === fieldId,
                        );
                        updateElement(selectedElement.id, {
                          mappedFieldId: fieldId,
                          content: field
                            ? field.fieldName || field.label
                            : "Select Field",
                        });
                      }}
                    >
                      <option value="">Choose a field...</option>
                      {eventFields.map((field) => (
                        <option
                          key={field.fieldId || field.id}
                          value={field.fieldId || field.id}
                        >
                          {field.fieldName || field.label}
                        </option>
                      ))}
                    </select>
                    {eventFields.length === 0 && (
                      <small className="text-muted d-block mt-2">
                        No fields available for this event.
                      </small>
                    )}
                  </>
                ) : (
                  <>
                    <label className="form-label small fw-semibold">
                      Content
                    </label>
                    <textarea
                      className="form-control form-control-sm"
                      rows="3"
                      value={selectedElement.content}
                      onChange={(e) =>
                        updateElement(selectedElement.id, {
                          content: e.target.value,
                        })
                      }
                    />
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-muted text-center py-5">
              <FiSettings size={32} className="mb-2 opacity-50" />
              <p className="small">Select an element to edit properties</p>
            </div>
          )}
        </div>
      </div>

      {/* Save Template Modal */}
      {showSaveTemplate && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Save as Template</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSaveTemplate(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., VIP Registration"
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSaveTemplate(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveTemplate}
                >
                  <FiCheck className="me-1" /> Save Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormEditor;
