import { useState, useEffect } from "react";
import { CheckCircle, PenTool, ShieldCheck, Download, Mail, Home, FileText } from "lucide-react";
import confetti from "canvas-confetti";
import SignaturePad from "./SignaturePad";
import LegalContractPreview from "./LegalContractPreview";
import { formatMoney, pushDealToOS } from "../lib/api";
import { JTF_RETAIL_CONTRACT } from "../lib/legalDocs";
import { dealStorage } from "../lib/storage";

export default function CustomerRemoteSignView({ dealId }) {
  const [deal, setDeal] = useState(() => dealStorage.getDeal(dealId));
  const [custSig, setCustSig] = useState(null);
  const [reviewed, setReviewed] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (deal && deal.signatures?.customer) {
      setAgreed(true);
    }
  }, [deal]);

  if (!deal) {
    return (
      <div className="app-container" style={{ textAlign: "center", padding: "40px 20px" }}>
        <div className="admin-card">
          <h2>Agreement Not Found</h2>
          <p className="card-subtitle">This signing link may be expired or invalid. Please contact JTF Home Group at (404) 555-0199.</p>
        </div>
      </div>
    );
  }

  const dummyOperator = {
    name: deal.signatures?.operatorName || "Mike Saint",
    email: deal.signatures?.operatorEmail || "realmichaelsaint872@gmail.com",
    title: "Managing Partner",
    phone: "251-281-7512",
  };

  async function handleCustomerSign() {
    if (!custSig) {
      alert("Please sign in the signature box before submitting.");
      return;
    }
    if (!reviewed) {
      alert("Please check the confirmation box to confirm you have reviewed the terms.");
      return;
    }
    setBusy(true);
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.6 }
    });

    const signatures = {
      customer: custSig,
      customerSignedAt: new Date().toISOString(),
      customerName: deal.customerName,
      customerEmail: deal.customerEmail,
      rep: deal.signatures?.rep || null,
      operatorName: dummyOperator.name,
      operatorEmail: dummyOperator.email,
      docTitle: JTF_RETAIL_CONTRACT.title,
    };

    const updated = {
      ...deal,
      signatures,
      status: "signed",
    };

    dealStorage.saveDeal(updated);
    setDeal(updated);

    try {
      await pushDealToOS({ deal: updated, operator: dummyOperator });
    } catch (e) {
      console.warn("OS sync non-fatal:", e);
    }

    setAgreed(true);
    setBusy(false);
  }

  return (
    <div className="app-container" style={{ maxWidth: "680px" }}>
      {/* Branded Header */}
      <div style={{ background: "var(--navy)", color: "#fff", padding: "18px 24px", borderRadius: "18px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ background: "var(--red)", color: "#fff", fontWeight: 900, fontSize: 16, width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            JTF
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>JTF Home Group</div>
            <div style={{ fontSize: 11, color: "#94a3b8" }}>Official Customer E-Signing Portal</div>
          </div>
        </div>
        <span className="badge badge-green" style={{ fontSize: 11 }}>
          Secure 256-Bit SSL
        </span>
      </div>

      <div className="admin-card">
        {agreed ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <div style={{ display: "inline-flex", background: "#dcfce7", padding: "20px", borderRadius: "50%", marginBottom: "16px" }}>
              <CheckCircle size={56} color="var(--green)" />
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: "var(--navy)" }}>Thank You, {deal.customerName}!</h1>
            <p style={{ color: "var(--text-muted)", fontSize: 14, margin: "8px 0 24px" }}>
              Your Master Retail Roofing Agreement for <b>{deal.address}</b> ({formatMoney(deal.grandTotal)}) has been officially signed and executed.
            </p>

            <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "14px", border: "1px solid var(--line)", textAlign: "left", marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Total Investment:</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: "var(--navy)" }}>{formatMoney(deal.grandTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Deposit (50% Due):</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "var(--navy)" }}>{formatMoney(Math.round(deal.grandTotal * 0.5))}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)" }}>Executed On:</span>
                <span style={{ fontSize: 13, fontWeight: 700 }}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
              A copy of your signed agreement has been logged to your customer file of record. Our production department will be in touch shortly regarding your project start date!
            </p>
          </div>
        ) : (
          <div>
            <div className="card-title">
              <FileText size={22} color="var(--red)" />
              Sign Your Roofing Agreement
            </div>
            <div className="card-subtitle">
              Prepared for <b>{deal.customerName}</b> · {deal.address}
            </div>

            {/* Investment Card */}
            <div style={{ background: "linear-gradient(135deg, #0b192c 0%, #1e293b 100%)", color: "#fff", padding: "18px 20px", borderRadius: "14px", marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Agreed Investment</div>
                  <div style={{ fontSize: 26, fontWeight: 900, color: "#fff" }}>{formatMoney(deal.grandTotal)}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#94a3b8", textTransform: "uppercase", fontWeight: 700 }}>Selected Package</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--gold)" }}>{deal.selectedPackage?.name}</div>
                </div>
              </div>
            </div>

            {/* Full Legal Contract Preview */}
            <LegalContractPreview deal={deal} operator={dummyOperator} />

            {/* Signature Box */}
            <SignaturePad
              title={`Sign on the Line Below (${deal.customerName})`}
              onSignChange={setCustSig}
            />

            {/* Confirmation Checkbox */}
            <div style={{ display: "flex", gap: 10, alignItems: "flex-start", margin: "16px 0", fontSize: 13, color: "var(--navy)", fontWeight: 600, background: "#f8fafc", padding: "12px", borderRadius: "10px", border: "1px solid var(--line)" }}>
              <input
                type="checkbox"
                id="custAgree"
                checked={reviewed}
                onChange={(e) => setReviewed(e.target.checked)}
                style={{ marginTop: 2, width: 18, height: 18, cursor: "pointer" }}
              />
              <label htmlFor="custAgree" style={{ cursor: "pointer" }}>
                I acknowledge that I have reviewed the full agreement, roofing specifications, payment schedule, and 3-day right of rescission.
              </label>
            </div>

            <button
              type="button"
              className="btn-primary"
              disabled={!custSig || !reviewed || busy}
              onClick={handleCustomerSign}
              style={{ fontSize: 17, padding: "16px" }}
            >
              {busy ? "Submitting Signature…" : "✍️ Submit My Signature & Execute Agreement"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
