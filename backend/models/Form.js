import mongoose from "mongoose";

const formSchema = new mongoose.Schema(
  {
    formName: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
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

export default mongoose.model("Form", formSchema);
