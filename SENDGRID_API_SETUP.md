# SendGrid API Key - Complete Guide

## 📋 Step 1: Create SendGrid Account

1. Go to **https://sendgrid.com**
2. Click **Sign Up** (top right)
3. Fill in:
   - **Email**: Your email address
   - **Password**: Create a strong password
   - **Company**: Your company name (or personal)
   - Click **Create Account**
4. Verify your email (check your inbox for verification link)
5. Click the link to verify

---

## 🔑 Step 2: Get API Key

### Method A: Simple Way (Recommended)

1. Log into SendGrid: https://app.sendgrid.com
2. On left sidebar, find **Settings** section
3. Click **API Keys**
4. Click **Create API Key** button (blue button, top right)
5. Fill in:
   - **API Key Name**: `Event Management App` (or any name)
   - **API Key Permissions**: Select **Full Access** (or just select "Mail Send")
6. Click **Create & Copy**
7. **Copy the API key** (you'll see it in a popup - copy it!)
8. ✅ Save it somewhere safe

### Method B: Step-by-Step Photos

**If confused, follow exactly:**

```
Step 1: Log into app.sendgrid.com
         ↓
Step 2: Left sidebar → Settings → API Keys
         ↓
Step 3: Blue "Create API Key" button
         ↓
Step 4: Enter name: "Event Management App"
         ↓
Step 5: Select "Full Access" permission
         ↓
Step 6: Click "Create & Copy"
         ↓
Step 7: Copy the key (long string like: SG.xxxxx...)
         ↓
✅ Done!
```

---

## 💾 Step 3: Get "From Email" Address

SendGrid needs a verified email address to send from.

### Option A: Use Your Own Domain

**If you have a domain:**
1. In SendGrid dashboard
2. Left sidebar → Settings → Sender Authentication
3. Click **Domain Authentication**
4. Add your domain
5. Follow verification steps
6. Use: `noreply@yourdomain.com`

### Option B: Use SendGrid's Domain

**If no domain:**
1. Use any email like: `noreply@yourdomain.sendgrid.net`
2. Or create a custom: `noreply@youreventapp.com` (if you own domain)

### Option C: Use Your Personal Email

1. Go to Settings → From Address
2. Add your email: `your.email@gmail.com`
3. Verify it (click link in email)
4. Use it in Communication Setup

---

## 📝 What You'll Have

After these steps, you'll have:

```
API Key: SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
From Email: noreply@yourdomain.com (or your email)
```

---

## ✅ Step 4: Add to Communication Setup

In your Event Management app:

1. Go to **Settings → Communication Setup**
2. Click **Email** tab
3. Change **Provider** to: **SendGrid**
4. Paste **API Key** in the field
5. Enter **From Email Address**: `noreply@yourdomain.com` (or your email)
6. Click **Test Connection**
7. Should see: ✅ **"SendGrid connection successful!"**
8. Click **Save Settings**

---

## 🎯 Complete Setup Example

```
Provider: SendGrid
API Key: SG.xxxxxxxxxxxxxxxxxxxxx (paste the long key)
From Email: noreply@yourdomain.com
```

---

## ⚠️ Important Notes

- **Keep API Key Safe**: Don't share it publicly
- **One Key Per App**: You can create multiple keys for different apps
- **No Expiry**: API keys don't expire (but you can revoke them)
- **Billing**: Free trial includes 100 emails/day

---

## 💳 SendGrid Pricing

- **Free Plan**: 100 emails/day (perfect for testing)
- **Paid Plans**: Starting from $20/month (5,000 emails/day)
- **No setup fees**: Just pay for what you use

---

## 🚀 After Setup

Once you've added the SendGrid API key:

1. All your emails will go through SendGrid
2. Event confirmations ✅
3. Pass generation emails ✅
4. Attendance confirmations ✅
5. Event reminders ✅
6. All automatic!

---

## ❓ Troubleshooting

### "API Key Not Accepted"
- Make sure you copied the **entire key** (no spaces before/after)
- Check it starts with `SG.`

### "Invalid From Email"
- Verify the email in SendGrid first
- Use exactly as shown in SendGrid dashboard

### "Connection Failed"
- Check API key is correct
- Check from email is verified in SendGrid
- Wait 5 minutes and try again

---

## 📞 SendGrid Support

If you need help:
- https://sendgrid.com/docs
- https://support.sendgrid.com

---

## ✨ That's It!

You now have:
1. ✅ SendGrid account
2. ✅ API Key
3. ✅ Verified from email
4. ✅ Connected to your app

Ready to send emails! 🎉
