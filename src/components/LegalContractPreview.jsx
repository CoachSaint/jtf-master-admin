import { generateLegalDocumentText, JTF_LEGAL_TEMPLATES } from "../lib/legalDocs";
import { ShieldCheck, FileCheck, Award, Eye } from "lucide-react";

export default function LegalContractPreview({ deal, operator, docType = "contract" }) {
  const tpl = JTF_LEGAL_TEMPLATES[docType] || JTF_LEGAL_TEMPLATES.contract;
  const fullText = generateLegalDocumentText({ deal, operator, docType });

  return (
    <div style={{ marginTop: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "var(--navy)" }}>
          <ShieldCheck size={16} color="var(--green)" />
          {tpl.title}
        </div>
        <span className="badge badge-green" style={{ fontSize: 11 }}>
          Counsel Approved ✓
        </span>
      </div>

      {/* Scrollable Document Box */}
      <div
        style={{
          maxHeight: "220px",
          overflowY: "auto",
          background: "#fff",
          border: "1.5px solid var(--line)",
          borderRadius: "12px",
          padding: "14px",
          fontFamily: "monospace",
          fontSize: "11.5px",
          lineHeight: 1.45,
          color: "var(--navy)",
          whiteSpace: "pre-wrap",
          boxShadow: "inset 0 2px 6px rgba(0,0,0,0.04)",
        }}
      >
        {fullText}
      </div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
        <Eye size={12} />
        Review the full terms above before executing homeowner signature.
      </div>
    </div>
  );
}
