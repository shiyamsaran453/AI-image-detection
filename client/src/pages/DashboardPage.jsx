import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictImage } from "../api/predictionApi";
import { removeToken } from "../utils/storage";
import DashboardLayout from "../layouts/DashboardLayout";
import Button from "../components/common/Button";

const LATEST_RESULT_KEY = "latest_prediction_result";

/* ─── Google Fonts ───────────────────────────────────────────────────────── */
if (!document.getElementById("gf-dashboard")) {
    const link = document.createElement("link");
    link.id = "gf-dashboard";
    link.rel = "stylesheet";
    link.href =
        "https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap";
    document.head.appendChild(link);
}

export default function DashboardPage() {
    const navigate = useNavigate();

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    useEffect(() => {
        return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
    }, [previewUrl]);

    const resetSelectedFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(null);
        setPreviewUrl("");
    };

    const applyFile = (file) => {
        setError("");
        if (!file) { resetSelectedFile(); return; }
        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file.");
            resetSelectedFile();
            return;
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleFileChange = (e) => applyFile(e.target.files?.[0]);

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        applyFile(e.dataTransfer.files?.[0]);
    };

    const handleDetect = async () => {
        if (!selectedFile) { setError("Please select an image first."); return; }
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            const res = await predictImage(formData);
            const payload = {
                image: previewUrl,
                fileName: selectedFile.name,
                result: res.data?.result || res.data,
                savedAt: new Date().toISOString(),
            };
            localStorage.setItem(LATEST_RESULT_KEY, JSON.stringify(payload));
            navigate("/result", { state: payload });
        } catch (err) {
            const message = err.response?.data?.detail || "Prediction failed.";
            if (err.response?.status === 401) { removeToken(); navigate("/login"); return; }
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{css}</style>
            <DashboardLayout title="Dashboard">

                {/* ── Page Header ─────────────────────────────────────────── */}
                <header className="dp-header">
                    <div className="dp-header-text">
                        <span className="dp-badge">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                                <circle cx="5" cy="5" r="5" />
                            </svg>
                            AI IMAGE DETECTION
                        </span>
                        <h1 className="dp-heading">Dashboard</h1>
                        <p className="dp-subheading">
                            Upload an image and check whether it is real or AI-generated.
                        </p>
                    </div>

                    {/* Decorative pill stats */}
                    <div className="dp-header-pills" aria-hidden="true">
                        <div className="dp-pill dp-pill--violet">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                            Secure Analysis
                        </div>
                        <div className="dp-pill dp-pill--dark">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                            </svg>
                            Real-time Results
                        </div>
                    </div>
                </header>

                {/* ── Main Grid ───────────────────────────────────────────── */}
                <section className="dp-grid" aria-label="Upload and preview">

                    {/* ── LEFT: Upload card ─────────────────────────────── */}
                    <div className="dp-card dp-card--upload">
                        <div className="dp-card-header">
                            <div className="dp-card-icon-wrap dp-card-icon-wrap--violet" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="16 16 12 12 8 16" />
                                    <line x1="12" y1="12" x2="12" y2="21" />
                                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="dp-card-title">Upload Image</h2>
                                <p className="dp-card-text">JPG, JPEG, PNG, WEBP and other image types supported.</p>
                            </div>
                        </div>

                        {/* Drop zone */}
                        <label
                            htmlFor="file-upload"
                            className={`dp-dropzone${dragOver ? " dp-dropzone--active" : ""}${selectedFile ? " dp-dropzone--has-file" : ""}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                        >
                            <input
                                id="file-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="dp-hidden-input"
                                aria-label="Choose an image file to analyse"
                            />

                            <div className="dp-dz-inner">
                                <div className={`dp-dz-icon-ring${dragOver ? " dp-dz-icon-ring--active" : ""}`} aria-hidden="true">
                                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="16 16 12 12 8 16" />
                                        <line x1="12" y1="12" x2="12" y2="21" />
                                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                    </svg>
                                </div>
                                <h3 className="dp-dz-title">
                                    {dragOver ? "Release to upload" : "Click or drag & drop"}
                                </h3>
                                <p className="dp-dz-text">
                                    {dragOver
                                        ? "We'll start the preview immediately."
                                        : "Drag a file here or click to browse from your device."}
                                </p>
                                {!dragOver && (
                                    <span className="dp-dz-btn" aria-hidden="true">
                                        Browse Files
                                    </span>
                                )}
                            </div>
                        </label>

                        {/* File info chip */}
                        {selectedFile && (
                            <div className="dp-file-chip" role="status" aria-live="polite">
                                <div className="dp-file-chip-icon" aria-hidden="true">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                    </svg>
                                </div>
                                <div className="dp-file-chip-body">
                                    <p className="dp-file-chip-label">SELECTED FILE</p>
                                    <p className="dp-file-chip-name">{selectedFile.name}</p>
                                    <p className="dp-file-chip-meta">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    className="dp-file-chip-remove"
                                    onClick={resetSelectedFile}
                                    aria-label="Remove selected file"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="dp-error" role="alert">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Detect button */}
                        <div className="dp-detect-wrap">
                            <Button
                                variant="primary"
                                fullWidth
                                onClick={handleDetect}
                                disabled={loading || !selectedFile}
                                aria-busy={loading}
                            >
                                {loading ? (
                                    <span className="dp-btn-inner">
                                        <span className="dp-spinner" aria-hidden="true" />
                                        Analysing image…
                                    </span>
                                ) : (
                                    <span className="dp-btn-inner">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                            aria-hidden="true">
                                            <circle cx="11" cy="11" r="8" />
                                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                        </svg>
                                        Detect Image
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* ── RIGHT: Preview card ────────────────────────────── */}
                    <div className="dp-card dp-card--preview">
                        <div className="dp-card-header">
                            <div className="dp-card-icon-wrap dp-card-icon-wrap--dark" aria-hidden="true">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="dp-card-title">Image Preview</h2>
                                <p className="dp-card-text">Your uploaded image appears here before detection.</p>
                            </div>
                        </div>

                        {previewUrl ? (
                            <div className="dp-preview-box">
                                <img
                                    src={previewUrl}
                                    alt="Preview of selected image"
                                    className="dp-preview-img"
                                />
                            </div>
                        ) : (
                            <div className="dp-empty-preview" role="img" aria-label="No image selected yet">
                                <div className="dp-empty-icon" aria-hidden="true">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                </div>
                                <p className="dp-empty-title">No image selected</p>
                                <p className="dp-empty-text">
                                    Upload an image on the left to preview it here.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* ── Bottom info cards ────────────────────────────────────── */}
                <section className="dp-info-grid" aria-label="Tips">
                    <div className="dp-info-card">
                        <div className="dp-info-icon-wrap" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="dp-info-title">How it works</h3>
                            <p className="dp-info-text">
                                Upload an image, preview it, then click <strong>Detect Image</strong>.
                                The result page will show the predicted label and confidence score
                                in seconds.
                            </p>
                        </div>
                    </div>

                    <div className="dp-info-card">
                        <div className="dp-info-icon-wrap" aria-hidden="true">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="dp-info-title">Tips for best results</h3>
                            <p className="dp-info-text">
                                Use clear, uncompressed images for higher accuracy. Avoid heavily
                                filtered or cropped photos. All major image formats are supported.
                            </p>
                        </div>
                    </div>
                </section>

            </DashboardLayout>
        </>
    );
}

/* ─── Scoped CSS ─────────────────────────────────────────────────────────── */
const css = `
  :root {
    --dp-violet:       #7c3aed;
    --dp-violet-light: #8b5cf6;
    --dp-violet-dim:   #ede9fe;
    --dp-violet-ring:  rgba(124,58,237,.18);
    --dp-black:        #0f0a1e;
    --dp-gray-900:     #111827;
    --dp-gray-600:     #4b5563;
    --dp-gray-500:     #6b7280;
    --dp-gray-200:     #e5e7eb;
    --dp-gray-100:     #f3f4f6;
    --dp-gray-50:      #f9fafb;
    --dp-red:          #dc2626;
    --dp-red-bg:       #fef2f2;
    --dp-red-border:   #fecaca;
    --dp-green:        #16a34a;
    --dp-white:        #ffffff;
    --dp-radius-lg:    20px;
    --dp-radius-md:    14px;
    --dp-radius-sm:    10px;
    --dp-shadow:       0 4px 24px rgba(0,0,0,0.07);
    --dp-shadow-hover: 0 8px 32px rgba(124,58,237,0.13);
    --dp-transition:   0.22s cubic-bezier(.4,0,.2,1);
    --dp-font:         'DM Sans', sans-serif;
    --dp-font-display: 'Outfit', sans-serif;
  }

  /* ── Page header ────────────────────────────────────── */
  .dp-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
  }

  .dp-header-text { flex: 1; min-width: 0; }

  .dp-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 10px;
    padding: 4px 12px;
    background: var(--dp-violet-dim);
    color: var(--dp-violet);
    border-radius: 999px;
    font-family: var(--dp-font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
  }

  .dp-heading {
    margin: 0;
    font-family: var(--dp-font-display);
    font-size: 32px;
    font-weight: 800;
    color: var(--dp-gray-900);
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .dp-subheading {
    margin: 8px 0 0;
    font-family: var(--dp-font);
    color: var(--dp-gray-500);
    font-size: 15px;
    line-height: 1.6;
  }

  .dp-header-pills {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-self: center;
  }

  .dp-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 999px;
    font-family: var(--dp-font-display);
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
  }

  .dp-pill--violet {
    background: var(--dp-violet-dim);
    color: var(--dp-violet);
  }

  .dp-pill--dark {
    background: var(--dp-gray-900);
    color: var(--dp-white);
  }

  /* ── Main grid ──────────────────────────────────────── */
  .dp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    .dp-grid { grid-template-columns: 1fr; }
    .dp-header { flex-direction: column; }
    .dp-header-pills { align-self: flex-start; }
  }

  /* ── Cards ──────────────────────────────────────────── */
  .dp-card {
    background: var(--dp-white);
    border-radius: var(--dp-radius-lg);
    padding: 24px;
    box-shadow: var(--dp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    display: flex;
    flex-direction: column;
    gap: 18px;
    transition: box-shadow var(--dp-transition);
  }

  .dp-card:hover { box-shadow: var(--dp-shadow-hover); }

  .dp-card-header {
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }

  .dp-card-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .dp-card-icon-wrap--violet {
    background: var(--dp-violet-dim);
    color: var(--dp-violet);
  }

  .dp-card-icon-wrap--dark {
    background: var(--dp-gray-900);
    color: var(--dp-white);
  }

  .dp-card-title {
    margin: 0 0 5px;
    font-family: var(--dp-font-display);
    font-size: 18px;
    font-weight: 700;
    color: var(--dp-gray-900);
    letter-spacing: -0.01em;
  }

  .dp-card-text {
    margin: 0;
    font-family: var(--dp-font);
    color: var(--dp-gray-500);
    font-size: 13.5px;
    line-height: 1.5;
  }

  /* ── Drop zone ──────────────────────────────────────── */
  .dp-dropzone {
    display: block;
    border: 2px dashed var(--dp-gray-200);
    border-radius: var(--dp-radius-md);
    background: var(--dp-gray-50);
    cursor: pointer;
    transition:
      border-color var(--dp-transition),
      background var(--dp-transition),
      box-shadow var(--dp-transition);
    outline: none;
  }

  .dp-dropzone:hover,
  .dp-dropzone:focus-within {
    border-color: var(--dp-violet-light);
    background: #faf8ff;
    box-shadow: 0 0 0 4px var(--dp-violet-ring);
  }

  .dp-dropzone--active {
    border-color: var(--dp-violet) !important;
    background: var(--dp-violet-dim) !important;
    box-shadow: 0 0 0 5px var(--dp-violet-ring) !important;
  }

  .dp-hidden-input { display: none; }

  .dp-dz-inner {
    min-height: 190px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 24px;
    gap: 10px;
  }

  /* Upload cloud icon ring */
  .dp-dz-icon-ring {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: var(--dp-white);
    border: 2px solid var(--dp-gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--dp-violet);
    box-shadow: 0 2px 12px rgba(124,58,237,0.1);
    transition: border-color var(--dp-transition), transform var(--dp-transition), box-shadow var(--dp-transition);
    margin-bottom: 4px;
  }

  .dp-dz-icon-ring--active,
  .dp-dropzone:hover .dp-dz-icon-ring {
    border-color: var(--dp-violet);
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(124,58,237,0.2);
  }

  .dp-dz-title {
    margin: 0;
    font-family: var(--dp-font-display);
    font-size: 16px;
    font-weight: 700;
    color: var(--dp-gray-900);
  }

  .dp-dz-text {
    margin: 0;
    font-family: var(--dp-font);
    color: var(--dp-gray-500);
    font-size: 13px;
    max-width: 260px;
    line-height: 1.6;
  }

  .dp-dz-btn {
    display: inline-block;
    margin-top: 6px;
    padding: 7px 18px;
    background: var(--dp-violet);
    color: var(--dp-white);
    border-radius: 999px;
    font-family: var(--dp-font-display);
    font-size: 13px;
    font-weight: 600;
    pointer-events: none;
    transition: background var(--dp-transition);
  }

  .dp-dropzone:hover .dp-dz-btn {
    background: var(--dp-violet-light);
  }

  /* ── File chip ──────────────────────────────────────── */
  .dp-file-chip {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 13px 15px;
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: var(--dp-radius-md);
    animation: dp-fade-in .25s ease;
  }

  .dp-file-chip-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: #dcfce7;
    color: var(--dp-green);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .dp-file-chip-body { flex: 1; min-width: 0; }

  .dp-file-chip-label {
    margin: 0 0 3px;
    font-family: var(--dp-font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: var(--dp-green);
  }

  .dp-file-chip-name {
    margin: 0 0 2px;
    font-family: var(--dp-font);
    font-size: 14px;
    font-weight: 600;
    color: var(--dp-gray-900);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .dp-file-chip-meta {
    margin: 0;
    font-family: var(--dp-font);
    font-size: 12px;
    color: var(--dp-gray-500);
  }

  .dp-file-chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border: none;
    background: rgba(220,38,38,.08);
    color: var(--dp-red);
    border-radius: 8px;
    cursor: pointer;
    flex-shrink: 0;
    transition: background var(--dp-transition);
  }

  .dp-file-chip-remove:hover { background: rgba(220,38,38,.18); }

  /* ── Error banner ───────────────────────────────────── */
  .dp-error {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 14px;
    background: var(--dp-red-bg);
    border: 1px solid var(--dp-red-border);
    border-radius: var(--dp-radius-sm);
    color: var(--dp-red);
    font-family: var(--dp-font);
    font-size: 13.5px;
    font-weight: 500;
    animation: dp-shake .35s cubic-bezier(.36,.07,.19,.97);
  }

  /* ── Detect button wrapper ──────────────────────────── */
  .dp-detect-wrap { margin-top: auto; }

  .dp-btn-inner {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .dp-spinner {
    display: inline-block;
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,.35);
    border-top-color: #fff;
    border-radius: 50%;
    animation: dp-spin .65s linear infinite;
  }

  /* ── Preview card ───────────────────────────────────── */
  .dp-preview-box {
    border: 1.5px solid var(--dp-gray-200);
    border-radius: var(--dp-radius-md);
    background: var(--dp-gray-50);
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    flex: 1;
  }

  .dp-preview-img {
    width: 100%;
    max-height: 380px;
    object-fit: contain;
    border-radius: 10px;
    display: block;
    animation: dp-fade-in .3s ease;
  }

  .dp-empty-preview {
    flex: 1;
    min-height: 300px;
    border: 2px dashed var(--dp-gray-200);
    border-radius: var(--dp-radius-md);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 32px;
    background: var(--dp-gray-50);
    gap: 10px;
  }

  .dp-empty-icon {
    width: 72px;
    height: 72px;
    border-radius: 50%;
    background: var(--dp-gray-100);
    border: 2px solid var(--dp-gray-200);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--dp-gray-500);
    margin-bottom: 6px;
  }

  .dp-empty-title {
    margin: 0;
    font-family: var(--dp-font-display);
    font-size: 17px;
    font-weight: 700;
    color: var(--dp-gray-900);
  }

  .dp-empty-text {
    margin: 0;
    font-family: var(--dp-font);
    font-size: 13.5px;
    color: var(--dp-gray-500);
    max-width: 220px;
    line-height: 1.6;
  }

  /* ── Info cards ─────────────────────────────────────── */
  .dp-info-grid {
    margin-top: 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  @media (max-width: 600px) {
    .dp-info-grid { grid-template-columns: 1fr; }
  }

  .dp-info-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    background: var(--dp-white);
    border-radius: var(--dp-radius-lg);
    padding: 20px 22px;
    box-shadow: var(--dp-shadow);
    border: 1px solid rgba(0,0,0,0.04);
    transition: box-shadow var(--dp-transition), transform var(--dp-transition);
  }

  .dp-info-card:hover {
    box-shadow: var(--dp-shadow-hover);
    transform: translateY(-2px);
  }

  .dp-info-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: var(--dp-violet-dim);
    color: var(--dp-violet);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .dp-info-title {
    margin: 0 0 7px;
    font-family: var(--dp-font-display);
    font-size: 15px;
    font-weight: 700;
    color: var(--dp-gray-900);
    letter-spacing: -0.01em;
  }

  .dp-info-text {
    margin: 0;
    font-family: var(--dp-font);
    color: var(--dp-gray-500);
    line-height: 1.7;
    font-size: 13.5px;
  }

  /* ── Animations ─────────────────────────────────────── */
  @keyframes dp-fade-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0);   }
  }

  @keyframes dp-shake {
    10%, 90% { transform: translateX(-2px); }
    20%, 80% { transform: translateX(3px);  }
    30%, 50%, 70% { transform: translateX(-3px); }
    40%, 60% { transform: translateX(3px);  }
  }

  @keyframes dp-spin {
    to { transform: rotate(360deg); }
  }
`;