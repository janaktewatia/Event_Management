import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser, verify2FA } from "../services/api";

// ── OTP 6-box input ──────────────────────────────────────────────────────────
const OTPInput = ({ value, onChange, disabled }) => {
  const inputs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  useEffect(() => { inputs.current[0]?.focus(); }, []);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("");
      onChange(next);
      if (i > 0) inputs.current[i - 1]?.focus();
    }
  };
  const handleInput = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("");
    onChange(next);
    if (char && i < 5) inputs.current[i + 1]?.focus();
  };
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted.padEnd(6, "").slice(0, 6));
    inputs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="d-flex gap-2 justify-content-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleInput(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          style={{
            width: 46, height: 52, fontSize: 22, fontWeight: 700,
            textAlign: "center", borderRadius: 10, outline: "none",
            border: d ? "2px solid #A855F7" : "2px solid #e2e8f0",
            background: d ? "#faf5ff" : "#f8fafc",
            color: "#1e1b4b", transition: "all 0.15s",
          }}
        />
      ))}
    </div>
  );
};

// ── Decorative left panel ────────────────────────────────────────────────────
const LeftPanel = () => (
  <div
    className="d-none d-lg-flex flex-column justify-content-between p-5"
    style={{
      width: "45%",
      minHeight: "100vh",
      background: "linear-gradient(145deg, #1e1b4b 0%, #4c1d95 50%, #7c3aed 100%)",
      position: "relative",
      overflow: "hidden",
    }}
  >
    {/* Background blobs */}
    <div style={{
      position: "absolute", width: 350, height: 350, borderRadius: "50%",
      background: "rgba(255,255,255,0.04)", top: -80, right: -80,
    }} />
    <div style={{
      position: "absolute", width: 250, height: 250, borderRadius: "50%",
      background: "rgba(255,255,255,0.06)", bottom: 100, left: -60,
    }} />
    <div style={{
      position: "absolute", width: 150, height: 150, borderRadius: "50%",
      background: "rgba(255,255,255,0.05)", bottom: -40, right: 60,
    }} />

    {/* Logo */}
    <div style={{ position: "relative", zIndex: 1 }}>
      <div className="d-flex align-items-center gap-3 mb-5">
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: "rgba(255,255,255,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <i className="bi bi-calendar-event-fill" style={{ color: "#fff", fontSize: 20 }} />
        </div>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 18, letterSpacing: 0.3 }}>
          Event Management
        </span>
      </div>

      {/* Main heading */}
      <h1 style={{ color: "#fff", fontWeight: 800, fontSize: 36, lineHeight: 1.2, marginBottom: 16 }}>
        Manage Events<br />
        <span style={{ color: "#c4b5fd" }}>Smarter & Faster</span>
      </h1>
      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 15, lineHeight: 1.7, maxWidth: 320 }}>
        Scan passes, register attendees, track activity and manage your events all from one place.
      </p>
    </div>

    {/* Feature cards */}
    <div style={{ position: "relative", zIndex: 1 }}>
      {[
        { icon: "bi-qr-code-scan",   text: "Instant QR Pass Scanning" },
        { icon: "bi-people-fill",    text: "Attendee Management" },
        { icon: "bi-bar-chart-fill", text: "Real-time Analytics" },
      ].map(({ icon, text }) => (
        <div key={text} className="d-flex align-items-center gap-3 mb-3">
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "rgba(255,255,255,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className={`bi ${icon}`} style={{ color: "#e9d5ff", fontSize: 16 }} />
          </div>
          <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}>{text}</span>
        </div>
      ))}
    </div>

    {/* Bottom tagline */}
    <div style={{ position: "relative", zIndex: 1 }}>
      <div style={{ height: 1, background: "rgba(255,255,255,0.1)", marginBottom: 20 }} />
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, margin: 0 }}>
        Secure · Fast · Reliable
      </p>
    </div>
  </div>
);

// ── Main login page ──────────────────────────────────────────────────────────
const LoginPage = () => {
  const { login } = useAuth();
  const [step, setStep]         = useState("credentials");
  const [form, setForm]         = useState({ userId: "", password: "" });
  const [showPw, setShowPw]     = useState(false);
  const [twoFAData, setTwoFAData] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  useEffect(() => { setError(""); setOtpValue(""); }, [step]);

  const handleCredentials = async (e) => {
    e.preventDefault();
    if (!form.userId.trim() || !form.password) { setError("Please fill in all fields."); return; }
    setLoading(true); setError("");
    try {
      // Convert userId to lowercase for case-insensitive matching, but keep password as-is
      const userIdLower = form.userId.trim().toLowerCase();
      const res = await loginUser(userIdLower, form.password);
      if (res.status === "2fa_setup") {
        setTwoFAData({ userId: userIdLower, qrCodeUrl: res.qrCodeUrl, secret: res.secret });
        setStep("2fa_setup");
      } else if (res.status === "2fa_required") {
        setTwoFAData({ userId: userIdLower });
        setStep("2fa_verify");
      } else {
        login(res);
      }
    } catch (err) { setError(err.message || "Login failed."); }
    finally { setLoading(false); }
  };

  const handleSetupConfirm = async () => {
    if (otpValue.replace(/\D/g,"").length < 6) { setError("Enter the 6-digit code."); return; }
    setLoading(true); setError("");
    try { const res = await verify2FA(twoFAData.userId, otpValue, true); login(res); }
    catch (err) { setError(err.message || "Invalid code."); setOtpValue(""); }
    finally { setLoading(false); }
  };

  const handleVerify = async () => {
    if (otpValue.replace(/\D/g,"").length < 6) { setError("Enter the 6-digit code."); return; }
    setLoading(true); setError("");
    try { const res = await verify2FA(twoFAData.userId, otpValue, false); login(res); }
    catch (err) { setError(err.message || "Invalid code."); setOtpValue(""); }
    finally { setLoading(false); }
  };

  const inputStyle = {
    height: 46, borderRadius: 10, border: "2px solid #e2e8f0",
    fontSize: 14, paddingLeft: 14, outline: "none", width: "100%",
    transition: "border-color 0.15s", background: "#fff",
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <LeftPanel />

      {/* Right: form panel */}
      <div
        className="d-flex flex-column align-items-center justify-content-center flex-grow-1 p-4"
        style={{ background: "#f8fafc" }}
      >
        {/* Mobile logo */}
        <div className="d-flex d-lg-none align-items-center gap-2 mb-6" style={{ marginBottom: 32 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: "linear-gradient(135deg,#7c3aed,#a855f7)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <i className="bi bi-calendar-event-fill" style={{ color: "#fff", fontSize: 16 }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#1e1b4b" }}>Event Management</span>
        </div>

        <div style={{ width: "100%", maxWidth: 400 }}>

          {/* ── Credentials step ── */}
          {step === "credentials" && (
            <>
              <div className="mb-4">
                <h2 style={{ fontWeight: 800, fontSize: 28, color: "#1e1b4b", marginBottom: 6 }}>Welcome back</h2>
                <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleCredentials} noValidate>
                <div className="mb-3">
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                    User ID
                  </label>
                  <div style={{ position: "relative" }}>
                    <i className="bi bi-person-badge"
                      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }} />
                    <input
                      type="text"
                      placeholder="Enter your User ID"
                      value={form.userId}
                      onChange={(e) => setForm((p) => ({ ...p, userId: e.target.value.replace(/\s/g, "") }))}
                      autoFocus
                      style={{ ...inputStyle, paddingLeft: 40 }}
                      onFocus={(e) => e.target.style.borderColor = "#A855F7"}
                      onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <i className="bi bi-lock"
                      style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: 16 }} />
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Enter your password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      style={{ ...inputStyle, paddingLeft: 40, paddingRight: 44 }}
                      onFocus={(e) => e.target.style.borderColor = "#A855F7"}
                      onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                    />
                    <button type="button" onClick={() => setShowPw((v) => !v)}
                      style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
                      <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} style={{ fontSize: 16 }} />
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
                    style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
                    <i className="bi bi-exclamation-circle-fill flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  style={{
                    width: "100%", height: 48, borderRadius: 12, border: "none", cursor: "pointer",
                    background: loading ? "#c4b5fd" : "linear-gradient(135deg, #7c3aed, #a855f7)",
                    color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: 0.3,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "all 0.2s",
                    boxShadow: loading ? "none" : "0 4px 15px rgba(168,85,247,0.35)",
                  }}>
                  {loading
                    ? <><span className="spinner-border spinner-border-sm" /> Signing in…</>
                    : <><i className="bi bi-box-arrow-in-right" /> Sign In</>}
                </button>
              </form>

              <p className="text-center mt-4" style={{ color: "#94a3b8", fontSize: 12 }}>
                Contact your administrator if you don't have an account.
              </p>
            </>
          )}

          {/* ── 2FA Setup step ── */}
          {step === "2fa_setup" && (
            <>
              <button onClick={() => setStep("credentials")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0, marginBottom: 24, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="bi bi-arrow-left" /> Back to login
              </button>

              <div className="mb-4">
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: "linear-gradient(135deg,#fef3c7,#fde68a)",
                  display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16,
                }}>
                  <i className="bi bi-shield-lock-fill" style={{ color: "#d97706", fontSize: 24 }} />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 24, color: "#1e1b4b", marginBottom: 6 }}>Set up 2FA</h2>
                <p style={{ color: "#94a3b8", fontSize: 13, margin: 0 }}>
                  Your account requires two-factor authentication. Scan the QR code once to get started.
                </p>
              </div>

              {/* QR card */}
              <div style={{
                background: "#fff", borderRadius: 16, padding: 20, textAlign: "center",
                border: "1px solid #e2e8f0", marginBottom: 20,
                boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
              }}>
                <img src={twoFAData.qrCodeUrl} alt="2FA QR"
                  style={{ width: 160, height: 160, borderRadius: 8, marginBottom: 12 }} />
                <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>Can't scan? Enter manually:</div>
                <code style={{
                  fontSize: 11, letterSpacing: 2, color: "#7c3aed",
                  background: "#f5f3ff", padding: "4px 10px", borderRadius: 6,
                  wordBreak: "break-all", display: "block",
                }}>
                  {twoFAData.secret}
                </code>
              </div>

              {/* Steps */}
              <div style={{ marginBottom: 20 }}>
                {[
                  "Open Google Authenticator or any TOTP app",
                  "Tap + → Scan QR code",
                  "Enter the 6-digit code below to confirm",
                ].map((txt, i) => (
                  <div key={i} className="d-flex align-items-center gap-3 mb-2">
                    <span style={{
                      width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                      background: "linear-gradient(135deg,#7c3aed,#a855f7)",
                      color: "#fff", fontSize: 11, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{i + 1}</span>
                    <span style={{ fontSize: 13, color: "#475569" }}>{txt}</span>
                  </div>
                ))}
              </div>

              <div className="mb-3">
                <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10, textAlign: "center" }}>
                  Confirm setup code
                </label>
                <OTPInput value={otpValue} onChange={setOtpValue} disabled={loading} />
              </div>

              {error && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
                  style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
                  <i className="bi bi-exclamation-circle-fill flex-shrink-0" />{error}
                </div>
              )}

              <button onClick={handleSetupConfirm} disabled={loading || otpValue.length < 6}
                style={{
                  width: "100%", height: 48, borderRadius: 12, border: "none", cursor: otpValue.length < 6 ? "not-allowed" : "pointer",
                  background: otpValue.length < 6 ? "#e2e8f0" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: otpValue.length < 6 ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 15,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: otpValue.length === 6 ? "0 4px 15px rgba(168,85,247,0.35)" : "none",
                  transition: "all 0.2s",
                }}>
                {loading ? <><span className="spinner-border spinner-border-sm" /> Verifying…</> : <><i className="bi bi-shield-check" /> Confirm & Sign In</>}
              </button>
            </>
          )}

          {/* ── 2FA Verify step ── */}
          {step === "2fa_verify" && (
            <>
              <button onClick={() => setStep("credentials")}
                style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: 0, marginBottom: 24, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
                <i className="bi bi-arrow-left" /> Back to login
              </button>

              <div className="mb-4 text-center">
                <div style={{
                  width: 64, height: 64, borderRadius: 18, margin: "0 auto 16px",
                  background: "linear-gradient(135deg,#f5f3ff,#ede9fe)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(139,92,246,0.15)",
                }}>
                  <i className="bi bi-shield-lock-fill" style={{ color: "#7c3aed", fontSize: 28 }} />
                </div>
                <h2 style={{ fontWeight: 800, fontSize: 24, color: "#1e1b4b", marginBottom: 8 }}>
                  Two-Factor Auth
                </h2>
                <p style={{ color: "#94a3b8", fontSize: 13 }}>
                  Open your authenticator app and enter the<br />6-digit code for <strong style={{ color: "#7c3aed" }}>Event Management</strong>
                </p>
              </div>

              <div className="mb-4">
                <OTPInput value={otpValue} onChange={(v) => { setOtpValue(v); setError(""); }} disabled={loading} />
              </div>

              {error && (
                <div className="d-flex align-items-center gap-2 mb-3 p-3 rounded-3"
                  style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 13 }}>
                  <i className="bi bi-exclamation-circle-fill flex-shrink-0" />{error}
                </div>
              )}

              <button onClick={handleVerify} disabled={loading || otpValue.length < 6}
                style={{
                  width: "100%", height: 48, borderRadius: 12, border: "none", cursor: otpValue.length < 6 ? "not-allowed" : "pointer",
                  background: otpValue.length < 6 ? "#e2e8f0" : "linear-gradient(135deg,#7c3aed,#a855f7)",
                  color: otpValue.length < 6 ? "#94a3b8" : "#fff", fontWeight: 700, fontSize: 15,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  boxShadow: otpValue.length === 6 ? "0 4px 15px rgba(168,85,247,0.35)" : "none",
                  transition: "all 0.2s",
                }}>
                {loading ? <><span className="spinner-border spinner-border-sm" /> Verifying…</> : <><i className="bi bi-shield-check" /> Verify & Sign In</>}
              </button>

              <p style={{ textAlign: "center", fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
                Code refreshes every 30 seconds
              </p>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
