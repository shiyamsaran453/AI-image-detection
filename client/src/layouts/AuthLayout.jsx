export default function AuthLayout({
    title,
    subtitle,
    children,
    sideTitle = "Smart image analysis starts here",
    sideText = "Secure authentication, clean dashboard flow, result tracking, and easy future model integration.",
}) {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "linear-gradient(135deg, #eef2ff 0%, #f8fafc 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "24px",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: "1120px",
                    display: "grid",
                    gridTemplateColumns: "1.05fr 0.95fr",
                    background: "#ffffff",
                    borderRadius: "24px",
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.12)",
                }}
            >
                <div
                    style={{
                        background: "linear-gradient(135deg, #4338ca 0%, #6366f1 100%)",
                        color: "#ffffff",
                        padding: "48px 40px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                    }}
                >
                    <div
                        style={{
                            display: "inline-block",
                            width: "fit-content",
                            padding: "8px 14px",
                            borderRadius: "999px",
                            background: "rgba(255,255,255,0.14)",
                            fontSize: "12px",
                            fontWeight: 700,
                            letterSpacing: "1px",
                            marginBottom: "18px",
                        }}
                    >
                        AI IMAGE DETECTION
                    </div>

                    <h1
                        style={{
                            fontSize: "38px",
                            lineHeight: 1.15,
                            margin: "0 0 16px",
                            color: "#ffffff",
                        }}
                    >
                        {sideTitle}
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: "rgba(255,255,255,0.88)",
                            fontSize: "16px",
                            lineHeight: 1.7,
                            maxWidth: "470px",
                        }}
                    >
                        {sideText}
                    </p>
                </div>

                <div
                    style={{
                        padding: "42px 34px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#ffffff",
                    }}
                >
                    <div style={{ width: "100%", maxWidth: "430px" }}>
                        <div style={{ marginBottom: "22px" }}>
                            <h2
                                style={{
                                    margin: "0 0 8px",
                                    fontSize: "30px",
                                    color: "#111827",
                                }}
                            >
                                {title}
                            </h2>
                            <p
                                style={{
                                    margin: 0,
                                    color: "#6b7280",
                                    fontSize: "14px",
                                    lineHeight: 1.6,
                                }}
                            >
                                {subtitle}
                            </p>
                        </div>

                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}