import { useState } from "react";
import { PenTool, CheckCircle, ShieldCheck, ArrowLeft, Download, RefreshCw, Mail, FileText, Award, CloudUpload } from "lucide-react";
import confetti from "canvas-confetti";
import SignaturePad from "./SignaturePad";
import LegalContractPreview from "./LegalContractPreview";
import { formatMoney, pushDealToOS } from "../lib/api";
import { JTF_RETAIL_CONTRACT } from "../lib/legalDocs";

export default function StepSign({ deal, operator, onUpdateDeal, onBack, onComplete }) {
  const [custSig, setCustSig] = useState(deal.signatures?.customer || null);
  const [repSig, setRepSig] = useState(deal.signatures?.rep || null);
  const [reviewed, setReviewed] = useState(false);
  const [agreed, setAgreed] = useState(deal.status === "signed");
  const [busy, setBusy] = useState(false);
  const [osSyncing, setOsSyncing] = useState(false);
  const [osDone, setOsDone] = useState(deal.syncedToOS || false);

  async function handleFinalize() {
    if (!custSig) {
      alert("Please capture the homeowner's signature on glass.");
      return;
    }
    if (!reviewed) {
      alert("Please confirm the homeowner has reviewed the terms.");
      return;
    }
    setBusy(true);
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });

    const signatures = {
      customer: custSig,
      rep: repSig,
      signedAt: new Date().toISOString(),
      operatorName: operator.name,
      operatorEmail: operator.email,
      docTitle: JTF_RETAIL_CONTRACT.title,
      driveId: JTF_RETAIL_CONTRACT.driveId,
      fileName: JTF_RETAIL_CONTRACT.fileName,
    };

    const updatedDeal = {
      ...deal,
      signatures,
      status: "signed",
    };

    onUpdateDeal({
      signatures,
      status: "signed",
    });

    // Automatically push the signed deal to JTF OS CRM
    try {
      const res = await pushDealToOS({ deal: updatedDeal, operator });
      setOsDone(true);
      onUpdateDeal({ syncedToOS: true, osSyncedAt: res.syncedAt, osLeadId: res.leadId });
    } catch (e) {
      console.warn("Auto-push to OS non-fatal:", e);
    }

    setAgreed(true);
    setBusy(false);
  }

  async function handleManualPush() {
    setOsSyncing(true);
    try {
      const res = await pushDealToOS({ deal, operator });
      setOsDone(true);
      onUpdateDeal({ syncedToOS: true, osSyncedAt: res.syncedAt, osLeadId: res.leadId });
    } catch (e) {
      alert("Sync failed: " + String(e.message || e));
    } finally {
      setOsSyncing(false);
    }
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <PenTool size={22} color="var(--red)" />
        5. In-Person Retail Sign &amp; Close
      </div>
      <div className="card-subtitle">
        Execute authorized Master Retail Agreement for <b>{deal.customerName}</b>
      </div>

      {agreed ? (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ display: "inline-flex", background: "#dcfce7", padding: "18px", borderRadius: "50%", marginBottom: "14px" }}>
            <CheckCircle size={52} color="var(--green)" />
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy)" }}>Retail Contract Executed! ✓</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0 20px" }}>
            The Master Retail Contract for <b>{deal.address}</b> ({formatMoney(deal.grandTotal)}) has been signed and logged to Customer 360.
          </p>

          <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "14px", border: "1px solid var(--line)", textAlign: "left", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Retail Investment:</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: "var(--navy)" }}>{formatMoney(deal.grandTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Deposit (50% Due Now):</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{formatMoney(Math.round((deal.grandTotal || 0) * 0.5))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Final Balance (Upon Completion):</span>
              <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{formatMoney(Math.round((deal.grandTotal || 0) * 0.5))}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Authorized Template:</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{JTF_RETAIL_CONTRACT.title}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Authorized Signer:</span>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{operator.name} ({operator.title})</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "var(--text-muted)" }}>CRM Sync Status:</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "var(--green)" }}>
                {osDone ? "🟢 Saved & Synced to JTF OS" : "🟡 Local Copy Ready"}
              </span>
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: 10 }}>
            <button
              type="button"
              className="btn-secondary"
              disabled={osSyncing}
              onClick={handleManualPush}
            >
              <CloudUpload size={16} />
              {osSyncing ? "Pushing…" : osDone ? "Re-sync to JTF OS ✓" : "🚀 Push to OS"}
            </button>
            <a
              className="btn-secondary"
              style={{ textDecoration: "none" }}
              href={`mailto:${deal.customerEmail || ""}?subject=${encodeURIComponent("Your Signed JTF Retail Contract & Receipt - " + deal.address)}&body=${encodeURIComponent(`Hi ${deal.customerName},\n\nThank you for choosing JTF Home Group. Your Master Retail Roofing Agreement has been officially executed.\n\nTotal Investment: ${formatMoney(deal.grandTotal)}\nDeposit Amount (50%): ${formatMoney(Math.round((deal.grandTotal || 0) * 0.5))}\nPackage: ${deal.selectedPackage?.name}\nAddress: ${deal.address}\n\nAuthorized by: ${operator.name} (${operator.title})\nJTF Home Group LLC\n(404) 555-0199`)}`}
            >
              <Mail size={16} />
              Email Receipt to Customer
            </a>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onComplete}
          >
            Start Next Retail Deal
          </button>
        </div>
      ) : (
        <div>
          {/* Deal Summary Banner */}
          <div style={{ background: "linear-gradient(135deg, #0b192c 0%, #1e293b 100%)", color: "#fff", padding: "16px 20px", borderRadius: "14px", marginBottom: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Total Agreed Investment</div>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{formatMoney(deal.grandTotal)}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Selected Package</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gold)" }}>{deal.selectedPackage?.name}</div>
              </div>
            </div>
          </div>

          {/* Full Authorized Retail Document Preview */}
          <LegalContractPreview deal={deal} operator={operator} />

          {/* Homeowner Signature Pad */}
          <SignaturePad
            title={`Homeowner Signature (${deal.customerName || "Customer"})`}
            onSignChange={setCustSig}
          />

          {/* JTF Representative Signature Pad */}
          <SignaturePad
            title={`JTF Executive Signature (${operator.name} · ${operator.title})`}
            onSignChange={setRepSig}
          />

          {/* Terms Review Checkbox */}
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "18px 0", fontSize: 13, color: "var(--navy)", fontWeight: 600, background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid var(--line)" }}>
            <input
              type="checkbox"
              id="termsReview"
              checked={reviewed}
              onChange={(e) => setReviewed(e.target.checked)}
              style={{ marginTop: 2, width: 18, height: 18, cursor: "pointer" }}
            />
            <label htmlFor="termsReview" style={{ cursor: "pointer" }}>
              I confirm that the homeowner has reviewed the full retail terms, roofing system inclusions, 5-year workmanship warranty, and 3-day right of rescission.
            </label>
          </div>

          <div className="footer-nav">
            <button type="button" className="btn-secondary" onClick={onBack}>
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={!custSig || !reviewed || busy}
              onClick={handleFinalize}
            >
              {busy ? "Executing & Pushing to OS…" : "✍️ Execute Retail Contract"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
