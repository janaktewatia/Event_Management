import mongoose from "mongoose";

const integrationSettingsSchema = new mongoose.Schema(
  {
    email: {
      provider: {
        type: String,
        enum: ["sendgrid", "zoho", "smtp", "mailgun", "aws-ses"],
        default: "sendgrid",
      },
      enabled: { type: Boolean, default: false },
      sendgridApiKey: { type: String, default: "" },
      fromEmail: { type: String, default: "" },
      zohoApiKey: { type: String, default: "" },
      zohoRefreshToken: { type: String, default: "" },
      zohoAccessToken: { type: String, default: "" },
      zohoSmtpHost: { type: String, default: "smtp.zoho.com" },
      zohoSmtpPort: { type: Number, default: 587 },
      zohoSmtpUser: { type: String, default: "" },
      zohoSmtpPassword: { type: String, default: "" },
      smtpHost: { type: String, default: "" },
      smtpPort: { type: Number, default: 587 },
      smtpUser: { type: String, default: "" },
      smtpPassword: { type: String, default: "" },
    },
    sms: {
      provider: {
        type: String,
        enum: ["twilio", "vonage", "aws-sns"],
        default: "twilio",
      },
      enabled: { type: Boolean, default: false },
      twilioAccountSid: { type: String, default: "" },
      twilioAuthToken: { type: String, default: "" },
      twilioPhoneNumber: { type: String, default: "" },
      vonageApiKey: { type: String, default: "" },
      vonageApiSecret: { type: String, default: "" },
      vonageFromNumber: { type: String, default: "" },
    },
    whatsapp: {
      provider: {
        type: String,
        enum: ["twilio", "meta"],
        default: "twilio",
      },
      enabled: { type: Boolean, default: false },
      twilioAccountSid: { type: String, default: "" },
      twilioAuthToken: { type: String, default: "" },
      twilioWhatsappNumber: { type: String, default: "" },
      metaBusinessAccountId: { type: String, default: "" },
      metaPhoneId: { type: String, default: "" },
      metaAccessToken: { type: String, default: "" },
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { collection: "integrationSettings" }
);

export default mongoose.model("IntegrationSettings", integrationSettingsSchema);
