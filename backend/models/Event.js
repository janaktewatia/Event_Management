import mongoose from "mongoose";

const attendeeFieldSettingSchema = new mongoose.Schema(
  {
    fieldId: String,
    label: String,
    type: String,
    enabled: Boolean,
    required: Boolean,
    options: [String],
  },
  { _id: false }
);

const categorySettingSchema = new mongoose.Schema(
  {
    categoryId: String,
    label: String,
    color: String,
    enabled: Boolean,
  },
  { _id: false }
);

const eventSchema = new mongoose.Schema(
  {
    eventName: { type: String, required: true, trim: true },
    startDate: { type: String },
    endDate: { type: String },
    venue: { type: String, default: "" },
    organizer: { type: String, default: "" },
    status: { type: String, default: "Draft" },
    imported: { type: Boolean, default: false },
    importedCount: { type: Number, default: 0 },
    attendeeCount: { type: Number, default: 0 },
    attendeeFields: [attendeeFieldSettingSchema],
    categories: [categorySettingSchema],
    eventType: { type: String, default: "" },
    passStatus: { type: String, enum: ["", "generated", "sent"], default: "" },
    passDesign: { type: mongoose.Schema.Types.Mixed, default: null },
    passDesignSaved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
