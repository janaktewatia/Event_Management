import React, { useState, useMemo } from "react";
import {
  TbVolume2,
  TbBell,
  TbLock,
  TbSearch,
  TbChevronDown,
  TbPlus,
  TbX,
  TbArrowUpRight,
  TbExternalLink,
  TbCornerUpLeft,
  TbCheck,
  TbUpload,
} from "react-icons/tb";
import "./WhatsAppTemplateCreator.css";

const WhatsAppTemplateCreator = () => {
  const mockTemplates = [
    {
      name: "pending_fee",
      preview: "Dear Parent, Fee Of your ward...",
      category: "Utility",
      language: "English",
      status: "In review",
      lastEdited: "12 Jun 2026",
    },
    {
      name: "exam_official_notific",
      preview: "Dear Parent, Exam schedule...",
      category: "Utility",
      language: "English",
      status: "In review",
      lastEdited: "12 Jun 2026",
    },
    {
      name: "hello_world",
      preview: "Welcome and confirmation...",
      category: "Utility",
      language: "English (US)",
      status: "Active",
      lastEdited: "11 Jun 2026",
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState("Utility");
  const [selectedCategoryType, setSelectedCategoryType] = useState("Default");
  const [templateName, setTemplateName] = useState("pending_fee");
  const [language, setLanguage] = useState("English");
  const [mediaType, setMediaType] = useState("Image");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaFileName, setMediaFileName] = useState("knowvatologo (1).png");
  const [headerText, setHeaderText] = useState("Pending Fee Reminder");
  const [bodyText, setBodyText] = useState(
    "Dear Parent,\n\nFee Of your ward {{1}} is pending for the Amount {{2}}. Kindly clear the dues.\n\nRegards,"
  );
  const [footerText, setFooterText] = useState("Knowvato Solution");
  const [variables, setVariables] = useState([
    { placeholder: "{{1}}", sampleValue: "name" },
    { placeholder: "{{2}}", sampleValue: "number" },
  ]);
  const [buttons, setButtons] = useState([]);
  const [showButtonsSection, setShowButtonsSection] = useState(false);
  const [saving, setSaving] = useState(false);

  const categoryOptions = {
    Marketing: [
      { label: "Default", description: "Standard marketing message" },
      { label: "Catalogue", description: "Message with product catalogue" },
      { label: "Calling permissions request", description: "Request calling permission" },
    ],
    Utility: [
      { label: "Default", description: "Standard utility message" },
      { label: "Calling permissions request", description: "Request calling permission" },
    ],
    Authentication: [
      { label: "One-time passcode", description: "OTP verification message" },
    ],
  };

  const buttonTypeOptions = {
    quick_reply: { label: "Custom", icon: "↵" },
    call_to_action: { label: "Visit website", icon: "→" },
    call_whatsapp: { label: "Call on WhatsApp", icon: "☎" },
    call_phone: { label: "Call Phone Number", icon: "☎" },
  };

  const extractVariables = () => {
    const matches = bodyText.match(/\{\{(\d+)\}\}/g) || [];
    return [...new Set(matches)];
  };

  const renderedBodyText = useMemo(() => {
    let text = bodyText;
    variables.forEach((v) => {
      text = text.replace(new RegExp(`\\${v.placeholder}`, "g"), `<strong>${v.sampleValue}</strong>`);
    });
    return text;
  }, [bodyText, variables]);

  const handleAddVariable = () => {
    const currentVars = extractVariables();
    const nextNum = currentVars.length + 1;
    const newPlaceholder = `{{${nextNum}}}`;
    setBodyText(bodyText + ` ${newPlaceholder}`);
    setVariables([...variables, { placeholder: newPlaceholder, sampleValue: "" }]);
  };

  const handleAddButton = (type = "quick_reply") => {
    const newId = `btn_${Date.now()}`;
    let newButton = { id: newId, type };
    
    if (type === "quick_reply") {
      newButton = { ...newButton, text: "Quick Reply" };
    } else if (type === "call_to_action") {
      newButton = { ...newButton, text: "Visit website", actionType: "Visit website", actionValue: "" };
    } else if (type === "call_whatsapp") {
      newButton = { ...newButton, text: "Call on WhatsApp", phone: "" };
    } else if (type === "call_phone") {
      newButton = { ...newButton, text: "Call Phone Number", phone: "" };
    }
    
    setButtons([...buttons, newButton]);
    setShowButtonsSection(true);
  };

  const handleRemoveButton = (id) => {
    const updated = buttons.filter((btn) => btn.id !== id);
    setButtons(updated);
    if (updated.length === 0) {
      setShowButtonsSection(false);
    }
  };

  const handleUpdateButton = (id, field, value) => {
    setButtons(buttons.map((btn) => (btn.id === id ? { ...btn, [field]: value } : btn)));
  };

  const handleUpdateVariable = (idx, value) => {
    const updated = [...variables];
    updated[idx].sampleValue = value;
    setVariables(updated);
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      setMediaFileName(file.name);
    }
  };

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("templateName", templateName);
      formData.append("category", selectedCategory);
      formData.append("categoryType", selectedCategoryType);
      formData.append("language", language);
      formData.append("headerText", headerText);
      formData.append("bodyText", bodyText);
      formData.append("footerText", footerText);
      formData.append("buttons", JSON.stringify(buttons));
      formData.append("variables", JSON.stringify(variables));
      
      if (mediaFile && mediaType !== "None") {
        formData.append("mediaFile", mediaFile);
        formData.append("mediaType", mediaType);
      }

      const response = await fetch("/api/whatsapp/templates", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        alert("✅ Template submitted for Meta approval!");
      } else {
        alert("❌ Failed to save template");
      }
    } catch (error) {
      alert("❌ Error: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="whatsapp-template-creator">
      <div className="template-section">
        <div className="template-section-header">
          <h1>Templates</h1>
          <p>Create, sync and test WhatsApp message templates.</p>
        </div>
        <div className="toolbar">
          <div className="toolbar-left">
            <div className="search-input">
              <TbSearch size={18} />
              <input type="text" placeholder="Search" />
            </div>
            <select className="dropdown">
              <option>Category</option>
              <option>Marketing</option>
              <option>Utility</option>
              <option>Authentication</option>
            </select>
            <select className="dropdown">
              <option>Language</option>
              <option>English</option>
              <option>Hindi</option>
            </select>
            <select className="dropdown">
              <option>8 options selected</option>
            </select>
          </div>
          <button className="btn-primary">
            <TbPlus size={18} />
            Create Template
          </button>
        </div>

        <div className="table-card">
          <table className="templates-table">
            <thead>
              <tr>
                <th style={{ width: "40px" }}>
                  <input type="checkbox" />
                </th>
                <th>Template name</th>
                <th>Category</th>
                <th>Language</th>
                <th>Status</th>
                <th>Last edited</th>
              </tr>
            </thead>
            <tbody>
              {mockTemplates.map((t, idx) => (
                <tr key={idx}>
                  <td>
                    <input type="checkbox" />
                  </td>
                  <td className="name-cell">
                    <div className="template-name">{t.name}</div>
                    <div className="template-preview">{t.preview}</div>
                  </td>
                  <td>{t.category}</td>
                  <td>{t.language}</td>
                  <td>
                    <span className={`pill pill-${t.status === "Active" ? "active" : "review"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>{t.lastEdited}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="table-footer">3 templates shown (total active: 3 of 250)</div>
        </div>
      </div>

      <div className="main-grid">
        <div className="left-column">
          <div className="card">
            <h3>Set up your template</h3>
            <p className="helper-text">Choose the category that best describes your message template.</p>
            <div className="tab-group">
              {["Marketing", "Utility", "Authentication"].map((cat) => (
                <button key={cat} className={`tab-button ${selectedCategory === cat ? "active" : ""}`}
                  onClick={() => { setSelectedCategory(cat); setSelectedCategoryType(categoryOptions[cat][0].label); }}
                  style={{ background: selectedCategory === cat ? "var(--surface)" : "transparent", color: selectedCategory === cat ? "var(--accent)" : "var(--text-muted)" }}>
                  {cat === "Marketing" && <TbVolume2 />}
                  {cat === "Utility" && <TbBell />}
                  {cat === "Authentication" && <TbLock />}
                  {cat}
                </button>
              ))}
            </div>
            <div className="options-group">
              {categoryOptions[selectedCategory].map((opt) => (
                <label key={opt.label} className={`option-card ${selectedCategoryType === opt.label ? "selected" : ""}`}
                  style={{ background: selectedCategoryType === opt.label ? "var(--pill-bg)" : "transparent" }}>
                  <input type="radio" name="category-option" value={opt.label} checked={selectedCategoryType === opt.label}
                    onChange={(e) => setSelectedCategoryType(e.target.value)} />
                  <div className="option-content">
                    <div className="option-title">{opt.label}</div>
                    <div className="option-description">{opt.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="card">
            <h3>Template name and language</h3>
            <div className="two-col-row">
              <div className="input-wrapper">
                <label>Name your template</label>
                <div className="input-container">
                  <input type="text" value={templateName} onChange={(e) => setTemplateName(e.target.value)} maxLength={512} />
                  <div className="input-counter">{templateName.length}/512 {templateName.length > 0 && <TbCheck size={16} />}</div>
                </div>
              </div>
              <div className="input-wrapper">
                <label>Select language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="full-width">
                  <option>English</option><option>Hindi</option><option>Spanish</option>
                </select>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Content</h3>
            <p className="helper-text">Add header, body, and footer content. <a href="#" style={{ color: "var(--accent)" }}>Learn more</a></p>
            <div className="two-col-row">
              <div className="input-wrapper">
                <label>Type of variable</label>
                <select className="full-width"><option>Number</option><option>Text</option></select>
              </div>
              <div className="input-wrapper">
                <label>Media sample · Optional</label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value)} className="full-width">
                  <option>None</option><option>Image</option><option>Video</option><option>Document</option><option>Location</option>
                </select>
              </div>
            </div>

            {mediaType !== "None" && (
              <div className="input-wrapper">
                <label>Upload {mediaType}</label>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                  <input type="file" id="media-upload" onChange={handleMediaUpload} style={{ display: "none" }}
                    accept={mediaType === "Image" ? "image/*" : mediaType === "Video" ? "video/*" : mediaType === "Document" ? ".pdf,.doc,.docx" : "*"} />
                  <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                    onClick={() => document.getElementById("media-upload").click()}>
                    <TbUpload size={16} /> Choose {mediaType}
                  </button>
                  {mediaFile && (
                    <div className="file-chip">
                      <div className="file-avatar">K</div>
                      <div className="file-name">{mediaFileName}</div>
                      <button className="btn-remove" onClick={() => { setMediaFile(null); setMediaFileName(""); }}>
                        <TbX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="input-wrapper">
              <label>Header · Optional</label>
              <div className="input-container">
                <input type="text" value={headerText} onChange={(e) => setHeaderText(e.target.value)} maxLength={60} />
                <div className="input-counter">{headerText.length}/60</div>
              </div>
            </div>
            <div className="input-wrapper">
              <label>Body</label>
              <div className="textarea-wrapper">
                <textarea value={bodyText} onChange={(e) => setBodyText(e.target.value)} rows={5} />
                <div className="textarea-toolbar">
                  <div className="formatting-icons">
                    <button className="icon-btn">😀</button>
                    <button className="icon-btn"><strong>B</strong></button>
                    <button className="icon-btn"><em>I</em></button>
                    <button className="icon-btn"><s>S</s></button>
                    <button className="icon-btn">&lt;/&gt;</button>
                  </div>
                  <button className="btn-add-variable" onClick={handleAddVariable}>
                    <TbPlus size={16} /> Add variable
                  </button>
                </div>
              </div>
            </div>
            <div className="input-wrapper">
              <label>Footer · Optional</label>
              <div className="input-container">
                <input type="text" value={footerText} onChange={(e) => setFooterText(e.target.value)} maxLength={60} />
                <div className="input-counter">{footerText.length}/60</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Variable samples</h3>
            <p className="helper-text">Include sample values for Meta's review process.</p>
            <div className="variables-list">
              {variables.map((v, idx) => (
                <div key={idx} className="variable-row">
                  <input type="text" value={v.placeholder} disabled className="var-placeholder" />
                  <input type="text" value={v.sampleValue} onChange={(e) => handleUpdateVariable(idx, e.target.value)} placeholder="Sample value" className="var-value" />
                </div>
              ))}
            </div>
          </div>

          {showButtonsSection && (
            <div className="card">
              <h3>Buttons · Optional</h3>
              <p className="helper-text">Create buttons that let customers respond. They will appear in a list.</p>

              {buttons.map((btn) => (
                <div key={btn.id} className="button-section">
                  {btn.type === "quick_reply" && (
                    <div className="button-row">
                      <label>Quick Reply · Optional</label>
                      <div className="button-fields">
                        <select className="btn-field" value={btn.type} onChange={(e) => handleUpdateButton(btn.id, "type", e.target.value)}>
                          <option value="quick_reply">Custom</option>
                          <option value="call_to_action">Visit website</option>
                          <option value="call_whatsapp">Call on WhatsApp</option>
                          <option value="call_phone">Call Phone Number</option>
                        </select>
                        <div className="btn-input-wrapper">
                          <input type="text" value={btn.text} onChange={(e) => handleUpdateButton(btn.id, "text", e.target.value)} maxLength={40} placeholder="Button text" />
                          <span className="btn-counter">{btn.text.length}/40</span>
                        </div>
                        <button className="btn-remove" onClick={() => handleRemoveButton(btn.id)}><TbX size={18} /></button>
                      </div>
                    </div>
                  )}

                  {btn.type === "call_to_action" && (
                    <div className="button-row">
                      <label>Call to Action · Optional</label>
                      <div className="button-fields">
                        <select className="btn-field" value={btn.type} onChange={(e) => handleUpdateButton(btn.id, "type", e.target.value)}>
                          <option value="quick_reply">Custom</option>
                          <option value="call_to_action">Visit website</option>
                          <option value="call_whatsapp">Call on WhatsApp</option>
                          <option value="call_phone">Call Phone Number</option>
                        </select>
                        <select className="btn-field" value={btn.actionType || "Visit website"} onChange={(e) => handleUpdateButton(btn.id, "actionType", e.target.value)}>
                          <option>Visit website</option>
                          <option>Call Phone</option>
                        </select>
                        <div className="btn-input-wrapper">
                          <input type="text" value={btn.text} onChange={(e) => handleUpdateButton(btn.id, "text", e.target.value)} maxLength={40} placeholder="Button text" />
                          <span className="btn-counter">{btn.text.length}/40</span>
                        </div>
                        <select className="btn-field">
                          <option>Static</option>
                          <option>Dynamic</option>
                        </select>
                        <input type="text" placeholder={btn.actionType === "Visit website" ? "https://www.example.cc" : "Phone number"} value={btn.actionValue || ""} onChange={(e) => handleUpdateButton(btn.id, "actionValue", e.target.value)} className="url-input" />
                        <button className="btn-remove" onClick={() => handleRemoveButton(btn.id)}><TbX size={18} /></button>
                      </div>
                    </div>
                  )}

                  {(btn.type === "call_whatsapp" || btn.type === "call_phone") && (
                    <div className="button-row">
                      <label>{btn.type === "call_whatsapp" ? "Call on WhatsApp" : "Call Phone Number"} · Optional</label>
                      <div className="button-fields">
                        <select className="btn-field" value={btn.type} onChange={(e) => handleUpdateButton(btn.id, "type", e.target.value)}>
                          <option value="quick_reply">Custom</option>
                          <option value="call_to_action">Visit website</option>
                          <option value="call_whatsapp">Call on WhatsApp</option>
                          <option value="call_phone">Call Phone Number</option>
                        </select>
                        <div className="btn-input-wrapper">
                          <input type="text" value={btn.text} onChange={(e) => handleUpdateButton(btn.id, "text", e.target.value)} maxLength={40} placeholder="Button text" />
                          <span className="btn-counter">{btn.text.length}/40</span>
                        </div>
                        <input type="text" value={btn.phone || ""} onChange={(e) => handleUpdateButton(btn.id, "phone", e.target.value)} placeholder="Phone number" className="url-input" />
                        <button className="btn-remove" onClick={() => handleRemoveButton(btn.id)}><TbX size={18} /></button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <button className="btn-add-button" onClick={() => handleAddButton("quick_reply")}>
                <TbPlus size={16} /> Add button <TbChevronDown size={16} />
              </button>
            </div>
          )}

          {!showButtonsSection && (
            <div className="card">
              <h3>Buttons · Optional</h3>
              <p className="helper-text">Create buttons that let customers respond. They will appear in a list.</p>
              <button className="btn-add-button" onClick={() => setShowButtonsSection(true)}>
                <TbPlus size={16} /> Add button <TbChevronDown size={16} />
              </button>
            </div>
          )}

          <div className="footer-actions">
            <button className="btn-cancel">Cancel</button>
            <button className="btn-primary" onClick={handleSaveTemplate} disabled={saving}>
              {saving ? "Submitting..." : "Submit for review"}
            </button>
          </div>
        </div>

        <div className="right-column">
          <div className="card sticky-card">
            <div className="card-header">
              <h3>Template preview</h3>
              <span style={{ color: "var(--text-muted)", opacity: 0.6, fontSize: "20px" }}>▶</span>
            </div>
            <div className="preview-container">
              {mediaFile && <div className="preview-media">K</div>}
              <div className="message-bubble">
                {headerText && <div className="bubble-header">{headerText}</div>}
                <div className="bubble-body" dangerouslySetInnerHTML={{ __html: renderedBodyText.replace(/\n/g, "<br/>") }} />
                {footerText && (
                  <div className="bubble-footer">
                    <span>{footerText}</span>
                    <span className="bubble-time">08:32</span>
                  </div>
                )}
              </div>
              {buttons.length > 0 && (
                <div className="preview-buttons">
                  {buttons.map((btn) => (
                    <div key={btn.id} className="preview-button-row">
                      {btn.type === "quick_reply" && (
                        <>
                          <TbCornerUpLeft size={16} />
                          <span>{btn.text}</span>
                        </>
                      )}
                      {(btn.type === "call_to_action" || btn.type === "call_whatsapp" || btn.type === "call_phone") && (
                        <>
                          <TbExternalLink size={16} />
                          <span>{btn.text}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card">
            <h3>About templates</h3>
            <p className="about-text">
              WhatsApp templates help you send structured messages. Include sample values for Meta's review.
              <a href="#" style={{ color: "var(--accent)" }}> Learn more →</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppTemplateCreator;
