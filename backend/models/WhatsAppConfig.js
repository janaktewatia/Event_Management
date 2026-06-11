import mongoose from "mongoose";

const whatsAppConfigSchema = new mongoose.Schema(
  {
    vendor: {
      type: String,
      enum: ["meta", "pinnacle", "interakt", "ai_sency"],
      required: true,
    },
    vendorName: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    meta: {
      accessToken: String,
      phoneId: String,
      wabaId: String,
      phoneNumber: String,
    },
    pinnacle: {
      apiKey: String,
      apiSecret: String,
      apiUrl: String,
    },
    interakt: {
      apiKey: String,
      apiUrl: String,
    },
    ai_sency: {
      apiKey: String,
      apiUrl: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WhatsAppConfig", whatsAppConfigSchema);
