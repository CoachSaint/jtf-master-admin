import { useState } from "react";
import { OPERATORS } from "../lib/storage";
import { UserCheck, Zap, FolderClock, CloudUpload, CheckCircle2 } from "lucide-react";
import { pushDealToOS } from "../lib/api";

export default function Header({ activeOperator, onOperatorChange, currentTab, onTabChange, activeDeal, onUpdateDeal }) {
  const [syncing, setSyncing] = useState(false);
  const [syncDone, setSyncDone] = useState(false);

  async function handlePush() {
    if (!activeDeal?.address) {
      alert("Please enter a property address first.");
      return;
    }
    setSyncing(true);
    try {
      const res = await pushDealToOS({ deal: activeDeal, operator: activeOperator });
      if (onUpdateDeal) {
        onUpdateDeal({ syncedToOS: true, osSyncedAt: res.syncedAt, osLeadId: res.leadId });
      }
      setSyncDone(true);
      setTimeout(() => setSyncDone(false), 4000);
    } catch (e) {
      alert("Sync error: " + String(e.message || e));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <header className="master-header">
      <div className="header-top">
        <div className="logo-badge">
          <div className="logo-icon">JTF</div>
          <div>
            <div className="logo-title">Master Admin</div>
            <div className="logo-sub">Executive Suite · David &amp; Michael</div>
          </div>
        </div>

        {/* Operator Switcher */}
        <div className="operator-pill">
          {OPERATORS.map((op) => (
            <button
              key={op.id}
              className={`operator-btn ${activeOperator.id === op.id ? "active" : ""}`}
              onClick={() => onOperatorChange(op)}
            >
              <UserCheck size={14} />
              {op.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Push to OS Action Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.08)",
          borderRadius: "12px",
          padding: "8px 12px",
          marginTop: 10,
          border: "1px solid rgba(255, 255, 255, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
          {activeDeal?.syncedToOS || syncDone ? (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#86efac", fontWeight: 700 }}>
              <CheckCircle2 size={16} /> Synced to JTF OS CRM
            </span>
          ) : (
            <span style={{ color: "#cbd5e1" }}>
              Active: <b>{activeDeal?.customerName || "Draft"}</b> ({activeDeal?.address ? activeDeal.address.split(",")[0] : "No address"})
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={syncing || !activeDeal?.address}
          onClick={handlePush}
          style={{
            background: syncDone ? "#16a34a" : "var(--gold)",
            color: syncDone ? "#fff" : "var(--navy)",
            border: "none",
            borderRadius: "8px",
            padding: "6px 14px",
            fontSize: "12px",
            fontWeight: "800",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            transition: "all 0.15s ease",
          }}
        >
          <CloudUpload size={14} />
          {syncing ? "Pushing…" : syncDone ? "Pushed ✓" : "🚀 Push to OS"}
        </button>
      </div>

      {/* Mode / View Navigation */}
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button
          className={`btn-secondary ${currentTab === "flow" ? "active" : ""}`}
          style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
          onClick={() => onTabChange("flow")}
        >
          <Zap size={15} />
          Deal Flow {activeDeal?.customerName ? `(${activeDeal.customerName.split(" ")[0]})` : ""}
        </button>
        <button
          className={`btn-secondary ${currentTab === "deals" ? "active" : ""}`}
          style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
          onClick={() => onTabChange("deals")}
        >
          <FolderClock size={15} />
          Saved Deals &amp; Records
        </button>
      </div>
    </header>
  );
}
