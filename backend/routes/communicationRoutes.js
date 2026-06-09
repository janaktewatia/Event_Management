import express from "express";
import {
  sendEmailNotification,
  sendEmailBulk,
  sendSmsNotification,
  sendSmsBulk,
  sendWhatsAppNotification,
  sendWhatsAppBulk,
} from "./communicationController.js";

const router = express.Router();

router.post("/email", sendEmailNotification);
router.post("/email/bulk", sendEmailBulk);
router.post("/sms", sendSmsNotification);
router.post("/sms/bulk", sendSmsBulk);
router.post("/whatsapp", sendWhatsAppNotification);
router.post("/whatsapp/bulk", sendWhatsAppBulk);

export default router;
