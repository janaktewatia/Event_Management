const BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const req = async (path, options = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
};

// Normalize MongoDB _id → id
const norm = (doc) => ({ ...doc, id: doc._id });
const normAll = (docs) => docs.map(norm);

// ── User Fields ──────────────────────────────────────────────────────────────
export const fetchUserFields = () => req("/user-fields").then(normAll);

export const createUserField = (data) =>
  req("/user-fields", { method: "POST", body: JSON.stringify(data) }).then(
    norm,
  );

export const patchUserField = (id, data) =>
  req(`/user-fields/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeUserField = (id) =>
  req(`/user-fields/${id}`, { method: "DELETE" });

// ── Categories ───────────────────────────────────────────────────────────────
export const fetchCategories = () => req("/categories").then(normAll);

export const createCategory = (data) =>
  req("/categories", { method: "POST", body: JSON.stringify(data) }).then(norm);

export const patchCategory = (id, data) =>
  req(`/categories/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeCategory = (id) =>
  req(`/categories/${id}`, { method: "DELETE" });

// ── Events ───────────────────────────────────────────────────────────────────
export const fetchEvents = () => req("/events").then(normAll);

export const createEvent = (data) =>
  req("/events", { method: "POST", body: JSON.stringify(data) }).then(norm);

export const patchEvent = (id, data) =>
  req(`/events/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeEvent = (id) => req(`/events/${id}`, { method: "DELETE" });

// ── Event Types ──────────────────────────────────────────────────────────────
export const fetchEventTypes = () => req("/event-types").then(normAll);

export const createEventType = (data) =>
  req("/event-types", { method: "POST", body: JSON.stringify(data) }).then(
    norm,
  );

export const patchEventType = (id, data) =>
  req(`/event-types/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeEventType = (id) =>
  req(`/event-types/${id}`, { method: "DELETE" });

// ── Attendees ────────────────────────────────────────────────────────────────
export const fetchAttendees = (eventId) =>
  req(`/attendees${eventId ? `?eventId=${eventId}` : ""}`).then(normAll);

export const createAttendee = (eventId, data) =>
  req("/attendees", {
    method: "POST",
    body: JSON.stringify({ eventId, ...data }),
  }).then(norm);

export const bulkCreateAttendees = (eventId, attendees) =>
  req("/attendees/bulk", {
    method: "POST",
    body: JSON.stringify({ eventId, attendees }),
  }).then(normAll);

export const patchAttendee = (id, data) =>
  req(`/attendees/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeAttendee = (id) =>
  req(`/attendees/${id}`, { method: "DELETE" });

// ── Pass Templates ───────────────────────────────────────────────────────────
export const fetchPassTemplates = () => req("/pass-templates").then(normAll);

export const createPassTemplate = (data) =>
  req("/pass-templates", { method: "POST", body: JSON.stringify(data) }).then(
    norm,
  );

export const updatePassTemplate = (id, data) =>
  req(`/pass-templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then(norm);

export const deletePassTemplate = (id) =>
  req(`/pass-templates/${id}`, { method: "DELETE" });

// ── Auth ──────────────────────────────────────────────────────────────────────
export const loginUser = (userId, password) =>
  req("/auth/login", {
    method: "POST",
    body: JSON.stringify({ userId, password }),
  });

export const verify2FA = (userId, token, isSetup = false) =>
  req("/auth/2fa/verify", {
    method: "POST",
    body: JSON.stringify({ userId, token, isSetup }),
  });

// ── User Types ────────────────────────────────────────────────────────────────
export const fetchUserTypes = () => req("/user-types").then(normAll);

export const createUserType = (data) =>
  req("/user-types", { method: "POST", body: JSON.stringify(data) }).then(norm);

export const patchUserType = (id, data) =>
  req(`/user-types/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeUserType = (id) =>
  req(`/user-types/${id}`, { method: "DELETE" });

// ── App Users ────────────────────────────────────────────────────────────────
export const fetchAppUsers = () => req("/app-users").then(normAll);

export const createAppUser = (data) =>
  req("/app-users", { method: "POST", body: JSON.stringify(data) }).then(norm);

export const patchAppUser = (id, data) =>
  req(`/app-users/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(
    norm,
  );

export const removeAppUser = (id) =>
  req(`/app-users/${id}`, { method: "DELETE" });

// ── Event Logs ────────────────────────────────────────────────────────────────
export const fetchEventLogs = (eventId) =>
  req(`/event-logs?eventId=${eventId}`);

export const createEventLog = (data) =>
  req("/event-logs", { method: "POST", body: JSON.stringify(data) });

export const clearEventLogs = (eventId) =>
  req(`/event-logs?eventId=${eventId}`, { method: "DELETE" });

// ── Public Registration (no auth) ─────────────────────────────────────────────
export const fetchPublicEvent = (eventId) => req(`/public/event/${eventId}`);

export const publicRegister = (eventId, data) =>
  req("/public/register", {
    method: "POST",
    body: JSON.stringify({ eventId, ...data }),
  });

// ── Forms ─────────────────────────────────────────────────────────────────────
export const fetchForms = () => req("/forms").then(normAll);

export const createForm = (data) =>
  req("/forms", { method: "POST", body: JSON.stringify(data) }).then(norm);

export const updateForm = (id, data) =>
  req(`/forms/${id}`, { method: "PUT", body: JSON.stringify(data) }).then(norm);

export const deleteForm = (id) => req(`/forms/${id}`, { method: "DELETE" });

// ── Form Templates ────────────────────────────────────────────────────────────
export const fetchFormTemplates = () => req("/form-templates").then(normAll);

export const createFormTemplate = (data) =>
  req("/form-templates", { method: "POST", body: JSON.stringify(data) }).then(
    norm,
  );

export const deleteFormTemplate = (id) =>
  req(`/form-templates/${id}`, { method: "DELETE" });
