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

const formSchema = new mongoose.Schema(
  {
    formName: { type: String, required: true, trim: true },
    eventId: String,
    eventName: String,
    description: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published", "saved"], default: "draft" },
    createdBy: String,
    fields: [formFieldSchema],
    elements: [mongoose.Schema.Types.Mixed],
    selectedCategories: [mongoose.Schema.Types.Mixed],
    alignment: { type: String, enum: ["left", "center", "right"], default: "center" },
  },
  { timestamps: true }
);

export default mongoose.model("Form", formSchema);
