import { Router } from "express";
import PassTemplate from "../models/PassTemplate.js";

const router = Router();

router.get("/", async (_req, res) => {
  try { res.json(await PassTemplate.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

router.post("/", async (req, res) => {
  try { res.status(201).json(await PassTemplate.create(req.body)); }
  catch (err) { res.status(400).json({ error: err.message }); }
});

router.put("/:id", async (req, res) => {
  try {
    const t = await PassTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!t) return res.status(404).json({ error: "Template not found" });
    res.json(t);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

router.delete("/:id", async (req, res) => {
  try {
    const t = await PassTemplate.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ error: "Template not found" });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
