# Communication Implementation Guide

## 🚀 Quick Start

### 1. Add Communication Setup to Navigation
Navigate to **Settings → Communication Setup** in the sidebar and configure:
- SendGrid API Key (Email)
- Twilio Account SID & Auth Token (SMS & WhatsApp)

### 2. Test Each Channel
Click "Test Connection" to verify credentials are correct.

### 3. Use in Your Features

---

## 📖 How to Use in Components

### Using the Notification Sender Component

```jsx
import { useState } from "react";
import NotificationSender from "./components/NotificationSender";
import { Button } from "react-bootstrap";

function MyPage() {
  const [showNotificationModal, setShowNotificationModal] = useState(false);

  return (
    <>
      <Button onClick={() => setShowNotificationModal(true)}>
        Send Notifications
      </Button>

      <NotificationSender
        show={showNotificationModal}
        onHide={() => setShowNotificationModal(false)}
        title="Send Event Reminder"
        defaultRecipients={{
          emails: ["user1@example.com", "user2@example.com"],
          phoneNumbers: ["+1234567890", "+0987654321"]
        }}
      />
    </>
  );
}
```

### Using the Communication Service Directly

```jsx
import communicationService from "./services/communicationService";

// Send single email
const result = await communicationService.sendEmail(
  "user@example.com",
  "Event Confirmation",
  "<h2>Welcome!</h2>",
  "Welcome to the event"
);

// Send bulk SMS
const result = await communicationService.sendBulkSMS(
  ["+1234567890", "+0987654321"],
  "Your event is tomorrow at 10 AM"
);

// Check if channel is enabled
const emailEnabled = await communicationService.isEmailEnabled();
if (emailEnabled) {
  // Show email option
}
```

---

## 🔧 Backend Integration Examples

### In Event Creation Controller

```javascript
import { sendEventConfirmationNotification } from "../utils/eventNotifications.js";

export const createEvent = async (req, res) => {
  try {
    // ... create event logic ...
    const event = await Event.create(req.body);

    // Send notifications to organizer
    await sendEventConfirmationNotification(req.user, event);

    res.json({ success: true, event });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### In Pass Generation Controller

```javascript
import { sendPassGeneratedNotification } from "../utils/eventNotifications.js";

export const generatePass = async (req, res) => {
  try {
    const { attendeeId, eventId } = req.body;
    
    const attendee = await Attendee.findById(attendeeId);
    const event = await Event.findById(eventId);

    // ... generate pass logic ...
    const pass = await Pass.create({ attendeeId, eventId });

    // Send notification
    await sendPassGeneratedNotification(attendee, event, pass);

    res.json({ success: true, pass });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### In Check-in Controller

```javascript
import { sendAttendanceConfirmationNotification } from "../utils/eventNotifications.js";

export const checkInAttendee = async (req, res) => {
  try {
    const { attendeeId, eventId } = req.body;

    const attendee = await Attendee.findById(attendeeId);
    const event = await Event.findById(eventId);

    // ... check-in logic ...
    const attendance = await Attendance.create({
      attendeeId,
      eventId,
      checkInTime: new Date()
    });

    // Send confirmation
    await sendAttendanceConfirmationNotification(
      attendee,
      event,
      attendance.checkInTime
    );

    res.json({ success: true, attendance });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
```

### In Scheduled Reminder Job

```javascript
import schedule from "node-schedule";
import { sendEventReminderNotification } from "../utils/eventNotifications.js";

// Run 24 hours before each event
schedule.scheduleJob("0 14 * * *", async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await Event.find({
      date: {
        $gte: new Date(tomorrow.setHours(0, 0, 0, 0)),
        $lt: new Date(tomorrow.setHours(23, 59, 59, 999))
      }
    });

    for (const event of events) {
      const attendees = await Attendee.find({ eventId: event._id });
      await sendEventReminderNotification(attendees, event);
      console.log(`Reminder sent for event: ${event.name}`);
    }
  } catch (error) {
    console.error("Scheduled reminder error:", error);
  }
});
```

---

## 🎯 Common Use Cases

### Use Case 1: Send Bulk Event Invitations via Zoho Mail

```javascript
// Frontend
import { communicationService } from "./services/communicationService";

const sendInvitations = async (eventId) => {
  const event = await getEvent(eventId);
  const attendees = await getAttendees(eventId);

  const emails = attendees.map(a => a.email).filter(Boolean);
  
  // Uses Zoho Mail if configured, SendGrid as fallback
  const result = await communicationService.sendBulkEmails(
    emails,
    `You're Invited: ${event.name}`,
    `<h2>${event.name}</h2><p>You're invited to attend our event!</p>`,
    `You're invited to ${event.name}`
  );

  console.log(`Sent to ${emails.length} attendees`, result);
};
```

**Note**: Once you've configured Zoho Mail in Communication Setup, all email operations automatically use Zoho Mail without any code changes!

### Use Case 2: Send Pass Download Links via SMS

```javascript
// Backend
import { sendSMS } from "../services/smsService.js";

export const sendPassLink = async (attendeeId, passDownloadUrl) => {
  const attendee = await Attendee.findById(attendeeId);
  
  const message = `Download your event pass: ${passDownloadUrl}`;
  
  const result = await sendSMS(attendee.phoneNumber, message);
  
  // Log the action
  await CommunicationLog.create({
    attendeeId,
    type: "sms",
    status: result.success ? "sent" : "failed",
    message
  });
};
```

### Use Case 3: Send WhatsApp Confirmation with QR Code

```javascript
// Backend
import { sendWhatsApp } from "../services/whatsappService.js";

export const sendPassViaWhatsApp = async (attendeeId, passUrl) => {
  const attendee = await Attendee.findById(attendeeId);
  const event = await Event.findById(attendee.eventId);

  const message = `
Hi ${attendee.firstName},

Your pass for ${event.name} is ready!

📅 Date: ${new Date(event.date).toLocaleDateString()}
⏰ Time: ${event.time}
📍 Location: ${event.location}

Download: ${passUrl}

See you at the event!
  `;

  const result = await sendWhatsApp(
    `+${attendee.phoneNumber}`,
    message
  );

  return result;
};
```

### Use Case 4: Send Multi-Channel Notifications

```javascript
// Frontend
import { communicationService } from "./services/communicationService";

const sendMultiChannelNotification = async (attendeeIds, message) => {
  const attendees = await getAttendees(attendeeIds);

  // Prepare recipients
  const emails = attendees.map(a => a.email).filter(Boolean);
  const phones = attendees.map(a => a.phoneNumber).filter(Boolean);

  // Send via all enabled channels
  const results = {
    email: null,
    sms: null,
    whatsapp: null
  };

  if (emails.length > 0) {
    results.email = await communicationService.sendBulkEmails(
      emails,
      message.subject,
      message.html
    );
  }

  if (phones.length > 0) {
    results.sms = await communicationService.sendBulkSMS(
      phones,
      message.text
    );

    results.whatsapp = await communicationService.sendBulkWhatsApp(
      phones,
      message.text
    );
  }

  return results;
};
```

---

## 📊 Tracking Communications

### Create Communication Log Model

```javascript
// models/CommunicationLog.js
import mongoose from "mongoose";

const communicationLogSchema = new mongoose.Schema({
  attendeeId: mongoose.Schema.Types.ObjectId,
  eventId: mongoose.Schema.Types.ObjectId,
  type: { type: String, enum: ["email", "sms", "whatsapp"] },
  subject: String,
  message: String,
  status: { type: String, enum: ["sent", "failed", "pending"] },
  error: String,
  sentAt: { type: Date, default: Date.now }
});

export default mongoose.model("CommunicationLog", communicationLogSchema);
```

### Log Communications Automatically

```javascript
import CommunicationLog from "../models/CommunicationLog.js";

export const logCommunication = async (attendeeId, type, subject, message, status, error = null) => {
  return await CommunicationLog.create({
    attendeeId,
    type,
    subject,
    message,
    status,
    error
  });
};
```

---

## ⚠️ Error Handling Best Practices

```javascript
try {
  const result = await communicationService.sendEmail(
    to,
    subject,
    html,
    text
  );

  if (result.success) {
    // Log success
    console.log("Email sent:", result.messageId);
    
    // Update database
    await Attendee.updateOne(
      { _id: attendeeId },
      { emailSentAt: new Date() }
    );
  } else {
    // Log failure
    console.error("Email failed:", result.error);
    
    // Optionally retry or notify admin
  }
} catch (error) {
  console.error("Email service error:", error);
  
  // Fallback: notify user via UI
  toast.error("Failed to send notification");
  
  // Don't stop the main flow - notifications are optional
}
```

---

## 🔐 Security Considerations

1. **Never log credentials** - API keys and tokens should never appear in logs
2. **Rate limiting** - Implement rate limits to prevent abuse
3. **Validation** - Always validate email and phone numbers
4. **Encryption** - Store credentials encrypted in database (already done)
5. **Audit logs** - Keep logs of all communications sent

---

## 📱 Frontend Examples

### Example: Send Notifications from Event Details Page

```jsx
import { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import NotificationSender from "../components/NotificationSender";

function EventDetailsPage({ event }) {
  const [showNotifyModal, setShowNotifyModal] = useState(false);

  const getAttendeeEmails = () => {
    return event.attendees?.map(a => a.email).filter(Boolean) || [];
  };

  const getAttendeePhones = () => {
    return event.attendees?.map(a => a.phoneNumber).filter(Boolean) || [];
  };

  return (
    <>
      <Button 
        variant="primary" 
        onClick={() => setShowNotifyModal(true)}
      >
        📢 Notify Attendees
      </Button>

      <NotificationSender
        show={showNotifyModal}
        onHide={() => setShowNotifyModal(false)}
        title={`Notify Attendees - ${event.name}`}
        defaultRecipients={{
          emails: getAttendeeEmails(),
          phoneNumbers: getAttendeePhones()
        }}
      />
    </>
  );
}
```

---

## 🧪 Testing

### Test Email Sending
```bash
curl -X POST http://localhost:5000/api/communications/email \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "html": "<h2>Test</h2>",
    "text": "Test email body"
  }'
```

### Test SMS Sending
```bash
curl -X POST http://localhost:5000/api/communications/sms \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Test SMS message"
  }'
```

### Test WhatsApp Sending
```bash
curl -X POST http://localhost:5000/api/communications/whatsapp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Test WhatsApp message"
  }'
```

---

## 📞 Support Resources

- **SendGrid Docs**: https://docs.sendgrid.com/
- **Twilio Docs**: https://www.twilio.com/docs
- **Implementation Issues**: Check logs in `/api/communications/logs`

---

Generated: June 9, 2024
Version: 1.0
