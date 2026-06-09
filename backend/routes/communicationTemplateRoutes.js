import express from "express";
import {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
} from "./communicationTemplateController.js";

const router = express.Router();

router.get("/", getTemplates);
router.get("/:templateId", getTemplateById);
router.post("/", createTemplate);
router.put("/:templateId", updateTemplate);
router.delete("/:templateId", deleteTemplate);
router.post("/:templateId/duplicate", duplicateTemplate);

export default router;
