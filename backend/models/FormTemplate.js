import mongoose from "mongoose";

const formTemplateSchema = new mongoose.Schema(
  {
    templateName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    fields: [
      {
        fieldId: String,
        label: String,
        type: String,
        required: Boolean,
        options: [String],
        order: Number,
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("FormTemplate", formTemplateSchema);
