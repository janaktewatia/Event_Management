import IntegrationSettings from "../models/IntegrationSettings.js";

export const sendEmail = async (to, subject, html, text) => {
  try {
    const settings = await IntegrationSettings.findOne();

    if (!settings || !settings.email.enabled) {
      throw new Error("Email service is not enabled or configured");
    }

    if (settings.email.provider === "sendgrid") {
      return await sendViaSendGrid(settings.email, to, subject, html, text);
    } else if (settings.email.provider === "zoho") {
      return await sendViaZoho(settings.email, to, subject, html, text);
    } else if (settings.email.provider === "smtp") {
      return await sendViaSMTP(settings.email, to, subject, html, text);
    }

    throw new Error(`Unsupported email provider: ${settings.email.provider}`);
  } catch (error) {
    console.error("Email sending error:", error.message);
    throw error;
  }
};

const sendViaSendGrid = async (emailConfig, to, subject, html, text) => {
  try {
    const sgMail = (await import("@sendgrid/mail")).default;
    sgMail.setApiKey(emailConfig.sendgridApiKey);

    const msg = {
      to,
      from: emailConfig.fromEmail,
      subject,
      text: text || "Message",
      html: html || text,
    };

    const response = await sgMail.send(msg);
    return { success: true, messageId: response[0].headers["x-message-id"] };
  } catch (error) {
    throw new Error(`SendGrid error: ${error.message}`);
  }
};

const sendViaZoho = async (emailConfig, to, subject, html, text) => {
  try {
    const nodemailer = (await import("nodemailer")).default;

    const transporter = nodemailer.createTransport({
      host: emailConfig.zohoSmtpHost,
      port: emailConfig.zohoSmtpPort,
      secure: emailConfig.zohoSmtpPort === 465,
      auth: {
        user: emailConfig.zohoSmtpUser,
        pass: emailConfig.zohoSmtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: emailConfig.fromEmail || emailConfig.zohoSmtpUser,
      to,
      subject,
      text: text || "Message",
      html: html || text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error(`Zoho Mail error: ${error.message}`);
  }
};

const sendViaSMTP = async (emailConfig, to, subject, html, text) => {
  try {
    const nodemailer = (await import("nodemailer")).default;

    const transporter = nodemailer.createTransport({
      host: emailConfig.smtpHost,
      port: emailConfig.smtpPort,
      secure: emailConfig.smtpPort === 465,
      auth: {
        user: emailConfig.smtpUser,
        pass: emailConfig.smtpPassword,
      },
    });

    const info = await transporter.sendMail({
      from: emailConfig.fromEmail,
      to,
      subject,
      text: text || "Message",
      html: html || text,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    throw new Error(`SMTP error: ${error.message}`);
  }
};

export const sendBulkEmails = async (recipients, subject, html, text) => {
  const results = [];

  for (const recipient of recipients) {
    try {
      const result = await sendEmail(recipient, subject, html, text);
      results.push({ email: recipient, success: true, ...result });
    } catch (error) {
      results.push({ email: recipient, success: false, error: error.message });
    }
  }

  return results;
};
