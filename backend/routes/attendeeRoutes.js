import { Router } from "express";
import Attendee from "../models/Attendee.js";
import Event from "../models/Event.js";
import { generatePassId, generatePassIds } from "../utils/generatePassId.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { eventId } = req.query;
    const filter = eventId ? { eventId } : {};
    const attendees = await Attendee.find(filter).sort({ createdAt: -1 });
    res.json(attendees);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { eventId, ...rest } = req.body;
    if (!eventId) return res.status(400).json({ error: "eventId required" });
    const passId = await generatePassId(eventId);
    const attendee = await Attendee.create({ ...rest, eventId, passId });
    await Event.findByIdAndUpdate(eventId, {
      $inc: { attendeeCount: 1 },
      status: "Active",
    });
    res.status(201).json(attendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/bulk", async (req, res) => {
  try {
    const { eventId, attendees } = req.body;
    if (!eventId || !Array.isArray(attendees)) {
      return res.status(400).json({ error: "eventId and attendees array required" });
    }

    const passIds = await generatePassIds(eventId, attendees.length);
    const records = attendees.map((a, i) => ({
      ...a,
      eventId,
      passId: passIds[i],
    }));

    const inserted = await Attendee.insertMany(records);

    await Event.findByIdAndUpdate(eventId, {
      $inc: { attendeeCount: inserted.length },
      status: "Active",
    });

    res.status(201).json(inserted);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!attendee) return res.status(404).json({ error: "Attendee not found" });
    res.json(attendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const attendee = await Attendee.findByIdAndDelete(req.params.id);
    if (!attendee) return res.status(404).json({ error: "Attendee not found" });

    const count = await Attendee.countDocuments({ eventId: attendee.eventId });
    await Event.findByIdAndUpdate(attendee.eventId, { attendeeCount: count });

    res.json({ message: "Attendee deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
