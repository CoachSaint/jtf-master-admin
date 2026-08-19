import { useState, useEffect } from "react";
import { Send, Mail, MessageSquare, Share2, FileText, ArrowRight, ArrowLeft, CheckCircle2, ExternalLink, CloudUpload, PenTool } from "lucide-react";
import { createProposalUrl, pushDealToOS, generateRemoteSignLink, sendDirectEmail, formatMoney } from "../lib/api";

export default function StepSend({ deal, operator, onUpdateDeal, onNext, onBack }) {
  const [proposal, setProposal] = useState(deal.proposal || null);
  const [busy, setBusy] = useState(!deal.proposal);
  const [copied, setCopied] = useState(false);
  const [osSyncing, setOsSyncing] = useState(false);
  const [osDone, setOsDone] = useState(deal.syncedToOS || false);
  const [emailStatus, setEmailStatus] = useState("");

  const signLink = generateRemoteSignLink(deal);

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

  async function handleSendEmailDirect(isRepCopy = false) {
    const targetEmail = isRepCopy ? operator.email : deal.customerEmail;
    if (!targetEmail) {
      alert("Please ensure email address is provided.");
      return;
    }
    setEmailStatus(`Sending email to ${targetEmail}…`);
    const res = await sendDirectEmail({
      to: targetEmail,
      subject: isRepCopy ? `Operator Copy: JTF Proposal - ${deal.customerName}` : `Your JTF Roofing Proposal & Agreement - ${deal.address}`,
      text: getEmailBody(isRepCopy),
      operator,
      deal,
    });
    if (res.ok) {
      setEmailStatus(`✓ Email dispatched to ${targetEmail}`);
    } else {
      setEmailStatus("Email queued in JTF OS.");
    }
    setTimeout(() => setEmailStatus(""), 4000);
  }

  function getEmailBody(isRepCopy = false) {
    const lines = [
      isRepCopy ? `OPERATOR COPY — JTF PROPOSAL & SIGNING LINK FOR ${deal.customerName.toUpperCase()}` : `Hi ${deal.customerName},`,
      "",
      `Thank you for the opportunity to earn your business. Here is your official retail proposal and agreement from JTF Home Group:`,
      "",
      `PROJECT: ${deal.selectedPackage?.name || "Roofing & Exterior Services"}`,
      `ADDRESS: ${deal.address}`,
      `TOTAL INVESTMENT: ${formatMoney(deal.grandTotal)}`,
      `DEPOSIT (50% DUE UPON SIGNING): ${formatMoney(Math.round((deal.grandTotal || 0) * 0.5))}`,
      "",
      `✍️ SIGN YOUR AGREEMENT ONLINE: ${signLink}`,
      `👉 View Interactive Proposal: ${proposal?.publicUrl || "https://rep.jtfhomegroup.com"}`,
      `📄 Download PDF: ${proposal?.pdfUrl || "https://rep.jtfhomegroup.com"}`,
      "",
      `Best regards,`,
      `${operator.name} (${operator.title})`,
      `JTF Home Group LLC`,
      `${operator.email} | ${operator.phone}`
    ];
    return lines.join("\n");
  }

  function getSmsHref() {
    const text = `Hi ${deal.customerName}, here is your JTF Roofing Proposal & Agreement for ${deal.address} (${formatMoney(deal.grandTotal)}). Sign online here: ${signLink}`;
    const cleanPhone = (deal.customerPhone || "").replace(/\D/g, "");
    return `sms:${cleanPhone}?body=${encodeURIComponent(text)}`;
  }

  async function handleCopyLink() {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(signLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `JTF Agreement - ${deal.customerName}`,
          text: `Here is your JTF Roofing Proposal & Agreement (${formatMoney(deal.grandTotal)})`,
          url: signLink,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  }

  return (
    <div className="admin-card">
      <div className="card-title">
        <Send size={22} color="var(--red)" />
        4. Send &amp; Deliver Proposal
      </div>
      <div className="card-subtitle">
        Deliver proposal &amp; remote signing link to <b>{deal.customerName}</b> ({formatMoney(deal.grandTotal)})
      </div>

      {/* Proposal Status Banner */}
      <div style={{ background: "#f0fdf4", border: "1.5px solid #86efac", borderRadius: "14px", padding: "16px", marginBottom: "18px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={24} color="var(--green)" />
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>Proposal &amp; Agreement Ready</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Interactive proposal and remote e-signing link generated.</div>
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

      {emailStatus && (
        <div style={{ background: "#dbeafe", border: "1px solid #93c5fd", color: "#1e40af", padding: "10px 14px", borderRadius: "10px", fontSize: "13px", marginBottom: "14px", fontWeight: 700 }}>
          {emailStatus}
        </div>
      )}

      {/* 1-Tap Delivery Buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Email to Customer */}
        <div className="grid-2">
          <a
            className="btn-primary"
            style={{ textDecoration: "none" }}
            href={`mailto:${deal.customerEmail || ""}?subject=${encodeURIComponent("Your JTF Roofing Proposal & Agreement - " + deal.address)}&body=${encodeURIComponent(getEmailBody(false))}`}
          >
            <Mail size={18} />
            ✉️ Email Customer (Mail App)
          </a>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleSendEmailDirect(false)}
          >
            <Send size={16} color="var(--blue)" />
            Direct Server Dispatch
          </button>
        </div>

        {/* SMS Proposal */}
        <a
          className="btn-secondary"
          style={{ textDecoration: "none" }}
          href={getSmsHref()}
        >
          <MessageSquare size={18} color="var(--blue)" />
          💬 Text / SMS Agreement Link to Customer
        </a>

        {/* Email to Operator */}
        <div className="grid-2">
          <a
            className="btn-secondary"
            style={{ textDecoration: "none" }}
            href={`mailto:${operator.email}?subject=${encodeURIComponent("Operator Copy: Proposal for " + deal.customerName)}&body=${encodeURIComponent(getEmailBody(true))}`}
          >
            <Mail size={16} color="var(--navy)" />
            ✉️ Email Copy to {operator.name.split(" ")[0]}
          </a>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => handleSendEmailDirect(true)}
          >
            <Send size={14} color="var(--navy)" />
            Send to {operator.email.split("@")[0]}
          </button>
        </div>

        {/* Remote Sign Link Copy */}
        <div className="grid-2" style={{ marginTop: 4 }}>
          <button type="button" className="btn-secondary" onClick={handleNativeShare}>
            <Share2 size={16} />
            {copied ? "Link Copied ✓" : "Share / Copy Sign Link"}
          </button>
          <a
            className="btn-secondary"
            style={{ textDecoration: "none" }}
            href={signLink}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            Preview Customer View
          </a>
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
