# Zoho Mail Troubleshooting - Error 535

## ❌ Error: "535 Authentication Failed"

This error means Zoho rejected your login credentials. Here's how to fix it.

---

## 🔍 Troubleshooting Steps

### Step 1: Verify You're Using App Password (NOT Main Password)

**❌ WRONG**: Using your Zoho account password
```
Email: your.email@zohomail.com
Password: YourMainZohoPassword123  ← WRONG!
```

**✅ CORRECT**: Using app-specific password
```
Email: your.email@zohomail.com
Password: [App Password from Zoho Settings]  ← CORRECT!
```

**How to Generate App Password:**
1. Go to https://mail.zoho.com
2. Click on your **Profile Avatar** (top right)
3. Click **My Accounts**
4. Select your account
5. Go to **Security** tab
6. Scroll to **App Passwords**
7. Select Application: **Other** or **Mail**
8. Select Device: **Other**
9. Click **Generate**
10. **Copy the entire password** (including hyphens)
11. Paste into Communication Setup

---

### Step 2: Check Email Address Format

**Common Mistakes:**

❌ `your email@zohomail.com` (space in email)
❌ `your.email@zoho.com` (wrong domain)
❌ `your.email@zohomail.IN` (wrong case)
❌ `your.email@zohomail.com ` (trailing space)

✅ `your.email@zohomail.com` (exactly as shown in Zoho Mail)

**Verify your email:**
- Log into Zoho Mail
- Check the email shown at top-left
- Copy it exactly as shown

---

### Step 3: Copy-Paste Issues

App passwords are long. Make sure:

1. ✅ No extra spaces before/after password
2. ✅ No line breaks in password
3. ✅ All characters copied (including hyphens)
4. ✅ No accidental characters at start/end

**How to verify:**
- Clear the password field
- Paste again carefully
- Check field length looks reasonable

---

### Step 4: Zoho Mail Account Status

Make sure your Zoho Mail account is:

1. ✅ Active (not suspended)
2. ✅ Email verified
3. ✅ Not locked due to failed login attempts
4. ✅ Password not expired

**If account is locked:**
1. Go to https://mail.zoho.com
2. Try logging in with your main password
3. You may need to unlock your account
4. Then generate a new app password

---

### Step 5: Check SMTP Settings

Make sure SMTP is enabled in Zoho:

1. Go to https://mail.zoho.com
2. Settings (gear icon) → Mail → SMTP
3. Verify SMTP is **Enabled**
4. Note your SMTP details

**Default Zoho SMTP Settings:**
```
Host: smtp.zoho.com
Port: 587 (TLS) or 465 (SSL)
Username: [Your full Zoho email]
Password: [App password]
```

---

## 🌍 Regional Zoho SMTP Servers

If your Zoho account is in a different region:

| Region | SMTP Server |
|--------|------------|
| **US** | smtp.zoho.com |
| **Europe** | smtp.zoho.eu |
| **India** | smtp.zoho.in |
| **Australia** | smtp.zoho.com.au |
| **China** | smtp.zoho.com.cn |

**How to check your region:**
1. Go to https://mail.zoho.com
2. Look at the URL:
   - `zoho.com` = US
   - `zoho.eu` = Europe
   - `zoho.in` = India
   - etc.

**If you're in Europe:**
- Change SMTP Host to: `smtp.zoho.eu`
- Then test again

---

## 🔐 Two-Factor Authentication

If you have 2FA enabled:

1. App passwords **bypass 2FA** (that's what they're for)
2. Make sure you used **app password**, not 2FA code
3. App password is different from your one-time code

**If 2FA is causing issues:**
- Temporarily disable 2FA to test
- Re-enable after verification
- Then use app password for integration

---

## 🔧 Step-by-Step Fix

### Fix #1: Generate New App Password

1. Go to https://mail.zoho.com
2. Profile → My Accounts → Your Account
3. Security Tab
4. **Delete old app password** if exists
5. Click **Generate New App Password**
6. Application: **Other (SMTP)**
7. Device: **Other**
8. Copy the full password

### Fix #2: Update Communication Setup

1. In your app: Settings → Communication Setup
2. Email tab
3. Clear current password field
4. Paste new app password (slowly, no extra spaces)
5. Verify email is exactly: `your.email@zohomail.com`
6. Check SMTP Host: `smtp.zoho.com` (or regional equivalent)
7. Check SMTP Port: `587`
8. Click **Test Connection**

### Fix #3: Check for Common Typos

```
WRONG:  your email@zohomail.com    (space in email)
WRONG:  your.email@zoho.com        (missing 'mail')
WRONG:  your.email@zohomail.IN     (capital IN)
WRONG:  Your.Email@Zohomail.Com    (wrong case)

CORRECT: your.email@zohomail.com    (lowercase, no spaces)
```

---

## ✅ Testing Process

1. **Generate app password** - Copy it
2. **Paste into Communication Setup** - Email tab
3. **Click "Test Connection"**
4. Should see: `✓ Zoho Mail connection successful!`
5. If error, follow troubleshooting steps above

---

## 🚨 Still Getting Error?

### Try This Debug Process:

**Step 1: Verify Zoho Login**
- Go to https://mail.zoho.com
- Log in with your email and main password
- If this fails, your account might be locked
- Contact Zoho support to unlock

**Step 2: Verify App Password Generation**
- In Zoho: Settings → Security → App Passwords
- Look for "Other (SMTP)" app
- If not there, generate a new one
- Copy the exact password

**Step 3: Test Outside App**
Use this command to test SMTP directly:
```bash
openssl s_client -starttls smtp -connect smtp.zoho.com:587
```

**Step 4: Check Port/Host**
Try different ports:
- Port 587 (TLS) - Standard
- Port 465 (SSL) - Alternative
- Port 25 (Plain) - Less common

---

## 📋 Checklist Before Testing

- [ ] I'm using **app password**, not main password
- [ ] Email is exactly: `your.email@zohomail.com`
- [ ] No extra spaces before/after password
- [ ] No extra spaces before/after email
- [ ] SMTP Host is: `smtp.zoho.com` (or regional server)
- [ ] SMTP Port is: `587`
- [ ] My Zoho account is active and verified
- [ ] I can log into https://mail.zoho.com with main password
- [ ] I generated app password in last 5 minutes (fresh)

---

## 🎯 Most Common Fixes

**Problem**: Using main password instead of app password
**Solution**: Generate app password in Zoho settings

**Problem**: Email has spaces or wrong domain
**Solution**: Copy email from Zoho: `Settings → My Account → Email`

**Problem**: Wrong regional SMTP server
**Solution**: Check Zoho URL, use corresponding SMTP server

**Problem**: Account locked due to failed attempts
**Solution**: Wait 30 min, log into Zoho with main password, try again

---

## 📞 If Still Not Working

1. **Contact Zoho Support**: https://www.zoho.com/mail/contact-support/
2. **Check Zoho Status**: https://status.zoho.com
3. **Verify account status**: Log into https://mail.zoho.com
4. **Try alternate provider**: Use SendGrid as temporary workaround

---

## 🔄 Alternative: Use SendGrid Instead

If Zoho continues having issues:

1. Settings → Communication Setup → Email tab
2. Change provider to: **SendGrid**
3. Get SendGrid API key from https://app.sendgrid.com
4. Paste API key and from email
5. Test and save

---

## ✅ Success Indicators

When working correctly, you'll see:

1. ✅ "Test Connection" shows `✓ Zoho Mail connection successful!`
2. ✅ "Save Settings" works without errors
3. ✅ Settings are saved (you can reload page and see them)
4. ✅ Email icon in Email tab shows enabled status
5. ✅ Can send test emails

---

Let me know which error message you're seeing exactly, and I can provide more specific help!
