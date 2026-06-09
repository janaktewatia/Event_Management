import mongoose from "mongoose";

const communicationTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
    },
    subject: String,
    content: { type: String, required: true },
    description: String,
    isDefault: { type: Boolean, default: false },
    createdBy: mongoose.Schema.Types.ObjectId,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "communicationTemplates" }
);

export default mongoose.model("CommunicationTemplate", communicationTemplateSchema);
