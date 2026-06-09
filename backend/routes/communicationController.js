import { sendEmail, sendBulkEmails } from "../services/emailService.js";
import { sendSMS, sendBulkSMS } from "../services/smsService.js";
import { sendWhatsApp, sendBulkWhatsApp } from "../services/whatsappService.js";

export const sendEmailNotification = async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    if (!to || !subject) {
      return res.status(400).json({ error: "Email and subject are required" });
    }

    const result = await sendEmail(to, subject, html, text);
    res.json({ success: true, message: "Email sent successfully", ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendEmailBulk = async (req, res) => {
  try {
    const { recipients, subject, html, text } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ error: "Recipients array is required" });
    }

    if (!subject) {
      return res.status(400).json({ error: "Subject is required" });
    }

    const results = await sendBulkEmails(recipients, subject, html, text);
    res.json({ success: true, message: "Bulk emails sent", results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendSmsNotification = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: "Phone number and message are required" });
    }

    const result = await sendSMS(phoneNumber, message);
    res.json({ success: true, message: "SMS sent successfully", ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendSmsBulk = async (req, res) => {
  try {
    const { phoneNumbers, message } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: "Phone numbers array is required" });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const results = await sendBulkSMS(phoneNumbers, message);
    res.json({ success: true, message: "Bulk SMS sent", results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendWhatsAppNotification = async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({ error: "Phone number and message are required" });
    }

    const result = await sendWhatsApp(phoneNumber, message);
    res.json({ success: true, message: "WhatsApp message sent successfully", ...result });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const sendWhatsAppBulk = async (req, res) => {
  try {
    const { phoneNumbers, message } = req.body;

    if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
      return res.status(400).json({ error: "Phone numbers array is required" });
    }

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const results = await sendBulkWhatsApp(phoneNumbers, message);
    res.json({ success: true, message: "Bulk WhatsApp messages sent", results });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};
