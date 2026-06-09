import express from "express";
import {
  getAllIntegrations,
  getIntegrationsByType,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testEmailConnection,
  testSmsConnection,
  testWhatsappConnection,
} from "../controllers/integrationController.js";

const router = express.Router();

// Test connections (define before :type routes to avoid conflicts)
router.post("/test-email", testEmailConnection);
router.post("/test-sms", testSmsConnection);
router.post("/test-whatsapp", testWhatsappConnection);

// Get all integrations grouped by type
router.get("/all", getAllIntegrations);

// Get integrations by type
router.get("/:type", getIntegrationsByType);

// Create new integration
router.post("/:type", createIntegration);

// Update integration
router.put("/:id", updateIntegration);

// Delete integration
router.delete("/:id", deleteIntegration);

export default router;
