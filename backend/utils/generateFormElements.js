export const generateDefaultFormElements = (form) => {
  if (!form) return [];

  const enabledFields = (form.fields || []).filter((f) => f.enabled !== false);
  const defaultElements = [];
  let zIndex = 1;

  // Background Image
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "image",
    x: 0,
    y: 0,
    w: 600,
    h: 1000,
    label: "Background Image",
    imageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=1000&fit=crop",
    objectFit: "cover",
    opacity: 0.25,
    zIndex: zIndex++,
  });

  // Brand Background
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "text",
    x: 20,
    y: 30,
    w: 280,
    h: 200,
    label: "Brand Background",
    content: "",
    bg: "rgba(51, 51, 51, 0.7)",
    borderRadius: 12,
    zIndex: zIndex++,
  });

  // Main Heading
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "header",
    x: 40,
    y: 50,
    w: 240,
    h: 60,
    label: "Main Heading",
    content: "Welcome!",
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
    textAlign: "left",
    bg: "transparent",
    zIndex: zIndex++,
  });

  // Brand Description
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "text",
    x: 40,
    y: 120,
    w: 240,
    h: 60,
    label: "Brand Description",
    content: form.formName + "\n\nFill out the form and get started today!",
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "left",
    lineHeight: 1.5,
    zIndex: zIndex++,
  });

  // Right side form section
  const formX = 320;
  const formW = 260;
  let currentY = 40;

  // Logo
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "image",
    x: formX + 85,
    y: currentY,
    w: 90,
    h: 50,
    label: "Logo",
    imageUrl: "https://via.placeholder.com/90x50/667eea/ffffff?text=Logo",
    objectFit: "contain",
    zIndex: zIndex++,
  });

  currentY += 70;

  // Form Title
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "header",
    x: formX + 10,
    y: currentY,
    w: formW - 20,
    h: 50,
    label: "Form Title",
    content: form.formName || "Registration Form",
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
    textAlign: "center",
    bg: "transparent",
    zIndex: zIndex++,
  });

  currentY += 60;

  // Form Subtitle
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "text",
    x: formX + 10,
    y: currentY,
    w: formW - 20,
    h: 40,
    label: "Form Subtitle",
    content: "Please provide your information",
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    zIndex: zIndex++,
  });

  currentY += 50;

  // Form Fields Section (placeholder)
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "text",
    x: formX + 5,
    y: currentY,
    w: formW - 10,
    h: (enabledFields.length * 60) + 100,
    label: "Form Fields Container",
    content: "",
    bg: "#ffffff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    zIndex: zIndex++,
  });

  currentY += (enabledFields.length * 70) + 120;

  // Footer
  defaultElements.push({
    id: Math.random().toString(36).slice(2, 9),
    type: "footer",
    x: 20,
    y: currentY,
    w: 560,
    h: 40,
    label: "Footer",
    content: "Powered by Event Management",
    fontSize: 12,
    fontWeight: "400",
    color: "#94a3b8",
    textAlign: "center",
    bg: "#f8fafc",
    borderRadius: 0,
    zIndex: zIndex++,
  });

  return defaultElements;
};
