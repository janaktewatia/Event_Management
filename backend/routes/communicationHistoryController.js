import mongoose from "mongoose";
import CommunicationHistory from "../models/CommunicationHistory.js";

export const getCommunicationHistory = async (req, res) => {
  try {
    const { eventId } = req.params;
    const history = await CommunicationHistory.find({ eventId })
      .sort({ sentAt: -1 })
      .populate("sentBy", "name email");

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEventCommunicationStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    if (!mongoose.isValidObjectId(eventId)) {
      return res.status(400).json({ error: "Invalid event ID" });
    }
    const stats = await CommunicationHistory.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(eventId) } },
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalRecipients: { $sum: "$recipientCount" },
          totalSuccess: { $sum: "$successCount" },
        },
      },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const logCommunication = async (req, res) => {
  try {
    const { eventId, type, template, subject, message, recipients, sentBy } = req.body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "recipients array is required" });
    }

    const recipientList = recipients.map((r) => ({
      ...r,
      status: "sent",
    }));

    const communication = await CommunicationHistory.create({
      eventId,
      type,
      template,
      subject,
      message,
      recipients: recipientList,
      recipientCount: recipientList.length,
      successCount: recipientList.length,
      failureCount: 0,
      sentBy,
    });

    res.json(communication);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCommunicationDetails = async (req, res) => {
  try {
    const { historyId } = req.params;
    const history = await CommunicationHistory.findById(historyId).populate("sentBy", "name email");

    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const exportCommunicationToExcel = async (req, res) => {
  try {
    const { historyId } = req.params;
    const history = await CommunicationHistory.findById(historyId);

    if (!history) {
      return res.status(404).json({ error: "Communication history not found" });
    }

    // Return data in a format that can be converted to Excel
    const excelData = {
      communicationType: history.type,
      template: history.template,
      subject: history.subject,
      sentAt: history.sentAt,
      totalRecipients: history.recipientCount,
      successful: history.successCount,
      failed: history.failureCount,
      recipients: history.recipients.map((r) => ({
        name: r.name,
        email: r.email || "N/A",
        phone: r.phone || "N/A",
        status: r.status,
        error: r.error || "N/A",
      })),
    };

    res.json(excelData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
