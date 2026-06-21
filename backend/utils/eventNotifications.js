import { sendNotification, createEmailTemplate, createSmsTemplate } from "./notificationHelper.js";

const formatEventDate = (event) => {
  if (!event?.startDate) return "TBD";
  const parsed = new Date(event.startDate);
  return Number.isNaN(parsed.getTime()) ? "TBD" : parsed.toLocaleDateString();
};

const buildEventData = (attendee, event) => ({
  attendeeName: attendee.firstName || attendee.name || "Attendee",
  eventName: event.eventName || event.name || "Event",
  eventDate: formatEventDate(event),
  eventTime: event.time || "TBD",
  eventLocation: event.venue || event.location || "TBD",
});

export const sendEventConfirmationNotification = async (attendee, event) => {
  try {
    const emailData = buildEventData(attendee, event);

    const emailTemplate = createEmailTemplate("eventConfirmation", emailData);
    const smsMessage = createSmsTemplate("eventConfirmation", emailData);

    const recipients = [];
    const phoneNumbers = [];

    if (attendee.email) recipients.push(attendee.email);
    if (attendee.phone || attendee.phoneNumber) {
      phoneNumbers.push(attendee.phone || attendee.phoneNumber);
    }

    if (recipients.length === 0 && phoneNumbers.length === 0) {
      console.warn(`No email or phone for attendee ${attendee._id}`);
      return { skipped: true };
    }

    return await sendNotification({
      type: recipients.length > 0 ? ["email", "sms"] : ["sms"],
      to: recipients.length > 0 ? recipients[0] : undefined,
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers[0] : undefined,
      subject: emailTemplate.subject,
      message: smsMessage,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
  } catch (error) {
    console.error("Error sending event confirmation:", error);
    return { error: error.message };
  }
};

export const sendEventReminderNotification = async (attendees, event) => {
  try {
    const emailData = {
      attendeeName: "{attendeeName}",
      eventName: event.eventName || event.name || "Event",
      eventDate: formatEventDate(event),
      eventTime: event.time || "TBD",
      eventLocation: event.venue || event.location || "TBD",
    };

    const emailTemplate = createEmailTemplate("eventReminder", emailData);
    const smsMessage = createSmsTemplate("eventReminder", emailData);

    const emails = attendees.filter((a) => a.email).map((a) => a.email);

    const phones = attendees
      .filter((a) => a.phone || a.phoneNumber)
      .map((a) => a.phone || a.phoneNumber);

    const results = {
      email: null,
      sms: null,
    };

    if (emails.length > 0) {
      results.email = await sendNotification({
        type: ["email"],
        to: emails,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text,
      });
    }

    if (phones.length > 0) {
      results.sms = await sendNotification({
        type: ["sms"],
        phoneNumbers: phones,
        message: smsMessage,
      });
    }

    return results;
  } catch (error) {
    console.error("Error sending event reminder:", error);
    return { error: error.message };
  }
};

export const sendAttendanceConfirmationNotification = async (attendee, event, checkInTime) => {
  try {
    const emailData = {
      ...buildEventData(attendee, event),
      checkInTime: new Date(checkInTime).toLocaleTimeString(),
    };

    const emailTemplate = createEmailTemplate("attendanceConfirmation", emailData);
    const smsMessage = createSmsTemplate("attendanceConfirmation", emailData);

    const recipients = [];
    const phoneNumbers = [];

    if (attendee.email) recipients.push(attendee.email);
    if (attendee.phone || attendee.phoneNumber) {
      phoneNumbers.push(attendee.phone || attendee.phoneNumber);
    }

    if (recipients.length === 0 && phoneNumbers.length === 0) {
      return { skipped: true };
    }

    return await sendNotification({
      type: recipients.length > 0 ? ["email", "sms"] : ["sms"],
      to: recipients.length > 0 ? recipients[0] : undefined,
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers[0] : undefined,
      subject: emailTemplate.subject,
      message: smsMessage,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });
  } catch (error) {
    console.error("Error sending attendance confirmation:", error);
    return { error: error.message };
  }
};

export const sendPassGeneratedNotification = async (attendee, event) => {
  try {
    const eventName = event.eventName || event.name || "Event";
    const subject = `Your ${eventName} Pass is Ready`;
    const message = `Your pass for ${eventName} has been generated. Download it now!`;
    const html = `
      <h2>Your Pass is Ready</h2>
      <p>Hi ${attendee.firstName || attendee.name},</p>
      <p>Your pass for <strong>${eventName}</strong> has been generated successfully.</p>
      <p>Please keep it safe and present it during check-in.</p>
      <p>Event Date: ${formatEventDate(event)}</p>
      <p>Thank you!</p>
    `;

    const recipients = [];
    const phoneNumbers = [];

    if (attendee.email) recipients.push(attendee.email);
    if (attendee.phone || attendee.phoneNumber) {
      phoneNumbers.push(attendee.phone || attendee.phoneNumber);
    }

    return await sendNotification({
      type: recipients.length > 0 ? ["email", "sms"] : ["sms"],
      to: recipients.length > 0 ? recipients[0] : undefined,
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers[0] : undefined,
      subject,
      message,
      html,
      text: message,
    });
  } catch (error) {
    console.error("Error sending pass generated notification:", error);
    return { error: error.message };
  }
};
