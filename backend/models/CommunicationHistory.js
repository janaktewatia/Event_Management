import mongoose from "mongoose";

const communicationHistorySchema = new mongoose.Schema(
  {
    eventId: mongoose.Schema.Types.ObjectId,
    type: {
      type: String,
      enum: ["email", "sms", "whatsapp"],
      required: true,
    },
    template: String,
    subject: String,
    message: String,
    recipientCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failureCount: { type: Number, default: 0 },
    recipients: [
      {
        phone: String,
        email: String,
        name: String,
        status: { type: String, enum: ["sent", "failed", "pending"], default: "pending" },
        error: String,
      },
    ],
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "AppUser" },
    sentAt: { type: Date, default: Date.now },
  },
  { collection: "communicationHistory" }
);

export default mongoose.model("CommunicationHistory", communicationHistorySchema);
