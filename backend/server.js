import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./db.js";

import eventRoutes from "./routes/eventRoutes.js";
import attendeeRoutes from "./routes/attendeeRoutes.js";
import userFieldRoutes from "./routes/userFieldRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import eventTypeRoutes from "./routes/eventTypeRoutes.js";
import eventLogRoutes from "./routes/eventLogRoutes.js";
import userTypeRoutes from "./routes/userTypeRoutes.js";
import appUserRoutes from "./routes/appUserRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import passTemplateRoutes from "./routes/passTemplateRoutes.js";
import publicRoutes from "./routes/publicRoutes.js";
import formsRoutes from "./routes/formsRoutes.js";
import formTemplatesRoutes from "./routes/formTemplatesRoutes.js";
import integrationRoutes from "./routes/integrationRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import communicationHistoryRoutes from "./routes/communicationHistoryRoutes.js";
import communicationTemplateRoutes from "./routes/communicationTemplateRoutes.js";
import whatsappRoutes from "./routes/whatsappRoutes.js";

const app = express();

connectDB();

app.use(
  cors({
    origin: (origin, cb) => cb(null, true), // allow all origins in dev
  }),
);
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/events", eventRoutes);
app.use("/api/attendees", attendeeRoutes);
app.use("/api/user-fields", userFieldRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/event-types", eventTypeRoutes);
app.use("/api/event-logs", eventLogRoutes);
app.use("/api/user-types", userTypeRoutes);
app.use("/api/app-users", appUserRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/pass-templates", passTemplateRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/forms", formsRoutes);
app.use("/api/form-templates", formTemplatesRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/communications", communicationRoutes);
app.use("/api/communication-history", communicationHistoryRoutes);
app.use("/api/communication-templates", communicationTemplateRoutes);
app.use("/api/whatsapp", whatsappRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
