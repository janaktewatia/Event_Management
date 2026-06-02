import { Router } from "express";
import UserType from "../models/UserType.js";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const types = await UserType.find().sort({ createdAt: -1 });
    res.json(types);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const type = await UserType.create(req.body);
    res.status(201).json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const type = await UserType.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!type) return res.status(404).json({ error: "User type not found" });
    res.json(type);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const type = await UserType.findByIdAndDelete(req.params.id);
    if (!type) return res.status(404).json({ error: "User type not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
