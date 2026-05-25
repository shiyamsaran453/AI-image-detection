import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { loginUser } from "../api/authApi";
import { setToken } from "../utils/storage";

/* ─── Google Fonts injection (Outfit + DM Sans) ─────────────────────────── */
const fontLink = document.getElementById("gf-login");
if (!fontLink) {
    const link = document.createElement("link");
    link.id = "gf-login";
    link.rel = "stylesheet";
    link.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600&display=swap";
    document.head.appendChild(link);
}

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);

    const isFormInvalid = !form.email.trim() || !form.password.trim();

    const handleChange = (e) => {
        setError("");
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);
            const res = await loginUser({
                email: form.email.trim(),
                password: form.password,
            });
            setToken(res.data.access_token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{css}</style>
            <AuthLayout
                title="Login"
                subtitle="Enter your account details to access the dashboard."
                sideTitle="Welcome back"
                sideText="Sign in to continue your image detection workflow, access previous results, and manage the full analysis dashboard."
            >
                <form onSubmit={handleSubmit} noValidate className="lp-form">

                    {/* ── Email ─────────────────────────────────────────────── */}
                    <div className="lp-field">
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

                    {/* ── Password ──────────────────────────────────────────── */}
                    <div className="lp-field">
                        <label htmlFor="password" className="lp-label">
                            Password
                        </label>

                        <div
                            className={`lp-password-wrap${passwordFocused ? " lp-password-wrap--focused" : ""}${error ? " lp-password-wrap--error" : ""}`}
                        >
                            <span className="lp-pw-icon" aria-hidden="true">
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
                                placeholder="Enter your password"
                                value={form.password}
                                onChange={handleChange}
                                onFocus={() => setPasswordFocused(true)}
                                onBlur={() => setPasswordFocused(false)}
                                required
                                autoComplete="current-password"
                                aria-describedby={error ? "login-error" : undefined}
                                className="lp-password-input"
                            />

                            <button
                                type="button"
                                className="lp-toggle"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                tabIndex={0}
                            >
                                {showPassword ? (
                                    /* Eye-off icon */
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                        <line x1="1" y1="1" x2="23" y2="23" />
                                    </svg>
                                ) : (
                                    /* Eye icon */
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* ── Error Banner ──────────────────────────────────────── */}
                    {error && (
                        <div id="login-error" className="lp-error" role="alert">
                            <span className="lp-error-icon" aria-hidden="true">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </span>
                            {error}
                        </div>
                    )}

                    {/* ── Submit ────────────────────────────────────────────── */}
                    <div className="lp-submit-wrap">
                        <Button
                            type="submit"
                            variant="primary"
                            fullWidth
                            disabled={loading || isFormInvalid}
                            aria-busy={loading}
                        >
                            {loading ? (
                                <span className="lp-btn-inner">
                                    <span className="lp-spinner" aria-hidden="true" />
                                    Signing in…
                                </span>
                            ) : (
                                <span className="lp-btn-inner">
                                    Sign In
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </span>
                            )}
                        </Button>
                    </div>

                    {/* ── Footer Link ───────────────────────────────────────── */}
                    <p className="lp-footer-text">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="lp-link">
                            Create account
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
    --lp-violet:       #7c3aed;
    --lp-violet-light: #8b5cf6;
    --lp-violet-dim:   #ede9fe;
    --lp-violet-ring:  rgba(124,58,237,.25);
    --lp-black:        #0f0a1e;
    --lp-gray-700:     #374151;
    --lp-gray-400:     #9ca3af;
    --lp-gray-200:     #e5e7eb;
    --lp-red:          #dc2626;
    --lp-red-bg:       #fef2f2;
    --lp-red-border:   #fecaca;
    --lp-white:        #ffffff;
    --lp-radius:       14px;
    --lp-transition:   0.2s cubic-bezier(.4,0,.2,1);
    --lp-font:         'DM Sans', sans-serif;
    --lp-font-display: 'Outfit', sans-serif;
  }

  /* ── Form container ─────────────────────────────────── */
  .lp-form {
    font-family: var(--lp-font);
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── Field wrapper ──────────────────────────────────── */
  .lp-field {
    margin-bottom: 18px;
  }

  /* ── Label ──────────────────────────────────────────── */
  .lp-label {
    display: block;
    margin-bottom: 7px;
    font-family: var(--lp-font-display);
    font-size: 13.5px;
    font-weight: 600;
    color: var(--lp-gray-700);
    letter-spacing: 0.01em;
  }

  /* ── Password wrapper ───────────────────────────────── */
  .lp-password-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid var(--lp-gray-200);
    border-radius: var(--lp-radius);
    background: var(--lp-white);
    transition: border-color var(--lp-transition), box-shadow var(--lp-transition);
    overflow: hidden;
  }

  .lp-password-wrap--focused {
    border-color: var(--lp-violet);
    box-shadow: 0 0 0 3.5px var(--lp-violet-ring);
  }

  .lp-password-wrap--error {
    border-color: var(--lp-red);
    box-shadow: 0 0 0 3px rgba(220,38,38,.15);
  }

  /* ── Lock icon inside field ─────────────────────────── */
  .lp-pw-icon {
    display: flex;
    align-items: center;
    padding: 0 0 0 14px;
    color: var(--lp-gray-400);
    flex-shrink: 0;
  }

  /* ── Password text input ────────────────────────────── */
  .lp-password-input {
    flex: 1;
    padding: 13px 10px;
    border: none;
    outline: none;
    font-family: var(--lp-font);
    font-size: 14px;
    background: transparent;
    color: var(--lp-black);
    min-width: 0;
  }

  .lp-password-input::placeholder {
    color: var(--lp-gray-400);
  }

  /* ── Show/Hide toggle button ────────────────────────── */
  .lp-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-left: 1.5px solid var(--lp-gray-200);
    background: var(--lp-violet-dim);
    color: var(--lp-violet);
    padding: 0 15px;
    height: 48px;
    cursor: pointer;
    transition: background var(--lp-transition), color var(--lp-transition);
    flex-shrink: 0;
  }

  .lp-toggle:hover {
    background: var(--lp-violet);
    color: var(--lp-white);
  }

  .lp-toggle:focus-visible {
    outline: 2px solid var(--lp-violet);
    outline-offset: -2px;
  }

  /* ── Error banner ───────────────────────────────────── */
  .lp-error {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 14px;
    padding: 11px 14px;
    background: var(--lp-red-bg);
    border: 1px solid var(--lp-red-border);
    border-radius: 10px;
    color: var(--lp-red);
    font-size: 13.5px;
    font-weight: 500;
    animation: lp-shake .35s cubic-bezier(.36,.07,.19,.97);
  }

  .lp-error-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  @keyframes lp-shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(3px);  }
    30%, 50%, 70% { transform: translateX(-3px); }
    40%, 60% { transform: translateX(3px);  }
  }

  /* ── Submit wrapper ─────────────────────────────────── */
  .lp-submit-wrap {
    margin-top: 6px;
  }

  /* ── Button inner layout (arrow + spinner) ──────────── */
  .lp-btn-inner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  /* ── Spinner ────────────────────────────────────────── */
  .lp-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: lp-spin .65s linear infinite;
  }

  @keyframes lp-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Footer text & link ─────────────────────────────── */
  .lp-footer-text {
    margin-top: 20px;
    text-align: center;
    color: var(--lp-gray-400);
    font-size: 13.5px;
  }

  .lp-link {
    color: var(--lp-violet);
    font-weight: 700;
    text-decoration: none;
    position: relative;
    transition: color var(--lp-transition);
  }

  .lp-link::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 0;
    height: 1.5px;
    background: var(--lp-violet-light);
    border-radius: 2px;
    transition: width var(--lp-transition);
  }

  .lp-link:hover { color: var(--lp-violet-light); }
  .lp-link:hover::after { width: 100%; }
`;