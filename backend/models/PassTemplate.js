import mongoose from "mongoose";

const passTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    canvas: {
      width:      { type: Number, default: 400 },
      height:     { type: Number, default: 600 },
      background: { type: String, default: "#ffffff" },
    },
    elements: { type: mongoose.Schema.Types.Mixed, default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("PassTemplate", passTemplateSchema);
