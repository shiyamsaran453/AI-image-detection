import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { registerUser } from "../api/authApi";

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

    const passwordMismatch = useMemo(() => {
        if (!form.confirmPassword) return false;
        return form.password !== form.confirmPassword;
    }, [form.password, form.confirmPassword]);

    const isFormInvalid =
        !form.name.trim() ||
        !form.email.trim() ||
        !form.password.trim() ||
        !form.confirmPassword.trim() ||
        passwordMismatch ||
        form.password.length < 6;

    const handleChange = (e) => {
        setMessage("");
        setError("");

        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (passwordMismatch) {
            setError("Passwords do not match.");
            return;
        }

        if (form.password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        try {
            setLoading(true);

            const payload = {
                name: form.name.trim(),
                email: form.email.trim(),
                password: form.password,
            };

            const res = await registerUser(payload);
            setMessage(res.data.message || "Registered successfully");

            setTimeout(() => {
                navigate("/login");
            }, 1200);
        } catch (err) {
            setError(err.response?.data?.detail || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Register"
            subtitle="Create an account to continue to the dashboard."
            sideTitle="Create your account"
            sideText="Build a clean workflow for image analysis, prediction tracking, and future model integration — all in one place."
        >
            <form onSubmit={handleSubmit}>
                <Input
                    label="Full Name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={form.name}
                    onChange={handleChange}
                    required
                />

                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={form.email}
                    onChange={handleChange}
                    required
                />

                <div style={styles.inputGroup}>
                    <label htmlFor="password" style={styles.label}>
                        Password
                    </label>

                    <div style={styles.passwordWrap}>
                        <input
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            style={styles.passwordInput}
                        />

                        <button
                            type="button"
                            style={styles.passwordToggle}
                            onClick={() => setShowPassword((prev) => !prev)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <p style={styles.helperText}>Minimum 6 characters required.</p>
                </div>

                <div style={styles.inputGroup}>
                    <label htmlFor="confirmPassword" style={styles.label}>
                        Confirm Password
                    </label>

                    <div style={styles.passwordWrap}>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Re-enter your password"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            style={styles.passwordInput}
                        />

                        <button
                            type="button"
                            style={styles.passwordToggle}
                            onClick={() => setShowConfirmPassword((prev) => !prev)}
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    {passwordMismatch ? (
                        <p style={styles.errorInline}>Passwords do not match.</p>
                    ) : null}
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading || isFormInvalid}
                    style={{ marginTop: "6px" }}
                >
                    {loading ? "Creating account..." : "Create Account"}
                </Button>

                {message ? <p style={styles.success}>{message}</p> : null}
                {error ? <p style={styles.error}>{error}</p> : null}

                <p style={styles.text}>
                    Already have an account?{" "}
                    <Link to="/login" style={styles.link}>
                        Login
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}

const styles = {
    inputGroup: {
        marginBottom: "16px",
    },
    label: {
        display: "block",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: 600,
        color: "#374151",
    },
    passwordWrap: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #d1d5db",
        borderRadius: "12px",
        overflow: "hidden",
        background: "#ffffff",
    },
    passwordInput: {
        flex: 1,
        padding: "13px 14px",
        border: "none",
        outline: "none",
        fontSize: "14px",
        boxSizing: "border-box",
        background: "#ffffff",
    },
    passwordToggle: {
        border: "none",
        background: "#eef2ff",
        color: "#4338ca",
        fontWeight: 700,
        padding: "13px 16px",
        cursor: "pointer",
    },
    helperText: {
        margin: "8px 2px 0",
        fontSize: "12px",
        color: "#6b7280",
    },
    errorInline: {
        margin: "8px 2px 0",
        fontSize: "12px",
        color: "#dc2626",
    },
    success: {
        marginTop: "14px",
        color: "#15803d",
        fontSize: "14px",
    },
    error: {
        marginTop: "14px",
        color: "#dc2626",
        fontSize: "14px",
    },
    text: {
        marginTop: "18px",
        textAlign: "center",
        color: "#6b7280",
        fontSize: "14px",
    },
    link: {
        color: "#4f46e5",
        fontWeight: 700,
        textDecoration: "none",
    },
};