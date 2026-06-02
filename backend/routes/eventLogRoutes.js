import { Router } from "express";
import EventLog from "../models/EventLog.js";

const router = Router();

// GET /api/event-logs?eventId=X  — fetch logs for one event
router.get("/", async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: "eventId required" });
    const logs = await EventLog.find({ eventId })
      .sort({ changedAt: -1 })
      .limit(500);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/event-logs  — create a log entry
router.post("/", async (req, res) => {
  try {
    const log = await EventLog.create(req.body);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/event-logs?eventId=X  — clear logs for an event (admin utility)
router.delete("/", async (req, res) => {
  try {
    const { eventId } = req.query;
    if (!eventId) return res.status(400).json({ error: "eventId required" });
    await EventLog.deleteMany({ eventId });
    res.json({ message: "Logs cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
