import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useEventData } from "../context/EventDataContext";

const THEME = "#A855F7";

const StatCard = ({ icon, label, value, sub, color, onClick }) => (
  <div
    className="card border-0 shadow-sm h-100"
    style={{ cursor: onClick ? "pointer" : "default", borderRadius: 12 }}
    onClick={onClick}
  >
    <div className="card-body p-3 d-flex align-items-center gap-3">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: color + "1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 22, color }} />
      </div>
      <div className="min-w-0">
        <div className="text-muted small mb-0" style={{ fontSize: 12 }}>
          {label}
        </div>
        <div className="fw-bold" style={{ fontSize: 26, lineHeight: 1.1, color: "#172033" }}>
          {value}
        </div>
        {sub && (
          <div className="text-muted" style={{ fontSize: 11 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    Active:    { bg: "#d1fae5", color: "#065f46" },
    Draft:     { bg: "#f3f4f6", color: "#4b5563" },
    Completed: { bg: "#ede9fe", color: "#5b21b6" },
    Imported:  { bg: "#dbeafe", color: "#1e40af" },
  };
  const s = map[status] || map.Draft;
  return (
    <span
      className="badge"
      style={{ background: s.bg, color: s.color, fontWeight: 600, fontSize: 11 }}
    >
      {status || "Draft"}
    </span>
  );
};

const DashboardPage = () => {
  const navigate = useNavigate();
  const { events, attendees } = useEventData();

  const totalEvents    = events.length;
  const activeEvents   = events.filter((e) => e.status === "Active").length;
  const draftEvents    = events.filter((e) => !e.status || e.status === "Draft").length;
  const totalAttendees = attendees.length > 0
    ? attendees.length
    : events.reduce((s, e) => s + (e.attendeeCount || 0), 0);

  const checkedIn  = attendees.filter((a) => a.status === "checked-in").length;
  const checkedOut = attendees.filter((a) => a.status === "checked-out").length;
  const registered = attendees.filter(
    (a) => !a.status || a.status === "registered",
  ).length;

  const passesGenerated = events.filter((e) => e.passDesignSaved || e.passStatus === "generated").length;

  // Recent events sorted by creation (latest first)
  const recentEvents = useMemo(
    () => [...events].sort((a, b) => (b.id > a.id ? 1 : -1)).slice(0, 8),
    [events],
  );

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="container-fluid p-2 fade-in">
      {/* Welcome header */}
      <div className="card border-0 shadow-sm mb-3" style={{ borderRadius: 14 }}>
        <div
          className="card-body p-3 d-flex align-items-center justify-content-between"
          style={{
            background: `linear-gradient(120deg, ${THEME} 0%, #7c3aed 100%)`,
            borderRadius: 14,
          }}
        >
          <div>
            <div className="fw-bold text-white mb-1" style={{ fontSize: 18 }}>
              Dashboard
            </div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 12 }}>
              {today}
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                fontSize: 12,
              }}
              onClick={() => navigate("/events?mode=new")}
            >
              <i className="bi bi-plus-circle me-1" />
              New Event
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                background: "rgba(255,255,255,0.18)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                fontSize: 12,
              }}
              onClick={() => navigate("/scan")}
            >
              <i className="bi bi-qr-code-scan me-1" />
              Scan Pass
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="row g-2 mb-3">
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-calendar-event"
            label="Total Events"
            value={totalEvents}
            sub={`${activeEvents} active · ${draftEvents} draft`}
            color={THEME}
            onClick={() => navigate("/events")}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-people"
            label="Total Attendees"
            value={totalAttendees}
            sub={`${registered} registered`}
            color="#3B82F6"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-box-arrow-in-right"
            label="Checked In"
            value={checkedIn}
            sub={
              totalAttendees > 0
                ? `${Math.round((checkedIn / totalAttendees) * 100)}% of total`
                : "—"
            }
            color="#10B981"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-box-arrow-right"
            label="Checked Out"
            value={checkedOut}
            sub={`${passesGenerated} pass design${passesGenerated !== 1 ? "s" : ""} saved`}
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Events table */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          <div
            className="d-flex align-items-center justify-content-between px-3 py-2"
            style={{ borderBottom: "1px solid #f1f5f9" }}
          >
            <div className="fw-semibold" style={{ fontSize: 14 }}>
              Events
            </div>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              style={{ fontSize: 12 }}
              onClick={() => navigate("/events")}
            >
              View All
            </button>
          </div>

          {/* Desktop table */}
          <div className="d-none d-md-block">
            <div className="table-responsive">
              <table
                className="table table-hover align-middle mb-0"
                style={{ fontSize: 13 }}
              >
                <thead className="table-light">
                  <tr>
                    <th>Event</th>
                    <th>Dates</th>
                    <th>Venue</th>
                    <th style={{ width: 80 }}>Attendees</th>
                    <th style={{ width: 90 }}>Status</th>
                    <th style={{ width: 90 }}>Pass</th>
                    <th className="text-center" style={{ width: 140 }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-5 text-muted">
                        No events yet.{" "}
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => navigate("/events?mode=new")}
                        >
                          Create your first event
                        </button>
                      </td>
                    </tr>
                  ) : (
                    recentEvents.map((ev) => (
                      <tr key={ev.id}>
                        <td>
                          <div className="fw-semibold">{ev.eventName}</div>
                          {ev.organizer && (
                            <small className="text-muted">{ev.organizer}</small>
                          )}
                        </td>
                        <td className="text-muted small">
                          <div>{ev.startDate || "—"}</div>
                          {ev.endDate && (
                            <div style={{ fontSize: 11 }}>to {ev.endDate}</div>
                          )}
                        </td>
                        <td className="text-muted small">{ev.venue || "—"}</td>
                        <td className="text-center fw-semibold">
                          {ev.attendeeCount || 0}
                        </td>
                        <td>
                          <StatusBadge status={ev.status} />
                        </td>
                        <td>
                          {ev.passDesignSaved || ev.passStatus === "generated" ? (
                            <span
                              className="badge"
                              style={{
                                background: "#d1fae5",
                                color: "#065f46",
                                fontSize: 11,
                              }}
                            >
                              <i className="bi bi-check-circle me-1" />
                              Ready
                            </span>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex gap-1 justify-content-center">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              style={{ fontSize: 11, padding: "2px 8px" }}
                              title="Upload Data"
                              onClick={() =>
                                navigate(`/events/${ev.id}/upload`)
                              }
                            >
                              <i className="bi bi-upload me-1" />
                              Upload
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              style={{ fontSize: 11, padding: "2px 8px" }}
                              title="Attendance Records"
                              onClick={() =>
                                navigate(`/events/${ev.id}/attendees`)
                              }
                            >
                              <i className="bi bi-person-check me-1" />
                              Attend.
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{
                                fontSize: 11,
                                padding: "2px 8px",
                                background: THEME,
                                color: "#fff",
                                border: "none",
                              }}
                              title="Scan"
                              onClick={() => navigate("/scan")}
                            >
                              <i className="bi bi-qr-code-scan" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="d-md-none p-2">
            {recentEvents.length === 0 ? (
              <div className="text-center py-4 text-muted">
                No events yet.{" "}
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => navigate("/events?mode=new")}
                >
                  Create your first event
                </button>
              </div>
            ) : (
              recentEvents.map((ev) => (
                <div
                  key={ev.id}
                  className="card border-0 mb-2"
                  style={{ background: "#f8fafc", borderRadius: 10 }}
                >
                  <div className="card-body p-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="fw-semibold" style={{ fontSize: 13 }}>
                          {ev.eventName}
                        </div>
                        {ev.organizer && (
                          <div className="text-muted" style={{ fontSize: 11 }}>
                            {ev.organizer}
                          </div>
                        )}
                      </div>
                      <div className="d-flex flex-column align-items-end gap-1">
                        <StatusBadge status={ev.status} />
                        <span className="text-muted" style={{ fontSize: 11 }}>
                          {ev.attendeeCount || 0} attendees
                        </span>
                      </div>
                    </div>
                    <div className="text-muted small mb-2">
                      {ev.startDate}
                      {ev.endDate ? ` → ${ev.endDate}` : ""}{" "}
                      {ev.venue ? `· ${ev.venue}` : ""}
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-fill"
                        style={{ fontSize: 11 }}
                        onClick={() => navigate(`/events/${ev.id}/upload`)}
                      >
                        <i className="bi bi-upload me-1" />
                        Upload
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-fill"
                        style={{ fontSize: 11 }}
                        onClick={() => navigate(`/events/${ev.id}/attendees`)}
                      >
                        <i className="bi bi-person-check me-1" />
                        Attendance
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm flex-fill"
                        style={{
                          fontSize: 11,
                          background: THEME,
                          color: "#fff",
                          border: "none",
                        }}
                        onClick={() => navigate("/scan")}
                      >
                        <i className="bi bi-qr-code-scan me-1" />
                        Scan
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
