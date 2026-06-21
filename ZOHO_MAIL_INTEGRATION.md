# Zoho Mail Integration Guide

## Overview

Zoho Mail has been integrated into the Communication Setup as an email provider option alongside SendGrid. Once configured, you can use Zoho Mail to send all event notifications, confirmations, and reminders.

---

## 🚀 Setting Up Zoho Mail

### Step 1: Get Your Zoho Mail Credentials

1. **Login to Zoho Mail**: Visit https://mail.zoho.com
2. **Find Your Email Address**: You'll use your Zoho Mail email address (e.g., `your.email@zohomail.com`)
3. **Set Up App Password** (Recommended):
   - Go to **Settings → Security**
   - Scroll to **App Passwords**
   - Create a new app password for this application
   - Copy the generated password (this is what you'll use, not your main password)

### Step 2: Configure in Communication Setup

1. Navigate to **Settings → Communication Setup**
2. Click on the **Email** tab
3. From the **Email Provider** dropdown, select **Zoho Mail**
4. Fill in the following fields:

   | Field | Value |
   |-------|-------|
   | **Zoho Mail Email Address** | Your Zoho email (e.g., `your.email@zohomail.com`) |
   | **Zoho Mail Password** | Your app-specific password or account password |
   | **From Email Address** | Email to appear as sender (can be same as above) |
   | **SMTP Host** | `smtp.zoho.com` (usually pre-filled) |
   | **SMTP Port** | `587` (usually pre-filled) |

5. Click **Test Connection** to verify credentials
6. Click **Save Settings** when successful

---

## 🔧 Configuration Details

### SMTP Settings for Zoho Mail

**Zoho Mail SMTP Details:**
- **SMTP Host**: `smtp.zoho.com`
- **SMTP Port**: `587` (TLS) or `465` (SSL)
- **Username**: Your full Zoho Mail email address
- **Password**: Your app-specific password (recommended) or account password
- **TLS/SSL**: Required

### Recommended Setup

For security and reliability, we recommend:
- Using **Port 587** (TLS) instead of 465
- Creating an **App-Specific Password** in Zoho settings
- Using your **Zoho Mail email** as both the sender and account

---

## 📧 Supported Email Regions

Zoho Mail SMTP servers available in different regions:

| Region | SMTP Server |
|--------|------------|
| **US (Default)** | `smtp.zoho.com` |
| **Europe** | `smtp.zoho.eu` |
| **India** | `smtp.zoho.in` |
| **Australia** | `smtp.zoho.com.au` |
| **China** | `smtp.zoho.com.cn` |

If your Zoho account is in a different region, update the **SMTP Host** accordingly.

---

## 🧪 Testing Your Connection

### Method 1: Using Communication Setup Page
1. Fill in your Zoho Mail credentials
2. Click **Test Connection**
3. You'll see a success or error message

### Method 2: Using API
```bash
curl -X POST http://localhost:5000/api/integrations/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "zoho",
    "zohoSmtpUser": "your.email@zohomail.com",
    "zohoSmtpPassword": "your-app-password"
  }'
```

---

## 🎯 Using Zoho Mail

Once configured and tested, Zoho Mail will be used for:

### Automatic Notifications
- ✅ Event creation confirmations
- ✅ Pass generation notifications
- ✅ Attendance confirmations
- ✅ Event reminders

### Manual Notifications
- ✅ Custom messages to attendees
- ✅ Bulk email campaigns
- ✅ System notifications

### Example Code

```javascript
// Zoho Mail will automatically be used for all email notifications
import { sendEmail } from "./services/emailService.js";

const result = await sendEmail(
  "attendee@example.com",
  "Event Confirmation",
  "<h2>Welcome!</h2><p>You're confirmed for our event</p>",
  "You're confirmed for our event"
);

console.log(result); // { success: true, messageId: "..." }
```

---

## ⚙️ Advanced Configuration

### Custom SMTP Settings

If you need to use a custom SMTP server or different port:

1. In **Communication Setup**, you can modify:
   - **SMTP Host**: Change from `smtp.zoho.com` if needed
   - **SMTP Port**: Change from `587` to `465` (SSL) if preferred

2. Or via API:
```javascript
const response = await fetch(`${apiUrl}/integrations/email`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    provider: "zoho",
    enabled: true,
    zohoSmtpUser: "your.email@zohomail.com",
    zohoSmtpPassword: "your-app-password",
    zohoSmtpHost: "smtp.zoho.com",
    zohoSmtpPort: 587,
    fromEmail: "noreply@yourdomain.com"
  })
});
```

---

## 🔒 Security Best Practices

### 1. Use App-Specific Passwords
- Create a dedicated app password in Zoho settings
- Don't use your main account password
- Easier to revoke if compromised

### 2. Never Share Credentials
- Keep passwords out of version control
- Use environment variables in production
- Use strong, unique passwords

### 3. Monitor Email Delivery
- Check Zoho Mail sent folder regularly
- Monitor bounce rates
- Review failed notifications in logs

### 4. Use TLS/SSL
- Always use port 587 (TLS) or 465 (SSL)
- Ensures encrypted communication
- Protects credentials in transit

---

## 🐛 Troubleshooting

### "Connection Failed" Error

**Problem**: Test connection shows `Invalid credentials`

**Solutions**:
1. ✓ Verify email address is correct (case-sensitive)
2. ✓ Check password is the app password, not main password
3. ✓ Ensure SMTP host is correct for your region
4. ✓ Try disabling 2FA temporarily to test

### "Timeout" Error

**Problem**: Connection takes too long or times out

**Solutions**:
1. ✓ Verify port is correct (587 or 465)
2. ✓ Check firewall/network allows outbound SMTP
3. ✓ Try different port (if 587 fails, try 465)
4. ✓ Verify SMTP server address is reachable

### Emails Not Sending

**Problem**: Connection is successful but emails don't send

**Solutions**:
1. ✓ Check email address format is valid
2. ✓ Verify Zoho account has enough quota
3. ✓ Check logs for detailed error messages
4. ✓ Verify sender email is authorized in Zoho

### "Relay Not Permitted"

**Problem**: Error indicates relay is not permitted

**Solutions**:
1. ✓ Ensure you're using your Zoho email as the sender
2. ✓ Don't try to send as a different domain
3. ✓ If using custom domain, configure in Zoho first

---

## 📊 Limits & Quotas

**Zoho Mail Sending Limits**:
- **Free Plan**: 100 emails/day
- **Standard Plan**: 5,000 emails/day
- **Professional Plan**: Unlimited

Check your Zoho plan for current limits.

---

## 🔄 Switching Providers

### From SendGrid to Zoho Mail
1. Keep SendGrid configured (backup)
2. Configure Zoho Mail in Communication Setup
3. Set Zoho Mail as active provider
4. Test thoroughly
5. Can keep SendGrid as fallback

### From Zoho Mail to SendGrid
1. Configure SendGrid in Communication Setup
2. Change provider from "Zoho Mail" to "SendGrid"
3. Save settings
4. Test connection

---

## 📱 Available Email Providers

You can now choose between:
- **SendGrid** - API-based, highly reliable, best for scale
- **Zoho Mail** - SMTP-based, cost-effective, good for small-to-medium
- **SMTP** - Custom SMTP server (any provider)
- **Mailgun** - API-based alternative
- **AWS SES** - For AWS users

---

## 💡 Tips

### Recommended Setup for Small Teams
```
Provider: Zoho Mail
Plan: Standard (free to start, upgrade as needed)
Region: Use your local region for better delivery
App Password: Yes, create one for security
```

### Recommended Setup for Large Teams
```
Provider: SendGrid
Plan: SendGrid Pro (better for high volume)
Fallback: Zoho Mail (if SendGrid goes down)
```

---

## 📞 Support Resources

- **Zoho Mail Docs**: https://www.zoho.com/mail/help/
- **SMTP Configuration**: https://www.zoho.com/mail/help/smtp.html
- **Create App Password**: https://www.zoho.com/mail/help/account-setup/enable-imap-smtp.html

---

## 🎯 Integration Examples

### Example 1: Send Event Confirmation via Zoho Mail
```javascript
import { sendEventConfirmationNotification } from "./utils/eventNotifications.js";

const attendee = {
  email: "john@example.com",
  firstName: "John"
};

const event = {
  name: "Tech Summit 2024",
  date: "2024-06-20",
  time: "10:00 AM",
  location: "Convention Center"
};

// Automatically uses Zoho Mail if configured
await sendEventConfirmationNotification(attendee, event);
```

### Example 2: Send Bulk Emails
```javascript
import { sendBulkEmails } from "./services/emailService.js";

const recipients = [
  "attendee1@example.com",
  "attendee2@example.com",
  "attendee3@example.com"
];

const result = await sendBulkEmails(
  recipients,
  "Event Reminder",
  "<h2>Your event is tomorrow!</h2>",
  "Your event is tomorrow at 10 AM"
);

console.log(result);
// Returns: [
//   { email: "attendee1@example.com", success: true, messageId: "..." },
//   { email: "attendee2@example.com", success: true, messageId: "..." },
//   { email: "attendee3@example.com", success: true, messageId: "..." }
// ]
```

### Example 3: Check if Email is Enabled
```javascript
import communicationService from "./services/communicationService.js";

const isEnabled = await communicationService.isEmailEnabled();
if (isEnabled) {
  // Show email option in UI
}
```

---

## ✅ Verification Checklist

Before considering Zoho Mail setup complete:

- [ ] Created Zoho Mail account
- [ ] Generated app-specific password
- [ ] Entered email address in Communication Setup
- [ ] Entered app password in Communication Setup
- [ ] Clicked "Test Connection" - shows success
- [ ] Clicked "Save Settings"
- [ ] Verified email received (check spam folder)
- [ ] Sent test notification via API
- [ ] Checked Zoho Mail sent folder

---

## 🚀 Next Steps

1. **Configure Zoho Mail** using this guide
2. **Test Connection** in Communication Setup
3. **Send Test Email** to verify
4. **Integrate into Events** - notifications will be sent automatically
5. **Monitor Delivery** - check logs and Zoho sent folder

---

Generated: June 9, 2024
Version: 1.0
