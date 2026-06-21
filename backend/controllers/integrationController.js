import Integration from "../models/Integration.js";
import IntegrationSettings from "../models/IntegrationSettings.js";

const syncIntegrationToSettings = async (integration) => {
  if (!integration?.enabled) return;

  let settings = await IntegrationSettings.findOne();
  if (!settings) {
    settings = new IntegrationSettings();
  }

  const data = integration.toObject ? integration.toObject() : integration;
  const { type, provider, enabled } = data;

  if (type === "email") {
    settings.email = {
      provider: provider || settings.email.provider,
      enabled,
      sendgridApiKey: data.sendgridApiKey || settings.email.sendgridApiKey,
      fromEmail: data.fromEmail || settings.email.fromEmail,
      zohoSmtpUser: data.zohoSmtpUser || settings.email.zohoSmtpUser,
      zohoSmtpPassword: data.zohoSmtpPassword || settings.email.zohoSmtpPassword,
      zohoSmtpHost: data.zohoSmtpHost || settings.email.zohoSmtpHost,
      zohoSmtpPort: data.zohoSmtpPort || settings.email.zohoSmtpPort,
      smtpHost: data.smtpHost || settings.email.smtpHost,
      smtpPort: data.smtpPort || settings.email.smtpPort,
      smtpUser: data.smtpUser || settings.email.smtpUser,
      smtpPassword: data.smtpPassword || settings.email.smtpPassword,
    };
  } else if (type === "sms") {
    settings.sms = {
      provider: provider || settings.sms.provider,
      enabled,
      twilioAccountSid: data.twilioAccountSid || settings.sms.twilioAccountSid,
      twilioAuthToken: data.twilioAuthToken || settings.sms.twilioAuthToken,
      twilioPhoneNumber: data.twilioPhoneNumber || settings.sms.twilioPhoneNumber,
      vonageApiKey: data.vonageApiKey || settings.sms.vonageApiKey,
      vonageApiSecret: data.vonageApiSecret || settings.sms.vonageApiSecret,
      vonageFromNumber: data.vonageFromNumber || settings.sms.vonageFromNumber,
    };
  } else if (type === "whatsapp") {
    settings.whatsapp = {
      provider: provider || settings.whatsapp.provider,
      enabled,
      twilioAccountSid: data.twilioAccountSid || settings.whatsapp.twilioAccountSid,
      twilioAuthToken: data.twilioAuthToken || settings.whatsapp.twilioAuthToken,
      twilioWhatsappNumber:
        data.twilioWhatsappNumber || settings.whatsapp.twilioWhatsappNumber,
      metaBusinessAccountId:
        data.metaBusinessAccountId || settings.whatsapp.metaBusinessAccountId,
      metaPhoneId: data.metaPhoneId || settings.whatsapp.metaPhoneId,
      metaAccessToken: data.metaAccessToken || settings.whatsapp.metaAccessToken,
    };
  }

  settings.updatedAt = Date.now();
  await settings.save();
};

// Get all integrations grouped by type
export const getAllIntegrations = async (req, res) => {
  try {
    const integrations = await Integration.find();

    const grouped = {
      email: [],
      sms: [],
      whatsapp: [],
    };

    integrations.forEach((item) => {
      if (grouped[item.type]) {
        grouped[item.type].push(item);
      }
    });

    res.json(grouped);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get integrations by type
export const getIntegrationsByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["email", "sms", "whatsapp"].includes(type)) {
      return res.status(400).json({ error: "Invalid integration type" });
    }

    const integrations = await Integration.find({ type });
    res.json(integrations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create integration
export const createIntegration = async (req, res) => {
  try {
    const { type } = req.params;
    const { provider, enabled, ...fields } = req.body;

    if (!["email", "sms", "whatsapp"].includes(type)) {
      return res.status(400).json({ error: "Invalid integration type" });
    }

    if (!provider) {
      return res.status(400).json({ error: "Provider is required" });
    }

    const integration = new Integration({
      type,
      provider,
      enabled,
      ...fields,
    });

    await integration.save();
    await syncIntegrationToSettings(integration);
    res.status(201).json({
      success: true,
      message: "Integration created successfully",
      integration,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update integration
export const updateIntegration = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const integration = await Integration.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!integration) {
      return res.status(404).json({ error: "Integration not found" });
    }

    await syncIntegrationToSettings(integration);

    res.json({
      success: true,
      message: "Integration updated successfully",
      integration,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete integration
export const deleteIntegration = async (req, res) => {
  try {
    const { id } = req.params;

    const integration = await Integration.findByIdAndDelete(id);

    if (!integration) {
      return res.status(404).json({ error: "Integration not found" });
    }

    res.json({
      success: true,
      message: "Integration deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Test Email Connection
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
        return res.status(400).json({
          success: false,
          error: "SendGrid API Key and From Email are required",
        });
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

        return res.json({
          success: true,
          message: "SendGrid connection successful",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid SendGrid API Key or From Email",
        });
      }
    }

    if (provider === "zoho") {
      if (!zohoSmtpUser || !zohoSmtpPassword) {
        return res.status(400).json({
          success: false,
          error: "Zoho Mail username and password are required",
        });
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

        return res.json({
          success: true,
          message: "Zoho Mail connection successful",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `Zoho Mail error: ${error.message}`,
        });
      }
    }

    if (provider === "smtp") {
      if (!smtpHost || !smtpUser || !smtpPassword) {
        return res.status(400).json({
          success: false,
          error: "SMTP host, user, and password are required",
        });
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

        return res.json({
          success: true,
          message: "SMTP connection successful",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: `SMTP error: ${error.message}`,
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: "Unsupported email provider for testing",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Test SMS Connection
export const testSmsConnection = async (req, res) => {
  try {
    const { provider, twilioAccountSid, twilioAuthToken, twilioPhoneNumber } =
      req.body;

    if (provider === "twilio") {
      if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
        return res.status(400).json({
          success: false,
          error:
            "Twilio Account SID, Auth Token, and Phone Number are required",
        });
      }

      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(twilioAccountSid, twilioAuthToken);

        await client.api.accounts(twilioAccountSid).fetch();

        return res.json({
          success: true,
          message: "Twilio connection successful",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid Twilio credentials",
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: "Unsupported SMS provider for testing",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Test WhatsApp Connection
export const testWhatsappConnection = async (req, res) => {
  try {
    const { provider, twilioAccountSid, twilioAuthToken, twilioWhatsappNumber } =
      req.body;

    if (provider === "twilio") {
      if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsappNumber) {
        return res.status(400).json({
          success: false,
          error:
            "Twilio Account SID, Auth Token, and WhatsApp Number are required",
        });
      }

      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(twilioAccountSid, twilioAuthToken);

        await client.api.accounts(twilioAccountSid).fetch();

        return res.json({
          success: true,
          message: "Twilio WhatsApp connection successful",
        });
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: "Invalid Twilio credentials",
        });
      }
    }

    return res.status(400).json({
      success: false,
      error: "Unsupported WhatsApp provider for testing",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
