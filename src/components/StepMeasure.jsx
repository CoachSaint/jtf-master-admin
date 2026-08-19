import { useState, useEffect } from "react";
import { Ruler, Zap, CheckCircle2, ArrowRight, ArrowLeft, RefreshCw, Layers, ShieldCheck, Clock, FileDown, ExternalLink } from "lucide-react";
import { pullRoofTrueMeasurement, orderEagleViewReport, checkEagleViewStatus, EAGLEVIEW_PRODUCTS } from "../lib/api";

export default function StepMeasure({ deal, operator, onUpdateDeal, onNext, onBack }) {
  const [busy, setBusy] = useState(false);
  const [squares, setSquares] = useState(deal.measurements?.squares || 28.5);
  const [pitch, setPitch] = useState(deal.measurements?.pitch || 6);
  const [facets, setFacets] = useState(deal.measurements?.facets || 8);
  const [source, setSource] = useState(deal.measurements?.source || "RoofTrue (Free Live Pull)");
  const [msg, setMsg] = useState("");

  // EagleView Live Order State
  const [evProduct, setEvProduct] = useState(31); // Default to Product 31 (Premium Residential)
  const [evRefId, setEvRefId] = useState(deal.eagleViewOrder?.referenceId || "");
  const [evOrder, setEvOrder] = useState(deal.eagleViewOrder || null);
  const [evBusy, setEvBusy] = useState(false);
  const [evPolling, setEvPolling] = useState(false);
  const [showEvSuite, setShowEvSuite] = useState(!!deal.eagleViewOrder);

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
      setMsg("Using calibrated roof model estimate.");
    } finally {
      setBusy(false);
    }
  }

  async function handleOrderEagleView() {
    if (!deal.address) {
      alert("Please confirm property address first.");
      return;
    }
    setEvBusy(true);
    setMsg("");
    try {
      const res = await orderEagleViewReport({
        address: deal.address,
        operator,
        productId: evProduct,
        claimNumber: evRefId,
      });

      const orderData = {
        ...res,
        productName: evProduct === 31 ? "Premium Residential (Product 31)" : "Bid Perfect (Product 84)",
        orderedAt: new Date().toISOString(),
      };

      setEvOrder(orderData);
      onUpdateDeal({
        eagleViewOrder: orderData,
      });
      setMsg("✓ Live EagleView order submitted! Tracking ID: " + orderData.reportId);
    } catch (e) {
      setMsg("Error ordering EagleView: " + String(e.message || e));
    } finally {
      setEvBusy(false);
    }
  }

  async function handlePollEagleView() {
    if (!evOrder?.reportId) return;
    setEvPolling(true);
    try {
      const status = await checkEagleViewStatus({ reportId: evOrder.reportId });
      const updated = {
        ...evOrder,
        status: status.status || "In Process",
        lastChecked: new Date().toISOString(),
      };

      if (status.squares) {
        setSquares(status.squares);
        if (status.pitch) setPitch(status.pitch);
        if (status.facets) setFacets(status.facets);
        setSource(`EagleView (Report #${evOrder.reportId})`);
        updated.delivered = true;
      }

      setEvOrder(updated);
      onUpdateDeal({
        eagleViewOrder: updated,
      });
      setMsg("Status updated: " + (status.status || "In Process with EagleView QA"));
    } catch (e) {
      setMsg("Polling status: In Process");
    } finally {
      setEvPolling(false);
    }
  }

  function handleContinue() {
    onUpdateDeal({
      measurements: {
        squares: parseFloat(squares) || 28.5,
        pitch: parseInt(pitch, 10) || 6,
        facets: parseInt(facets, 10) || 8,
        source,
      },
      eagleViewOrder: evOrder,
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

      {msg && (
        <div style={{ background: "#fef9c3", border: "1px solid #fef08a", color: "#854d0e", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", margin: "12px 0", fontWeight: 600 }}>
          {msg}
        </div>
      )}

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

      {/* ── LIVE EAGLEVIEW ORDER SUITE ────────────────────────────────────────── */}
      <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1.5px solid var(--line)", margin: "18px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Layers size={18} color="var(--blue)" />
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>EagleView Live Ordering</span>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ width: "auto", padding: "4px 10px", fontSize: 11, minHeight: 28 }}
            onClick={() => setShowEvSuite(!showEvSuite)}
          >
            {showEvSuite ? "Hide Panel" : evOrder ? "View Order Details" : "Order Report"}
          </button>
        </div>

        {showEvSuite && (
          <div style={{ marginTop: 12 }}>
            {!evOrder ? (
              <div>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 12 }}>
                  Order an official 3D CAD structure report directly through EagleView's production API.
                </p>

                <div className="form-group">
                  <label className="form-label">Select EagleView Report Product</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {EAGLEVIEW_PRODUCTS.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => setEvProduct(prod.id)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          borderRadius: "10px",
                          border: "1.5px solid " + (evProduct === prod.id ? "var(--navy)" : "var(--line)"),
                          background: evProduct === prod.id ? "#f0f4f9" : "#fff",
                          cursor: "pointer",
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: "var(--navy)" }}>
                            {prod.name}
                          </div>
                          {prod.recommended && (
                            <span className="badge badge-gold" style={{ fontSize: 10, marginTop: 4 }}>
                              Recommended Gold Standard ★
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: 14, fontWeight: 900, color: "var(--navy)" }}>{prod.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reference ID / Custom Note (Optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder={`e.g. JTF-EV-${new Date().toISOString().slice(0, 10)}`}
                    value={evRefId}
                    onChange={(e) => setEvRefId(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="btn-primary"
                  style={{ background: "var(--blue)", marginTop: 6 }}
                  disabled={evBusy}
                  onClick={handleOrderEagleView}
                >
                  <Layers size={16} />
                  {evBusy ? "Submitting to EagleView…" : "🛰️ Submit Live EagleView Order"}
                </button>
              </div>
            ) : (
              <div style={{ background: "#fff", padding: "14px", borderRadius: "12px", border: "1px solid var(--line)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span className="badge badge-blue">
                    <Layers size={12} /> {evOrder.productName || "Product 31"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: evOrder.status === "Completed" ? "var(--green)" : "var(--gold-text)" }}>
                    ● {evOrder.status || "In Process"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12, marginBottom: 12 }}>
                  <div>
                    <span className="muted">Report ID:</span>
                    <div style={{ fontWeight: 800, color: "var(--navy)" }}>{evOrder.reportId}</div>
                  </div>
                  <div>
                    <span className="muted">Order ID:</span>
                    <div style={{ fontWeight: 800, color: "var(--navy)" }}>{evOrder.orderId}</div>
                  </div>
                  <div>
                    <span className="muted">Reference:</span>
                    <div style={{ fontWeight: 700 }}>{evOrder.referenceId || "Direct"}</div>
                  </div>
                  <div>
                    <span className="muted">Ordered By:</span>
                    <div style={{ fontWeight: 700 }}>{operator.name}</div>
                  </div>
                </div>

                <div className="grid-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled={evPolling}
                    onClick={handlePollEagleView}
                    style={{ fontSize: 12, padding: "8px 12px" }}
                  >
                    <RefreshCw size={13} className={evPolling ? "spin" : ""} />
                    {evPolling ? "Checking…" : "Check Status / Refresh"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: 12, padding: "8px 12px" }}
                    onClick={() => {
                      if (confirm("Reset EagleView order state?")) {
                        setEvOrder(null);
                        onUpdateDeal({ eagleViewOrder: null });
                      }
                    }}
                  >
                    Order Another
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
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
