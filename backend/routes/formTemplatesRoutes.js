import { Router } from "express";
import FormTemplate from "../models/FormTemplate.js";

const router = Router();

// GET all form templates
router.get("/", async (_req, res) => {
  try {
    const templates = await FormTemplate.find().sort({ createdAt: -1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single template
router.get("/:id", async (req, res) => {
  try {
    const template = await FormTemplate.findById(req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.json(template);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create template
router.post("/", async (req, res) => {
  try {
    const template = await FormTemplate.create(req.body);
    res.status(201).json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update template
router.put("/:id", async (req, res) => {
  try {
    const template = await FormTemplate.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE template
router.delete("/:id", async (req, res) => {
  try {
    const template = await FormTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.json({ message: "Template deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
