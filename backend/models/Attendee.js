import mongoose from "mongoose";

const attendeeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    passId: { type: String },
    name: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    category: { type: String, default: "" },
    organization: { type: String, default: "" },
    status: { type: String, default: "registered" },
    passGenerated: { type: Boolean, default: false },
    checkInTime: { type: String, default: null },
    checkOutTime: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Attendee", attendeeSchema);
