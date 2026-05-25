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

/* ─── Google Fonts ───────────────────────────────────────────────────────── */
if (!document.getElementById("gf-history")) {
    const link = document.createElement("link");
    link.id = "gf-history";
    link.rel = "stylesheet";
    link.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    document.head.appendChild(link);
}

/* ─── Helpers (unchanged) ────────────────────────────────────────────────── */
function formatDateTime(value) {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
}

function buildImageUrl(imagePath) {
    if (!imagePath) return "";
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
    return `${BASE_URL}/${String(imagePath).replace(/\\/g, "/")}`;
}

/* ─── Mini confidence bar used inside cards ──────────────────────────────── */
function MiniBar({ value }) {
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
    return (
        <div className="hp-mini-bar-wrap">
            <div className="hp-mini-bar-track">
                <div className="hp-mini-bar-fill" style={{ width: `${pct}%`, background: color }} />
            </div>
            <span className="hp-mini-bar-pct" style={{ color }}>{pct.toFixed(2)}%</span>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function HistoryPage() {
    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [filter, setFilter] = useState("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [deleteLoadingId, setDeleteLoadingId] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);

    /* ── Data fetching (unchanged) ──────────────────────────────────────── */
    const fetchHistory = async () => {
        try {
            setLoading(true);
            setPageError("");
            const res = await getPredictionHistory();
            setHistory(res.data?.history || []);
        } catch (err) {
            if (err.response?.status === 401) { removeToken(); navigate("/login"); return; }
            setPageError(err.response?.data?.detail || "Failed to load history.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchHistory(); }, []);

    /* ── Filtering (unchanged) ──────────────────────────────────────────── */
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

    /* ── Delete (unchanged) ─────────────────────────────────────────────── */
    const handleDelete = async (predictionId) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this record? This cannot be undone."
        );
        if (!confirmDelete) return;
        try {
            setDeleteLoadingId(predictionId);
            await deletePredictionHistoryItem(predictionId);
            setHistory((prev) => prev.filter((item) => item.id !== predictionId));
        } catch (err) {
            if (err.response?.status === 401) { removeToken(); navigate("/login"); return; }
            alert(err.response?.data?.detail || "Failed to delete this record.");
        } finally {
            setDeleteLoadingId("");
        }
    };

    /* ── Render stats ───────────────────────────────────────────────────── */
    const realCount = history.filter(i => String(i.label || "").toUpperCase() === "REAL").length;
    const fakeCount = history.filter(i => String(i.label || "").toUpperCase() === "FAKE").length;

    return (
        <>
            <style>{css}</style>
            <DashboardLayout title="History">

                {/* ── Page header ─────────────────────────────────────────── */}
                <header className="hp-header">
                    <div className="hp-header-text">
                        <span className="hp-badge">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                                <circle cx="5" cy="5" r="5" />
                            </svg>
                            AI IMAGE DETECTION
                        </span>
                        <h1 className="hp-heading">Prediction History</h1>
                        <p className="hp-subheading">View and manage your previous image detection results.</p>
                    </div>

                    {/* Stats pills — visible only when data loaded */}
                    {!loading && !pageError && history.length > 0 && (
                        <div className="hp-stats" aria-label="Summary statistics">
                            <div className="hp-stat-chip hp-stat-chip--total">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                                    <path d="M12 7v5l4 2" />
                                </svg>
                                {history.length} Total
                            </div>
                            <div className="hp-stat-chip hp-stat-chip--real">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                                {realCount} Real
                            </div>
                            <div className="hp-stat-chip hp-stat-chip--fake">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                {fakeCount} Fake
                            </div>
                        </div>
                    )}
                </header>

                {/* ── Controls card ────────────────────────────────────────── */}
                <section className="hp-controls-card" aria-label="Filter and search controls">
                    <div className="hp-controls-row">

                        {/* Search */}
                        <div className={`hp-search-wrap${searchFocused ? " hp-search-wrap--focused" : ""}`}>
                            <span className="hp-search-icon" aria-hidden="true">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                                </svg>
                            </span>
                            <input
                                type="search"
                                placeholder="Search by label or date…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={() => setSearchFocused(false)}
                                className="hp-search-input"
                                aria-label="Search history by label or date"
                            />
                            {search && (
                                <button
                                    type="button"
                                    className="hp-search-clear"
                                    onClick={() => setSearch("")}
                                    aria-label="Clear search"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Filter tabs */}
                        <div className="hp-filter-tabs" role="group" aria-label="Filter by prediction type">
                            {["ALL", "REAL", "FAKE"].map((val) => (
                                <button
                                    key={val}
                                    type="button"
                                    className={`hp-filter-tab${filter === val ? " hp-filter-tab--active" : ""}`}
                                    onClick={() => setFilter(val)}
                                    aria-pressed={filter === val}
                                >
                                    {val === "ALL" ? "All" : val === "REAL" ? "Real" : "Fake"}
                                </button>
                            ))}
                        </div>

                        {/* Refresh */}
                        <Button variant="primary" onClick={fetchHistory} aria-label="Refresh history">
                            <span className="hp-btn-inner">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <path d="M3 3v5h5" /><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                                </svg>
                                Refresh
                            </span>
                        </Button>
                    </div>

                    {/* Result count */}
                    {!loading && !pageError && (
                        <p className="hp-result-count" aria-live="polite">
                            {filteredHistory.length === 0
                                ? "No results match your current filters."
                                : `Showing ${filteredHistory.length} of ${history.length} record${history.length !== 1 ? "s" : ""}`}
                        </p>
                    )}
                </section>

                {/* ── List / states ─────────────────────────────────────────── */}
                <section className="hp-list-wrap" aria-label="History records">

                    {/* Loading */}
                    {loading && (
                        <div className="hp-state-card">
                            <Loader text="Loading history…" />
                            <p className="hp-state-text">Please wait while we fetch your prediction records.</p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && pageError && (
                        <div className="hp-state-card" role="alert">
                            <div className="hp-state-icon hp-state-icon--error" aria-hidden="true">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <h3 className="hp-state-title">Unable to load history</h3>
                            <p className="hp-state-text">{pageError}</p>
                            <Button variant="primary" onClick={fetchHistory}>Try Again</Button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !pageError && filteredHistory.length === 0 && (
                        <div className="hp-state-card">
                            <div className="hp-state-icon hp-state-icon--neutral" aria-hidden="true">
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <h3 className="hp-state-title">No records found</h3>
                            <p className="hp-state-text">
                                {search || filter !== "ALL"
                                    ? "Try a different search term or clear your filters."
                                    : "Run a prediction from the dashboard to see results here."}
                            </p>
                            <Link to="/dashboard" className="hp-cta-link">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg>
                                Go to Dashboard
                            </Link>
                        </div>
                    )}

                    {/* ── Cards grid ──────────────────────────────────────── */}
                    {!loading && !pageError && filteredHistory.length > 0 && (
                        <div className="hp-grid">
                            {filteredHistory.map((item) => {
                                const label = String(item.label || "").toUpperCase();
                                const imageUrl = buildImageUrl(item.image_path);
                                const isReal = label === "REAL";
                                const isDeleting = deleteLoadingId === item.id;

                                return (
                                    <article key={item.id} className="hp-card">

                                        {/* Image area */}
                                        <div className="hp-card-img-wrap">
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={`Prediction: ${label}`}
                                                    className="hp-card-img"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none";
                                                        const fallback = e.currentTarget.nextSibling;
                                                        if (fallback) fallback.style.display = "flex";
                                                    }}
                                                />
                                            ) : null}
                                            <div
                                                className="hp-card-no-img"
                                                aria-label="Image preview not available"
                                                style={{ display: imageUrl ? "none" : "flex" }}
                                            >
                                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span>No preview</span>
                                            </div>

                                            {/* Floating verdict chip on image */}
                                            <span
                                                className={`hp-verdict-chip ${isReal ? "hp-verdict-chip--real" : "hp-verdict-chip--fake"}`}
                                                aria-label={`Result: ${label}`}
                                            >
                                                {isReal ? (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12" />
                                                    </svg>
                                                ) : (
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <line x1="18" y1="6" x2="6" y2="18" />
                                                        <line x1="6" y1="6" x2="18" y2="18" />
                                                    </svg>
                                                )}
                                                {label || "UNKNOWN"}
                                            </span>
                                        </div>

                                        {/* Card body */}
                                        <div className="hp-card-body">

                                            {/* Confidence */}
                                            <div className="hp-card-section">
                                                <span className="hp-card-meta-label">Confidence</span>
                                                <MiniBar value={item.confidence || 0} />
                                            </div>

                                            {/* Date */}
                                            <div className="hp-card-section">
                                                <span className="hp-card-meta-label">Analysed</span>
                                                <p className="hp-card-date">
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                        aria-hidden="true">
                                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="16" y1="2" x2="16" y2="6" />
                                                        <line x1="8" y1="2" x2="8" y2="6" />
                                                        <line x1="3" y1="10" x2="21" y2="10" />
                                                    </svg>
                                                    {formatDateTime(item.created_at)}
                                                </p>
                                            </div>

                                            {/* Delete */}
                                            <div className="hp-card-action">
                                                <Button
                                                    variant="danger"
                                                    onClick={() => handleDelete(item.id)}
                                                    disabled={isDeleting}
                                                    aria-label={`Delete record from ${formatDateTime(item.created_at)}`}
                                                >
                                                    {isDeleting ? (
                                                        <span className="hp-btn-inner">
                                                            <span className="hp-spinner" aria-hidden="true" />
                                                            Deleting…
                                                        </span>
                                                    ) : (
                                                        <span className="hp-btn-inner">
                                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                                                aria-hidden="true">
                                                                <polyline points="3 6 5 6 21 6" />
                                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                                <path d="M10 11v6" /><path d="M14 11v6" />
                                                                <path d="M9 6V4h6v2" />
                                                            </svg>
                                                            Delete
                                                        </span>
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>

            </DashboardLayout>
        </>
    );
}

/* ─── Scoped CSS ─────────────────────────────────────────────────────────── */
const css = `
  :root {
    --hp-violet:        #7c3aed;
    --hp-violet-light:  #8b5cf6;
    --hp-violet-dim:    #ede9fe;
    --hp-violet-ring:   rgba(124,58,237,.18);
    --hp-black:         #0f0a1e;
    --hp-gray-900:      #111827;
    --hp-gray-700:      #374151;
    --hp-gray-600:      #4b5563;
    --hp-gray-500:      #6b7280;
    --hp-gray-300:      #d1d5db;
    --hp-gray-200:      #e5e7eb;
    --hp-gray-100:      #f3f4f6;
    --hp-gray-50:       #f9fafb;
    --hp-green:         #16a34a;
    --hp-green-dark:    #166534;
    --hp-green-light:   #dcfce7;
    --hp-red:           #dc2626;
    --hp-red-dark:      #991b1b;
    --hp-red-light:     #fee2e2;
    --hp-white:         #ffffff;
    --hp-radius-lg:     20px;
    --hp-radius-md:     14px;
    --hp-radius-sm:     10px;
    --hp-shadow:        0 4px 24px rgba(0,0,0,0.07);
    --hp-shadow-hover:  0 8px 32px rgba(124,58,237,0.12);
    --hp-transition:    0.22s cubic-bezier(.4,0,.2,1);
    --hp-font:          'DM Sans', sans-serif;
    --hp-font-display:  'Outfit', sans-serif;
  }

  /* ── Header ─────────────────────────────────────────────────── */
  .hp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
  }

  .hp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--hp-violet-dim);
    color: var(--hp-violet);
    border-radius: 999px;
    font-family: var(--hp-font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 10px;
  }

  .hp-heading {
    margin: 0;
    font-family: var(--hp-font-display);
    font-size: 30px;
    font-weight: 800;
    color: var(--hp-gray-900);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .hp-subheading {
    margin: 8px 0 0;
    font-family: var(--hp-font);
    color: var(--hp-gray-500);
    font-size: 15px;
    line-height: 1.6;
  }

  /* Stats chips */
  .hp-stats {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-self: center;
  }

  .hp-stat-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    font-family: var(--hp-font-display);
    font-size: 12px;
    font-weight: 700;
    white-space: nowrap;
  }

  .hp-stat-chip--total { background: var(--hp-violet-dim); color: var(--hp-violet); }
  .hp-stat-chip--real  { background: var(--hp-green-light); color: var(--hp-green-dark); }
  .hp-stat-chip--fake  { background: var(--hp-red-light);   color: var(--hp-red-dark); }

  /* ── Controls card ───────────────────────────────────────────── */
  .hp-controls-card {
    background: var(--hp-white);
    border-radius: var(--hp-radius-lg);
    padding: 18px 20px;
    box-shadow: var(--hp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    margin-bottom: 24px;
  }

  .hp-controls-row {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  /* Search */
  .hp-search-wrap {
    display: flex;
    align-items: center;
    flex: 1 1 240px;
    border: 1.5px solid var(--hp-gray-200);
    border-radius: var(--hp-radius-md);
    background: var(--hp-white);
    transition: border-color var(--hp-transition), box-shadow var(--hp-transition);
    overflow: hidden;
    padding: 0 12px;
    gap: 8px;
    min-width: 0;
  }

  .hp-search-wrap--focused {
    border-color: var(--hp-violet);
    box-shadow: 0 0 0 3.5px var(--hp-violet-ring);
  }

  .hp-search-icon {
    display: flex;
    align-items: center;
    color: var(--hp-gray-500);
    flex-shrink: 0;
  }

  .hp-search-input {
    flex: 1;
    padding: 11px 0;
    border: none;
    outline: none;
    font-family: var(--hp-font);
    font-size: 14px;
    color: var(--hp-gray-900);
    background: transparent;
    min-width: 0;
  }

  .hp-search-input::placeholder { color: var(--hp-gray-500); }

  .hp-search-clear {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--hp-gray-100);
    color: var(--hp-gray-500);
    border-radius: 6px;
    width: 22px;
    height: 22px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--hp-transition), color var(--hp-transition);
  }

  .hp-search-clear:hover { background: var(--hp-gray-200); color: var(--hp-gray-900); }

  /* Filter tab group */
  .hp-filter-tabs {
    display: flex;
    border: 1.5px solid var(--hp-gray-200);
    border-radius: var(--hp-radius-md);
    overflow: hidden;
    flex-shrink: 0;
  }

  .hp-filter-tab {
    padding: 10px 16px;
    border: none;
    background: var(--hp-white);
    color: var(--hp-gray-600);
    font-family: var(--hp-font-display);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: background var(--hp-transition), color var(--hp-transition);
    border-right: 1px solid var(--hp-gray-200);
    white-space: nowrap;
  }

  .hp-filter-tab:last-child { border-right: none; }

  .hp-filter-tab--active {
    background: var(--hp-violet);
    color: var(--hp-white);
  }

  .hp-filter-tab:hover:not(.hp-filter-tab--active) {
    background: var(--hp-violet-dim);
    color: var(--hp-violet);
  }

  /* Result count */
  .hp-result-count {
    margin: 12px 0 0;
    font-family: var(--hp-font);
    font-size: 13px;
    color: var(--hp-gray-500);
  }

  /* ── State cards (loading / error / empty) ───────────────────── */
  .hp-state-card {
    background: var(--hp-white);
    border-radius: var(--hp-radius-lg);
    padding: 52px 32px;
    text-align: center;
    box-shadow: var(--hp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    animation: hp-fade-in .3s ease;
  }

  .hp-state-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    margin-bottom: 4px;
  }

  .hp-state-icon--error   { background: var(--hp-red-light);  color: var(--hp-red);    }
  .hp-state-icon--neutral { background: var(--hp-violet-dim); color: var(--hp-violet); }

  .hp-state-title {
    margin: 0;
    font-family: var(--hp-font-display);
    font-size: 20px;
    font-weight: 800;
    color: var(--hp-gray-900);
  }

  .hp-state-text {
    margin: 0;
    font-family: var(--hp-font);
    font-size: 14px;
    color: var(--hp-gray-500);
    line-height: 1.65;
    max-width: 320px;
  }

  .hp-cta-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 11px 20px;
    background: var(--hp-violet);
    color: var(--hp-white);
    border-radius: var(--hp-radius-sm);
    font-family: var(--hp-font-display);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: background var(--hp-transition), box-shadow var(--hp-transition);
  }

  .hp-cta-link:hover {
    background: var(--hp-violet-light);
    box-shadow: 0 4px 16px rgba(124,58,237,.3);
  }

  /* ── Cards grid ──────────────────────────────────────────────── */
  .hp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }

  /* ── History card ────────────────────────────────────────────── */
  .hp-card {
    background: var(--hp-white);
    border-radius: var(--hp-radius-lg);
    overflow: hidden;
    box-shadow: var(--hp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    transition: box-shadow var(--hp-transition), transform var(--hp-transition);
    animation: hp-fade-in .3s ease;
  }

  .hp-card:hover {
    box-shadow: var(--hp-shadow-hover);
    transform: translateY(-3px);
  }

  /* Image zone */
  .hp-card-img-wrap {
    width: 100%;
    height: 200px;
    background: var(--hp-gray-100);
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
  }

  .hp-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .4s ease;
  }

  .hp-card:hover .hp-card-img { transform: scale(1.04); }

  .hp-card-no-img {
    position: absolute;
    inset: 0;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: var(--hp-gray-300);
    font-family: var(--hp-font);
    font-size: 13px;
    background: var(--hp-gray-50);
  }

  /* Floating verdict chip */
  .hp-verdict-chip {
    position: absolute;
    top: 10px;
    right: 10px;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 11px;
    border-radius: 999px;
    font-family: var(--hp-font-display);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.05em;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }

  .hp-verdict-chip--real { background: rgba(22,163,74,.9);  color: #fff; }
  .hp-verdict-chip--fake { background: rgba(220,38,38,.9);  color: #fff; }

  /* Card body */
  .hp-card-body {
    padding: 16px 18px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1;
  }

  .hp-card-section { display: flex; flex-direction: column; gap: 5px; }

  .hp-card-meta-label {
    font-family: var(--hp-font-display);
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--hp-gray-500);
  }

  .hp-card-date {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0;
    font-family: var(--hp-font);
    font-size: 13px;
    color: var(--hp-gray-700);
  }

  .hp-card-action {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
  }

  /* ── Mini confidence bar ─────────────────────────────────────── */
  .hp-mini-bar-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hp-mini-bar-track {
    flex: 1;
    height: 7px;
    background: var(--hp-gray-100);
    border-radius: 999px;
    overflow: hidden;
  }

  .hp-mini-bar-fill {
    height: 100%;
    border-radius: 999px;
    transition: width .6s cubic-bezier(.4,0,.2,1);
  }

  .hp-mini-bar-pct {
    font-family: var(--hp-font-display);
    font-size: 13px;
    font-weight: 700;
    flex-shrink: 0;
    min-width: 44px;
    text-align: right;
  }

  /* ── Shared button inner ─────────────────────────────────────── */
  .hp-btn-inner {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  .hp-spinner {
    display: inline-block;
    width: 13px;
    height: 13px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: hp-spin .65s linear infinite;
  }

  /* ── Animations ──────────────────────────────────────────────── */
  @keyframes hp-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  @keyframes hp-spin {
    to { transform: rotate(360deg); }
  }

  /* ── Responsive ──────────────────────────────────────────────── */
  @media (max-width: 768px) {
    .hp-header { flex-direction: column; }
    .hp-controls-row { flex-direction: column; align-items: stretch; }
    .hp-filter-tabs { width: 100%; justify-content: stretch; }
    .hp-filter-tab { flex: 1; text-align: center; }
    .hp-search-wrap { flex: none; width: 100%; }
    .hp-stats { align-self: flex-start; }
  }
`;