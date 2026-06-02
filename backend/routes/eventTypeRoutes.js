import { Router } from "express";
import EventType from "../models/EventType.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const types = await EventType.find().sort({ createdAt: -1 });
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const type = await EventType.create(req.body);
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const type = await EventType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) return res.status(404).json({ error: "Event type not found" });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const type = await EventType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ error: "Event type not found" });
    res.json({ message: "Event type deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
