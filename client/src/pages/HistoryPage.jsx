import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    deletePredictionHistoryItem,
    getPredictionHistory,
} from "../api/predictionApi";
import { removeToken } from "../utils/storage";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const BASE_URL = "http://127.0.0.1:8000";

function formatDateTime(value) {
    if (!value) return "Not available";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString();
}

function buildImageUrl(imagePath) {
    if (!imagePath) return "";

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath;
    }

    return `${BASE_URL}/${String(imagePath).replace(/\\/g, "/")}`;
}

export default function HistoryPage() {
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [deleteLoadingId, setDeleteLoadingId] = useState("");

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setPageError("");

            const res = await getPredictionHistory();
            const items = res.data?.history || [];

            setHistory(items);
        } catch (err) {
            if (err.response?.status === 401) {
                removeToken();
                navigate("/login");
                return;
            }

            setPageError(err.response?.data?.detail || "Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const label = String(item.label || "").toUpperCase();
            const createdAt = formatDateTime(item.created_at);

            const matchesFilter = filter === "ALL" ? true : label === filter;
            const matchesSearch =
                label.toLowerCase().includes(search.toLowerCase()) ||
                createdAt.toLowerCase().includes(search.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [history, filter, search]);

    const handleDelete = async (predictionId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this history item?"
        );

        if (!confirmDelete) return;

        try {
            setDeleteLoadingId(predictionId);
            await deletePredictionHistoryItem(predictionId);

            setHistory((prev) => prev.filter((item) => item.id !== predictionId));
        } catch (err) {
            if (err.response?.status === 401) {
                removeToken();
                navigate("/login");
                return;
            }

            alert(err.response?.data?.detail || "Failed to delete history item.");
        } finally {
            setDeleteLoadingId("");
        }
    };

    return (
        <DashboardLayout title="History">
            <div style={styles.header}>
                <div>
                    <p style={styles.badge}>AI IMAGE DETECTION</p>
                    <h1 style={styles.pageTitle}>Prediction History</h1>
                    <p style={styles.pageSubtitle}>
                        View and manage your previous image detection results.
                    </p>
                </div>
            </div>

            <section style={styles.controlsCard}>
                <div style={styles.controlsRow}>
                    <input
                        type="text"
                        placeholder="Search by label or date"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={styles.searchInput}
                    />

                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        style={styles.select}
                    >
                        <option value="ALL">All</option>
                        <option value="REAL">Real</option>
                        <option value="FAKE">Fake</option>
                    </select>

                    <Button variant="primary" onClick={fetchHistory}>
                        Refresh
                    </Button>
                </div>
            </section>

            <section style={styles.listWrapper}>
                {loading ? (
                    <div style={styles.emptyState}>
                        <Loader text="Loading history..." />
                        <p style={styles.emptyText}>
                            Please wait while we fetch your prediction records.
                        </p>
                    </div>
                ) : pageError ? (
                    <div style={styles.emptyState}>
                        <div style={styles.stateIcon}>⚠️</div>
                        <h3 style={styles.emptyTitle}>Unable to load history</h3>
                        <p style={styles.emptyText}>{pageError}</p>
                        <Button variant="primary" onClick={fetchHistory}>
                            Try Again
                        </Button>
                    </div>
                ) : filteredHistory.length === 0 ? (
                    <div style={styles.emptyState}>
                        <div style={styles.stateIcon}>📂</div>
                        <h3 style={styles.emptyTitle}>No history found</h3>
                        <p style={styles.emptyText}>
                            Try changing the filter or run a new prediction.
                        </p>
                        <Link to="/dashboard" style={styles.primaryLink}>
                            Go to Dashboard
                        </Link>
                    </div>
                ) : (
                    <div style={styles.grid}>
                        {filteredHistory.map((item) => {
                            const label = String(item.label || "").toUpperCase();
                            const imageUrl = buildImageUrl(item.image_path);

                            return (
                                <div key={item.id} style={styles.card}>
                                    <div style={styles.imageWrap}>
                                        {imageUrl ? (
                                            <img
                                                src={imageUrl}
                                                alt={label}
                                                style={styles.image}
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none";
                                                    const fallback = e.currentTarget.nextSibling;
                                                    if (fallback) fallback.style.display = "flex";
                                                }}
                                            />
                                        ) : null}

                                        <div
                                            style={{
                                                ...styles.noImage,
                                                display: imageUrl ? "none" : "flex",
                                            }}
                                        >
                                            No image preview
                                        </div>
                                    </div>

                                    <div style={styles.cardBody}>
                                        <div style={styles.badgeRow}>
                                            <span
                                                style={{
                                                    ...styles.labelBadge,
                                                    background:
                                                        label === "REAL" ? "#dcfce7" : "#fee2e2",
                                                    color:
                                                        label === "REAL" ? "#166534" : "#991b1b",
                                                }}
                                            >
                                                {label || "UNKNOWN"}
                                            </span>
                                        </div>

                                        <p style={styles.infoText}>
                                            <strong>Confidence:</strong>{" "}
                                            {Number(item.confidence || 0).toFixed(2)}%
                                        </p>

                                        <p style={styles.infoText}>
                                            <strong>Date:</strong> {formatDateTime(item.created_at)}
                                        </p>

                                        <p style={styles.pathText}>
                                            <strong>Path:</strong> {item.image_path || "Not available"}
                                        </p>

                                        <div style={styles.actionRow}>
                                            <Button
                                                variant="danger"
                                                onClick={() => handleDelete(item.id)}
                                                disabled={deleteLoadingId === item.id}
                                                style={{
                                                    opacity: deleteLoadingId === item.id ? 0.7 : 1,
                                                }}
                                            >
                                                {deleteLoadingId === item.id ? "Deleting..." : "Delete"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
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
    pageTitle: {
        margin: 0,
        fontSize: "32px",
        fontWeight: 700,
        color: "#111827",
    },
    pageSubtitle: {
        margin: "8px 0 0",
        color: "#6b7280",
        fontSize: "15px",
    },
    controlsCard: {
        background: "#ffffff",
        borderRadius: "18px",
        padding: "18px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        marginBottom: "24px",
    },
    controlsRow: {
        display: "flex",
        gap: "14px",
        flexWrap: "wrap",
    },
    searchInput: {
        flex: "1 1 260px",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        outline: "none",
        fontSize: "14px",
    },
    select: {
        minWidth: "140px",
        padding: "12px 14px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        outline: "none",
        fontSize: "14px",
        background: "#ffffff",
    },
    listWrapper: {},
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
    },
    card: {
        background: "#ffffff",
        borderRadius: "18px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        border: "1px solid #eef2ff",
    },
    imageWrap: {
        width: "100%",
        height: "220px",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    noImage: {
        position: "absolute",
        inset: 0,
        color: "#6b7280",
        fontSize: "14px",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
    },
    cardBody: {
        padding: "18px",
    },
    badgeRow: {
        marginBottom: "12px",
    },
    labelBadge: {
        display: "inline-block",
        padding: "6px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: 700,
        letterSpacing: "0.4px",
    },
    infoText: {
        margin: "8px 0",
        color: "#374151",
        fontSize: "14px",
    },
    pathText: {
        margin: "8px 0",
        color: "#6b7280",
        fontSize: "13px",
        wordBreak: "break-word",
    },
    actionRow: {
        marginTop: "14px",
        display: "flex",
        justifyContent: "flex-end",
    },
    emptyState: {
        background: "#ffffff",
        borderRadius: "18px",
        padding: "40px 24px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
    },
    stateIcon: {
        fontSize: "34px",
        marginBottom: "12px",
    },
    emptyTitle: {
        margin: "0 0 10px",
        color: "#111827",
    },
    emptyText: {
        margin: "12px 0 18px",
        color: "#6b7280",
        lineHeight: 1.6,
    },
    primaryLink: {
        display: "inline-block",
        textDecoration: "none",
        background: "#4f46e5",
        color: "#ffffff",
        padding: "12px 18px",
        borderRadius: "10px",
        fontWeight: 600,
    },
};