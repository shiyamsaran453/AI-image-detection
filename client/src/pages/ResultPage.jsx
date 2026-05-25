import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";

const LATEST_RESULT_KEY = "latest_prediction_result";

function getStoredResult() {
    try {
        const raw = localStorage.getItem(LATEST_RESULT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

/* ─── Google Fonts ───────────────────────────────────────────────────────── */
if (!document.getElementById("gf-result")) {
    const link = document.createElement("link");
    link.id = "gf-result";
    link.rel = "stylesheet";
    link.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    document.head.appendChild(link);
}

/* ─── Confidence Bar ─────────────────────────────────────────────────────── */
function ConfidenceBar({ value }) {
    const pct = Math.min(100, Math.max(0, Number(value) || 0));
    const color = pct >= 80 ? "#16a34a" : pct >= 50 ? "#f59e0b" : "#ef4444";
    const trackBg = pct >= 80 ? "#dcfce7" : pct >= 50 ? "#fef9c3" : "#fee2e2";
    const tier = pct >= 80 ? "High" : pct >= 50 ? "Medium" : "Low";

    return (
        <div className="rp-conf-wrap">
            <div className="rp-conf-header">
                <span className="rp-conf-pct" style={{ color }}>{pct.toFixed(2)}%</span>
                <span className="rp-conf-tier" style={{ color, background: trackBg }}>{tier} Confidence</span>
            </div>
            <div className="rp-conf-track" style={{ background: trackBg }}>
                <div
                    className="rp-conf-fill"
                    style={{ width: `${pct}%`, background: color }}
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Confidence: ${pct.toFixed(2)}%`}
                />
            </div>
        </div>
    );
}

/* ─── Image Analysis Card ────────────────────────────────────────────────── */
function AnalysisImageCard({ title, subtitle, src, alt, icon }) {
    return (
        <div className="rp-img-card">
            <div className="rp-img-card-header">
                <div className="rp-img-card-icon" aria-hidden="true">{icon}</div>
                <div>
                    <h3 className="rp-img-card-title">{title}</h3>
                    {subtitle && <p className="rp-img-card-sub">{subtitle}</p>}
                </div>
            </div>
            <div className="rp-img-card-body">
                {src ? (
                    <img src={src} alt={alt} className="rp-img-card-img" />
                ) : (
                    <div className="rp-img-card-empty" aria-label="Image not available">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                            aria-hidden="true">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <span>Image not available</span>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function ResultPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const latestStored = getStoredResult();
    const pageData = location.state || latestStored;
    const result = pageData?.result;

    const images = result?.images || {};
    const original = images.original;
    const highpass = images.highpass;
    const ela = images.ela;

    /* ── No result fallback ─────────────────────────────────────────────── */
    if (!result) {
        return (
            <>
                <style>{css}</style>
                <DashboardLayout title="Result">
                    <div className="rp-fallback-wrap">
                        <div className="rp-fallback-card">
                            <div className="rp-fallback-icon" aria-hidden="true">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            </div>
                            <h2 className="rp-fallback-title">No result found</h2>
                            <p className="rp-fallback-text">
                                No prediction data is available. Upload an image to get started.
                            </p>
                            <Button onClick={() => navigate("/dashboard")}>
                                <span className="rp-btn-inner">
                                    Go to Dashboard
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                        aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </Button>
                        </div>
                    </div>
                </DashboardLayout>
            </>
        );
    }

    const label = result.label || "Unknown";
    const confidence = result.confidence !== undefined ? Number(result.confidence) : null;
    const isReal = String(label).toUpperCase() === "REAL";

    return (
        <>
            <style>{css}</style>
            <DashboardLayout title="Result">
                <div className="rp-wrapper">

                    {/* ── Page header ─────────────────────────────────────── */}
                    <header className="rp-header">
                        <div className="rp-header-text">
                            <span className="rp-badge">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                                    <circle cx="5" cy="5" r="5" />
                                </svg>
                                ANALYSIS COMPLETE
                            </span>
                            <h1 className="rp-heading">Prediction Result</h1>
                        </div>
                        <Button onClick={() => navigate("/dashboard")}>
                            <span className="rp-btn-inner">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg>
                                Try Another
                            </span>
                        </Button>
                    </header>

                    {/* ── Verdict banner ───────────────────────────────────── */}
                    <div
                        className={`rp-verdict ${isReal ? "rp-verdict--real" : "rp-verdict--fake"}`}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="rp-verdict-icon" aria-hidden="true">
                            {isReal ? (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            ) : (
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            )}
                        </div>
                        <div className="rp-verdict-body">
                            <p className="rp-verdict-label">
                                {isReal ? "REAL IMAGE DETECTED" : "AI-GENERATED IMAGE DETECTED"}
                            </p>
                            <p className="rp-verdict-desc">
                                {isReal
                                    ? "Our model determined this image is likely authentic and not AI-generated."
                                    : "Our model determined this image shows signs of AI generation or manipulation."}
                            </p>
                        </div>
                        <div className="rp-verdict-chip" aria-hidden="true">
                            {isReal ? "REAL" : "FAKE"}
                        </div>
                    </div>

                    {/* ── 3-image analysis grid ────────────────────────────── */}
                    <section className="rp-img-grid" aria-label="Image analysis views">
                        <AnalysisImageCard
                            title="Original Image"
                            subtitle="Uploaded source file"
                            src={original ? `http://127.0.0.1:8000/${original}` : null}
                            alt="Original uploaded image"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            }
                        />
                        <AnalysisImageCard
                            title="High Pass Filter"
                            subtitle="Edge frequency analysis"
                            src={highpass ? `http://127.0.0.1:8000/${highpass}` : null}
                            alt="High pass filtered image"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                </svg>
                            }
                        />
                        <AnalysisImageCard
                            title="Error Level Analysis"
                            subtitle="Compression artifact map"
                            src={ela ? `http://127.0.0.1:8000/${ela}` : null}
                            alt="Error level analysis image"
                            icon={
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="2" y1="12" x2="22" y2="12" />
                                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                            }
                        />
                    </section>

                    {/* ── Detection summary card ────────────────────────────── */}
                    <div className="rp-summary-card">
                        <div className="rp-summary-header">
                            <div className="rp-summary-icon" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h3 className="rp-summary-title">Detection Summary</h3>
                        </div>

                        <div className="rp-summary-body">
                            {/* Label row */}
                            <div className="rp-meta-row">
                                <div className="rp-meta-item">
                                    <span className="rp-meta-label">Predicted Label</span>
                                    <span
                                        className={`rp-meta-value rp-label-chip ${isReal ? "rp-label-chip--real" : "rp-label-chip--fake"}`}
                                    >
                                        {label.toUpperCase()}
                                    </span>
                                </div>
                                {pageData?.fileName && (
                                    <div className="rp-meta-item">
                                        <span className="rp-meta-label">File Name</span>
                                        <span className="rp-meta-value rp-meta-filename">
                                            {pageData.fileName}
                                        </span>
                                    </div>
                                )}
                                {pageData?.savedAt && (
                                    <div className="rp-meta-item">
                                        <span className="rp-meta-label">Analysed At</span>
                                        <span className="rp-meta-value">
                                            {new Date(pageData.savedAt).toLocaleString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Confidence */}
                            <div className="rp-conf-section">
                                <span className="rp-meta-label" style={{ marginBottom: "10px", display: "block" }}>
                                    Model Confidence
                                </span>
                                {confidence !== null ? (
                                    <ConfidenceBar value={confidence} />
                                ) : (
                                    <p className="rp-na">Not available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── Action row ────────────────────────────────────────── */}
                    <div className="rp-actions">
                        <Button onClick={() => navigate("/dashboard")}>
                            <span className="rp-btn-inner">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg>
                                Upload Again
                            </span>
                        </Button>

                        <Link to="/history" className="rp-history-link">
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                aria-hidden="true">
                                <path d="M3 3v5h5" />
                                <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                                <path d="M12 7v5l4 2" />
                            </svg>
                            View History
                        </Link>
                    </div>

                </div>
            </DashboardLayout>
        </>
    );
}

/* ─── Scoped CSS ─────────────────────────────────────────────────────────── */
const css = `
  :root {
    --rsp-violet:        #7c3aed;
    --rsp-violet-light:  #8b5cf6;
    --rsp-violet-dim:    #ede9fe;
    --rsp-violet-ring:   rgba(124,58,237,.18);
    --rsp-black:         #0f0a1e;
    --rsp-gray-900:      #111827;
    --rsp-gray-600:      #4b5563;
    --rsp-gray-500:      #6b7280;
    --rsp-gray-300:      #d1d5db;
    --rsp-gray-200:      #e5e7eb;
    --rsp-gray-100:      #f3f4f6;
    --rsp-gray-50:       #f9fafb;
    --rsp-green:         #16a34a;
    --rsp-green-bg:      #f0fdf4;
    --rsp-green-border:  #86efac;
    --rsp-red:           #dc2626;
    --rsp-red-bg:        #fef2f2;
    --rsp-red-border:    #fca5a5;
    --rsp-white:         #ffffff;
    --rsp-radius-lg:     20px;
    --rsp-radius-md:     14px;
    --rsp-radius-sm:     10px;
    --rsp-shadow:        0 4px 24px rgba(0,0,0,0.07);
    --rsp-shadow-v:      0 6px 28px rgba(124,58,237,0.12);
    --rsp-transition:    0.22s cubic-bezier(.4,0,.2,1);
    --rsp-font:          'DM Sans', sans-serif;
    --rsp-font-display:  'Outfit', sans-serif;
  }

  /* ── Wrapper ──────────────────────────────────────────── */
  .rp-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* ── Page header ──────────────────────────────────────── */
  .rp-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
  }

  .rp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: var(--rsp-violet-dim);
    color: var(--rsp-violet);
    border-radius: 999px;
    font-family: var(--rsp-font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    margin-bottom: 8px;
  }

  .rp-heading {
    margin: 0;
    font-family: var(--rsp-font-display);
    font-size: 30px;
    font-weight: 800;
    color: var(--rsp-gray-900);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  /* ── Verdict banner ───────────────────────────────────── */
  .rp-verdict {
    display: flex;
    align-items: center;
    gap: 18px;
    padding: 20px 24px;
    border-radius: var(--rsp-radius-lg);
    border: 1.5px solid transparent;
    animation: rsp-fade-in .3s ease;
  }

  .rp-verdict--real {
    background: var(--rsp-green-bg);
    border-color: var(--rsp-green-border);
  }

  .rp-verdict--fake {
    background: var(--rsp-red-bg);
    border-color: var(--rsp-red-border);
  }

  .rp-verdict-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .rp-verdict--real .rp-verdict-icon {
    background: #dcfce7;
    color: var(--rsp-green);
  }

  .rp-verdict--fake .rp-verdict-icon {
    background: #fee2e2;
    color: var(--rsp-red);
  }

  .rp-verdict-body { flex: 1; min-width: 0; }

  .rp-verdict-label {
    margin: 0 0 4px;
    font-family: var(--rsp-font-display);
    font-size: 17px;
    font-weight: 800;
    letter-spacing: -0.01em;
  }

  .rp-verdict--real .rp-verdict-label { color: var(--rsp-green); }
  .rp-verdict--fake .rp-verdict-label { color: var(--rsp-red); }

  .rp-verdict-desc {
    margin: 0;
    font-family: var(--rsp-font);
    font-size: 13.5px;
    color: var(--rsp-gray-600);
    line-height: 1.5;
  }

  .rp-verdict-chip {
    padding: 6px 16px;
    border-radius: 999px;
    font-family: var(--rsp-font-display);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.06em;
    flex-shrink: 0;
  }

  .rp-verdict--real .rp-verdict-chip {
    background: var(--rsp-green);
    color: var(--rsp-white);
  }

  .rp-verdict--fake .rp-verdict-chip {
    background: var(--rsp-red);
    color: var(--rsp-white);
  }

  @media (max-width: 600px) {
    .rp-verdict { flex-wrap: wrap; }
    .rp-verdict-chip { display: none; }
  }

  /* ── 3-image grid ─────────────────────────────────────── */
  .rp-img-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }

  @media (max-width: 900px) {
    .rp-img-grid { grid-template-columns: 1fr 1fr; }
  }

  @media (max-width: 580px) {
    .rp-img-grid { grid-template-columns: 1fr; }
  }

  /* ── Image card ───────────────────────────────────────── */
  .rp-img-card {
    background: var(--rsp-white);
    border-radius: var(--rsp-radius-lg);
    box-shadow: var(--rsp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: box-shadow var(--rsp-transition), transform var(--rsp-transition);
  }

  .rp-img-card:hover {
    box-shadow: var(--rsp-shadow-v);
    transform: translateY(-2px);
  }

  .rp-img-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--rsp-gray-100);
  }

  .rp-img-card-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 9px;
    background: var(--rsp-violet-dim);
    color: var(--rsp-violet);
    flex-shrink: 0;
  }

  .rp-img-card-title {
    margin: 0 0 2px;
    font-family: var(--rsp-font-display);
    font-size: 14px;
    font-weight: 700;
    color: var(--rsp-gray-900);
  }

  .rp-img-card-sub {
    margin: 0;
    font-family: var(--rsp-font);
    font-size: 11.5px;
    color: var(--rsp-gray-500);
  }

  .rp-img-card-body {
    padding: 14px;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 180px;
    background: var(--rsp-gray-50);
  }

  .rp-img-card-img {
    width: 100%;
    max-height: 240px;
    object-fit: contain;
    border-radius: 10px;
    display: block;
    animation: rsp-fade-in .35s ease;
  }

  .rp-img-card-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: var(--rsp-gray-300);
    font-family: var(--rsp-font);
    font-size: 12.5px;
    text-align: center;
  }

  /* ── Summary card ─────────────────────────────────────── */
  .rp-summary-card {
    background: var(--rsp-white);
    border-radius: var(--rsp-radius-lg);
    box-shadow: var(--rsp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    overflow: hidden;
  }

  .rp-summary-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 18px 22px;
    border-bottom: 1px solid var(--rsp-gray-100);
    background: var(--rsp-gray-50);
  }

  .rp-summary-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 11px;
    background: var(--rsp-violet-dim);
    color: var(--rsp-violet);
    flex-shrink: 0;
  }

  .rp-summary-title {
    margin: 0;
    font-family: var(--rsp-font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--rsp-gray-900);
  }

  .rp-summary-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* ── Meta row ─────────────────────────────────────────── */
  .rp-meta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .rp-meta-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
    min-width: 140px;
  }

  .rp-meta-label {
    font-family: var(--rsp-font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: var(--rsp-gray-500);
  }

  .rp-meta-value {
    font-family: var(--rsp-font);
    font-size: 14px;
    font-weight: 600;
    color: var(--rsp-gray-900);
  }

  .rp-meta-filename {
    font-size: 13px;
    word-break: break-all;
    font-weight: 500;
  }

  /* ── Label chip ───────────────────────────────────────── */
  .rp-label-chip {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 999px;
    font-family: var(--rsp-font-display);
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.06em;
    width: fit-content;
  }

  .rp-label-chip--real {
    background: #dcfce7;
    color: var(--rsp-green);
  }

  .rp-label-chip--fake {
    background: #fee2e2;
    color: var(--rsp-red);
  }

  /* ── Confidence bar ───────────────────────────────────── */
  .rp-conf-section { }

  .rp-conf-wrap { display: flex; flex-direction: column; gap: 8px; }

  .rp-conf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .rp-conf-pct {
    font-family: var(--rsp-font-display);
    font-size: 26px;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1;
  }

  .rp-conf-tier {
    font-family: var(--rsp-font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 999px;
  }

  .rp-conf-track {
    height: 10px;
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }

  .rp-conf-fill {
    height: 100%;
    border-radius: 999px;
    transition: width .7s cubic-bezier(.4,0,.2,1);
  }

  .rp-na {
    font-family: var(--rsp-font);
    font-size: 14px;
    color: var(--rsp-gray-500);
    margin: 0;
    font-style: italic;
  }

  /* ── Actions ──────────────────────────────────────────── */
  .rp-actions {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .rp-history-link {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    background: var(--rsp-white);
    border: 1.5px solid var(--rsp-gray-200);
    border-radius: 12px;
    color: var(--rsp-gray-600);
    font-family: var(--rsp-font-display);
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: border-color var(--rsp-transition), color var(--rsp-transition), box-shadow var(--rsp-transition);
  }

  .rp-history-link:hover {
    border-color: var(--rsp-violet);
    color: var(--rsp-violet);
    box-shadow: 0 0 0 3px var(--rsp-violet-ring);
  }

  /* ── Button inner ─────────────────────────────────────── */
  .rp-btn-inner {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }

  /* ── Fallback ─────────────────────────────────────────── */
  .rp-fallback-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
  }

  .rp-fallback-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    text-align: center;
    padding: 48px 40px;
    background: var(--rsp-white);
    border-radius: var(--rsp-radius-lg);
    box-shadow: var(--rsp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    max-width: 360px;
    width: 100%;
    animation: rsp-fade-in .3s ease;
  }

  .rp-fallback-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 68px;
    height: 68px;
    border-radius: 50%;
    background: var(--rsp-violet-dim);
    color: var(--rsp-violet);
  }

  .rp-fallback-title {
    margin: 0;
    font-family: var(--rsp-font-display);
    font-size: 22px;
    font-weight: 800;
    color: var(--rsp-gray-900);
  }

  .rp-fallback-text {
    margin: 0;
    font-family: var(--rsp-font);
    font-size: 14px;
    color: var(--rsp-gray-500);
    line-height: 1.6;
    max-width: 260px;
  }

  /* ── Animations ───────────────────────────────────────── */
  @keyframes rsp-fade-in {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0);   }
  }
`;