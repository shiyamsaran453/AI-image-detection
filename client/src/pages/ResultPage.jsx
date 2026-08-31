import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";

export default function ResultPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const image = location.state?.image;
    const fileName = location.state?.fileName;
    const result = location.state?.result;

    if (!result) {
        return (
            <DashboardLayout title="Result">
                <div style={styles.fallbackWrap}>
                    <div style={styles.fallbackCard}>
                        <div style={styles.fallbackIcon}>!</div>
                        <h2 style={styles.fallbackTitle}>No result found</h2>
                        <p style={styles.fallbackText}>
                            Please upload an image from the dashboard and try again.
                        </p>
                        <Button variant="primary" onClick={() => navigate("/dashboard")}>
                            Go to Dashboard
                        </Button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const label =
        result.label || result.result_label || result.prediction || "Unknown";

    const confidence =
        result.confidence !== undefined && result.confidence !== null
            ? Number(result.confidence).toFixed(2)
            : null;

    const isReal = String(label).toUpperCase() === "REAL";

    return (
        <DashboardLayout title="Result">
            <div style={styles.wrapper}>
                <header style={styles.header}>
                    <div>
                        <p style={styles.badgeLabel}>AI IMAGE DETECTION</p>
                        <h1 style={styles.heading}>Prediction Result</h1>
                        <p style={styles.subheading}>
                            Review the detected label and confidence for the uploaded image.
                        </p>
                    </div>

                    <div style={styles.headerActions}>
                        <Link to="/history" style={styles.historyButton}>
                            View History
                        </Link>
                        <Button variant="primary" onClick={() => navigate("/dashboard")}>
                            Try Another Image
                        </Button>
                    </div>
                </header>

                <section style={styles.contentGrid}>
                    <div style={styles.imageCard}>
                        <h2 style={styles.cardTitle}>Uploaded Image</h2>
                        <p style={styles.cardText}>
                            This is the image that was sent for prediction.
                        </p>

                        {image ? (
                            <div style={styles.imageBox}>
                                <img src={image} alt="Uploaded" style={styles.image} />
                            </div>
                        ) : (
                            <div style={styles.emptyImage}>
                                <p style={styles.emptyImageText}>Image preview not available</p>
                            </div>
                        )}

                        {fileName ? (
                            <div style={styles.fileInfoBox}>
                                <p style={styles.fileInfoLabel}>File Name</p>
                                <p style={styles.fileInfoValue}>{fileName}</p>
                            </div>
                        ) : null}
                    </div>

                    <div style={styles.resultCard}>
                        <h2 style={styles.cardTitle}>Detection Summary</h2>
                        <p style={styles.cardText}>
                            The system prediction and confidence are shown below.
                        </p>

                        <div style={styles.statusWrap}>
                            <span
                                style={{
                                    ...styles.statusBadge,
                                    background: isReal ? "#dcfce7" : "#fee2e2",
                                    color: isReal ? "#166534" : "#991b1b",
                                }}
                            >
                                {String(label).toUpperCase()}
                            </span>
                        </div>

                        <div style={styles.metricBox}>
                            <p style={styles.metricLabel}>Prediction Label</p>
                            <p style={styles.metricValue}>{label}</p>
                        </div>

                        <div style={styles.metricBox}>
                            <p style={styles.metricLabel}>Confidence Score</p>
                            <p style={styles.metricValue}>
                                {confidence !== null ? `${confidence}%` : "Not available"}
                            </p>
                        </div>

                        <div style={styles.noteBox}>
                            <h3 style={styles.noteTitle}>Note</h3>
                            <p style={styles.noteText}>
                                This page is ready for final real model integration. Once the
                                actual model is connected, the UI can remain the same while the
                                backend returns real prediction values.
                            </p>
                        </div>

                        <div style={styles.actionRow}>
                            <Button variant="primary" onClick={() => navigate("/dashboard")}>
                                Upload Another Image
                            </Button>

                            <Link to="/history" style={styles.linkButton}>
                                Open History
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
        </DashboardLayout>
    );
}

const styles = {
    wrapper: {},
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap",
        marginBottom: "24px",
    },
    badgeLabel: {
        margin: "0 0 8px",
        color: "#4f46e5",
        fontSize: "12px",
        fontWeight: 800,
        letterSpacing: "1px",
    },
    heading: {
        margin: 0,
        fontSize: "34px",
        color: "#111827",
    },
    subheading: {
        margin: "8px 0 0",
        color: "#6b7280",
        fontSize: "15px",
    },
    headerActions: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
        flexWrap: "wrap",
    },
    historyButton: {
        textDecoration: "none",
        background: "#ffffff",
        color: "#4f46e5",
        padding: "10px 16px",
        borderRadius: "10px",
        fontWeight: 700,
        border: "1px solid #dbeafe",
        boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    },
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
    },
    imageCard: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    resultCard: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    cardTitle: {
        margin: "0 0 8px",
        fontSize: "24px",
        color: "#111827",
    },
    cardText: {
        margin: "0 0 18px",
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: 1.6,
    },
    imageBox: {
        border: "1px solid #d1d5db",
        borderRadius: "18px",
        padding: "12px",
        background: "#f9fafb",
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: "100%",
        maxHeight: "420px",
        objectFit: "contain",
        borderRadius: "12px",
    },
    emptyImage: {
        minHeight: "420px",
        border: "2px dashed #cbd5e1",
        borderRadius: "18px",
        background: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#6b7280",
    },
    emptyImageText: {
        margin: 0,
        fontSize: "15px",
    },
    fileInfoBox: {
        marginTop: "16px",
        padding: "14px",
        borderRadius: "14px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
    },
    fileInfoLabel: {
        margin: "0 0 6px",
        fontSize: "12px",
        fontWeight: 700,
        color: "#6b7280",
        letterSpacing: "0.5px",
    },
    fileInfoValue: {
        margin: 0,
        fontSize: "15px",
        fontWeight: 600,
        color: "#111827",
        wordBreak: "break-word",
    },
    statusWrap: {
        marginBottom: "18px",
    },
    statusBadge: {
        display: "inline-block",
        padding: "8px 14px",
        borderRadius: "999px",
        fontSize: "13px",
        fontWeight: 800,
        letterSpacing: "0.5px",
    },
    metricBox: {
        background: "#eef2ff",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "14px",
    },
    metricLabel: {
        margin: "0 0 6px",
        fontSize: "13px",
        color: "#6b7280",
        fontWeight: 700,
        letterSpacing: "0.4px",
    },
    metricValue: {
        margin: 0,
        fontSize: "24px",
        fontWeight: 700,
        color: "#111827",
    },
    noteBox: {
        marginTop: "18px",
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "16px",
    },
    noteTitle: {
        margin: "0 0 8px",
        fontSize: "16px",
        color: "#111827",
    },
    noteText: {
        margin: 0,
        color: "#6b7280",
        fontSize: "14px",
        lineHeight: 1.7,
    },
    actionRow: {
        display: "flex",
        gap: "12px",
        marginTop: "20px",
        flexWrap: "wrap",
    },
    linkButton: {
        display: "inline-block",
        textDecoration: "none",
        padding: "12px 18px",
        borderRadius: "10px",
        background: "#ffffff",
        color: "#4f46e5",
        fontWeight: 700,
        border: "1px solid #dbeafe",
    },
    fallbackWrap: {
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    fallbackCard: {
        width: "100%",
        maxWidth: "500px",
        margin: "0 auto",
        background: "#ffffff",
        borderRadius: "20px",
        padding: "32px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    },
    fallbackIcon: {
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        margin: "0 auto 16px",
        background: "#fee2e2",
        color: "#b91c1c",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: "24px",
    },
    fallbackTitle: {
        margin: "0 0 10px",
        color: "#111827",
    },
    fallbackText: {
        margin: "0 0 20px",
        color: "#6b7280",
        lineHeight: 1.6,
    },
};