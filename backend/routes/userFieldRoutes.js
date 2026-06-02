import { Router } from "express";
import UserField from "../models/UserField.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const fields = await UserField.find().sort({ createdAt: -1 });
    res.json(fields);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const field = await UserField.create(req.body);
    res.status(201).json(field);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const field = await UserField.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!field) return res.status(404).json({ error: "Field not found" });
    res.json(field);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const field = await UserField.findByIdAndDelete(req.params.id);
    if (!field) return res.status(404).json({ error: "Field not found" });
    res.json({ message: "Field deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
