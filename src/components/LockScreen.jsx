import { useState } from "react";
import { Lock, ShieldCheck, UserCheck, KeyRound, ArrowRight } from "lucide-react";
import { AUTHORIZED_OPERATORS, authService } from "../lib/auth";

export default function LockScreen({ onUnlock }) {
  const [selectedOp, setSelectedOp] = useState(AUTHORIZED_OPERATORS[0].id);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  function handleKeypad(digit) {
    if (pin.length < 4) {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        attemptLogin(next);
      }
    }
  }

  function handleClear() {
    setPin("");
    setError("");
  }

  function attemptLogin(codeToTest) {
    const res = authService.loginWithPin(codeToTest || pin, selectedOp);
    if (res.ok) {
      onUnlock(res.user);
    } else {
      setError("Incorrect PIN. Please try again.");
      setPin("");
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0b192c 0%, #070d18 100%)",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "rgba(15, 23, 42, 0.8)",
          backdropFilter: "blur(16px)",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "24px",
          padding: "28px 24px",
          color: "#fff",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
          }}
        >
          <Lock size={26} color="#fff" />
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 900, letterSpacing: "-0.5px" }}>JTF Master Admin</h1>
        <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, marginBottom: 20 }}>
          Executive Sales &amp; Closing Suite
        </p>

        {/* Operator Switcher */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {AUTHORIZED_OPERATORS.map((op) => (
            <button
              key={op.id}
              type="button"
              onClick={() => {
                setSelectedOp(op.id);
                setError("");
                setPin("");
              }}
              style={{
                padding: "10px",
                borderRadius: "14px",
                border: "1.5px solid " + (selectedOp === op.id ? "#d4af37" : "rgba(255, 255, 255, 0.1)"),
                background: selectedOp === op.id ? "rgba(212, 175, 55, 0.15)" : "rgba(255, 255, 255, 0.04)",
                color: selectedOp === op.id ? "#d4af37" : "#cbd5e1",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {op.name}
            </button>
          ))}
        </div>

        {/* PIN Indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, margin: "16px 0 20px" }}>
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                background: pin.length > i ? "#d4af37" : "rgba(255, 255, 255, 0.2)",
                boxShadow: pin.length > i ? "0 0 10px #d4af37" : "none",
                transition: "all 0.15s ease",
              }}
            />
          ))}
        </div>

        {error && (
          <div style={{ color: "#f87171", fontSize: 13, fontWeight: 600, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {/* Numeric Keypad */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, margin: "0 auto" }}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "↵"].map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                if (key === "C") handleClear();
                else if (key === "↵") attemptLogin();
                else handleKeypad(key);
              }}
              style={{
                height: "54px",
                borderRadius: "14px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(255, 255, 255, 0.06)",
                color: key === "C" ? "#f87171" : key === "↵" ? "#d4af37" : "#fff",
                fontSize: 20,
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.1s ease",
              }}
            >
              {key}
            </button>
          ))}
        </div>

        <div style={{ fontSize: 11, color: "#64748b", marginTop: 20 }}>
          Authorized executive access only · JTF Home Group LLC
        </div>
      </div>
    </div>
  );
}
