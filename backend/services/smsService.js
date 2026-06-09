import IntegrationSettings from "../models/IntegrationSettings.js";

export const sendSMS = async (phoneNumber, message) => {
  try {
    const settings = await IntegrationSettings.findOne();

    if (!settings || !settings.sms.enabled) {
      throw new Error("SMS service is not enabled or configured");
    }

    if (settings.sms.provider === "twilio") {
      return await sendViaTwilio(settings.sms, phoneNumber, message);
    } else if (settings.sms.provider === "vonage") {
      return await sendViaVonage(settings.sms, phoneNumber, message);
    }

    throw new Error(`Unsupported SMS provider: ${settings.sms.provider}`);
  } catch (error) {
    console.error("SMS sending error:", error.message);
    throw error;
  }
};

const sendViaTwilio = async (smsConfig, phoneNumber, message) => {
  try {
    const twilio = (await import("twilio")).default;
    const client = twilio(smsConfig.twilioAccountSid, smsConfig.twilioAuthToken);

    const result = await client.messages.create({
      body: message,
      from: smsConfig.twilioPhoneNumber,
      to: phoneNumber,
    });

    return { success: true, messageId: result.sid };
  } catch (error) {
    throw new Error(`Twilio SMS error: ${error.message}`);
  }
};

const sendViaVonage = async (smsConfig, phoneNumber, message) => {
  try {
    const Vonage = (await import("@vonage/server-sdk")).default;
    const vonage = new Vonage({
      apiKey: smsConfig.vonageApiKey,
      apiSecret: smsConfig.vonageApiSecret,
    });

    const result = await vonage.sms.send({
      to: phoneNumber,
      from: smsConfig.vonageFromNumber,
      text: message,
    });

    if (result.messages[0]["status"] === "0") {
      return { success: true, messageId: result.messages[0]["message-id"] };
    } else {
      throw new Error(`Message failed with error: ${result.messages[0]["error-text"]}`);
    }
  } catch (error) {
    throw new Error(`Vonage SMS error: ${error.message}`);
  }
};

export const sendBulkSMS = async (phoneNumbers, message) => {
  const results = [];

  for (const phoneNumber of phoneNumbers) {
    try {
      const result = await sendSMS(phoneNumber, message);
      results.push({ phoneNumber, success: true, ...result });
    } catch (error) {
      results.push({ phoneNumber, success: false, error: error.message });
    }
  }

  return results;
};
