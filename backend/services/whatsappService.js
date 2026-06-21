import IntegrationSettings from "../models/IntegrationSettings.js";

export const sendWhatsApp = async (phoneNumber, message) => {
  try {
    const settings = await IntegrationSettings.findOne();

    if (!settings || !settings.whatsapp.enabled) {
      throw new Error("WhatsApp service is not enabled or configured");
    }

    if (settings.whatsapp.provider === "twilio") {
      return await sendViaTwilioWhatsApp(settings.whatsapp, phoneNumber, message);
    } else if (settings.whatsapp.provider === "meta") {
      return await sendViaMetaWhatsApp(settings.whatsapp, phoneNumber, message);
    }

    throw new Error(`Unsupported WhatsApp provider: ${settings.whatsapp.provider}`);
  } catch (error) {
    console.error("WhatsApp sending error:", error.message);
    throw error;
  }
};

const sendViaTwilioWhatsApp = async (whatsappConfig, phoneNumber, message) => {
  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(whatsappConfig.twilioAccountSid, whatsappConfig.twilioAuthToken);

    const result = await client.messages.create({
      body: message,
      from: whatsappConfig.twilioWhatsappNumber,
      to: `whatsapp:${phoneNumber}`,
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    throw new Error(`Twilio WhatsApp error: ${error.message}`);
  }
};

const sendViaMetaWhatsApp = async (whatsappConfig, phoneNumber, message) => {
  try {
    const phoneId =
      whatsappConfig.metaPhoneId || whatsappConfig.metaBusinessAccountId;
    if (!phoneId) {
      throw new Error("Meta Phone Number ID is not configured");
    }

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneId}/messages`,
      {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${whatsappConfig.metaAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: { body: message },
      }),
    },
    );

    const data = await response.json();

    if (data.messages && data.messages[0]) {
      return { success: true, messageId: data.messages[0].id };
    } else {
      throw new Error(data.error?.message || "Failed to send WhatsApp message");
    }
  } catch (error) {
    throw new Error(`Meta WhatsApp error: ${error.message}`);
  }
};

export const sendBulkWhatsApp = async (phoneNumbers, message) => {
  const results = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendWhatsApp(phoneNumber, message);
      results.push({ phoneNumber, success: true, ...result });
    } catch (error) {
      results.push({ phoneNumber, success: false, error: error.message });
    }
  }

  return results;
};
