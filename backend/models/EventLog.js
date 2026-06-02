import mongoose from "mongoose";

const eventLogSchema = new mongoose.Schema(
  {
    eventId:     { type: String, required: true, index: true },
    action:      { type: String, required: true },
    entity:      { type: String, default: "" },    // "event" | "attendee" | "pass"
    entityId:    { type: String, default: "" },
    entityName:  { type: String, default: "" },    // human-readable (attendee name, event name)
    oldData:     { type: mongoose.Schema.Types.Mixed, default: null },
    newData:     { type: mongoose.Schema.Types.Mixed, default: null },
    changedBy:   { type: String, default: "Admin" },
    changedAt:   { type: Date, default: Date.now },
  },
  { timestamps: false }
);

export default mongoose.model("EventLog", eventLogSchema);
