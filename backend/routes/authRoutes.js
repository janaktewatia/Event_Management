import { Router } from "express";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import AppUser from "../models/AppUser.js";
import UserType from "../models/UserType.js";

const router = Router();

const APP_NAME = "Event Management";

const ALL_PERMISSIONS = [
  "reports.dashboard",
  "events.view",
  "attendees.view",
  "pass.design",
  "reports.attendance",
  "pass.generate",
  "setup.access",
  "scan.access",
  "reports.activity",
];

const buildUserPayload = (user, userType) => ({
  id: user._id,
  userId: user.userId,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  userTypeId: user.userTypeId,
  userTypeName: userType?.name || null,
  permissions: userType?.permissions || [],
});

// ── Login ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { userId, password } = req.body;
    if (!userId || !password)
      return res.status(400).json({ error: "User ID and password are required." });

    // Master admin — no 2FA
    if (userId.trim() === "admin" && password === "admin") {
      return res.json({
        id: "master",
        userId: "admin",
        name: "Administrator",
        email: "",
        mobile: "",
        userTypeId: null,
        userTypeName: "Admin",
        permissions: ALL_PERMISSIONS,
      });
    }

    const user = await AppUser.findOne({ userId: userId.trim() });
    if (!user) return res.status(401).json({ error: "Invalid User ID or password." });
    if (!user.active) return res.status(403).json({ error: "Your account is inactive. Contact an administrator." });
    if (user.password !== password) return res.status(401).json({ error: "Invalid User ID or password." });

    const userType = user.userTypeId
      ? await UserType.findById(user.userTypeId).catch(() => null)
      : null;

    // Check if 2FA is required for this user type
    if (userType?.requiresTwoFactor) {
      if (!user.twoFactorEnabled) {
        let secret = user.twoFactorSecret;
        if (!secret) {
          secret = generateSecret();
          await AppUser.findByIdAndUpdate(user._id, { twoFactorSecret: secret });
        }
        const otpauth = generateURI({ type: "totp", label: user.userId, secret, issuer: APP_NAME });
        const qrCodeUrl = await QRCode.toDataURL(otpauth);

        return res.json({
          status: "2fa_setup",
          userId: user.userId,
          qrCodeUrl,
          secret,
        });
      }
      // 2FA already set up — ask for token
      return res.json({ status: "2fa_required", userId: user.userId });
    }

    // No 2FA needed
    res.json(buildUserPayload(user, userType));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Verify 2FA token (setup confirmation + regular login) ─────────────────────
router.post("/2fa/verify", async (req, res) => {
  try {
    const { userId, token, isSetup } = req.body;
    if (!userId || !token)
      return res.status(400).json({ error: "User ID and token are required." });

    const user = await AppUser.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found." });

    if (!user.twoFactorSecret) {
      return res.status(400).json({
        error: "Two-factor authentication is not configured for this account.",
      });
    }

    const result = verifySync({ token, secret: user.twoFactorSecret });
    const valid = result?.valid ?? result;
    if (!valid) return res.status(401).json({ error: "Invalid authentication code. Try again." });

    // On first setup, mark 2FA as enabled
    if (isSetup) {
      await AppUser.findByIdAndUpdate(user._id, { twoFactorEnabled: true });
    }

    const userType = user.userTypeId
      ? await UserType.findById(user.userTypeId).catch(() => null)
      : null;

    res.json(buildUserPayload(user, userType));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
