import React, { useState } from "react";
import {
  FiTrash2,
  FiCopy,
  FiSearch,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";
import { useForm } from "../context/FormContext";

const FormTemplatePage = () => {
  const {
    formTemplates,
    templatesLoading,
    templatesError,
    deleteTemplate,
    loadTemplate,
    forms,
  } = useForm();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filteredTemplates = formTemplates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleDeleteTemplate = async (templateId) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      setDeleting(templateId);
      try {
        await deleteTemplate(templateId);
      } catch (error) {
        alert("Failed to delete template: " + error.message);
      } finally {
        setDeleting(null);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="card border-0 shadow-sm h-100">
      <div
        className="card-body p-0"
        style={{ display: "flex", flexDirection: "column" }}
      >
        {/* Header */}
        <div className="p-3 border-bottom bg-light">
          <div className="mb-3">
            <h5 className="fw-bold mb-1">Form Templates</h5>
            <p className="text-muted small mb-0">
              Saved form templates that can be reused for new forms.
            </p>
          </div>

          {/* Search */}
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-white">
              <FiSearch />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto" }} className="p-3">
          {templatesLoading && (
            <div className="p-5 text-center">
              <div className="spinner-border text-primary mb-3" />
              <div className="text-muted">Loading templates...</div>
            </div>
          )}

          {templatesError && !templatesLoading && (
            <div className="alert alert-warning d-flex align-items-center m-3">
              <FiAlertCircle className="me-2" />
              <div>
                <strong>Error loading templates:</strong> {templatesError}
              </div>
            </div>
          )}

          {!templatesLoading && filteredTemplates.length === 0 ? (
            <div className="text-center py-5">
              <div className="text-muted">
                {formTemplates.length === 0
                  ? "No templates yet. Create one by saving a form design as a template."
                  : "No matching templates found."}
              </div>
            </div>
          ) : (
            <div className="row g-3">
              {filteredTemplates.map((template) => {
                const elementCount = template.elements?.length || 0;
                return (
                  <div key={template.id} className="col-md-6">
                    <div
                      className="card border-light h-100"
                      style={{
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <h6 className="card-title fw-semibold mb-0">
                            {template.name}
                          </h6>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleDeleteTemplate(template.id)}
                              title="Delete template"
                              disabled={deleting === template.id}
                            >
                              {deleting === template.id ? (
                                <span className="spinner-border spinner-border-sm" />
                              ) : (
                                <FiTrash2 size={14} />
                              )}
                            </button>
                          </div>
                        </div>

                        {template.description && (
                          <p className="card-text small text-muted mb-2">
                            {template.description}
                          </p>
                        )}

                        <div className="small text-muted mb-3">
                          <div>Elements: {elementCount}</div>
                          <div>Created: {formatDate(template.createdAt)}</div>
                        </div>

                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary flex-grow-1"
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <FiInfo size={12} className="me-1" /> View Details
                          </button>
                          <button
                            className="btn btn-sm btn-primary flex-grow-1"
                            onClick={() => {
                              alert(
                                `Template "${template.name}" copied! You can now create a new form with this template.`,
                              );
                            }}
                          >
                            <FiCopy size={12} className="me-1" /> Use Template
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Template Details Modal */}
      {selectedTemplate && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.5)", zIndex: 1050 }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Template Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedTemplate(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label fw-semibold">Name</label>
                  <div>{selectedTemplate.name}</div>
                </div>

                {selectedTemplate.description && (
                  <div className="mb-3">
                    <label className="form-label fw-semibold">
                      Description
                    </label>
                    <div>{selectedTemplate.description}</div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label fw-semibold">Elements</label>
                  <div
                    className="bg-light p-3 rounded"
                    style={{ maxHeight: "300px", overflowY: "auto" }}
                  >
                    {selectedTemplate.elements?.length === 0 ? (
                      <div className="text-muted small">No elements</div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {selectedTemplate.elements?.map((el, idx) => (
                          <div key={idx} className="list-group-item p-2">
                            <div className="small">
                              <strong>{el.type}</strong> - {el.content}
                            </div>
                            <div className="text-muted small">
                              Position: ({el.x}, {el.y}) | Size: {el.width}x
                              {el.height}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">
                      Created
                    </label>
                    <div className="small">
                      {formatDate(selectedTemplate.createdAt)}
                    </div>
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">
                      Elements
                    </label>
                    <div className="small">
                      {selectedTemplate.elements?.length || 0} items
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    alert(
                      `Template "${selectedTemplate.name}" is ready to use!`,
                    );
                    setSelectedTemplate(null);
                  }}
                >
                  <FiCopy className="me-1" /> Use This Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormTemplatePage;
