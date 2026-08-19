import { useState } from "react";
import { PenTool, CheckCircle, Award, ArrowLeft, Download, RefreshCw, Mail } from "lucide-react";
import confetti from "canvas-confetti";
import SignaturePad from "./SignaturePad";
import { formatMoney } from "../lib/api";

export default function StepSign({ deal, operator, onUpdateDeal, onBack, onComplete }) {
  const [custSig, setCustSig] = useState(deal.signatures?.customer || null);
  const [repSig, setRepSig] = useState(deal.signatures?.rep || null);
  const [agreed, setAgreed] = useState(deal.status === "signed");
  const [busy, setBusy] = useState(false);

  function handleFinalize() {
    if (!custSig) {
      alert("Please obtain the customer's signature.");
      return;
    }
    setBusy(true);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    const signatures = {
      customer: custSig,
      rep: repSig,
      signedAt: new Date().toISOString(),
      operatorName: operator.name,
      operatorEmail: operator.email,
    };

    onUpdateDeal({
      signatures,
      status: "signed",
    });
    setAgreed(true);
    setBusy(false);
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <PenTool size={22} color="var(--red)" />
        5. In-Person Sign &amp; Close
      </div>
      <div className="card-subtitle">
        Execute binding agreement for <b>{deal.customerName}</b>
      </div>

      {agreed ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ display: "inline-flex", background: "#dcfce7", padding: "16px", borderRadius: "50%", marginBottom: "12px" }}>
            <CheckCircle size={48} color="var(--green)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy)" }}>Deal Closed &amp; Signed! ✓</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0 20px" }}>
            The contract for <b>{deal.address}</b> ({formatMoney(deal.grandTotal)}) is fully executed.
          </p>

          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid var(--line)", textAlign: "left", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Contract Value:</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>{formatMoney(deal.grandTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Package / Scope:</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{deal.selectedPackage?.name}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Executed By:</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{operator.name}</span>
            </div>
          </div>

          <div className="grid-2">
            <button
              type="button"
              className="btn-primary"
              onClick={onComplete}
            >
              Start New Deal Flow
            </button>
            <a
              className="btn-secondary"
              style={{ textDecoration: "none" }}
              href={`mailto:${deal.customerEmail || ""}?subject=${encodeURIComponent("Signed Agreement - " + deal.address)}&body=${encodeURIComponent(`Hi ${deal.customerName},\n\nThank you for choosing JTF Home Group. Your signed agreement for ${formatMoney(deal.grandTotal)} has been executed.\n\nBest,\n${operator.name}`)}`}
            >
              <Mail size={16} />
              Email Receipt to Customer
            </a>
          </div>
        </div>
      ) : (
        <div>
          {/* Deal Summary Ribbon */}
          <div style={{ background: "var(--navy)", color: "#fff", padding: "16px", borderRadius: "14px", marginBottom: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Total Investment</div>
                <div style={{ fontSize: 24, fontWeight: 900 }}>{formatMoney(deal.grandTotal)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Scope</div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{deal.selectedPackage?.name}</div>
              </div>
            </div>
          </div>

          {/* Customer Signature Pad */}
          <SignaturePad
            title={`Customer Signature (${deal.customerName})`}
            onSignChange={setCustSig}
          />

          {/* Rep Signature Pad */}
          <SignaturePad
            title={`JTF Executive Representative (${operator.name})`}
            onSignChange={setRepSig}
          />

          {/* Terms Checkbox */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "16px 0", fontSize: 13, color: "var(--text-muted)" }}>
            <input type="checkbox" id="terms" defaultChecked style={{ marginTop: 3, width: 18, height: 18 }} />
            <label htmlFor="terms">
              Homeowner authorizes JTF Home Group to perform work specified at the agreed investment sum. All work guaranteed per standard warranty provisions.
            </label>
          </div>

          <div className="footer-nav">
            <button type="button" className="btn-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!custSig || busy}
              onClick={handleFinalize}
            >
              {busy ? "Finalizing…" : "✍️ Sign & Execute Agreement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
