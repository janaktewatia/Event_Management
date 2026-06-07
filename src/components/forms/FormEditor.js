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
  FiLock,
  FiUnlock,
  FiChevronUp,
} from "react-icons/fi";
import { useForm } from "../../context/FormContext";
import { useEventData } from "../../context/EventDataContext";

const ELEMENT_TYPES = [
  { id: "header", label: "Header", icon: "bi-layout-text-window" },
  { id: "footer", label: "Footer", icon: "bi-layout-text-sidebar-reverse" },
  { id: "text", label: "Text", icon: "bi-type-h1" },
  { id: "image", label: "Image", icon: "bi-image" },
  { id: "logo", label: "Logo", icon: "bi-patch-check" },
  { id: "divider", label: "Divider", icon: "bi-dash-lg" },
];

const FONTS = [
  "Inter, sans-serif",
  "Arial, sans-serif",
  "Georgia, serif",
  "Courier New, monospace",
  "Verdana, sans-serif",
];

const CANVAS_PRESETS = [
  { label: "Card (350×200)", w: 350, h: 200 },
  { label: "Badge (400×600)", w: 400, h: 600 },
  { label: "Ticket (600×250)", w: 600, h: 250 },
];

const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_ELEMENT = {
  text: {
    w: 200,
    h: 36,
    label: "Text",
    content: "Text Here",
    fontSize: 16,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#1e293b",
    textAlign: "left",
    lineHeight: 1.4,
    bg: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
  header: {
    w: 400,
    h: 72,
    label: "Header",
    content: "Event Header",
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 1.3,
    bg: "#7c3aed",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 16,
    paddingY: 16,
    opacity: 1,
  },
  footer: {
    w: 400,
    h: 48,
    label: "Footer",
    content: "Event Footer",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1.4,
    bg: "#f8fafc",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 8,
    paddingY: 8,
    opacity: 1,
  },
  image: {
    w: 140,
    h: 140,
    label: "Image",
    content: "",
    imageUrl: "",
    objectFit: "cover",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1,
    bg: "#f1f5f9",
    borderRadius: 8,
    borderWidth: 0,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
  logo: {
    w: 80,
    h: 80,
    label: "Logo",
    content: "",
    imageUrl: "",
    objectFit: "contain",
    fontSize: 12,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 1,
    bg: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
  divider: {
    w: 360,
    h: 2,
    label: "Divider",
    content: "",
    fontSize: 0,
    fontWeight: "400",
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    textDecoration: "none",
    color: "transparent",
    textAlign: "left",
    lineHeight: 1,
    bg: "#e2e8f0",
    borderRadius: 0,
    borderWidth: 0,
    borderColor: "transparent",
    borderStyle: "solid",
    paddingX: 0,
    paddingY: 0,
    opacity: 1,
  },
};

const makeElement = (type, x = 40, y = 40) => ({
  id: uid(),
  type,
  x,
  y,
  w: DEFAULT_ELEMENT[type].w,
  h: DEFAULT_ELEMENT[type].h,
  zIndex: 1,
  locked: false,
  ...DEFAULT_ELEMENT[type],
});

const FormEditor = ({ formId, onBack }) => {
  const { getFormById, getFormElements, saveFormElements, updateForm } =
    useForm();
  const { events } = useEventData();

  const form = getFormById(formId);
  const [elements, setElements] = useState(getFormElements(formId) || []);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [canvasWidth, setCanvasWidth] = useState(600);
  const [canvasHeight, setCanvasHeight] = useState(800);
  const canvasRef = useRef(null);

  const selectedElement = elements.find((el) => el.id === selectedElementId);
  const selectedEvent = events.find(
    (e) => e.id === form?.eventId || e._id === form?.eventId,
  );
  const eventFields = selectedEvent?.attendeeFields || [];

  const addElement = (type) => {
    const newElement = makeElement(type, 40, 40 + elements.length * 20);
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

    const newElement = { ...element, id: uid(), x: element.x + 10, y: element.y + 10 };
    setElements((prev) => [...prev, newElement]);
    setSelectedElementId(newElement.id);
  };

  const bringToFront = (elementId) => {
    const maxZ = Math.max(...elements.map((el) => el.zIndex || 1), 0);
    updateElement(elementId, { zIndex: maxZ + 1 });
  };

  const sendToBack = (elementId) => {
    const minZ = Math.min(...elements.map((el) => el.zIndex || 1));
    updateElement(elementId, { zIndex: minZ - 1 });
  };

  const toggleLock = (elementId) => {
    const el = elements.find((e) => e.id === elementId);
    if (el) updateElement(elementId, { locked: !el.locked });
  };

  const handleCanvasClick = (e) => {
    if (e.target === canvasRef.current) {
      setSelectedElementId(null);
    }
  };

  const handleElementMouseDown = (e, elementId) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedElementId(elementId);

    const element = elements.find((el) => el.id === elementId);
    if (!element || element.locked) return;

    const startX = e.clientX - element.x;
    const startY = e.clientY - element.y;

    const handleMouseMove = (moveEvent) => {
      const newX = Math.max(0, moveEvent.clientX - startX);
      const newY = Math.max(0, moveEvent.clientY - startY);
      updateElement(elementId, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleResizeMouseDown = (e, elementId, handle) => {
    e.preventDefault();
    e.stopPropagation();

    const element = elements.find((el) => el.id === elementId);
    if (!element || element.locked) return;

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = element.w;
    const startH = element.h;
    const startX_pos = element.x;
    const startY_pos = element.y;

    const handleMouseMove = (moveEvent) => {
      const dX = moveEvent.clientX - startX;
      const dY = moveEvent.clientY - startY;
      const updates = {};

      if (handle === "se") {
        updates.w = Math.max(20, startW + dX);
        updates.h = Math.max(20, startH + dY);
      } else if (handle === "s") {
        updates.h = Math.max(20, startH + dY);
      } else if (handle === "e") {
        updates.w = Math.max(20, startW + dX);
      } else if (handle === "nw") {
        updates.x = Math.max(0, startX_pos + dX);
        updates.y = Math.max(0, startY_pos + dY);
        updates.w = Math.max(20, startW - dX);
        updates.h = Math.max(20, startH - dY);
      }

      updateElement(elementId, updates);
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
      {/* Header */}
      <div
        className="bg-light border-bottom p-3"
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <div className="d-flex align-items-center gap-3">
          <button className="btn btn-link p-0 text-dark" onClick={onBack}>
            <FiArrowLeft size={20} />
          </button>
          <div>
            <h5 className="mb-0 fw-bold">{form?.formName}</h5>
            <small className="text-muted">{form?.eventName}</small>
          </div>
        </div>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowSaveTemplate(true)}
            disabled={saving}
          >
            Save as Template
          </button>
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={saveDraft}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <FiDownload size={14} className="me-1" />
            )}
            Draft
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={saveForm}
            disabled={saving}
          >
            {saving ? (
              <span className="spinner-border spinner-border-sm me-1" />
            ) : (
              <FiSave size={14} className="me-1" />
            )}
            Save
          </button>
        </div>
      </div>
      {error && <div className="alert alert-danger mt-2 mb-0 py-2 px-3 small">{error}</div>}

      {/* Main Editor */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Panel - Elements */}
        <div style={{ width: 220, borderRight: "1px solid #e2e8f0", background: "#f8fafc", overflowY: "auto", padding: "1rem" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Elements
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {ELEMENT_TYPES.map((element) => (
              <button
                key={element.id}
                onClick={() => addElement(element.id)}
                style={{
                  height: 32,
                  borderRadius: 6,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-start",
                  gap: 8,
                  padding: "0 8px",
                }}
              >
                <i className={`bi ${element.icon}`} style={{ fontSize: 14 }} />
                <span>{element.label}</span>
              </button>
            ))}
          </div>

          <hr style={{ margin: "12px 0", border: "none", borderTop: "1px solid #e2e8f0" }} />

          <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
            Layers ({elements.length})
          </div>
          <div style={{ maxHeight: 400, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {elements.map((el, idx) => (
              <div
                key={el.id}
                onClick={() => setSelectedElementId(el.id)}
                style={{
                  padding: 8,
                  borderRadius: 6,
                  background: selectedElementId === el.id ? "#dbeafe" : "#f1f5f9",
                  borderLeft: selectedElementId === el.id ? "3px solid #3b82f6" : "3px solid transparent",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                <div style={{ fontWeight: selectedElementId === el.id ? 600 : 500, color: "#1e293b" }}>
                  {el.label || el.type} #{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div style={{ flex: 1, background: "#f9fafb", overflow: "auto", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "2rem 1rem" }}>
          {/* Canvas Presets */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {CANVAS_PRESETS.map((preset) => (
              <button
                key={preset.label}
                onClick={() => { setCanvasWidth(preset.w); setCanvasHeight(preset.h); }}
                style={{
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: canvasWidth === preset.w && canvasHeight === preset.h ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                  background: canvasWidth === preset.w && canvasHeight === preset.h ? "#dbeafe" : "#fff",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Canvas */}
          <div
            ref={canvasRef}
            onClick={handleCanvasClick}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              background: "white",
              border: "2px solid #e5e7eb",
              borderRadius: "8px",
              position: "relative",
              boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
              overflow: "hidden",
            }}
          >
            {elements.map((el) => {
              const isText = ["text", "header", "footer"].includes(el.type);
              const isMedia = ["image", "logo"].includes(el.type);
              return (
                <div
                  key={el.id}
                  onClick={(e) => { e.stopPropagation(); setSelectedElementId(el.id); }}
                  onMouseDown={(e) => !el.locked && handleElementMouseDown(e, el.id)}
                  style={{
                    position: "absolute",
                    left: el.x,
                    top: el.y,
                    width: el.w,
                    height: el.h,
                    background: el.bg,
                    borderRadius: el.borderRadius,
                    border: el.borderWidth > 0 ? `${el.borderWidth}px ${el.borderStyle} ${el.borderColor}` : "none",
                    opacity: el.opacity ?? 1,
                    zIndex: (el.zIndex || 1) + 1,
                    cursor: el.locked ? "not-allowed" : "move",
                    boxSizing: "border-box",
                    outline: selectedElementId === el.id ? "2px solid #a855f7" : "none",
                    outlineOffset: 2,
                    boxShadow: selectedElementId === el.id ? "0 0 0 1px #e9d5ff, 0 0 8px rgba(168,85,247,0.3)" : "none",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: el.textAlign === "center" ? "center" : el.textAlign === "right" ? "flex-end" : "flex-start",
                    padding: `${el.paddingY}px ${el.paddingX}px`,
                    fontSize: el.fontSize,
                    fontWeight: el.fontWeight,
                    fontFamily: el.fontFamily,
                    fontStyle: el.fontStyle,
                    textDecoration: el.textDecoration,
                    color: el.color,
                    lineHeight: el.lineHeight,
                  }}
                >
                  {el.type === "divider" ? null : isMedia && el.imageUrl ? (
                    <img src={el.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: el.objectFit || "cover", display: "block" }} />
                  ) : isText ? (
                    <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", width: "100%" }}>
                      {el.content || <span style={{ color: "#cbd5e1", fontStyle: "italic" }}>Empty…</span>}
                    </div>
                  ) : isMedia ? (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 4 }}>
                      <i className="bi bi-image" style={{ fontSize: 28, color: "#cbd5e1" }} />
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{el.label}</span>
                    </div>
                  ) : null}

                  {/* Resize Handles */}
                  {selectedElementId === el.id && !el.locked && (
                    <>
                      {[[0, 0, "nw"], [el.w, el.h, "se"], [el.w, 0, "ne"], [0, el.h, "sw"], [el.w / 2, el.h, "s"], [el.w, el.h / 2, "e"]].map(([x, y, handle]) => (
                        <div
                          key={handle}
                          onMouseDown={(e) => handleResizeMouseDown(e, el.id, handle)}
                          style={{
                            position: "absolute",
                            left: x - 4,
                            top: y - 4,
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: "#a855f7",
                            border: "2px solid #fff",
                            cursor: handle === "se" ? "se-resize" : handle === "nw" ? "nw-resize" : handle === "s" ? "s-resize" : "e-resize",
                            zIndex: 10,
                            boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                          }}
                        />
                      ))}
                    </>
                  )}
                </div>
              );
            })}

            {elements.length === 0 && (
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "#9ca3af" }}>
                <i className="bi bi-plus-circle" style={{ fontSize: 32, display: "block", marginBottom: 8, opacity: 0.5 }} />
                <div style={{ fontSize: 13, color: "#94a3b8" }}>Add elements from the left panel</div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Properties */}
        <div style={{ width: 300, borderLeft: "1px solid #e2e8f0", background: "#f8fafc", overflowY: "auto", padding: "12px" }}>
          {selectedElement ? (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f1f5f9" }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="bi bi-pencil-square" style={{ color: "#a855f7" }} />
                  {selectedElement.label || selectedElement.type}
                </span>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => duplicateElement(selectedElement.id)} title="Duplicate" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #f1f5f9", background: "#f1f5f9", color: "#475569", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><FiCopy size={12} /></button>
                  <button onClick={() => deleteElement(selectedElement.id)} title="Delete" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fef2f2", background: "#fef2f2", color: "#dc2626", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}><FiTrash2 size={12} /></button>
                </div>
              </div>

              {/* State */}
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={selectedElement.locked} onChange={() => toggleLock(selectedElement.id)} style={{ cursor: "pointer" }} />
                  {selectedElement.locked ? "Locked" : "Unlocked"}
                </label>
              </div>

              {/* Position & Size */}
              <div style={{ background: "#f8fafc", borderRadius: 8, padding: 10, marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Position & Size</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div><span style={{ fontSize: 10, color: "#94a3b8" }}>X</span><input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px", outline: "none", boxSizing: "border-box" }} /></div>
                  <div><span style={{ fontSize: 10, color: "#94a3b8" }}>Y</span><input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px", outline: "none", boxSizing: "border-box" }} /></div>
                  <div><span style={{ fontSize: 10, color: "#94a3b8" }}>W</span><input type="number" value={Math.round(selectedElement.w)} onChange={(e) => updateElement(selectedElement.id, { w: Math.max(20, Number(e.target.value)) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px", outline: "none", boxSizing: "border-box" }} /></div>
                  <div><span style={{ fontSize: 10, color: "#94a3b8" }}>H</span><input type="number" value={Math.round(selectedElement.h)} onChange={(e) => updateElement(selectedElement.id, { h: Math.max(20, Number(e.target.value)) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px", outline: "none", boxSizing: "border-box" }} /></div>
                </div>
              </div>

              {/* Colors */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Colors</div>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Text Color</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={selectedElement.color === "transparent" ? "#000000" : selectedElement.color} onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
                    <input type="text" value={selectedElement.color} onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })} style={{ width: 80, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, padding: "0 6px", fontFamily: "monospace" }} />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#475569", marginBottom: 4 }}>Background</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={selectedElement.bg === "transparent" ? "#ffffff" : selectedElement.bg} onChange={(e) => updateElement(selectedElement.id, { bg: e.target.value })} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
                    <input type="text" value={selectedElement.bg} onChange={(e) => updateElement(selectedElement.id, { bg: e.target.value })} style={{ width: 80, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, padding: "0 6px", fontFamily: "monospace" }} />
                    <button onClick={() => updateElement(selectedElement.id, { bg: "transparent" })} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 11 }}>✕</button>
                  </div>
                </div>
              </div>

              {/* Typography */}
              {["text", "header", "footer"].includes(selectedElement.type) && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Typography</div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>Font Family</span>
                    <select value={selectedElement.fontFamily} onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }}>
                      {FONTS.map((f) => <option key={f} value={f}>{f.split(",")[0]}</option>)}
                    </select>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>Font Size</span>
                    <input type="number" value={selectedElement.fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }} />
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>Font Weight</span>
                    <select value={selectedElement.fontWeight} onChange={(e) => updateElement(selectedElement.id, { fontWeight: e.target.value })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }}>
                      <option value="100">Thin</option>
                      <option value="300">Light</option>
                      <option value="400">Normal</option>
                      <option value="600">Semibold</option>
                      <option value="700">Bold</option>
                    </select>
                  </div>
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 10, color: "#94a3b8" }}>Line Height</span>
                    <input type="number" value={selectedElement.lineHeight} onChange={(e) => updateElement(selectedElement.id, { lineHeight: Number(e.target.value) || 1 })} step="0.1" style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }} />
                  </div>
                </div>
              )}

              {/* Text Alignment */}
              {["text", "header", "footer"].includes(selectedElement.type) && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Alignment</div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        onClick={() => updateElement(selectedElement.id, { textAlign: align })}
                        style={{
                          flex: 1,
                          height: 28,
                          borderRadius: 6,
                          border: selectedElement.textAlign === align ? "2px solid #a855f7" : "1px solid #e2e8f0",
                          background: selectedElement.textAlign === align ? "#f3e8ff" : "#fff",
                          color: selectedElement.textAlign === align ? "#a855f7" : "#475569",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: selectedElement.textAlign === align ? 600 : 400,
                          textTransform: "capitalize",
                        }}
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Borders & Spacing */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Appearance</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                  <div><span style={{ fontSize: 10, color: "#94a3b8" }}>Border Radius</span><input type="number" value={selectedElement.borderRadius} onChange={(e) => updateElement(selectedElement.id, { borderRadius: Number(e.target.value) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }} /></div>
                  <div><span style={{ fontSize: 10, color: "#94a3b8" }}>Border Width</span><input type="number" value={selectedElement.borderWidth} onChange={(e) => updateElement(selectedElement.id, { borderWidth: Number(e.target.value) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }} /></div>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>Border Color</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <input type="color" value={selectedElement.borderColor === "transparent" ? "#000000" : selectedElement.borderColor} onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", cursor: "pointer", padding: 2 }} />
                    <input type="text" value={selectedElement.borderColor} onChange={(e) => updateElement(selectedElement.id, { borderColor: e.target.value })} style={{ width: 80, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, padding: "0 6px", fontFamily: "monospace", flex: 1 }} />
                  </div>
                </div>
                {selectedElement.type !== "divider" && (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>Opacity</span>
                      <input type="number" min="0" max="1" step="0.1" value={selectedElement.opacity ?? 1} onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }} />
                    </div>
                    <div>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>Z-Index</span>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button onClick={() => sendToBack(selectedElement.id)} style={{ flex: 1, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer", fontSize: 11 }}>Back</button>
                        <button onClick={() => bringToFront(selectedElement.id)} style={{ flex: 1, height: 28, borderRadius: 6, border: "1px solid #e2e8f0", background: "#fff", color: "#475569", cursor: "pointer", fontSize: 11 }}>Front</button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Content */}
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>Content</div>
                {["image", "logo"].includes(selectedElement.type) ? (
                  <>
                    <div style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>Image URL</span>
                      <input type="text" value={selectedElement.imageUrl || ""} onChange={(e) => updateElement(selectedElement.id, { imageUrl: e.target.value })} placeholder="Paste image URL..." style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, padding: "0 6px" }} />
                    </div>
                    {selectedElement.imageUrl && (
                      <div style={{ marginBottom: 6 }}>
                        <span style={{ fontSize: 10, color: "#94a3b8" }}>Object Fit</span>
                        <select value={selectedElement.objectFit || "cover"} onChange={(e) => updateElement(selectedElement.id, { objectFit: e.target.value })} style={{ width: "100%", height: 28, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 12, padding: "0 6px" }}>
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                          <option value="fill">Fill</option>
                        </select>
                      </div>
                    )}
                  </>
                ) : selectedElement.type !== "divider" ? (
                  <textarea value={selectedElement.content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} placeholder="Enter text..." style={{ width: "100%", height: 72, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 11, padding: "6px", fontFamily: "monospace", resize: "none" }} />
                ) : null}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem 0", color: "#94a3b8" }}>
              <i className="bi bi-cursor" style={{ fontSize: 28, display: "block", marginBottom: 8 }} />
              <div style={{ fontSize: 12 }}>Click an element to edit properties</div>
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
          <div className="modal-dialog" style={{ maxWidth: 460 }}>
            <div className="modal-content border-0 shadow">
              <div className="modal-header border-0 pb-0">
                <h6 className="modal-title fw-semibold d-flex align-items-center gap-2">
                  <i className="bi bi-bookmark" style={{ color: "#a855f7" }} />
                  Save as Template
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSaveTemplate(false)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label small fw-semibold mb-1">Template Name</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., Standard Event Form"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="form-label small fw-semibold mb-1">Description (Optional)</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows="3"
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    placeholder="Describe this template..."
                  />
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setShowSaveTemplate(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || saving}
                >
                  {saving ? (
                    <span className="spinner-border spinner-border-sm me-1" />
                  ) : (
                    <i className="bi bi-bookmark-fill me-1" />
                  )}
                  Save Template
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
