import { Router } from "express";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";

const router = Router();

// GET /api/public/event/:eventId
// Returns only the fields needed for the public form: eventName + enabled attendeeFields
router.get("/event/:eventId", async (req, res) => {
  try {
    const event = await Event.findById(req.params.eventId)
      .select("eventName attendeeFields startDate endDate venue")
      .lean();
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/public/register
// Accepts { eventId, name, email, phone, ...customFields }
// Reuses the same passId generation logic as POST /api/attendees
router.post("/register", async (req, res) => {
  try {
    const { eventId, ...rest } = req.body;
    if (!eventId) return res.status(400).json({ error: "eventId required" });
    const count = await Attendee.countDocuments({ eventId });
    const eventShort = String(eventId).slice(-4);
    const passId = `PASS-${eventShort}-${String(count + 1).padStart(4, "0")}`;
    const attendee = await Attendee.create({
      ...rest,
      eventId,
      passId,
      status: "registered",
    });
    await Event.findByIdAndUpdate(eventId, {
      $inc: { attendeeCount: 1 },
      status: "Active",
    });
    res.status(201).json({ passId: attendee.passId, message: "Registration successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
