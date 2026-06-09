import IntegrationSettings from "../models/IntegrationSettings.js";

export const getIntegrationSettings = async (req, res) => {
  try {
    let settings = await IntegrationSettings.findOne();

    if (!settings) {
      settings = await IntegrationSettings.create({});
    }

    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateEmailSettings = async (req, res) => {
  try {
    const {
      provider,
      enabled,
      sendgridApiKey,
      fromEmail,
      zohoSmtpUser,
      zohoSmtpPassword,
      zohoSmtpHost,
      zohoSmtpPort,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
    } = req.body;

    let settings = await IntegrationSettings.findOne();
    if (!settings) {
      settings = new IntegrationSettings();
    }

    settings.email = {
      provider: provider || settings.email.provider,
      enabled: enabled !== undefined ? enabled : settings.email.enabled,
      sendgridApiKey: sendgridApiKey || settings.email.sendgridApiKey,
      fromEmail: fromEmail || settings.email.fromEmail,
      zohoSmtpUser: zohoSmtpUser || settings.email.zohoSmtpUser,
      zohoSmtpPassword: zohoSmtpPassword || settings.email.zohoSmtpPassword,
      zohoSmtpHost: zohoSmtpHost || settings.email.zohoSmtpHost || "smtp.zoho.com",
      zohoSmtpPort: zohoSmtpPort || settings.email.zohoSmtpPort || 587,
      smtpHost: smtpHost || settings.email.smtpHost,
      smtpPort: smtpPort || settings.email.smtpPort,
      smtpUser: smtpUser || settings.email.smtpUser,
      smtpPassword: smtpPassword || settings.email.smtpPassword,
    };

    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ message: "Email settings updated successfully", settings: settings.email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSmsSettings = async (req, res) => {
  try {
    const { provider, enabled, twilioAccountSid, twilioAuthToken, twilioPhoneNumber, vonageApiKey, vonageApiSecret, vonageFromNumber } = req.body;

    let settings = await IntegrationSettings.findOne();
    if (!settings) {
      settings = new IntegrationSettings();
    }

    settings.sms = {
      provider: provider || settings.sms.provider,
      enabled: enabled !== undefined ? enabled : settings.sms.enabled,
      twilioAccountSid: twilioAccountSid || settings.sms.twilioAccountSid,
      twilioAuthToken: twilioAuthToken || settings.sms.twilioAuthToken,
      twilioPhoneNumber: twilioPhoneNumber || settings.sms.twilioPhoneNumber,
      vonageApiKey: vonageApiKey || settings.sms.vonageApiKey,
      vonageApiSecret: vonageApiSecret || settings.sms.vonageApiSecret,
      vonageFromNumber: vonageFromNumber || settings.sms.vonageFromNumber,
    };

    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ message: "SMS settings updated successfully", settings: settings.sms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateWhatsappSettings = async (req, res) => {
  try {
    const { provider, enabled, twilioAccountSid, twilioAuthToken, twilioWhatsappNumber, metaBusinessAccountId, metaAccessToken } = req.body;

    let settings = await IntegrationSettings.findOne();
    if (!settings) {
      settings = new IntegrationSettings();
    }

    settings.whatsapp = {
      provider: provider || settings.whatsapp.provider,
      enabled: enabled !== undefined ? enabled : settings.whatsapp.enabled,
      twilioAccountSid: twilioAccountSid || settings.whatsapp.twilioAccountSid,
      twilioAuthToken: twilioAuthToken || settings.whatsapp.twilioAuthToken,
      twilioWhatsappNumber: twilioWhatsappNumber || settings.whatsapp.twilioWhatsappNumber,
      metaBusinessAccountId: metaBusinessAccountId || settings.whatsapp.metaBusinessAccountId,
      metaAccessToken: metaAccessToken || settings.whatsapp.metaAccessToken,
    };

    settings.updatedAt = Date.now();
    await settings.save();

    res.json({ message: "WhatsApp settings updated successfully", settings: settings.whatsapp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const testEmailConnection = async (req, res) => {
  try {
    const {
      provider,
      sendgridApiKey,
      fromEmail,
      zohoSmtpUser,
      zohoSmtpPassword,
      zohoSmtpHost,
      zohoSmtpPort,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
    } = req.body;

    if (provider === "sendgrid") {
      if (!sendgridApiKey || !fromEmail) {
        return res.status(400).json({ error: "SendGrid API Key and From Email are required" });
      }

      try {
        const sgMail = (await import("@sendgrid/mail")).default;
        sgMail.setApiKey(sendgridApiKey);

        await sgMail.send({
          to: "test@example.com",
          from: fromEmail,
          subject: "Test",
          text: "Test",
        });

        return res.json({ success: true, message: "SendGrid connection successful" });
      } catch (error) {
        return res.status(400).json({ success: false, error: "Invalid SendGrid API Key or From Email" });
      }
    }

    if (provider === "zoho") {
      if (!zohoSmtpUser || !zohoSmtpPassword) {
        return res.status(400).json({ error: "Zoho Mail username and password are required" });
      }

      try {
        const nodemailer = (await import("nodemailer")).default;

        const transporter = nodemailer.createTransport({
          host: zohoSmtpHost || "smtp.zoho.com",
          port: zohoSmtpPort || 587,
          secure: (zohoSmtpPort || 587) === 465,
          auth: {
            user: zohoSmtpUser,
            pass: zohoSmtpPassword,
          },
        });

        await transporter.verify();

        return res.json({ success: true, message: "Zoho Mail connection successful" });
      } catch (error) {
        return res.status(400).json({ success: false, error: `Zoho Mail error: ${error.message}` });
      }
    }

    if (provider === "smtp") {
      if (!smtpHost || !smtpUser || !smtpPassword) {
        return res.status(400).json({ error: "SMTP host, user, and password are required" });
      }

      try {
        const nodemailer = (await import("nodemailer")).default;

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort || 587,
          secure: (smtpPort || 587) === 465,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
        });

        await transporter.verify();

        return res.json({ success: true, message: "SMTP connection successful" });
      } catch (error) {
        return res.status(400).json({ success: false, error: `SMTP error: ${error.message}` });
      }
    }

    return res.status(400).json({ error: "Unsupported email provider for testing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const testSmsConnection = async (req, res) => {
  try {
    const { provider, twilioAccountSid, twilioAuthToken, twilioPhoneNumber } = req.body;

    if (provider === "twilio") {
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        return res.status(400).json({ error: "Twilio Account SID, Auth Token, and Phone Number are required" });
      }

      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(twilioAccountSid, twilioAuthToken);

        await client.api.accounts(twilioAccountSid).fetch();

        return res.json({ success: true, message: "Twilio connection successful" });
      } catch (error) {
        return res.status(400).json({ success: false, error: "Invalid Twilio credentials" });
      }
    }

    return res.status(400).json({ error: "Unsupported SMS provider for testing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const testWhatsappConnection = async (req, res) => {
  try {
    const { provider, twilioAccountSid, twilioAuthToken, twilioWhatsappNumber } = req.body;

    if (provider === "twilio") {
      if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsappNumber) {
        return res.status(400).json({ error: "Twilio Account SID, Auth Token, and WhatsApp Number are required" });
      }

      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(twilioAccountSid, twilioAuthToken);

        await client.api.accounts(twilioAccountSid).fetch();

        return res.json({ success: true, message: "Twilio WhatsApp connection successful" });
      } catch (error) {
        return res.status(400).json({ success: false, error: "Invalid Twilio credentials" });
      }
    }

    return res.status(400).json({ error: "Unsupported WhatsApp provider for testing" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
