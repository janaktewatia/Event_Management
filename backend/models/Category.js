import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    color: { type: String, default: "#6c757d" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema);
