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
    fields: [formFieldSchema],
  },
  { timestamps: true }
);

export default mongoose.model("FormTemplate", formTemplateSchema);
