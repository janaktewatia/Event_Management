import mongoose from "mongoose";

const whatsAppTemplateSchema = new mongoose.Schema(
  {
    templateName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["UTILITY", "MARKETING"],
      required: true,
    },
    language: {
      type: String,
      default: "en",
    },
    headerType: {
      type: String,
      enum: ["TEXT", "IMAGE", "DOCUMENT", "VIDEO"],
      default: "TEXT",
    },
    headerContent: {
      text: String,
      mediaUrl: String,
      mediaType: String,
    },
    bodyText: {
      type: String,
      required: true,
    },
    footerText: String,
    buttons: [
      {
        type: {
          type: String,
          enum: ["CALL_TO_ACTION", "QUICK_REPLY", "URL"],
        },
        buttonText: String,
        actionType: {
          type: String,
          enum: ["CALL", "WEBSITE", "QUICK_REPLY"],
        },
        actionValue: String,
        isDynamic: Boolean,
      },
    ],
    variables: [
      {
        name: String,
        position: String,
        type: String,
        sampleValue: String,
      },
    ],
    metaTemplateId: String,
    metaStatus: {
      type: String,
      enum: ["PENDING_DELETION", "DELETED", "PENDING_REVIEW", "REJECTED", "APPROVED", "DISABLED"],
      default: "PENDING_REVIEW",
    },
    vendor: {
      type: String,
      default: "meta",
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

export default mongoose.model("WhatsAppTemplate", whatsAppTemplateSchema);
