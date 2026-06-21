import { Router } from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Attendee from "../models/Attendee.js";
import { escapeRegex } from "../utils/escapeRegex.js";
import { generatePassId } from "../utils/generatePassId.js";

const router = Router();

const findPublicEvent = async (eventIdOrSlug) => {
  if (mongoose.isValidObjectId(eventIdOrSlug)) {
    return Event.findById(eventIdOrSlug);
  }
  const searchName = eventIdOrSlug.replace(/_/g, " ");
  return Event.findOne({
    eventName: { $regex: new RegExp(`^${escapeRegex(searchName)}$`, "i") },
  });
};

// GET /api/public/event/:eventId
// Returns only the fields needed for the public form: eventName + enabled attendeeFields
router.get("/event/:eventId", async (req, res) => {
  try {
    const event = await findPublicEvent(req.params.eventId);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/public/register
// Accepts { eventId, name, email, phone, ...customFields }
router.post("/register", async (req, res) => {
  try {
    const { eventId, ...rest } = req.body;
    if (!eventId) return res.status(400).json({ error: "eventId required" });
    const passId = await generatePassId(eventId);
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
    res
      .status(201)
      .json({ passId: attendee.passId, message: "Registration successful" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
