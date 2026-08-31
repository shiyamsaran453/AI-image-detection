import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictImage } from "../api/predictionApi";
import { removeToken } from "../utils/storage";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";

export default function DashboardPage() {
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const resetSelectedFile = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(null);
        setPreviewUrl("");
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        setError("");

        if (!file) {
            resetSelectedFile();
            return;
        }

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            resetSelectedFile();
            return;
        }

        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleDetect = async () => {
        if (!selectedFile) {
            setError("Please select an image first.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);

            const res = await predictImage(formData);

            navigate("/result", {
                state: {
                    image: previewUrl,
                    fileName: selectedFile.name,
                    result: res.data?.result || res.data,
                },
            });
        } catch (err) {
            const message = err.response?.data?.detail || "Prediction failed.";

            if (err.response?.status === 401) {
                removeToken();
                navigate("/login");
                return;
            }

            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout title="Dashboard">
            <div style={styles.header}>
                <div>
                    <p style={styles.badge}>AI IMAGE DETECTION</p>
                    <h1 style={styles.heading}>Dashboard</h1>
                    <p style={styles.subheading}>
                        Upload an image and check whether it is real or AI generated.
                    </p>
                </div>
            </div>

            <section style={styles.contentGrid}>
                <div style={styles.leftCard}>
                    <h2 style={styles.cardTitle}>Upload Image</h2>
                    <p style={styles.cardText}>
                        Supported input: JPG, JPEG, PNG, WEBP and other image formats.
                    </p>

                    <label style={styles.uploadBox}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            style={styles.hiddenInput}
                        />
                        <div style={styles.uploadInner}>
                            <div style={styles.uploadIcon}>↑</div>
                            <h3 style={styles.uploadTitle}>Click to choose an image</h3>
                            <p style={styles.uploadText}>
                                Select a file from your device to preview and analyze.
                            </p>
                        </div>
                    </label>

                    {selectedFile ? (
                        <div style={styles.fileInfoBox}>
                            <p style={styles.fileInfoLabel}>Selected File</p>
                            <p style={styles.fileName}>{selectedFile.name}</p>
                            <p style={styles.fileMeta}>
                                {(selectedFile.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                    ) : null}

                    {error ? <p style={styles.error}>{error}</p> : null}

                    <Button
                        variant="primary"
                        fullWidth
                        onClick={handleDetect}
                        disabled={loading}
                        style={{ marginTop: "18px", padding: "14px" }}
                    >
                        {loading ? "Detecting..." : "Detect Image"}
                    </Button>
                </div>

                <div style={styles.rightCard}>
                    <h2 style={styles.cardTitle}>Preview</h2>
                    <p style={styles.cardText}>
                        Your uploaded image will appear here before detection.
                    </p>

                    {previewUrl ? (
                        <div style={styles.previewBox}>
                            <img src={previewUrl} alt="Preview" style={styles.previewImage} />
                        </div>
                    ) : (
                        <div style={styles.emptyPreview}>
                            <div style={styles.emptyIcon}>🖼️</div>
                            <p style={styles.emptyTitle}>No image selected</p>
                            <p style={styles.emptyText}>
                                Upload an image to preview it here.
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <section style={styles.bottomGrid}>
                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>How it works</h3>
                    <p style={styles.infoText}>
                        Upload an image, preview it, and start detection. The result page
                        will show the predicted label and confidence score.
                    </p>
                </div>

                <div style={styles.infoCard}>
                    <h3 style={styles.infoTitle}>Next step</h3>
                    <p style={styles.infoText}>
                        After the final website structure is completed, the real model can
                        be integrated into the backend without changing this page layout.
                    </p>
                </div>
            </section>
        </DashboardLayout>
    );
}

const styles = {
    header: {
        marginBottom: "24px",
    },
    badge: {
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
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
    },
    leftCard: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "24px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    rightCard: {
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
    uploadBox: {
        display: "block",
        border: "2px dashed #c7d2fe",
        borderRadius: "18px",
        background: "#f8faff",
        padding: "18px",
        cursor: "pointer",
    },
    hiddenInput: {
        display: "none",
    },
    uploadInner: {
        minHeight: "180px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
    uploadIcon: {
        width: "54px",
        height: "54px",
        borderRadius: "50%",
        background: "#e0e7ff",
        color: "#4338ca",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        fontWeight: 700,
        marginBottom: "14px",
    },
    uploadTitle: {
        margin: "0 0 8px",
        fontSize: "18px",
        color: "#111827",
    },
    uploadText: {
        margin: 0,
        color: "#6b7280",
        fontSize: "14px",
        maxWidth: "320px",
        lineHeight: 1.6,
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
    fileName: {
        margin: "0 0 4px",
        fontSize: "15px",
        fontWeight: 600,
        color: "#111827",
        wordBreak: "break-word",
    },
    fileMeta: {
        margin: 0,
        fontSize: "13px",
        color: "#6b7280",
    },
    error: {
        color: "#dc2626",
        marginTop: "14px",
        fontSize: "14px",
    },
    previewBox: {
        border: "1px solid #d1d5db",
        borderRadius: "18px",
        padding: "12px",
        background: "#f9fafb",
        minHeight: "420px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    },
    previewImage: {
        width: "100%",
        maxHeight: "420px",
        objectFit: "contain",
        borderRadius: "12px",
    },
    emptyPreview: {
        minHeight: "420px",
        border: "2px dashed #cbd5e1",
        borderRadius: "18px",
        padding: "24px",
        textAlign: "center",
        color: "#6b7280",
        background: "#f9fafb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    emptyIcon: {
        fontSize: "42px",
        marginBottom: "12px",
    },
    emptyTitle: {
        margin: "0 0 8px",
        color: "#111827",
        fontWeight: 700,
        fontSize: "18px",
    },
    emptyText: {
        margin: 0,
        maxWidth: "280px",
        lineHeight: 1.6,
    },
    bottomGrid: {
        marginTop: "24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "24px",
    },
    infoCard: {
        background: "#ffffff",
        borderRadius: "20px",
        padding: "22px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    infoTitle: {
        margin: "0 0 10px",
        color: "#111827",
        fontSize: "18px",
    },
    infoText: {
        margin: 0,
        color: "#6b7280",
        lineHeight: 1.7,
        fontSize: "14px",
    },
};