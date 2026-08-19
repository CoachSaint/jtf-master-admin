import { generateRetailContractText, JTF_RETAIL_CONTRACT } from "../lib/legalDocs";
import { ShieldCheck, FileCheck, Award, Eye, FileText } from "lucide-react";

export default function LegalContractPreview({ deal, operator }) {
  const fullText = generateRetailContractText({ deal, operator });

  return (
    <div style={{ marginTop: 16, marginBottom: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 800, color: "var(--navy)" }}>
          <FileText size={16} color="var(--red)" />
          {JTF_RETAIL_CONTRACT.title}
        </div>
        <span className="badge badge-gold" style={{ fontSize: 11 }}>
          Drive Master: {JTF_RETAIL_CONTRACT.fileName}
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
        Official JTF Retail Agreement terms with statutory 3-day cancellation and dual warranty.
      </div>
    </div>
  );
}
