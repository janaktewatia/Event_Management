# Communication History & Bulk Sending Guide

## Overview

The Communication History feature allows you to send bulk emails, SMS, and WhatsApp messages to event attendees and maintain a complete history of all communications with detailed tracking.

---

## 🚀 Features

### 1. Send Communications
- **Email**: Send to all attendees with custom subject and message
- **SMS**: Send SMS messages to all attendees
- **WhatsApp**: Send WhatsApp messages to all attendees
- **Templates**: Pre-built templates for common messages
- **Custom Messages**: Write your own message

### 2. Communication History Sidebar
- **View All Communications**: See complete history of all sent communications
- **Date & Time**: Track when each communication was sent
- **Template Info**: See which template was used
- **Recipient Count**: View total recipients and success/failure rates
- **Status Indicators**: See 🟢 All Sent, 🟡 Partial, or 🔴 Failed

### 3. Detailed Analytics
- **View Recipients**: See full list of recipients with delivery status
- **Export to Excel**: Download recipient list with delivery details
- **Delivery Status**: Track which messages succeeded and which failed

---

## 📋 How to Use

### Send Communication to Attendees

#### Step 1: Navigate to Event Attendees
1. Go to: **Events → Select Event → Upload Data**
2. Look for the **"Send Communication"** button

#### Step 2: Choose Communication Type
1. Click **"Send Communication"**
2. Select one of:
   - 📧 **Email** - Send email to all attendees
   - 📱 **SMS** - Send SMS to all attendees
   - 💬 **WhatsApp** - Send WhatsApp to all attendees

#### Step 3: Compose Message
1. **(For Email only)** Enter Subject
2. Enter Message:
   - Use templates or write custom message
   - For SMS: Keep under 160 characters recommended
   - For WhatsApp: Can be longer

#### Step 4: Send
1. Review recipient count
2. Click **"Send to X Attendees"**
3. Wait for confirmation

---

## 📊 View Communication History

### Access History Sidebar

1. In Event Attendees page, click **"Communication History"** button
2. Sidebar opens showing:
   - All past communications
   - Date & time sent
   - Type (Email/SMS/WhatsApp)
   - Template used (if any)
   - Status (✓ All Sent / ⚠ Partial / ✗ Failed)

### View Details

1. In History Sidebar, click **"View (X)"** button
2. Modal opens showing:
   - Summary statistics
   - Complete list of recipients
   - Delivery status for each recipient
   - Error messages (if any)

### Export to Excel

1. In History Sidebar, click **"📊"** button (or in details modal)
2. Excel file downloads with:
   - Recipient names
   - Email/Phone numbers
   - Delivery status
   - Error details

---

## 📈 Data Stored

Each communication entry tracks:

```javascript
{
  eventId: "...",
  type: "email|sms|whatsapp",
  template: "eventConfirmation|eventReminder|custom",
  subject: "Email subject (email only)",
  message: "Full message text",
  recipientCount: 50,          // Total recipients
  successCount: 48,            // Successfully sent
  failureCount: 2,             // Failed to send
  sentAt: "2026-06-10T10:30Z", // Timestamp
  sentBy: "userid",            // Who sent it
  recipients: [
    {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
      status: "sent|failed",
      error: "Error message if failed"
    },
    // ... more recipients
  ]
}
```

---

## 🎯 Pre-built Templates

### Email Templates
1. **Event Confirmation**
   - Confirms event registration
   - Includes event details
   - Professional format

2. **Event Reminder**
   - Reminds about upcoming event
   - Date, time, location
   - Call to action

3. **Attendance Confirmation**
   - Confirms check-in
   - Thank you message
   - Next steps

### SMS/WhatsApp Templates
Same templates as email but in SMS-friendly format (shorter, concise)

---

## 📱 API Endpoints

### Send Communication
```
POST /api/communications/email
POST /api/communications/sms
POST /api/communications/whatsapp
```

### Communication History
```
GET /api/communication-history/event/:eventId
POST /api/communication-history/log
GET /api/communication-history/details/:historyId
GET /api/communication-history/export/:historyId
GET /api/communication-history/stats/:eventId
```

---

## 🔐 Requirements

### To Send Communications
- Integration must be configured
- At least one attendee with valid contact info
- Communication channel enabled (Email/SMS/WhatsApp)

### To Export
- Valid communication history ID
- At least one recipient

---

## ⚠️ Important Notes

1. **Bulk Limits**
   - SendGrid: Check your plan limits
   - Twilio: Check account balance
   - Ensure sufficient credits before sending

2. **Recipient Data**
   - Email: Requires valid email address
   - SMS/WhatsApp: Requires valid phone number

3. **Message Length**
   - Email: No limit
   - SMS: Recommended 160 characters (counts as 2 SMS if longer)
   - WhatsApp: No strict limit, but keep concise

4. **Delivery Status**
   - "Sent" = Accepted by provider
   - "Failed" = Provider rejected
   - Actual delivery depends on recipient's device/network

---

## 📊 Excel Export Format

When you export to Excel, you get:

| Name | Email | Phone | Status | Error |
|------|-------|-------|--------|-------|
| John Doe | john@example.com | +1234567890 | sent | - |
| Jane Smith | jane@example.com | +0987654321 | failed | Invalid number |

---

## 🔍 Tracking & Analytics

### Available Metrics
- Total communications sent
- By type (Email/SMS/WhatsApp)
- By date range
- Success/failure rates
- Recipient counts

### Reports
- Download communication history as Excel
- Filter by date range
- Filter by communication type

---

## 💡 Best Practices

1. **Use Templates**
   - Saves time
   - Consistent messaging
   - Professional format

2. **Test First**
   - Send test message to yourself first
   - Verify content and formatting
   - Check links/formatting before bulk send

3. **Time Messaging**
   - Send during business hours
   - Avoid late night/early morning
   - Consider recipient timezone

4. **Monitor Delivery**
   - Check success rates
   - Review failures
   - Update phone numbers for failed deliveries

5. **Maintain History**
   - Keep records of all communications
   - Use for compliance
   - Reference for follow-up

---

## 🚨 Troubleshooting

### Messages Not Sending
- Verify integration is enabled
- Check attendee contact info
- Verify provider settings
- Check account credits

### Export Not Working
- Ensure history exists
- Check browser download folder
- Try different communication entry

### Delivery Failures
- Verify phone numbers (SMS/WhatsApp)
- Verify email addresses (Email)
- Check provider rate limits
- Verify credentials

---

## 📞 Support

For issues:
1. Check Communication History for details
2. Verify Integration Settings
3. Check provider account status
4. Review error messages in export

---

Generated: June 10, 2026
Version: 1.0
