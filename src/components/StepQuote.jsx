import { useState } from "react";
import { DollarSign, ShieldAlert, Award, Sparkles, ArrowRight, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { formatMoney } from "../lib/api";

const TAMKO_PACKAGES = [
  {
    key: "heritage",
    name: "TAMKO Heritage",
    rate: 450,
    warranty: "Standard 30-Yr Architectural",
    desc: "Quality architectural fiberglass asphalt shingles.",
  },
  {
    key: "titan_xt",
    name: "TAMKO Titan XT (Best Seller)",
    rate: 600,
    warranty: "160 MPH Wind Warranty + Enhanced Protection",
    desc: "High-wind extreme durability with AnchorLock technology.",
    popular: true,
  },
  {
    key: "stormfighter_flex",
    name: "Storm Fighter Flex (Class 4)",
    rate: 850,
    warranty: "Class 4 Impact Resistant + Maximum Insurance Discount",
    desc: "SBS modified asphalt for extreme hail and storm resistance.",
  },
];

export default function StepQuote({ deal, onUpdateDeal, onNext, onBack }) {
  const squares = parseFloat(deal.measurements?.squares) || 28.5;
  const [mode, setMode] = useState(deal.quoteMode || "standard"); // "standard" | "custom"
  const [selectedKey, setSelectedKey] = useState(deal.selectedPackage?.key || "titan_xt");
  
  // Custom quoting state
  const [customTitle, setCustomTitle] = useState(deal.customQuote?.title || "Custom Roofing & Exterior Scope");
  const [customType, setCustomType] = useState(deal.customQuote?.type || "per_sq"); // "per_sq" | "flat"
  const [customRate, setCustomRate] = useState(deal.customQuote?.rate || 650);
  const [customFlatTotal, setCustomFlatTotal] = useState(deal.customQuote?.flatTotal || "");
  const [lineItems, setLineItems] = useState(deal.lineItems || []);
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemAmount, setNewItemAmount] = useState("");
  const [discountPct, setDiscountPct] = useState(deal.discountPct || 0);

  // Calculations
  const selectedPkg = TAMKO_PACKAGES.find((p) => p.key === selectedKey) || TAMKO_PACKAGES[1];
  const standardBaseTotal = Math.round(squares * selectedPkg.rate);
  
  const customBaseTotal = customType === "flat"
    ? (parseFloat(customFlatTotal) || 0)
    : Math.round(squares * (parseFloat(customRate) || 0));

  const baseTotal = mode === "standard" ? standardBaseTotal : customBaseTotal;
  const addOnsTotal = lineItems.reduce((acc, it) => acc + (parseFloat(it.amount) || 0), 0);
  const subtotal = baseTotal + addOnsTotal;
  const discountAmount = Math.round(subtotal * (parseFloat(discountPct) / 100));
  const grandTotal = Math.max(0, subtotal - discountAmount);

  function addLineItem(label, amount) {
    if (!label || !amount) return;
    setLineItems([...lineItems, { id: Date.now() + Math.random(), label, amount: parseFloat(amount) }]);
    setNewItemDesc("");
    setNewItemAmount("");
  }

  function removeLineItem(id) {
    setLineItems(lineItems.filter((it) => it.id !== id));
  }

  function handleContinue() {
    onUpdateDeal({
      quoteMode: mode,
      selectedPackage: mode === "standard" ? selectedPkg : { key: "custom", name: customTitle, rate: customRate },
      customQuote: {
        title: customTitle,
        type: customType,
        rate: customRate,
        flatTotal: customFlatTotal,
      },
      lineItems,
      discountPct: parseFloat(discountPct) || 0,
      baseTotal,
      addOnsTotal,
      discountAmount,
      grandTotal,
    });
    onNext();
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <DollarSign size={22} color="var(--red)" />
        3. Pricing &amp; Package Quote
      </div>
      <div className="card-subtitle">
        Pricing based on <b>{squares} Squares</b>
      </div>

      {/* Mode Switcher */}
      <div className="grid-2" style={{ marginBottom: 16 }}>
        <button
          type="button"
          className={`btn-secondary ${mode === "standard" ? "active" : ""}`}
          onClick={() => setMode("standard")}
        >
          <Award size={16} />
          Standard TAMKO Packages
        </button>
        <button
          type="button"
          className={`btn-secondary ${mode === "custom" ? "active" : ""}`}
          onClick={() => setMode("custom")}
        >
          <Sparkles size={16} />
          ⚡ Operator Custom Quote
        </button>
      </div>

      {mode === "standard" ? (
        <div>
          {TAMKO_PACKAGES.map((pkg) => {
            const isSel = selectedKey === pkg.key;
            const pkgTotal = Math.round(squares * pkg.rate);
            return (
              <div
                key={pkg.key}
                className={`package-card ${isSel ? "selected" : ""}`}
                onClick={() => setSelectedKey(pkg.key)}
              >
                {pkg.popular && (
                  <span className="badge badge-gold" style={{ position: "absolute", top: 12, right: 12 }}>
                    Most Popular ★
                  </span>
                )}
                <div className="package-header">
                  <div className="package-name">{pkg.name}</div>
                  <div className="package-price">{formatMoney(pkgTotal)}</div>
                </div>
                <div className="package-desc">{pkg.desc}</div>
                <div style={{ fontSize: 12, color: "var(--navy)", fontWeight: 700, marginTop: 6 }}>
                  🛡️ {pkg.warranty}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid var(--line)" }}>
          <div className="form-group">
            <label className="form-label">Scope / Project Title</label>
            <input
              type="text"
              className="input-field"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Standing Seam Metal / Commercial TPO / Siding & Gutters"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Pricing Mode</label>
            <div className="grid-2">
              <button
                type="button"
                className={`btn-secondary ${customType === "per_sq" ? "active" : ""}`}
                onClick={() => setCustomType("per_sq")}
              >
                Rate per Sq (${squares} sq)
              </button>
              <button
                type="button"
                className={`btn-secondary ${customType === "flat" ? "active" : ""}`}
                onClick={() => setCustomType("flat")}
              >
                Flat Contract Total ($)
              </button>
            </div>
          </div>

          {customType === "per_sq" ? (
            <div className="form-group">
              <label className="form-label">Rate per Square ($/sq)</label>
              <input
                type="number"
                step="25"
                className="input-field"
                value={customRate}
                onChange={(e) => setCustomRate(e.target.value)}
                placeholder="650"
              />
            </div>
          ) : (
            <div className="form-group">
              <label className="form-label">Total Contract Amount ($)</label>
              <input
                type="number"
                step="100"
                className="input-field"
                value={customFlatTotal}
                onChange={(e) => setCustomFlatTotal(e.target.value)}
                placeholder="15000"
              />
            </div>
          )}
        </div>
      )}

      {/* Add-ons & Line Items */}
      <div style={{ marginTop: 18 }}>
        <label className="form-label">Line Items &amp; Add-ons</label>
        {lineItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 12px",
              background: "#fff",
              border: "1px solid var(--line)",
              borderRadius: "10px",
              marginBottom: 6,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 600 }}>{item.label}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{formatMoney(item.amount)}</span>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: "auto", padding: "4px 8px", minHeight: 28 }}
                onClick={() => removeLineItem(item.id)}
              >
                <Trash2 size={13} color="var(--red)" />
              </button>
            </div>
          </div>
        ))}

        {/* Quick Add Row */}
        <div className="grid-2" style={{ alignItems: "end", marginTop: 8 }}>
          <div>
            <input
              type="text"
              className="input-field"
              placeholder="Item name (e.g. 6in Gutters)"
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <input
              type="number"
              className="input-field"
              placeholder="$ Amount"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
            />
            <button
              type="button"
              className="btn-primary"
              style={{ width: "auto", padding: "0 16px" }}
              onClick={() => addLineItem(newItemDesc, newItemAmount)}
            >
              <Plus size={16} /> Add
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
          <button type="button" className="badge badge-gold" onClick={() => addLineItem("5 Sheets OSB Decking", 450)}>
            + 5 Sheets Decking ($450)
          </button>
          <button type="button" className="badge badge-gold" onClick={() => addLineItem("6\" Seamless Gutters", 1850)}>
            + 6" Seamless Gutters ($1,850)
          </button>
          <button type="button" className="badge badge-gold" onClick={() => addLineItem("Chimney Flashing Rebuild", 450)}>
            + Chimney Flashing ($450)
          </button>
          <button type="button" className="badge badge-gold" onClick={() => addLineItem("Skylight Replacement", 850)}>
            + Skylight ($850)
          </button>
        </div>
      </div>

      {/* Discount */}
      <div className="form-group" style={{ marginTop: 16 }}>
        <label className="form-label">In-Home Discount % (0–20%)</label>
        <input
          type="number"
          min="0"
          max="20"
          className="input-field"
          value={discountPct}
          onChange={(e) => setDiscountPct(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Summary Box */}
      <div className="total-summary-card">
        <div className="summary-row">
          <span>Base Roof / Scope:</span>
          <span>{formatMoney(baseTotal)}</span>
        </div>
        {addOnsTotal > 0 && (
          <div className="summary-row">
            <span>Add-ons ({lineItems.length}):</span>
            <span>+{formatMoney(addOnsTotal)}</span>
          </div>
        )}
        {discountAmount > 0 && (
          <div className="summary-row" style={{ color: "var(--green)" }}>
            <span>Discount (−{discountPct}%):</span>
            <span>−{formatMoney(discountAmount)}</span>
          </div>
        )}
        <div className="summary-row grand-total">
          <span>Grand Total:</span>
          <span>{formatMoney(grandTotal)}</span>
        </div>
      </div>

      <div className="footer-nav">
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn-primary" onClick={handleContinue}>
          Lock In &amp; Continue to Send
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
