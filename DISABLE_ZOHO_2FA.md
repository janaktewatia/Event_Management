# How to Disable 2FA in Zoho Mail

## 🔐 Step-by-Step Guide

### Step 1: Log into Zoho Mail

1. Go to **https://mail.zoho.com**
2. Enter your **email address**
3. Enter your **password**
4. When asked for 2FA code:
   - Open your **authenticator app** (Google Authenticator, Microsoft Authenticator, Authy, etc.)
   - Find the **6-digit code** for Zoho
   - Enter it
   - Click **Verify** ✅

### Step 2: Go to Security Settings

Once logged in:

1. Click your **Profile Avatar** (top right corner)
2. Click **My Accounts**
3. Select your **mail account**
4. Go to **Security** tab

### Step 3: Disable 2FA

1. Look for **Two-Factor Authentication** section
2. You should see it's currently **"Enabled"**
3. Click on **Two-Factor Authentication**
4. Click **Disable** button
5. You may be asked to confirm - click **Yes** or **Confirm**

### Step 4: Confirmation

- You should see: **"Two-Factor Authentication has been disabled"**
- 2FA is now **OFF** ✅

---

## ✅ Done!

2FA is now disabled. You can:

1. Log out and log back in with just email + password (no 2FA code needed)
2. Generate app password for SMTP without 2FA interference
3. Use Zoho Mail without 2FA

---

## 🔄 Next: Generate App Password

Now that 2FA is disabled:

1. Still in **Settings → Security**
2. Look for **App Passwords**
3. Click **Generate**
4. Application: **Other** or **Mail**
5. Device: **Other**
6. Click **Generate**
7. **Copy the password** (you'll see something like: `xxxx-xxxx-xxxx-xxxx`)

---

## 📝 Then Configure in Your App

1. Settings → Communication Setup → Email tab
2. Provider: **Zoho Mail**
3. Email: `your.email@zohomail.com`
4. Password: **Paste the app password**
5. Click **Test Connection**
6. Should see ✅ **"Zoho Mail connection successful!"**
7. Click **Save Settings**

---

## ⚠️ Security Note

2FA provides extra security. Consider:

- **Option 1**: Keep it disabled (easier setup, less secure)
- **Option 2**: Re-enable after app password generation (more secure)
  - You only need 2FA when logging into Zoho Mail directly
  - App password bypasses 2FA for SMTP/apps

---

## 🎯 Summary

| Step | Action |
|------|--------|
| 1 | Log into Zoho with 2FA code |
| 2 | Go to Settings → Security |
| 3 | Click Disable on Two-Factor Authentication |
| 4 | Generate app password |
| 5 | Use app password in Communication Setup |

---

That's it! 2FA will be disabled. 🎉
