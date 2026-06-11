import express from "express";
import {
  saveWhatsAppConfig,
  getWhatsAppConfig,
  getAllConfigs,
  setActiveConfig,
  fetchMetaTemplates,
  saveWhatsAppTemplate,
  getWhatsAppTemplates,
  getWhatsAppTemplate,
  deleteWhatsAppTemplate,
  submitTemplateToMeta,
  testMetaConnection,
} from "../controllers/whatsappController.js";

const router = express.Router();

// Debug endpoint
router.post("/debug-config", (req, res) => {
  console.log("DEBUG: Received request");
  console.log("Headers:", req.headers);
  console.log("Body:", JSON.stringify(req.body, null, 2));
  res.json({ received: true, body: req.body });
});

// Configuration endpoints
router.post("/config", saveWhatsAppConfig);
router.get("/config", getWhatsAppConfig);
router.get("/configs", getAllConfigs);
router.put("/config/:vendor/activate", setActiveConfig);
router.post("/test-connection", testMetaConnection);

// Meta Templates endpoints
router.get("/templates/fetch-meta", fetchMetaTemplates);

// Template endpoints
router.post("/templates", saveWhatsAppTemplate);
router.get("/templates", getWhatsAppTemplates);
router.get("/templates/:id", getWhatsAppTemplate);
router.delete("/templates/:id", deleteWhatsAppTemplate);
router.post("/templates/:templateId/submit-meta", submitTemplateToMeta);

export default router;
