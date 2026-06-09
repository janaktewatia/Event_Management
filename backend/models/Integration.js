import mongoose from "mongoose";

const integrationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
    },
    provider: {
      type: String,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    lastTestStatus: {
      type: String,
      enum: ["success", "failed", "untested"],
      default: "untested",
    },
    lastTestedAt: {
      type: Date,
      default: null,
    },
    // Email fields
    sendgridApiKey: {
      type: String,
      default: "",
    },
    fromEmail: {
      type: String,
      default: "",
    },
    zohoSmtpUser: {
      type: String,
      default: "",
    },
    zohoSmtpPassword: {
      type: String,
      default: "",
    },
    zohoSmtpHost: {
      type: String,
      default: "smtp.zoho.com",
    },
    zohoSmtpPort: {
      type: Number,
      default: 587,
    },
    smtpHost: {
      type: String,
      default: "",
    },
    smtpPort: {
      type: Number,
      default: 587,
    },
    smtpUser: {
      type: String,
      default: "",
    },
    smtpPassword: {
      type: String,
      default: "",
    },
    // SMS/WhatsApp fields
    twilioAccountSid: {
      type: String,
      default: "",
    },
    twilioAuthToken: {
      type: String,
      default: "",
    },
    twilioPhoneNumber: {
      type: String,
      default: "",
    },
    twilioWhatsappNumber: {
      type: String,
      default: "",
    },
    // Vonage fields (for SMS)
    vonageApiKey: {
      type: String,
      default: "",
    },
    vonageApiSecret: {
      type: String,
      default: "",
    },
    vonageFromNumber: {
      type: String,
      default: "",
    },
    // Meta fields (for WhatsApp)
    metaBusinessAccountId: {
      type: String,
      default: "",
    },
    metaAccessToken: {
      type: String,
      default: "",
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
  { collection: "integrations" }
);

export default mongoose.model("Integration", integrationSchema);
