import mongoose from "mongoose";

const formFieldSchema = new mongoose.Schema(
  {
    fieldId: String,
    label: String,
    type: String,
    required: Boolean,
    enabled: Boolean,
    options: [String],
    order: Number,
  },
  { _id: false }
);

const formTemplateSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    category: { type: String, enum: ["Registration", "Feedback", "Survey", "Booking", "Application", "Health", "Event", "Donation", "Membership", "Other"], default: "Other" },
    icon: { type: String, default: "📋" },
    imageUrl: { type: String, default: "" },
    color: { type: String, default: "#6366f1" },
    isIndustryTemplate: { type: Boolean, default: false },
    fields: [formFieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model("FormTemplate", formTemplateSchema);
