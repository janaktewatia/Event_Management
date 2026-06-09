import CommunicationTemplate from "../models/CommunicationTemplate.js";

export const getTemplates = async (req, res) => {
  try {
    const { type } = req.query;
    const query = type ? { type } : {};
    const templates = await CommunicationTemplate.find(query).sort({ createdAt: -1 });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTemplateById = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await CommunicationTemplate.findById(templateId);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, type, subject, content, description, createdBy } = req.body;

    if (!name || !type || !content) {
      return res.status(400).json({ error: "Name, type, and content are required" });
    }

    const template = await CommunicationTemplate.create({
      name,
      type,
      subject,
      content,
      description,
      createdBy,
    });

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const { name, type, subject, content, description } = req.body;

    const template = await CommunicationTemplate.findByIdAndUpdate(
      templateId,
      {
        name,
        type,
        subject,
        content,
        description,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await CommunicationTemplate.findByIdAndDelete(templateId);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const duplicateTemplate = async (req, res) => {
  try {
    const { templateId } = req.params;
    const template = await CommunicationTemplate.findById(templateId);

    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    const newTemplate = await CommunicationTemplate.create({
      name: `${template.name} (Copy)`,
      type: template.type,
      subject: template.subject,
      content: template.content,
      description: template.description,
      createdBy: template.createdBy,
    });

    res.json(newTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
