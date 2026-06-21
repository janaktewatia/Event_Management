import { Router } from "express";
import Form from "../models/Form.js";
import { generateDefaultFormElements } from "../utils/generateFormElements.js";
import { escapeRegex } from "../utils/escapeRegex.js";

const router = Router();

// GET all forms
router.get("/", async (_req, res) => {
  try {
    const forms = await Form.find().sort({ createdAt: -1 });
    // Generate default elements for forms that don't have them
    const formsWithElements = forms.map((form) => {
      const formData = form.toObject ? form.toObject() : form;
      if (!formData.elements || formData.elements.length === 0) {
        formData.elements = generateDefaultFormElements(formData);
      }
      return formData;
    });
    res.json(formsWithElements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET form by slug (form name)
router.get("/slug/:slug", async (req, res) => {
  try {
    const slug = req.params.slug;
    // Convert slug back to search pattern (replace _ with spaces)
    const searchName = slug.replace(/_/g, " ");

    // Find form by name (case-insensitive)
    let form = await Form.findOne({
      formName: { $regex: new RegExp(`^${escapeRegex(searchName)}$`, "i") },
    });

    if (!form) {
      return res.status(404).json({ error: "Form not found" });
    }

    // Convert to plain object to allow modifications
    let formData = form.toObject ? form.toObject() : form;

    // Generate default elements if missing
    if (!formData.elements || formData.elements.length === 0) {
      formData.elements = generateDefaultFormElements(formData);
    }

    res.json(formData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single form by ID
router.get("/:id", async (req, res) => {
  try {
    let form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });

    // Convert to plain object
    let formData = form.toObject ? form.toObject() : form;

    // Generate default elements if missing
    if (!formData.elements || formData.elements.length === 0) {
      formData.elements = generateDefaultFormElements(formData);
    }

    res.json(formData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create form
router.post("/", async (req, res) => {
  try {
    const form = await Form.create(req.body);
    res.status(201).json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT update form
router.put("/:id", async (req, res) => {
  try {
    const form = await Form.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json(form);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE form
router.delete("/:id", async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);
    if (!form) return res.status(404).json({ error: "Form not found" });
    res.json({ message: "Form deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
