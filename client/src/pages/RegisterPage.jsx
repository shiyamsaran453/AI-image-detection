import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { registerUser } from "../api/authApi";

/* ─── Google Fonts injection (shared with Login) ─────────────────────────── */
if (!document.getElementById("gf-register")) {
    const link = document.createElement("link");
    link.id = "gf-register";
    link.rel = "stylesheet";
    link.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);
}

export default function RegisterPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [pwFocused, setPwFocused] = useState(false);
    const [cpwFocused, setCpwFocused] = useState(false);

    /* ── Derived state (unchanged) ──────────────────────────────────────── */
    const passwordMismatch = useMemo(() => {
        if (!form.confirmPassword) return false;
        return form.password !== form.confirmPassword;
    }, [form.password, form.confirmPassword]);

    const passwordStrength = useMemo(() => {
        const p = form.password;
        if (p.length === 0) return null;
        if (p.length < 6) return 0;
        if (p.length < 10 || !/[0-9]/.test(p)) return 1;
        return 2;
    }, [form.password]);

    const strengthMeta = [
        { label: "Too short", color: "#ef4444", bg: "#fef2f2" },
        { label: "Fair", color: "#f59e0b", bg: "#fffbeb" },
        { label: "Strong", color: "#16a34a", bg: "#f0fdf4" },
    ];

    const isFormInvalid =
        !form.name.trim() ||
        !form.email.trim() ||
        !form.password.trim() ||
        !form.confirmPassword.trim() ||
        passwordMismatch ||
        form.password.length < 6;

    /* ── Handlers (unchanged) ───────────────────────────────────────────── */
    const handleChange = (e) => {
        setMessage("");
        setError("");
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (passwordMismatch) { setError("Passwords do not match."); return; }
        if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }

        try {
            setLoading(true);
            const res = await registerUser({
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            });
            setMessage(res.data.message || "Account created! Redirecting to login…");
            setTimeout(() => navigate("/login"), 1200);
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    /* ── Eye SVG helpers ────────────────────────────────────────────────── */
    const EyeOpen = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
    const EyeOff = () => (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    );

    /* ── Render ─────────────────────────────────────────────────────────── */
    return (
        <>
            <style>{css}</style>
            <AuthLayout
                title="Register"
                subtitle="Create an account to continue to the dashboard."
                sideTitle="Create your account"
                sideText="Build a clean workflow for image analysis, prediction tracking, and future model integration — all in one place."
            >
                <form onSubmit={handleSubmit} noValidate className="rp-form">

                    {/* ── Full Name ──────────────────────────────────────── */}
                    <div className="rp-field">
                        <Input
                            label="Full Name"
                            name="name"
                            type="text"
                            placeholder="Enter your full name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            autoComplete="name"
                        />
                    </div>

                    {/* ── Email ──────────────────────────────────────────── */}
                    <div className="rp-field">
                        <Input
                            label="Email Address"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            autoComplete="email"
                        />
                    </div>

                    {/* ── Password ───────────────────────────────────────── */}
                    <div className="rp-field">
                        <label htmlFor="password" className="rp-label">
                            Password
                        </label>

                        <div className={`rp-pw-wrap${pwFocused ? " rp-pw-wrap--focused" : ""}`}>
                            <span className="rp-pw-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </span>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                value={form.password}
                                onChange={handleChange}
                                onFocus={() => setPwFocused(true)}
                                onBlur={() => setPwFocused(false)}
                                required
                                autoComplete="new-password"
                                aria-describedby="password-hint"
                                className="rp-pw-input"
                            />
                            <button
                                type="button"
                                className="rp-toggle"
                                onClick={() => setShowPassword((p) => !p)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff /> : <EyeOpen />}
                            </button>
                        </div>

                        {/* ── Strength bar ───────────────────────────────── */}
                        {passwordStrength !== null && (
                            <div className="rp-strength-wrap" aria-live="polite">
                                <div className="rp-strength-track">
                                    {[0, 1, 2].map((i) => (
                                        <div
                                            key={i}
                                            className="rp-strength-seg"
                                            style={{
                                                background:
                                                    i <= passwordStrength
                                                        ? strengthMeta[passwordStrength].color
                                                        : "#e5e7eb",
                                                transform: i <= passwordStrength ? "scaleY(1.5)" : "scaleY(1)",
                                            }}
                                        />
                                    ))}
                                </div>
                                <span
                                    className="rp-strength-label"
                                    style={{
                                        color: strengthMeta[passwordStrength].color,
                                        background: strengthMeta[passwordStrength].bg,
                                    }}
                                >
                                    {strengthMeta[passwordStrength].label}
                                </span>
                            </div>
                        )}

                        <p id="password-hint" className="rp-hint">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                aria-hidden="true" style={{ flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            Minimum 6 characters required.
                        </p>
                    </div>

                    {/* ── Confirm Password ───────────────────────────────── */}
                    <div className="rp-field">
                        <label htmlFor="confirmPassword" className="rp-label">
                            Confirm Password
                        </label>

                        <div
                            className={[
                                "rp-pw-wrap",
                                cpwFocused ? "rp-pw-wrap--focused" : "",
                                passwordMismatch ? "rp-pw-wrap--error" : "",
                            ].filter(Boolean).join(" ")}
                        >
                            <span className="rp-pw-icon" aria-hidden="true">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </span>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Re-enter your password"
                                value={form.confirmPassword}
                                onChange={handleChange}
                                onFocus={() => setCpwFocused(true)}
                                onBlur={() => setCpwFocused(false)}
                                required
                                autoComplete="new-password"
                                aria-invalid={passwordMismatch}
                                aria-describedby={passwordMismatch ? "confirm-error" : undefined}
                                className="rp-pw-input"
                            />
                            <button
                                type="button"
                                className="rp-toggle"
                                onClick={() => setShowConfirmPassword((p) => !p)}
                                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                            >
                                {showConfirmPassword ? <EyeOff /> : <EyeOpen />}
                            </button>
                        </div>

                        {passwordMismatch && (
                            <p id="confirm-error" className="rp-mismatch" role="alert">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true" style={{ flexShrink: 0 }}>
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="15" y1="9" x2="9" y2="15" />
                                    <line x1="9" y1="9" x2="15" y2="15" />
                                </svg>
                                Passwords do not match.
                            </p>
                        )}
                    </div>

                    {/* ── Success / Error banners ────────────────────────── */}
                    {message && (
                        <div className="rp-banner rp-banner--success" role="status">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                aria-hidden="true">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="rp-banner rp-banner--error" role="alert">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                aria-hidden="true">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* ── Submit ─────────────────────────────────────────── */}
                    <div className="rp-submit-wrap">
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={loading || isFormInvalid}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <span className="rp-btn-inner">
                                    <span className="rp-spinner" aria-hidden="true" />
                                    Creating account…
                                </span>
                            ) : (
                                <span className="rp-btn-inner">
                                    Create Account
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        aria-hidden="true">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="8.5" cy="7" r="4" />
                                        <line x1="20" y1="8" x2="20" y2="14" />
                                        <line x1="23" y1="11" x2="17" y2="11" />
                                    </svg>
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* ── Footer link ────────────────────────────────────── */}
                    <p className="rp-footer-text">
                        Already have an account?{" "}
                        <Link to="/login" className="rp-link">
                            Sign in
                        </Link>
                    </p>
                </form>
            </AuthLayout>
        </>
    );
}

/* ─── Scoped CSS ─────────────────────────────────────────────────────────── */
const css = `
  :root {
    --rp-violet:        #7c3aed;
    --rp-violet-light:  #8b5cf6;
    --rp-violet-dim:    #ede9fe;
    --rp-violet-ring:   rgba(124,58,237,.25);
    --rp-black:         #0f0a1e;
    --rp-gray-700:      #374151;
    --rp-gray-500:      #6b7280;
    --rp-gray-400:      #9ca3af;
    --rp-gray-200:      #e5e7eb;
    --rp-red:           #dc2626;
    --rp-red-bg:        #fef2f2;
    --rp-red-border:    #fecaca;
    --rp-green:         #15803d;
    --rp-green-bg:      #f0fdf4;
    --rp-green-border:  #bbf7d0;
    --rp-white:         #ffffff;
    --rp-radius:        14px;
    --rp-transition:    0.2s cubic-bezier(.4,0,.2,1);
    --rp-font:          'DM Sans', sans-serif;
    --rp-font-display:  'Outfit', sans-serif;
  }

  /* ── Form ───────────────────────────────────────────── */
  .rp-form {
    font-family: var(--rp-font);
    display: flex;
    flex-direction: column;
  }

  /* ── Field wrapper ──────────────────────────────────── */
  .rp-field {
    margin-bottom: 18px;
  }

  /* ── Label ──────────────────────────────────────────── */
  .rp-label {
    display: block;
    margin-bottom: 7px;
    font-family: var(--rp-font-display);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--rp-gray-700);
    letter-spacing: 0.01em;
  }

  /* ── Password wrapper ───────────────────────────────── */
  .rp-pw-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid var(--rp-gray-200);
    border-radius: var(--rp-radius);
    background: var(--rp-white);
    transition: border-color var(--rp-transition), box-shadow var(--rp-transition);
    overflow: hidden;
  }

  .rp-pw-wrap--focused {
    border-color: var(--rp-violet);
    box-shadow: 0 0 0 3.5px var(--rp-violet-ring);
  }

  .rp-pw-wrap--error {
    border-color: var(--rp-red) !important;
    box-shadow: 0 0 0 3px rgba(220,38,38,.15) !important;
  }

  /* ── Prefix icon ────────────────────────────────────── */
  .rp-pw-icon {
    display: flex;
    align-items: center;
    padding: 0 0 0 14px;
    color: var(--rp-gray-400);
    flex-shrink: 0;
  }

  /* ── Text input ─────────────────────────────────────── */
  .rp-pw-input {
    flex: 1;
    padding: 13px 10px;
    border: none;
    outline: none;
    font-family: var(--rp-font);
    font-size: 14px;
    background: transparent;
    color: var(--rp-black);
    min-width: 0;
  }

  .rp-pw-input::placeholder {
    color: var(--rp-gray-400);
  }

  /* ── Eye toggle ─────────────────────────────────────── */
  .rp-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-left: 1.5px solid var(--rp-gray-200);
    background: var(--rp-violet-dim);
    color: var(--rp-violet);
    padding: 0 15px;
    height: 48px;
    cursor: pointer;
    transition: background var(--rp-transition), color var(--rp-transition);
    flex-shrink: 0;
  }

  .rp-toggle:hover {
    background: var(--rp-violet);
    color: var(--rp-white);
  }

  .rp-toggle:focus-visible {
    outline: 2px solid var(--rp-violet);
    outline-offset: -2px;
  }

  /* ── Strength meter ─────────────────────────────────── */
  .rp-strength-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-top: 10px;
  }

  .rp-strength-track {
    display: flex;
    gap: 5px;
    flex: 1;
  }

  .rp-strength-seg {
    flex: 1;
    height: 5px;
    border-radius: 999px;
    transition: background 0.3s ease, transform 0.25s ease;
    transform-origin: bottom;
  }

  .rp-strength-label {
    font-family: var(--rp-font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 999px;
    flex-shrink: 0;
    transition: color 0.3s, background 0.3s;
  }

  /* ── Helper / hint text ─────────────────────────────── */
  .rp-hint {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 8px 2px 0;
    font-size: 12px;
    color: var(--rp-gray-500);
  }

  /* ── Mismatch inline error ──────────────────────────── */
  .rp-mismatch {
    display: flex;
    align-items: center;
    gap: 5px;
    margin: 8px 2px 0;
    font-size: 12px;
    font-weight: 500;
    color: var(--rp-red);
    animation: rp-fade-in .2s ease;
  }

  /* ── Banners ─────────────────────────────────────────── */
  .rp-banner {
    display: flex;
    align-items: center;
    gap: 9px;
    margin-bottom: 14px;
    padding: 11px 14px;
    border-radius: 10px;
    font-size: 13.5px;
    font-weight: 500;
    animation: rp-fade-in .25s ease;
  }

  .rp-banner--success {
    background: var(--rp-green-bg);
    border: 1px solid var(--rp-green-border);
    color: var(--rp-green);
  }

  .rp-banner--error {
    background: var(--rp-red-bg);
    border: 1px solid var(--rp-red-border);
    color: var(--rp-red);
    animation: rp-shake .35s cubic-bezier(.36,.07,.19,.97);
  }

  @keyframes rp-fade-in {
    from { opacity: 0; transform: translateY(-4px); }
    to   { opacity: 1; transform: translateY(0);    }
  }

  @keyframes rp-shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(3px);  }
    30%, 50%, 70% { transform: translateX(-3px); }
    40%, 60% { transform: translateX(3px);  }
  }

  /* ── Submit wrapper ─────────────────────────────────── */
  .rp-submit-wrap {
    margin-top: 6px;
  }

  /* ── Button inner (icon + spinner) ─────────────────── */
  .rp-btn-inner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .rp-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rp-spin .65s linear infinite;
  }

  @keyframes rp-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Footer text & link ─────────────────────────────── */
  .rp-footer-text {
    margin-top: 20px;
    text-align: center;
    color: var(--rp-gray-400);
    font-size: 13.5px;
  }

  .rp-link {
    color: var(--rp-violet);
    font-weight: 700;
    text-decoration: none;
    position: relative;
    transition: color var(--rp-transition);
  }

  .rp-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 0;
    height: 1.5px;
    background: var(--rp-violet-light);
    border-radius: 2px;
    transition: width var(--rp-transition);
  }

  .rp-link:hover { color: var(--rp-violet-light); }
  .rp-link:hover::after { width: 100%; }
`;