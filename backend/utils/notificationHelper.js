import { sendEmail, sendBulkEmails } from "../services/emailService.js";
import { sendSMS, sendBulkSMS } from "../services/smsService.js";
import { sendWhatsApp, sendBulkWhatsApp } from "../services/whatsappService.js";

export const sendNotification = async (options) => {
  const { type, to, subject, message, html, text, phoneNumbers } = options;

  const results = {
    email: null,
    sms: null,
    whatsapp: null,
  };

  try {
    if (type.includes("email") && to) {
      try {
        if (Array.isArray(to)) {
          results.email = await sendBulkEmails(to, subject, html, text);
        } else {
          results.email = await sendEmail(to, subject, html, text);
        }
      } catch (error) {
        results.email = { error: error.message };
      }
    }

    if (type.includes("sms") && phoneNumbers) {
      try {
        if (Array.isArray(phoneNumbers) && phoneNumbers.length > 1) {
          results.sms = await sendBulkSMS(phoneNumbers, message);
        } else {
          const phone = Array.isArray(phoneNumbers) ? phoneNumbers[0] : phoneNumbers;
          results.sms = await sendSMS(phone, message);
        }
      } catch (error) {
        results.sms = { error: error.message };
      }
    }

    if (type.includes("whatsapp") && phoneNumbers) {
      try {
        if (Array.isArray(phoneNumbers) && phoneNumbers.length > 1) {
          results.whatsapp = await sendBulkWhatsApp(phoneNumbers, message);
        } else {
          const phone = Array.isArray(phoneNumbers) ? phoneNumbers[0] : phoneNumbers;
          results.whatsapp = await sendWhatsApp(phone, message);
        }
      } catch (error) {
        results.whatsapp = { error: error.message };
      }
    }

    return results;
  } catch (error) {
    console.error("Notification error:", error);
    throw error;
  }
};

export const createEmailTemplate = (templateName, data) => {
  const templates = {
    eventConfirmation: (data) => ({
      subject: `Event Confirmation: ${data.eventName}`,
      html: `
        <h2>Event Confirmation</h2>
        <p>Hello ${data.attendeeName},</p>
        <p>Thank you for registering for <strong>${data.eventName}</strong></p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: ${data.eventDate}</li>
          <li>Time: ${data.eventTime}</li>
          <li>Location: ${data.eventLocation}</li>
        </ul>
        <p>Your pass QR code has been generated. Please keep it safe for check-in.</p>
        <p>Best regards,<br>Event Management Team</p>
      `,
      text: `Event Confirmation: ${data.eventName}\n\nHello ${data.attendeeName},\n\nThank you for registering for ${data.eventName}.\n\nEvent Date: ${data.eventDate}\nEvent Time: ${data.eventTime}\nLocation: ${data.eventLocation}\n\nBest regards,\nEvent Management Team`,
    }),
    eventReminder: (data) => ({
      subject: `Reminder: ${data.eventName} is coming up`,
      html: `
        <h2>Event Reminder</h2>
        <p>Hello ${data.attendeeName},</p>
        <p>This is a reminder that <strong>${data.eventName}</strong> is happening soon!</p>
        <p><strong>Event Details:</strong></p>
        <ul>
          <li>Date: ${data.eventDate}</li>
          <li>Time: ${data.eventTime}</li>
          <li>Location: ${data.eventLocation}</li>
        </ul>
        <p>Please don't forget to bring your pass for smooth check-in.</p>
        <p>See you there!<br>Event Management Team</p>
      `,
      text: `Event Reminder: ${data.eventName}\n\nHello ${data.attendeeName},\n\nThis is a reminder that ${data.eventName} is happening soon!\n\nEvent Date: ${data.eventDate}\nEvent Time: ${data.eventTime}\nLocation: ${data.eventLocation}\n\nSee you there!`,
    }),
    attendanceConfirmation: (data) => ({
      subject: `Attendance Confirmed: ${data.eventName}`,
      html: `
        <h2>Attendance Confirmed</h2>
        <p>Hello ${data.attendeeName},</p>
        <p>Your attendance at <strong>${data.eventName}</strong> has been confirmed.</p>
        <p>Check-in Time: ${data.checkInTime}</p>
        <p>Thank you for attending!<br>Event Management Team</p>
      `,
      text: `Attendance Confirmed: ${data.eventName}\n\nHello ${data.attendeeName},\n\nYour attendance has been confirmed.\n\nCheck-in Time: ${data.checkInTime}\n\nThank you for attending!`,
    }),
  };

  return templates[templateName] ? templates[templateName](data) : null;
};

export const createSmsTemplate = (templateName, data) => {
  const templates = {
    eventConfirmation: (data) =>
      `Hi ${data.attendeeName}, you're confirmed for ${data.eventName} on ${data.eventDate} at ${data.eventTime}. Location: ${data.eventLocation}`,
    eventReminder: (data) =>
      `Reminder: ${data.eventName} is happening on ${data.eventDate} at ${data.eventTime}. Don't forget your pass!`,
    attendanceConfirmation: (data) =>
      `Great! Your attendance at ${data.eventName} has been confirmed. Check-in time: ${data.checkInTime}`,
  };

  return templates[templateName] ? templates[templateName](data) : null;
};
