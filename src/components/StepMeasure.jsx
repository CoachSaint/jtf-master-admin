import { useState, useEffect } from "react";
import { Ruler, Zap, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Layers } from "lucide-react";
import { pullRoofTrueMeasurement, orderEagleViewReport } from "../lib/api";

export default function StepMeasure({ deal, operator, onUpdateDeal, onNext, onBack }) {
  const [busy, setBusy] = useState(false);
  const [squares, setSquares] = useState(deal.measurements?.squares || 28.5);
  const [pitch, setPitch] = useState(deal.measurements?.pitch || 6);
  const [facets, setFacets] = useState(deal.measurements?.facets || 8);
  const [source, setSource] = useState(deal.measurements?.source || "RoofTrue (Free Live Pull)");
  const [evOrdered, setEvOrdered] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!deal.measurements && deal.address) {
      handlePull();
    }
  }, [deal.address]);

  async function handlePull() {
    setBusy(true);
    setMsg("");
    try {
      const res = await pullRoofTrueMeasurement(deal.address);
      setSquares(res.squares);
      setPitch(res.pitch);
      setFacets(res.facets);
      setSource(res.source);
      onUpdateDeal({
        measurements: {
          squares: res.squares,
          pitch: res.pitch,
          facets: res.facets,
          source: res.source,
        }
      });
    } catch (e) {
      setMsg("Using fallback roof model calculation.");
    } finally {
      setBusy(false);
    }
  }

  async function handleEagleView() {
    setBusy(true);
    try {
      await orderEagleViewReport({ address: deal.address, operator });
      setEvOrdered(true);
      setMsg("EagleView Premium Report requested — office notified.");
    } catch {
      setMsg("EagleView request queued.");
    } finally {
      setBusy(false);
    }
  }

  function handleContinue() {
    onUpdateDeal({
      measurements: {
        squares: parseFloat(squares) || 28.5,
        pitch: parseInt(pitch, 10) || 6,
        facets: parseInt(facets, 10) || 8,
        source,
      }
    });
    onNext();
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <Ruler size={22} color="var(--red)" />
        2. Rooftop Measurement
      </div>
      <div className="card-subtitle">
        Verified geometric measurements for <b>{deal.address}</b>
      </div>

      {/* Measurement Box */}
      <div className="measurement-box">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="badge badge-gold">
            <Zap size={13} /> {source}
          </span>
          <button
            className="operator-btn"
            style={{ padding: "4px 10px", fontSize: 11 }}
            disabled={busy}
            onClick={handlePull}
          >
            <RefreshCw size={12} className={busy ? "spin" : ""} />
            Re-pull
          </button>
        </div>

        <div className="measurement-grid">
          <div className="stat-box">
            <div className="stat-value">{squares}</div>
            <div className="stat-label">Total Squares</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{pitch}/12</div>
            <div className="stat-label">Primary Pitch</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{facets}</div>
            <div className="stat-label">Roof Facets</div>
          </div>
        </div>
      </div>

      {msg && <div style={{ fontSize: 13, color: "var(--gold-text)", margin: "8px 0" }}>{msg}</div>}

      {/* Manual Keypad / Adjust */}
      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">Adjust Measured Squares (If you have a verified report)</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="number"
            step="0.1"
            min="1"
            className="input-field"
            value={squares}
            onChange={(e) => setSquares(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary"
            style={{ width: "auto", padding: "0 16px" }}
            onClick={() => setSquares((prev) => (parseFloat(prev) + 1).toFixed(1))}
          >
            +1 sq
          </button>
        </div>
      </div>

      {/* EagleView Backup Order */}
      <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid var(--line)", margin: "16px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>Need a Paid EagleView Report?</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Order a full 3D CAD structure report with 1 tap.</div>
          </div>
          <button
            type="button"
            className={`btn-secondary ${evOrdered ? "active" : ""}`}
            style={{ width: "auto", padding: "8px 14px", fontSize: 13 }}
            disabled={busy || evOrdered}
            onClick={handleEagleView}
          >
            <Layers size={14} />
            {evOrdered ? "Ordered ✓" : "Order EagleView"}
          </button>
        </div>
      </div>

      <div className="footer-nav">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn-primary" onClick={handleContinue}>
          Continue to Quote Builder
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
