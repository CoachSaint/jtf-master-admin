import { OPERATORS } from "../lib/storage";
import { UserCheck, Zap, FolderClock } from "lucide-react";

export default function Header({ activeOperator, onOperatorChange, currentTab, onTabChange, activeDeal }) {
  return (
    <header className="master-header">
      <div className="header-top">
        <div className="logo-badge">
          <div className="logo-icon">JTF</div>
          <div>
            <div className="logo-title">Master Admin</div>
            <div className="logo-sub">Executive Sales &amp; Closing Suite</div>
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

      {/* Mode / View Navigation */}
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          className={`btn-secondary ${currentTab === "flow" ? "active" : ""}`}
          style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
          onClick={() => onTabChange("flow")}
        >
          <Zap size={15} />
          Deal Closer Flow {activeDeal?.customerName ? `(${activeDeal.customerName.split(" ")[0]})` : ""}
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
