import express from "express";
import {
  getCommunicationHistory,
  getEventCommunicationStats,
  logCommunication,
  getCommunicationDetails,
  exportCommunicationToExcel,
} from "./communicationHistoryController.js";

const router = express.Router();

router.get("/event/:eventId", getCommunicationHistory);
router.get("/stats/:eventId", getEventCommunicationStats);
router.post("/log", logCommunication);
router.get("/details/:historyId", getCommunicationDetails);
router.get("/export/:historyId", exportCommunicationToExcel);

export default router;
