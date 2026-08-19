import { useState, useEffect } from "react";
import { Send, Mail, MessageSquare, Share2, FileText, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, CloudUpload } from "lucide-react";
import { createProposalUrl, pushDealToOS, formatMoney } from "../lib/api";

export default function StepSend({ deal, operator, onUpdateDeal, onNext, onBack }) {
  const [proposal, setProposal] = useState(deal.proposal || null);
  const [busy, setBusy] = useState(!deal.proposal);
  const [copied, setCopied] = useState(false);
  const [osSyncing, setOsSyncing] = useState(false);
  const [osDone, setOsDone] = useState(deal.syncedToOS || false);

  useEffect(() => {
    if (!proposal) {
      generate();
    }
  }, []);

  async function generate() {
    setBusy(true);
    try {
      const p = await createProposalUrl({ deal, operator });
      setProposal(p);
      onUpdateDeal({ proposal: p });
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  }

  async function handlePushToOS() {
    setOsSyncing(true);
    try {
      const res = await pushDealToOS({ deal, operator });
      setOsDone(true);
      onUpdateDeal({ syncedToOS: true, osSyncedAt: res.syncedAt, osLeadId: res.leadId });
    } catch (e) {
      alert("Push to OS failed: " + String(e.message || e));
    } finally {
      setOsSyncing(false);
    }
  }

  function getEmailBody(isRepCopy = false) {
    const lines = [
      isRepCopy ? `OPERATOR COPY — JTF PROPOSAL FOR ${deal.customerName.toUpperCase()}` : `Hi ${deal.customerName},`,
      "",
      `Thank you for the opportunity to earn your business. Here is your official proposal from JTF Home Group:`,
      "",
      `PROJECT: ${deal.selectedPackage?.name || "Roofing & Exterior Services"}`,
      `ADDRESS: ${deal.address}`,
      `TOTAL INVESTMENT: ${formatMoney(deal.grandTotal)}`,
      "",
      `👉 View Interactive Proposal: ${proposal?.publicUrl || "https://rep.jtfhomegroup.com"}`,
      `📄 Download PDF: ${proposal?.pdfUrl || "https://rep.jtfhomegroup.com"}`,
      "",
      `Best regards,`,
      `${operator.name} (${operator.title})`,
      `JTF Home Group`,
      `${operator.email} | ${operator.phone}`
    ];
    return lines.join("\n");
  }

  function getSmsHref() {
    const text = `Hi ${deal.customerName}, here is your JTF Roofing Proposal for ${deal.address} (${formatMoney(deal.grandTotal)}): ${proposal?.publicUrl || ""}`;
    const cleanPhone = (deal.customerPhone || "").replace(/\D/g, "");
    return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  }

  async function handleCopy() {
    if (proposal?.publicUrl && navigator.clipboard) {
      await navigator.clipboard.writeText(proposal.publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  async function handleNativeShare() {
    if (navigator.share && proposal?.publicUrl) {
      try {
        await navigator.share({
          title: `JTF Proposal - ${deal.customerName}`,
          text: `Here is your JTF Roofing Proposal (${formatMoney(deal.grandTotal)})`,
          url: proposal.publicUrl,
        });
      } catch {}
    } else {
      handleCopy();
    }
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <Send size={22} color="var(--red)" />
        4. Send &amp; Deliver Proposal
      </div>
      <div className="card-subtitle">
        Deliver proposal to <b>{deal.customerName}</b> ({formatMoney(deal.grandTotal)})
      </div>

      {/* Proposal Status Banner */}
      <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "14px", padding: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={24} color="var(--green)" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>Proposal Built &amp; Ready</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Ready for instant delivery or CRM storage.</div>
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            disabled={osSyncing}
            onClick={handlePushToOS}
            style={{
              width: "auto",
              padding: "6px 14px",
              fontSize: "12px",
              background: osDone ? "#dcfce7" : "#fff",
              color: osDone ? "#166534" : "var(--navy)",
              borderColor: osDone ? "#86efac" : "var(--line)",
            }}
          >
            <CloudUpload size={14} />
            {osSyncing ? "Pushing…" : osDone ? "In CRM OS ✓" : "Push to OS"}
          </button>
        </div>
      </div>

      {/* 1-Tap Delivery Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Email to Customer */}
        <a
          className="btn-primary"
          style={{ textDecoration: "none" }}
          href={`mailto:${deal.customerEmail || ""}?subject=${encodeURIComponent("Your JTF Roofing Proposal - " + deal.address)}&body=${encodeURIComponent(getEmailBody(false))}`}
        >
          <Mail size={18} />
          ✉️ Email Proposal to Customer
        </a>

        {/* SMS Proposal */}
        <a
          className="btn-secondary"
          style={{ textDecoration: "none" }}
          href={getSmsHref()}
        >
          <MessageSquare size={18} color="var(--blue)" />
          💬 Text / SMS Proposal Link
        </a>

        {/* Email to Operator */}
        <a
          className="btn-secondary"
          style={{ textDecoration: "none" }}
          href={`mailto:${operator.email}?subject=${encodeURIComponent("Rep Copy: Proposal for " + deal.customerName)}&body=${encodeURIComponent(getEmailBody(true))}`}
        >
          <Mail size={18} color="var(--navy)" />
          ✉️ Email Copy to Myself ({operator.name.split(" ")[0]})
        </a>

        {/* Share / Copy & Preview */}
        <div className="grid-2" style={{ marginTop: 4 }}>
          <button type="button" className="btn-secondary" onClick={handleNativeShare}>
            <Share2 size={16} />
            {copied ? "Copied ✓" : "Share / Copy Link"}
          </button>
          {proposal?.publicUrl && (
            <a
              className="btn-secondary"
              style={{ textDecoration: "none" }}
              href={proposal.publicUrl}
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={16} />
              Preview Web
            </a>
          )}
        </div>
      </div>

      <div className="footer-nav" style={{ marginTop: 24 }}>
        <button type="button" className="btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back
        </button>
        <button type="button" className="btn-primary btn-gold" onClick={onNext}>
          Proceed to In-Person Sign &amp; Close
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
