import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import Button from "../components/common/Button";
import Input from "../components/common/Input";
import { loginUser } from "../api/authApi";
import { setToken } from "../utils/storage";

export default function LoginPage() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const isFormInvalid = !form.email.trim() || !form.password.trim();

    const handleChange = (e) => {
        setError("");

        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            setLoading(true);

            const payload = {
                email: form.email.trim(),
                password: form.password,
            };

            const res = await loginUser(payload);
            setToken(res.data.access_token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Login"
            subtitle="Enter your account details to access the dashboard."
            sideTitle="Welcome back"
            sideText="Sign in to continue your image detection workflow, access previous results, and manage the full analysis dashboard."
        >
            <form onSubmit={handleSubmit}>
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
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    disabled={loading || isFormInvalid}
                    style={{ marginTop: "6px" }}
                >
                    {loading ? "Signing in..." : "Sign In"}
                </Button>

                {error ? <p style={styles.error}>{error}</p> : null}

                <p style={styles.text}>
                    Don&apos;t have an account?{" "}
                    <Link to="/register" style={styles.link}>
                        Register
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