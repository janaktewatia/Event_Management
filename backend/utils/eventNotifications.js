import { sendNotification, createEmailTemplate, createSmsTemplate } from "./notificationHelper.js";

export const sendEventConfirmationNotification = async (attendee, event) => {
  try {
    const emailData = {
      attendeeName: attendee.firstName || attendee.name || "Attendee",
      eventName: event.name,
      eventDate: new Date(event.date).toLocaleDateString(),
      eventTime: event.time || "TBD",
      eventLocation: event.location || "TBD"
    };

    const emailTemplate = createEmailTemplate("eventConfirmation", emailData);
    const smsMessage = createSmsTemplate("eventConfirmation", emailData);

    const recipients = [];
    const phoneNumbers = [];

    if (attendee.email) recipients.push(attendee.email);
    if (attendee.phoneNumber) phoneNumbers.push(attendee.phoneNumber);

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
      text: emailTemplate.text
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
      eventName: event.name,
      eventDate: new Date(event.date).toLocaleDateString(),
      eventTime: event.time || "TBD",
      eventLocation: event.location || "TBD"
    };

    const emailTemplate = createEmailTemplate("eventReminder", emailData);
    const smsMessage = createSmsTemplate("eventReminder", emailData);

    const emails = attendees
      .filter(a => a.email)
      .map(a => a.email);

    const phones = attendees
      .filter(a => a.phoneNumber)
      .map(a => a.phoneNumber);

    const results = {
      email: null,
      sms: null
    };

    if (emails.length > 0) {
      results.email = await sendNotification({
        type: ["email"],
        to: emails,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      });
    }

    if (phones.length > 0) {
      results.sms = await sendNotification({
        type: ["sms"],
        phoneNumbers: phones,
        message: smsMessage
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
      attendeeName: attendee.firstName || attendee.name || "Attendee",
      eventName: event.name,
      checkInTime: new Date(checkInTime).toLocaleTimeString()
    };

    const emailTemplate = createEmailTemplate("attendanceConfirmation", emailData);
    const smsMessage = createSmsTemplate("attendanceConfirmation", emailData);

    const recipients = [];
    const phoneNumbers = [];

    if (attendee.email) recipients.push(attendee.email);
    if (attendee.phoneNumber) phoneNumbers.push(attendee.phoneNumber);

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
      text: emailTemplate.text
    });
  } catch (error) {
    console.error("Error sending attendance confirmation:", error);
    return { error: error.message };
  }
};

export const sendPassGeneratedNotification = async (attendee, event, passData) => {
  try {
    const subject = `Your ${event.name} Pass is Ready`;
    const message = `Your pass for ${event.name} has been generated. Download it now!`;
    const html = `
      <h2>Your Pass is Ready</h2>
      <p>Hi ${attendee.firstName || attendee.name},</p>
      <p>Your pass for <strong>${event.name}</strong> has been generated successfully.</p>
      <p>Please keep it safe and present it during check-in.</p>
      <p>Event Date: ${new Date(event.date).toLocaleDateString()}</p>
      <p>Thank you!</p>
    `;

    const recipients = [];
    const phoneNumbers = [];

    if (attendee.email) recipients.push(attendee.email);
    if (attendee.phoneNumber) phoneNumbers.push(attendee.phoneNumber);

    return await sendNotification({
      type: recipients.length > 0 ? ["email", "sms"] : ["sms"],
      to: recipients.length > 0 ? recipients[0] : undefined,
      phoneNumbers: phoneNumbers.length > 0 ? phoneNumbers[0] : undefined,
      subject,
      message,
      html,
      text: message
    });
  } catch (error) {
    console.error("Error sending pass generated notification:", error);
    return { error: error.message };
  }
};
