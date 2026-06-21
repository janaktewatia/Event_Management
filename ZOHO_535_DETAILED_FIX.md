# Zoho Mail Error 535 - Detailed Troubleshooting

## 🔍 Understanding Error 535

"535 Authentication Failed" means:
- ❌ SMTP server rejected the username/password combination
- ❌ The email or password is incorrect
- ❌ SMTP is not properly configured
- ❌ Account type doesn't support SMTP

---

## ✅ Complete Verification Checklist

### 1. Verify Email Address

**What you need:**
- Log into https://mail.zoho.com
- Look at the email shown at top-left
- Copy it **exactly** as shown

**Common formats:**
- `yourname@zohomail.com` ← Standard
- `yourname@zoho.in` ← India region
- `yourname@custom-domain.com` ← Custom domain

**What to check:**
- ✅ No spaces in email
- ✅ Correct domain (.com, .eu, .in, etc.)
- ✅ Correct spelling of your name
- ✅ Use lowercase letters

---

### 2. Verify SMTP is Enabled

**Steps:**

1. Log into https://mail.zoho.com
2. Click **Settings** (gear icon, top right)
3. Click **Mail** in left menu
4. Look for **IMAP/SMTP** section
5. Check status - should say **"Enabled"**

**If it says "Disabled":**
- Click **Enable IMAP/SMTP**
- Confirm the change
- Wait 5 minutes for it to activate

---

### 3. Identify Your Region & SMTP Server

**Check your Zoho region:**

When you log into Zoho, look at the URL:

| URL | Region | SMTP Server |
|-----|--------|------------|
| `https://mail.zoho.com` | **US** | `smtp.zoho.com` |
| `https://mail.zoho.eu` | **Europe** | `smtp.zoho.eu` |
| `https://mail.zoho.in` | **India** | `smtp.zoho.in` |
| `https://mail.zoho.com.au` | **Australia** | `smtp.zoho.com.au` |
| `https://mail.zoho.com.cn` | **China** | `smtp.zoho.com.cn` |

**What to use in Communication Setup:**
- **SMTP Host**: Match your region (see table above)
- **SMTP Port**: `587` (TLS) or `465` (SSL)

---

### 4. Verify Your Password

**After disabling 2FA, you have 2 options:**

**Option A: Use Main Password**
```
Email: your.email@zohomail.com
Password: [Your Zoho login password - the one you use to log into mail.zoho.com]
```

**Option B: Use App Password** (Recommended)
```
Email: your.email@zohomail.com
Password: [Generated app password from Settings → Security → App Passwords]
```

**How to create app password:**
1. Log into https://mail.zoho.com
2. Settings → Security → App Passwords
3. Click **Generate**
4. Application: **Other** or **Mail**
5. Device: **Other**
6. Click **Generate**
7. **Copy the entire password** (format: `xxxx-xxxx-xxxx-xxxx`)

---

### 5. Check for Special Characters

**If your password has special characters:**
- Some characters need URL encoding in SMTP
- Examples: `@`, `!`, `#`, `$`, `%`, `&`

**Safer approach:**
- Use app password instead (generated passwords have fewer special chars)
- Or reset your Zoho password to something simpler (only letters & numbers)

---

### 6. Test SMTP Directly (Advanced)

If you're comfortable with command line:

```bash
# Test SMTP connection
openssl s_client -starttls smtp -connect smtp.zoho.com:587

# At the prompt, enter:
ehlo test
auth login
[your base64 encoded email - optional]
[your base64 encoded password - optional]
quit
```

---

## 🛠️ Step-by-Step Fix Process

### Fix #1: Use Correct Regional SMTP Server

1. Log into Zoho: Note the URL domain
2. In Communication Setup:
   - **US**: `smtp.zoho.com`
   - **Europe**: `smtp.zoho.eu`
   - **India**: `smtp.zoho.in`
   - (etc., based on your region)
3. Port: `587`
4. Test Connection

### Fix #2: Generate Fresh App Password

1. Log into https://mail.zoho.com
2. Settings → Security → App Passwords
3. **Delete any old app passwords**
4. Click **Generate New**
5. Application: **Other**
6. Device: **Other**
7. Click **Generate**
8. **Copy the password immediately** (don't wait)
9. Paste into Communication Setup
10. Test Connection

### Fix #3: Use Main Password (If App Password Fails)

1. Log into Communication Setup
2. Change password to: **Your Zoho login password**
   - (The one you use to log into mail.zoho.com)
3. Test Connection
4. If this works, you know the email/host are correct
5. Then try app password again

### Fix #4: Verify Email Format

1. Log into https://mail.zoho.com
2. Look at top-left where it shows your email
3. **Copy it exactly** (case-sensitive, no extra spaces)
4. Paste into Communication Setup
5. Verify no spaces before/after
6. Test Connection

---

## 📋 Complete Configuration Template

**Fill this out carefully:**

```
Email Address: _______________________ (copy from Zoho top-left)
Zoho Region: ________________________ (US/EU/IN/AU/CN - check URL)
SMTP Host: _________________________ (smtp.zoho.com or regional)
SMTP Port: _________________________ (587 or 465)
Password Type: ______________________ (main or app password)
Password: __________________________ (paste here)
```

---

## 🎯 Most Likely Causes (in order)

| # | Cause | Fix |
|---|-------|-----|
| 1 | **Wrong SMTP Host** | Use correct region: `smtp.zoho.eu` not `smtp.zoho.com` |
| 2 | **Wrong Email Format** | Copy from Zoho: `your.email@zohomail.com` (no spaces) |
| 3 | **Email & Password Mismatch** | Try main password, then app password |
| 4 | **SMTP Not Enabled** | Enable in Zoho: Settings → Mail → IMAP/SMTP |
| 5 | **Password with Special Chars** | Use app password instead of main password |
| 6 | **Account Locked** | Wait 30 min, log into Zoho with main password |

---

## ⚠️ Account Lock Issues

If you tried wrong passwords too many times:

1. Zoho may have **temporarily locked** the account
2. **Wait 30 minutes** before trying again
3. Log into https://mail.zoho.com with main password
4. Complete any security prompts
5. Then try SMTP again

---

## 🔄 If Still Not Working

**Try this order:**

1. ✅ Verify correct SMTP host for your region
2. ✅ Verify email format has no spaces
3. ✅ Use app password instead of main password
4. ✅ Use main password instead of app password
5. ✅ Verify SMTP is enabled in Zoho
6. ✅ Wait 30 min (account lock cooldown)
7. ✅ Switch to SendGrid as fallback

---

## 🔄 Alternative: Use SendGrid Instead

If Zoho SMTP continues failing:

1. Settings → Communication Setup → Email tab
2. Change provider to: **SendGrid**
3. Sign up free at https://sendgrid.com
4. Get API key
5. Enter API key and from email
6. Test and save

SendGrid is more reliable for SMTP integrations.

---

## 📞 Zoho Support

If you need help from Zoho:
- Website: https://www.zoho.com/mail/contact-support/
- They can verify if SMTP is properly enabled
- They can reset account if locked

---

## ✅ Success Indicators

When working:
1. ✅ Test Connection shows: `✓ Zoho Mail connection successful!`
2. ✅ Settings save without errors
3. ✅ Can reload page and settings are still there
4. ✅ Can send test emails

---

Let me know what you find when checking these items!
