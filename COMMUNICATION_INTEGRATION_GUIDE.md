# Communication Integration Guide

## Overview

The application now has full communication integration support for Email, SMS, and WhatsApp. Once you configure your credentials in the **Communication Setup** page, all communication features become live and can be used throughout the application.

---

## 📋 Setup Steps

### 1. Navigate to Communication Setup
- Go to **Settings → Communication Setup** in the sidebar
- You'll see three tabs: **Email**, **SMS**, and **WhatsApp**

### 2. Configure Each Service

#### 📧 Email (SendGrid or Zoho Mail)

**Option A: SendGrid**
- Provider: SendGrid
- Enter your SendGrid API Key
- Enter your From Email Address
- Click **Test Connection** to verify
- Click **Save Settings** to store

**Option B: Zoho Mail** (New!)
- Provider: Zoho Mail
- Enter your Zoho Mail email address
- Enter your Zoho Mail password (or app-specific password)
- Optional: Customize SMTP host/port if needed
- Click **Test Connection** to verify
- Click **Save Settings** to store

See [ZOHO_MAIL_INTEGRATION.md](./ZOHO_MAIL_INTEGRATION.md) for detailed setup instructions.

#### 📱 SMS (Twilio)
- Provider: Twilio (selected by default)
- Enter Twilio Account SID
- Enter Twilio Auth Token
- Enter Twilio Phone Number (your SMS sender)
- Click **Test Connection** to verify
- Click **Save Settings** to store

#### 💬 WhatsApp (Twilio)
- Provider: Twilio (selected by default)
- Enter Twilio Account SID
- Enter Twilio Auth Token
- Enter Twilio WhatsApp Number (from sandbox)
- Click **Test Connection** to verify
- Click **Save Settings** to store

---

## 🔌 API Endpoints

### Integration Settings Management

#### Get Current Settings
```bash
GET /api/integrations
```

#### Update Email Settings
```bash
POST /api/integrations/email
{
  "provider": "sendgrid",
  "enabled": true,
  "sendgridApiKey": "SG.xxxxx",
  "fromEmail": "noreply@yourdomain.com"
}
```

#### Update SMS Settings
```bash
POST /api/integrations/sms
{
  "provider": "twilio",
  "enabled": true,
  "twilioAccountSid": "ACxxxxx",
  "twilioAuthToken": "xxxxx",
  "twilioPhoneNumber": "+1234567890"
}
```

#### Update WhatsApp Settings
```bash
POST /api/integrations/whatsapp
{
  "provider": "twilio",
  "enabled": true,
  "twilioAccountSid": "ACxxxxx",
  "twilioAuthToken": "xxxxx",
  "twilioWhatsappNumber": "whatsapp:+1234567890"
}
```

#### Test Connections
```bash
POST /api/integrations/test-email
POST /api/integrations/test-sms
POST /api/integrations/test-whatsapp
```

---

### Sending Communications

#### Send Email
```bash
POST /api/communications/email
{
  "to": "user@example.com",
  "subject": "Event Confirmation",
  "html": "<h2>Welcome</h2>",
  "text": "Welcome to our event"
}
```

#### Send Email (Bulk)
```bash
POST /api/communications/email/bulk
{
  "recipients": ["user1@example.com", "user2@example.com"],
  "subject": "Event Reminder",
  "html": "<h2>Event Reminder</h2>",
  "text": "Your event is coming up"
}
```

#### Send SMS
```bash
POST /api/communications/sms
{
  "phoneNumber": "+1234567890",
  "message": "Your event pass is ready"
}
```

#### Send SMS (Bulk)
```bash
POST /api/communications/sms/bulk
{
  "phoneNumbers": ["+1234567890", "+0987654321"],
  "message": "Event reminder: Your event starts tomorrow"
}
```

#### Send WhatsApp
```bash
POST /api/communications/whatsapp
{
  "phoneNumber": "+1234567890",
  "message": "Your event pass has been generated"
}
```

#### Send WhatsApp (Bulk)
```bash
POST /api/communications/whatsapp/bulk
{
  "phoneNumbers": ["+1234567890", "+0987654321"],
  "message": "Don't forget! Your event starts in 1 hour"
}
```

---

## 🔧 Backend Usage Examples

### Using the Notification Helper

```javascript
import { sendNotification, createEmailTemplate } from "../utils/notificationHelper.js";

// Example 1: Send Email with Template
const emailData = {
  attendeeName: "John Doe",
  eventName: "Tech Summit 2024",
  eventDate: "June 15, 2024",
  eventTime: "10:00 AM",
  eventLocation: "Convention Center"
};

const emailTemplate = createEmailTemplate("eventConfirmation", emailData);
await sendNotification({
  type: ["email"],
  to: "john@example.com",
  subject: emailTemplate.subject,
  html: emailTemplate.html,
  text: emailTemplate.text
});

// Example 2: Send Multi-Channel Notifications
await sendNotification({
  type: ["email", "sms", "whatsapp"],
  to: "john@example.com",
  phoneNumbers: "+1234567890",
  subject: "Event Reminder",
  message: "Your event is tomorrow at 10 AM",
  html: "<h2>Event Reminder</h2><p>Your event is tomorrow</p>"
});

// Example 3: Send Bulk SMS
await sendNotification({
  type: ["sms"],
  phoneNumbers: ["+1111111111", "+2222222222", "+3333333333"],
  message: "Attendance reminder: Check in by 9:30 AM"
});
```

### Direct Service Usage

```javascript
import { sendEmail } from "../services/emailService.js";
import { sendSMS } from "../services/smsService.js";
import { sendWhatsApp } from "../services/whatsappService.js";

// Send single email
const emailResult = await sendEmail(
  "user@example.com",
  "Event Confirmation",
  "<h2>Welcome!</h2>",
  "Welcome to the event"
);

// Send single SMS
const smsResult = await sendSMS(
  "+1234567890",
  "Your event pass is ready"
);

// Send WhatsApp message
const whatsappResult = await sendWhatsApp(
  "+1234567890",
  "Your event pass has been generated. Please keep it safe."
);
```

---

## 🎯 Integration Points

### When Creating an Event
Send confirmation email/SMS/WhatsApp to attendees

```javascript
// In event creation controller
await sendNotification({
  type: ["email", "sms"],
  to: attendee.email,
  phoneNumbers: attendee.phoneNumber,
  subject: "Event Created",
  message: `Event ${eventName} has been created`,
  html: `<h2>${eventName}</h2><p>Your event is confirmed</p>`
});
```

### When Generating Pass
Send pass notification to attendee

```javascript
// In pass generation controller
await sendNotification({
  type: ["email", "whatsapp"],
  to: attendee.email,
  phoneNumbers: attendee.phoneNumber,
  subject: "Your Event Pass is Ready",
  message: "Your pass QR code is ready. Check email for details.",
  html: createEmailTemplate("eventConfirmation", attendeeData).html
});
```

### When Checking In
Send confirmation to attendee

```javascript
// In check-in controller
await sendNotification({
  type: ["sms", "whatsapp"],
  phoneNumbers: attendee.phoneNumber,
  message: `Welcome! Check-in confirmed for ${eventName}`
});
```

### Scheduled Event Reminders
Send reminders before event

```javascript
// In a scheduled job/cron task
const attendees = await Attendee.find({ eventId });
const emailAddresses = attendees.map(a => a.email);
const phoneNumbers = attendees.map(a => a.phoneNumber);

await sendNotification({
  type: ["email", "sms"],
  to: emailAddresses,
  phoneNumbers: phoneNumbers,
  subject: `Reminder: ${eventName} is tomorrow`,
  message: `${eventName} is happening tomorrow at ${eventTime}`,
  html: createEmailTemplate("eventReminder", eventData).html
});
```

---

## 📧 Email Templates

Built-in templates available:

1. **eventConfirmation** - Initial event confirmation
2. **eventReminder** - Event reminder before it starts
3. **attendanceConfirmation** - Confirmation after check-in

```javascript
import { createEmailTemplate, createSmsTemplate } from "../utils/notificationHelper.js";

const emailTemplate = createEmailTemplate("eventConfirmation", {
  attendeeName: "John",
  eventName: "Conference 2024",
  eventDate: "June 20, 2024",
  eventTime: "2:00 PM",
  eventLocation: "Downtown Hall"
});

const smsMessage = createSmsTemplate("eventReminder", {
  attendeeName: "John",
  eventName: "Conference 2024",
  eventDate: "June 20, 2024",
  eventTime: "2:00 PM"
});
```

---

## ✅ Error Handling

All communication endpoints return structured responses:

### Success Response
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "xxxxx"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Email service is not enabled or configured"
}
```

### Bulk Operations
```json
{
  "success": true,
  "message": "Bulk SMS sent",
  "results": [
    { "phoneNumber": "+1111111111", "success": true, "messageId": "xxxxx" },
    { "phoneNumber": "+2222222222", "success": false, "error": "Invalid number" }
  ]
}
```

---

## 🔐 Security Notes

1. **Credentials are securely stored** in MongoDB
2. **Never share API keys** in code or commits
3. **Use environment variables** for sensitive data
4. **Test connections** before saving
5. **Monitor bulk operations** for rate limits (especially SMS)

---

## 🐛 Troubleshooting

### Email Not Sending
- Check if Email is enabled in setup
- Verify SendGrid API key is correct
- Verify "From Email" is authorized in SendGrid
- Check email format is valid

### SMS Not Sending
- Check if SMS is enabled in setup
- Verify Twilio credentials are correct
- Verify phone number format (should include country code: +1XXXXXXXXXX)
- Check Twilio account has sufficient credits

### WhatsApp Not Sending
- Check if WhatsApp is enabled in setup
- Verify Twilio WhatsApp number is correct
- Ensure recipient has joined the WhatsApp sandbox
- WhatsApp requires proper message templates for business

---

## 📞 Support

For issues with:
- **SendGrid**: Visit https://support.sendgrid.com
- **Twilio**: Visit https://support.twilio.com
- **Application**: Check logs at `/api/communications/logs` (if available)

---

## 🚀 Next Steps

1. Configure credentials in Communication Setup
2. Test each channel with Test Connection buttons
3. Integrate notifications into event workflows
4. Monitor delivery status in activity logs
5. Adjust templates based on feedback

---

Generated: June 9, 2024
Version: 1.0
