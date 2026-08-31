import { Link, useLocation, useNavigate } from "react-router-dom";
import { removeToken } from "../../utils/storage";
import Button from "./Button";

export default function Navbar({ title = "AI Image Detection" }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        removeToken();
        navigate("/login");
    };

    const navItems = [
        { label: "Dashboard", path: "/dashboard" },
        { label: "History", path: "/history" },
    ];

    return (
        <header
            style={{
                width: "100%",
                background: "#ffffff",
                borderBottom: "1px solid #e5e7eb",
                position: "sticky",
                top: 0,
                zIndex: 20,
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <p
                        style={{
                            margin: 0,
                            color: "#4f46e5",
                            fontSize: "12px",
                            fontWeight: 800,
                            letterSpacing: "1px",
                        }}
                    >
                        AI IMAGE DETECTION
                    </p>
                    <h2
                        style={{
                            margin: "4px 0 0",
                            fontSize: "20px",
                            color: "#111827",
                        }}
                    >
                        {title}
                    </h2>
                </div>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        flexWrap: "wrap",
                    }}
                >
                    {navItems.map((item) => {
                        const active = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    textDecoration: "none",
                                    padding: "10px 14px",
                                    borderRadius: "10px",
                                    fontWeight: 700,
                                    fontSize: "14px",
                                    background: active ? "#eef2ff" : "#ffffff",
                                    color: active ? "#4338ca" : "#374151",
                                    border: "1px solid #e5e7eb",
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}

                    <Button variant="danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}