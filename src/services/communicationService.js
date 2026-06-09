import { apiUrl } from "../config";

export const communicationService = {
  // Email Operations
  sendEmail: async (to, subject, html, text) => {
    const response = await fetch(`${apiUrl}/communications/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, subject, html, text }),
    });
    return response.json();
  },

  sendBulkEmails: async (recipients, subject, html, text) => {
    const response = await fetch(`${apiUrl}/communications/email/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipients, subject, html, text }),
    });
    return response.json();
  },

  // SMS Operations
  sendSMS: async (phoneNumber, message) => {
    const response = await fetch(`${apiUrl}/communications/sms`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, message }),
    });
    return response.json();
  },

  sendBulkSMS: async (phoneNumbers, message) => {
    const response = await fetch(`${apiUrl}/communications/sms/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumbers, message }),
    });
    return response.json();
  },

  // WhatsApp Operations
  sendWhatsApp: async (phoneNumber, message) => {
    const response = await fetch(`${apiUrl}/communications/whatsapp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, message }),
    });
    return response.json();
  },

  sendBulkWhatsApp: async (phoneNumbers, message) => {
    const response = await fetch(`${apiUrl}/communications/whatsapp/bulk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumbers, message }),
    });
    return response.json();
  },

  // Integration Settings
  getIntegrationSettings: async () => {
    const response = await fetch(`${apiUrl}/integrations`);
    return response.json();
  },

  // Quick notification check (to see if a channel is enabled)
  isEmailEnabled: async () => {
    try {
      const settings = await communicationService.getIntegrationSettings();
      return settings?.email?.enabled || false;
    } catch {
      return false;
    }
  },

  isSMSEnabled: async () => {
    try {
      const settings = await communicationService.getIntegrationSettings();
      return settings?.sms?.enabled || false;
    } catch {
      return false;
    }
  },

  isWhatsAppEnabled: async () => {
    try {
      const settings = await communicationService.getIntegrationSettings();
      return settings?.whatsapp?.enabled || false;
    } catch {
      return false;
    }
  },
};

export default communicationService;
