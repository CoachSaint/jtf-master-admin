import { useState } from "react";
import { FolderCheck, Plus, CheckCircle, Clock, Trash2, ExternalLink } from "lucide-react";
import { formatMoney } from "../lib/api";

export default function DealsPipeline({ deals, onSelectDeal, onNewDeal, onDeleteDeal }) {
  return (
    <div className="admin-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div className="card-title" style={{ margin: 0 }}>
            <FolderCheck size={22} color="var(--red)" />
            Saved Deals &amp; Records ({deals.length})
          </div>
          <div className="card-subtitle" style={{ margin: 0 }}>
            Quick access to quotes, proposals, and signed agreements.
          </div>
        </div>
        <button
          type="button"
          className="btn-primary"
          style={{ width: "auto", padding: "10px 16px", fontSize: 13 }}
          onClick={onNewDeal}
        >
          <Plus size={16} /> New Deal
        </button>
      </div>

      {deals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "30px 0", color: "var(--text-muted)" }}>
          <Clock size={36} style={{ margin: "0 auto 10px", opacity: 0.4 }} />
          <div style={{ fontWeight: 700 }}>No deals created yet</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>Start your first deal to measure, quote, and sign in seconds.</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {deals.map((deal) => {
            const isSigned = deal.status === "signed";
            return (
              <div
                key={deal.id}
                style={{
                  border: "1.5px solid var(--line)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#fff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onClick={() => onSelectDeal(deal)}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: "var(--navy)" }}>
                      {deal.customerName || "Homeowner"}
                    </span>
                    {isSigned ? (
                      <span className="badge badge-green">Signed ✓</span>
                    ) : deal.grandTotal ? (
                      <span className="badge badge-gold">Quoted</span>
                    ) : (
                      <span className="badge badge-blue">Draft</span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{deal.address}</div>
                  <div style={{ fontSize: 12, color: "var(--navy)", fontWeight: 600, marginTop: 4 }}>
                    {deal.selectedPackage?.name || "Scope in progress"} · {deal.measurements?.squares ? `${deal.measurements.squares} sq` : "Not measured"}
                  </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: "var(--navy)" }}>
                      {deal.grandTotal ? formatMoney(deal.grandTotal) : "—"}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      {new Date(deal.updatedAt || deal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ width: "auto", padding: "6px 8px", minHeight: 28 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this deal record?")) {
                        onDeleteDeal(deal.id);
                      }
                    }}
                  >
                    <Trash2 size={13} color="var(--red)" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
