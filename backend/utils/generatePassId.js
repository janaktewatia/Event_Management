import Event from "../models/Event.js";

export const generatePassId = async (eventId) => {
  const event = await Event.findByIdAndUpdate(
    eventId,
    { $inc: { registrationSequence: 1 } },
    { new: true },
  );
  if (!event) throw new Error("Event not found");
  const eventShort = String(eventId).slice(-4);
  return `PASS-${eventShort}-${String(event.registrationSequence).padStart(4, "0")}`;
};

export const generatePassIds = async (eventId, count) => {
  const event = await Event.findByIdAndUpdate(
    eventId,
    { $inc: { registrationSequence: count } },
    { new: true },
  );
  if (!event) throw new Error("Event not found");
  const eventShort = String(eventId).slice(-4);
  const start = event.registrationSequence - count + 1;
  return Array.from({ length: count }, (_, i) =>
    `PASS-${eventShort}-${String(start + i).padStart(4, "0")}`,
  );
};
