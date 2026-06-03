import React, { useMemo, useState } from "react";
import { useEventData } from "../context/EventDataContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const THEME = "#A855F7";
const COLORS = ["#A855F7", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#06B6D4", "#8B5CF6", "#EC4899"];

const StatCard = ({ icon, label, value, trend, color }) => (
  <div
    className="card border-0 shadow-sm h-100"
    style={{ borderRadius: 10, background: "#fff", overflow: "hidden" }}
  >
    <div className="card-body p-3 d-flex align-items-center gap-3">
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: color + "1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div className="text-muted" style={{ fontSize: 12 }}>
          {label}
        </div>
        <div className="fw-bold" style={{ fontSize: 24, color: "#172033", lineHeight: 1.2 }}>
          {value}
        </div>
      </div>
      {trend && (
        <span style={{ color: trend > 0 ? "#10B981" : "#EF4444", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: "#fff" }}>
    <div className="card-body p-4">
      <h6 className="card-title fw-bold mb-4" style={{ fontSize: 14, color: "#172033" }}>
        {title}
      </h6>
      {children}
    </div>
  </div>
);

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
};

const DashboardPage = () => {
  const { events, attendees, eventTypes } = useEventData();
  const [showEventTypeTable, setShowEventTypeTable] = useState(false);
  const [showLast7DaysTable, setShowLast7DaysTable] = useState(false);
  const [showAttendanceTable, setShowAttendanceTable] = useState(false);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Calculate KPIs
  const totalEvents = events.length;
  const totalRegistrants = attendees.length;
  const totalAttendees = attendees.filter((a) => a.status && a.status !== "registered").length;
  const attendeePercentage = totalRegistrants > 0 ? ((totalAttendees / totalRegistrants) * 100).toFixed(1) : 0;

  // Last 7 days events
  const last7DaysEvents = useMemo(() => {
    return events.filter((e) => {
      const startDate = parseDate(e.startDate);
      return startDate && startDate >= sevenDaysAgo && startDate <= now;
    });
  }, [events]);

  // Upcoming events (next 30 days)
  const upcomingEvents = useMemo(() => {
    return events.filter((e) => {
      const startDate = parseDate(e.startDate);
      return startDate && startDate > now && startDate <= thirtyDaysLater;
    }).sort((a, b) => parseDate(a.startDate) - parseDate(b.startDate));
  }, [events]);

  // Event type wise count with proper mapping
  const eventTypeWiseData = useMemo(() => {
    const types = {};
    const eventTypeMap = {};
    const eventTypeMapByIdOnly = {};

    // Create mapping both ways - by id field and by _id field (in case normalization varies)
    (eventTypes || []).filter((et) => et.active).forEach((et) => {
      const id = et.id || et._id;
      eventTypeMap[id] = et.label;
      eventTypeMapByIdOnly[et._id] = et.label;
      types[et.label] = 0;
    });

    let unclassifiedCount = 0;

    events.forEach((e) => {
      const eventTypeId = e.eventType?.trim() || "";

      if (eventTypeId) {
        // Try to match with mapped event type
        const mappedLabel = eventTypeMap[eventTypeId] || eventTypeMapByIdOnly[eventTypeId];

        if (mappedLabel) {
          types[mappedLabel]++;
        } else if (eventTypeId.length <= 50 && !/^[a-f0-9]{24}$/.test(eventTypeId)) {
          // EventType is already a label (not an ObjectId)
          types[eventTypeId] = (types[eventTypeId] || 0) + 1;
        } else {
          // No valid event type found
          unclassifiedCount++;
        }
      } else {
        unclassifiedCount++;
      }
    });

    // Only add Unclassified if there are unclassified events
    if (unclassifiedCount > 0) {
      types["Unclassified"] = unclassifiedCount;
    }

    return Object.entries(types)
      .filter(([, count]) => count > 0) // Only show types with at least 1 event
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [events, eventTypes]);

  // Event wise attendee percentage
  const eventWiseAttendance = useMemo(() => {
    return events.map((e) => {
      const eventAttendees = attendees.filter((a) => a.eventId === e._id || a.eventId === e.id);
      const checkedIn = eventAttendees.filter((a) => a.status && a.status !== "registered").length;
      const percentage = eventAttendees.length > 0 ? Math.round((checkedIn / eventAttendees.length) * 100) : 0;
      return {
        name: e.eventName,
        registered: eventAttendees.length,
        attended: checkedIn,
        percentage,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [events, attendees]);

  // Last 7 days timeline
  const last7DaysTimeline = useMemo(() => {
    const data = {};
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      data[key] = 0;
      labels.push(key);
    }
    last7DaysEvents.forEach((e) => {
      const startDate = parseDate(e.startDate);
      const key = startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      data[key]++;
    });
    return labels.map((label) => ({ date: label, events: data[label] }));
  }, [last7DaysEvents, events]);

  return (
    <div className="container-fluid p-3" style={{ background: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: 28, color: "#172033" }}>
          Analytics & Insights
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
          Real-time overview of your events and attendee data
        </p>
      </div>

      {/* KPI Cards */}
      <div className="row g-2 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-calendar-event"
            label="Total Events"
            value={totalEvents}
            color={THEME}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-people"
            label="Total Registrants"
            value={totalRegistrants}
            color="#3B82F6"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-person-check"
            label="Total Attendees"
            value={totalAttendees}
            color="#10B981"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-percent"
            label="Attendance Rate"
            value={`${attendeePercentage}%`}
            color="#F59E0B"
          />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-4">
        {/* Event Type Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: "#fff", height: 420 }}>
            <div className="card-body p-4 d-flex flex-column" style={{ height: "100%" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title fw-bold mb-0" style={{ fontSize: 14, color: "#172033" }}>
                  Event Type Distribution
                </h6>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: showEventTypeTable ? THEME : "#f3f4f6",
                    color: showEventTypeTable ? "#fff" : "#64748b",
                    border: "none",
                    fontSize: 11,
                  }}
                  onClick={() => setShowEventTypeTable(!showEventTypeTable)}
                >
                  <i className="bi bi-table me-1" />
                  {showEventTypeTable ? "Hide" : "Show"} Table
                </button>
              </div>
              {eventTypeWiseData.length > 0 ? (
                showEventTypeTable ? (
                  <div className="table-responsive flex-grow-1" style={{ overflowY: "auto" }}>
                    <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                      <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                        <tr>
                          <th>Event Type</th>
                          <th className="text-end">Count</th>
                          <th className="text-end">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventTypeWiseData.map((type, idx) => {
                          const total = eventTypeWiseData.reduce((sum, t) => sum + t.count, 0);
                          const percentage = ((type.count / total) * 100).toFixed(1);
                          return (
                            <tr key={idx}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: 2,
                                      background: COLORS[idx % COLORS.length],
                                    }}
                                  />
                                  {type.name}
                                </div>
                              </td>
                              <td className="text-end fw-semibold">{type.count}</td>
                              <td className="text-end">
                                <span
                                  className="badge"
                                  style={{
                                    background: "#f0fdf4",
                                    color: "#10B981",
                                    fontSize: 11,
                                  }}
                                >
                                  {percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={eventTypeWiseData}
                        cx="45%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, count, percent }) => `${name}\n${count}`}
                        outerRadius={75}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {eventTypeWiseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.count}`}
                      />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
                        formatter={(value) => `${value} event${value > 1 ? 's' : ''}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="text-center text-muted py-5">No event type data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Last 7 Days Events */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: "#fff", height: 420 }}>
            <div className="card-body p-4 d-flex flex-column" style={{ height: "100%" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title fw-bold mb-0" style={{ fontSize: 14, color: "#172033" }}>
                  Last 7 Days - Events Created
                </h6>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: showLast7DaysTable ? THEME : "#f3f4f6",
                    color: showLast7DaysTable ? "#fff" : "#64748b",
                    border: "none",
                    fontSize: 11,
                  }}
                  onClick={() => setShowLast7DaysTable(!showLast7DaysTable)}
                >
                  <i className="bi bi-table me-1" />
                  {showLast7DaysTable ? "Hide" : "Show"} Table
                </button>
              </div>
              {showLast7DaysTable ? (
                <div className="table-responsive flex-grow-1" style={{ overflowY: "auto" }}>
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                    <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                      <tr>
                        <th>Date</th>
                        <th>Event Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {last7DaysEvents.length > 0 ? (
                        last7DaysEvents.map((event) => (
                          <tr key={event._id || event.id}>
                            <td className="fw-semibold text-nowrap">{formatDate(event.startDate)}</td>
                            <td>{event.eventName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center text-muted py-3">
                            No events created in last 7 days
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={last7DaysTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" stroke="#94a3b8" style={{ fontSize: 11 }} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
                      formatter={(value) => [`${value} event${value > 1 ? 's' : ''}`, 'Count']}
                    />
                    <Bar dataKey="events" fill={THEME} radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="row g-3 mb-4">
        {/* Upcoming Events Count */}
        <div className="col-12 col-lg-4">
          <ChartCard title="Upcoming Events (30 days)">
            <div className="p-3 text-center">
              <div className="text-muted small mb-3">Events scheduled for the next 30 days</div>
              <div className="fw-bold" style={{ fontSize: 48, color: "#10B981", marginBottom: "1rem" }}>
                {upcomingEvents.length}
              </div>
              <div className="small text-muted">
                {upcomingEvents.length === 0 ? "No upcoming events" : `${upcomingEvents.length} event${upcomingEvents.length !== 1 ? 's' : ''} scheduled`}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Attendance Trend */}
        <div className="col-12 col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: "#fff", height: 420 }}>
            <div className="card-body p-4 d-flex flex-column" style={{ height: "100%" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title fw-bold mb-0" style={{ fontSize: 14, color: "#172033" }}>
                  Top Events by Attendance Rate
                </h6>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: showAttendanceTable ? "#A855F7" : "#f3f4f6",
                    color: showAttendanceTable ? "#fff" : "#64748b",
                    border: "none",
                    fontSize: 11,
                  }}
                  onClick={() => setShowAttendanceTable(!showAttendanceTable)}
                >
                  <i className="bi bi-table me-1" />
                  {showAttendanceTable ? "Hide" : "Show"} Table
                </button>
              </div>
              {showAttendanceTable ? (
                <div className="table-responsive flex-grow-1" style={{ overflowY: "auto" }}>
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                    <thead style={{ background: "#f8fafc", position: "sticky", top: 0 }}>
                      <tr>
                        <th>Event Name</th>
                        <th className="text-end">Attended</th>
                        <th className="text-end">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventWiseAttendance.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          <td className="fw-semibold">{row.name}</td>
                          <td className="text-end small">{row.attended}/{row.registered}</td>
                          <td className="text-end">
                            <span
                              className="badge"
                              style={{
                                background: row.percentage >= 80 ? "#d1fae5" : row.percentage >= 50 ? "#fef3c7" : "#fee2e2",
                                color: row.percentage >= 80 ? "#065f46" : row.percentage >= 50 ? "#92400e" : "#7f1d1d",
                                fontSize: 11,
                              }}
                            >
                              {row.percentage}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : eventWiseAttendance.slice(0, 5).length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={eventWiseAttendance.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: 11 }} angle={-15} height={80} />
                    <YAxis stroke="#94a3b8" style={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8 }}
                      formatter={(value) => `${value}%`}
                    />
                    <Bar dataKey="percentage" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">No attendance data available</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="row g-3">
        {/* Upcoming Events Table */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-0">
              <div className="px-4 py-3 d-flex align-items-center justify-content-between" style={{ borderBottom: "1px solid #e2e8f0" }}>
                <h6 className="fw-bold mb-0" style={{ fontSize: 14, color: "#172033" }}>
                  Upcoming Events (Next 30 Days)
                </h6>
                <span className="badge bg-light text-dark" style={{ fontSize: 11 }}>
                  {upcomingEvents.length}
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th>Event Name</th>
                      <th>Start Date</th>
                      <th className="text-end">Registrants</th>
                    </tr>
                  </thead>
                  <tbody>
                    {upcomingEvents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted">
                          No upcoming events
                        </td>
                      </tr>
                    ) : (
                      upcomingEvents.map((ev) => (
                        <tr key={ev._id || ev.id}>
                          <td>
                            <div className="fw-semibold">{ev.eventName}</div>
                            {ev.venue && <small className="text-muted d-block">{ev.venue}</small>}
                          </td>
                          <td className="text-muted small">{formatDate(ev.startDate)}</td>
                          <td className="text-end fw-semibold">
                            {attendees.filter((a) => a.eventId === ev._id || a.eventId === ev.id).length}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Events (Last 7 Days) Table */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-0">
              <div className="px-4 py-3 d-flex align-items-center justify-content-between" style={{ borderBottom: "1px solid #e2e8f0" }}>
                <h6 className="fw-bold mb-0" style={{ fontSize: 14, color: "#172033" }}>
                  Recent Events (Last 7 Days)
                </h6>
                <span className="badge bg-light text-dark" style={{ fontSize: 11 }}>
                  {last7DaysEvents.length}
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th>Event Name</th>
                      <th>Date</th>
                      <th className="text-end">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {last7DaysEvents.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted">
                          No recent events
                        </td>
                      </tr>
                    ) : (
                      last7DaysEvents.map((ev) => {
                        const eventAttendees = attendees.filter((a) => a.eventId === ev._id || a.eventId === ev.id);
                        const attended = eventAttendees.filter((a) => a.status && a.status !== "registered").length;
                        const percentage = eventAttendees.length > 0 ? Math.round((attended / eventAttendees.length) * 100) : 0;
                        return (
                          <tr key={ev._id || ev.id}>
                            <td>
                              <div className="fw-semibold">{ev.eventName}</div>
                              {ev.organizer && <small className="text-muted d-block">{ev.organizer}</small>}
                            </td>
                            <td className="text-muted small">{formatDate(ev.startDate)}</td>
                            <td className="text-end">
                              <div className="fw-semibold">{percentage}%</div>
                              <small className="text-muted">{attended}/{eventAttendees.length}</small>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event-wise Attendance Details */}
      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-0">
              <div className="px-4 py-3" style={{ borderBottom: "1px solid #e2e8f0" }}>
                <h6 className="fw-bold mb-0" style={{ fontSize: 14, color: "#172033" }}>
                  Event-wise Attendance Details
                </h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#f8fafc" }}>
                      <th>Event Name</th>
                      <th className="text-end">Registered</th>
                      <th className="text-end">Attended</th>
                      <th className="text-end">Percentage</th>
                      <th className="text-center">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventWiseAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          No event data available
                        </td>
                      </tr>
                    ) : (
                      eventWiseAttendance.map((row) => (
                        <tr key={row.name}>
                          <td className="fw-semibold">{row.name}</td>
                          <td className="text-end fw-semibold">{row.registered}</td>
                          <td className="text-end fw-semibold">{row.attended}</td>
                          <td className="text-end">
                            <span className="badge" style={{ background: "#f0fdf4", color: "#10B981" }}>
                              {row.percentage}%
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                background: "#e2e8f0",
                                borderRadius: 8,
                                height: 24,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  background: row.percentage >= 80 ? "#10B981" : row.percentage >= 50 ? "#F59E0B" : "#EF4444",
                                  height: "100%",
                                  width: `${row.percentage}%`,
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
