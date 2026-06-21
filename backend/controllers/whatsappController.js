import WhatsAppConfig from "../models/WhatsAppConfig.js";
import WhatsAppTemplate from "../models/WhatsAppTemplate.js";
import fetch from "node-fetch";

// Save WhatsApp Configuration
export const saveWhatsAppConfig = async (req, res) => {
  try {
    const { vendor, meta, pinnacle, interakt, ai_sency } = req.body;

    // Validate vendor
    if (!vendor || !["meta", "pinnacle", "interakt", "ai_sency"].includes(vendor)) {
      return res.status(400).json({ 
        error: "Invalid vendor. Must be: meta, pinnacle, interakt, or ai_sency" 
      });
    }

    // Validate Meta config
    if (vendor === "meta") {
      if (!meta) {
        return res.status(400).json({ error: "Meta configuration is required" });
      }
      if (!meta.accessToken || meta.accessToken.trim().length === 0) {
        return res.status(400).json({ error: "Access Token is required" });
      }
      if (!meta.phoneId || meta.phoneId.trim().length === 0) {
        return res.status(400).json({ error: "Phone ID is required" });
      }
      if (!meta.wabaId || meta.wabaId.trim().length === 0) {
        return res.status(400).json({ error: "WABA ID is required" });
      }
    }

    let config = await WhatsAppConfig.findOne({ vendor });

    if (config) {
      config.vendorName = getVendorName(vendor);
      if (vendor === "meta") config.meta = meta;
      if (vendor === "pinnacle") config.pinnacle = pinnacle;
      if (vendor === "interakt") config.interakt = interakt;
      if (vendor === "ai_sency") config.ai_sency = ai_sency;
      config.updatedAt = new Date();
    } else {
      config = new WhatsAppConfig({
        vendor,
        vendorName: getVendorName(vendor),
        meta: vendor === "meta" ? meta : undefined,
        pinnacle: vendor === "pinnacle" ? pinnacle : undefined,
        interakt: vendor === "interakt" ? interakt : undefined,
        ai_sency: vendor === "ai_sency" ? ai_sency : undefined,
      });
    }

    await config.save();
    res.json({ success: true, message: "WhatsApp configuration saved", config });
  } catch (err) {
    console.error("Error saving WhatsApp config:", err);
    res.status(500).json({ 
      error: "Failed to save configuration: " + err.message,
      details: err.toString()
    });
  }
};

// Get WhatsApp Configuration
export const getWhatsAppConfig = async (req, res) => {
  try {
    const { vendor } = req.query;
    let config;

    if (vendor) {
      config = await WhatsAppConfig.findOne({ vendor });
    } else {
      config = await WhatsAppConfig.findOne({ isActive: true });
    }

    res.json(config || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get All Configurations
export const getAllConfigs = async (req, res) => {
  try {
    const configs = await WhatsAppConfig.find({});
    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Set Active Configuration
export const setActiveConfig = async (req, res) => {
  try {
    const { vendor } = req.params;

    await WhatsAppConfig.updateMany({}, { isActive: false });
    const config = await WhatsAppConfig.findOneAndUpdate(
      { vendor },
      { isActive: true },
      { new: true }
    );

    if (!config) {
      return res.status(404).json({ error: "WhatsApp configuration not found for this vendor" });
    }

    res.json({ success: true, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fetch Templates from Meta WhatsApp Cloud API
export const fetchMetaTemplates = async (req, res) => {
  try {
    const config = await WhatsAppConfig.findOne({ vendor: "meta", isActive: true });

    if (!config || !config.meta) {
      return res.status(400).json({ error: "Meta WhatsApp configuration not found" });
    }

    const { accessToken, wabaId } = config.meta;

    const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates?access_token=${accessToken}`;

    const response = await fetch(url);
    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(400).json({ 
        error: "Invalid response from Meta API. Check your credentials.",
        details: text.substring(0, 200)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    const templates = data.data || [];
    const formattedTemplates = templates.map((t) => ({
      metaTemplateId: t.id,
      templateName: t.name,
      category: t.category,
      language: t.language || "en",
      bodyText: t.components?.find((c) => c.type === "BODY")?.text || "",
      headerType: t.components?.find((c) => c.type === "HEADER")?.format || "TEXT",
      metaStatus: t.status,
      vendor: "meta",
    }));

    res.json({ templates: formattedTemplates, rawData: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save WhatsApp Template
export const saveWhatsAppTemplate = async (req, res) => {
  try {
    const { templateId, ...templateData } = req.body;

    let template;

    if (templateId) {
      template = await WhatsAppTemplate.findByIdAndUpdate(templateId, templateData, {
        new: true,
      });
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
    } else {
      template = new WhatsAppTemplate(templateData);
      await template.save();
    }

    res.json({ success: true, template });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get WhatsApp Templates
export const getWhatsAppTemplates = async (req, res) => {
  try {
    const { vendor } = req.query;
    const query = vendor ? { vendor } : {};
    const templates = await WhatsAppTemplate.find(query).sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Single Template
export const getWhatsAppTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const template = await WhatsAppTemplate.findById(id);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete Template
export const deleteWhatsAppTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    await WhatsAppTemplate.findByIdAndDelete(id);
    res.json({ success: true, message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Submit Template to Meta for Approval
export const submitTemplateToMeta = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await WhatsAppTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const config = await WhatsAppConfig.findOne({ vendor: "meta", isActive: true });
    if (!config || !config.meta) {
      return res.status(400).json({ error: "Meta configuration not found" });
    }

    const { accessToken, wabaId } = config.meta;

    const components = [];

    if (template.headerType === "TEXT" && template.headerContent?.text) {
      components.push({
        type: "HEADER",
        format: "TEXT",
        text: template.headerContent.text,
      });
    } else if (template.headerType !== "TEXT" && template.headerContent?.text) {
      components.push({
        type: "HEADER",
        format: template.headerType,
        text: template.headerContent.text,
      });
    }

    components.push({
      type: "BODY",
      text: template.bodyText,
    });

    if (template.footerText) {
      components.push({
        type: "FOOTER",
        text: template.footerText,
      });
    }

    if (template.buttons && template.buttons.length > 0) {
      components.push({
        type: "BUTTONS",
        buttons: template.buttons.map((btn) => ({
          type:
            btn.actionType === "CALL"
              ? "PHONE_NUMBER"
              : btn.actionType === "WEBSITE"
                ? "URL"
                : btn.actionType === "QUICK_REPLY"
                  ? "QUICK_REPLY"
                  : btn.actionType.toUpperCase(),
          text: btn.buttonText,
          phone_number: btn.actionType === "CALL" ? btn.actionValue : undefined,
          url: btn.actionType === "WEBSITE" ? btn.actionValue : undefined,
        })),
      });
    }

    const payload = {
      name: template.templateName,
      language: template.language,
      category: template.category,
      components,
    };

    const url = `https://graph.facebook.com/v18.0/${wabaId}/message_templates?access_token=${accessToken}`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const text = await response.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(400).json({ 
        error: "Invalid response from Meta API",
        details: text.substring(0, 200)
      });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error });
    }

    template.metaTemplateId = data.id;
    template.metaStatus = "PENDING_REVIEW";
    await template.save();

    res.json({ success: true, template, metaResponse: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Test Meta Connection
export const testMetaConnection = async (req, res) => {
  try {
    const { accessToken, wabaId } = req.body;

    if (!accessToken || !wabaId) {
      return res.status(400).json({
        success: false,
        message: "Missing credentials",
        error: "Please provide both Access Token and WABA ID"
      });
    }

    if (!/^\d+$/.test(wabaId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid WABA ID format",
        error: "WABA ID should contain only numbers (e.g., 981013294562418)"
      });
    }

    if (accessToken.length < 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid Access Token format",
        error: "Access Token seems too short. Please check your token."
      });
    }

    const url = `https://graph.facebook.com/v18.0/${wabaId}?access_token=${accessToken}`;
    
    const response = await fetch(url);
    const text = await response.text();
    
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(400).json({
        success: false,
        message: "Invalid response from Meta API",
        error: "Meta API returned invalid response. Check your credentials or network connection.",
        details: text.substring(0, 300)
      });
    }

    if (data.error) {
      const errorCode = data.error.code;
      const errorMessage = data.error.message;

      let friendlyMessage = errorMessage;
      
      if (errorCode === 190) {
        friendlyMessage = "Access Token is invalid or expired. Generate a new token from Meta Business Suite.";
      } else if (errorCode === 100) {
        friendlyMessage = "Invalid WABA ID. Please verify the WhatsApp Business Account ID.";
      } else if (errorCode === 10) {
        friendlyMessage = "This app does not have permission to access this resource. Check token permissions.";
      } else if (errorCode === 401) {
        friendlyMessage = "Unauthorized. Access Token may be expired or revoked.";
      }

      return res.status(400).json({
        success: false,
        message: "Meta API returned an error",
        error: friendlyMessage,
        errorCode: errorCode,
        rawError: errorMessage
      });
    }

    return res.json({
      success: true,
      message: "Connection successful!",
      data: {
        wabaId: data.id,
        displayName: data.display_phone_number || "N/A",
        phoneNumberId: data.phone_number_id || "N/A"
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Network error",
      error: err.message
    });
  }
};

function getVendorName(vendor) {
  const names = {
    meta: "Meta WhatsApp",
    pinnacle: "Pinnacle",
    interakt: "Interakt",
    ai_sency: "Ai Sency",
  };
  return names[vendor] || vendor;
}
