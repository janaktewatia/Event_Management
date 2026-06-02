import mongoose from "mongoose";

const userFieldSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    type: { type: String, required: true, default: "text" },
    active: { type: Boolean, default: true },
    options: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("UserField", userFieldSchema);
